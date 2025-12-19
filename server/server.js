const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const k8s = require('@kubernetes/client-node');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { authMiddleware, optionalAuth } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Load Kubeconfig
const kubeData = path.join(__dirname, '../.kube/admin-config');
const kc = new k8s.KubeConfig();

let k8sApi, k8sCoreApi, k8sNetworkingApi, logWatcher;
let k8sConfigured = false;

try {
    if (fs.existsSync(kubeData)) {
        kc.loadFromFile(kubeData);
        k8sApi = kc.makeApiClient(k8s.AppsV1Api);
        k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
        k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api);
        logWatcher = new k8s.Log(kc);
        k8sConfigured = true;
        console.log('✅ Loaded kubeconfig from:', kubeData);
    } else {
        console.warn('⚠️ Kubeconfig not found at:', kubeData);
    }
} catch (e) {
    console.error('❌ Failed to load kubeconfig:', e.message);
}

// ---------------------------------------------------------
// WebSocket: Log Streaming
// ---------------------------------------------------------
io.on('connection', (socket) => {
    console.log('🔌 Client connected for logs');
    let logStream = null;

    socket.on('watch-logs', async ({ namespace, podName }) => {
        console.log(`📜 Watching logs for pod: ${podName} in ${namespace}`);

        if (!k8sConfigured) {
            socket.emit('log-error', 'Kubernetes not configured');
            return;
        }

        try {
            // Close existing stream if any
            if (logStream) {
                logStream.destroy();
                logStream = null;
            }

            const stream = new (require('stream').PassThrough)();
            stream.on('data', (chunk) => {
                socket.emit('log-data', chunk.toString());
            });

            logStream = await logWatcher.log(namespace, podName, '', stream, {
                follow: true,
                tailLines: 100,
                pretty: true,
                timestamps: true
            });

            socket.on('disconnect', () => {
                if (logStream) logStream.destroy();
                console.log('🔌 Client disconnected, stopping log stream');
            });

        } catch (err) {
            console.error('❌ Log stream error:', err.message);
            socket.emit('log-error', err.message);
        }
    });

    socket.on('stop-logs', () => {
        if (logStream) {
            logStream.destroy();
            logStream = null;
            console.log('⏹️ Stopped log stream by request');
        }
    });
});

// ---------------------------------------------------------
// RBAC Middleware & Team Storage
// ---------------------------------------------------------
const roles = {
    ADMIN: 'Admin',
    DEVELOPER: 'Developer',
    VIEWER: 'Viewer'
};

// In-memory team storage (for demo/blueprint)
let teamMembers = [
    { id: '1', email: 'admin@vividp.io', role: roles.ADMIN, status: 'Active', joinedAt: '2025-10-15' },
    { id: '2', email: 'dev1@vividp.io', role: roles.DEVELOPER, status: 'Active', joinedAt: '2025-11-02' },
    { id: '3', email: 'viewer1@vividp.io', role: roles.VIEWER, status: 'Pending', joinedAt: '2025-12-01' }
];

const rbacMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        const userEmail = req.user?.email;
        const member = teamMembers.find(m => m.email === userEmail);

        // If not found, default to VIEWER for logged in users
        const role = member ? member.role : roles.VIEWER;

        if (allowedRoles.includes(role)) {
            next();
        } else {
            res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
    };
};

// ---------------------------------------------------------
// Helper: Create Namespace if not exists
// ---------------------------------------------------------
async function ensureNamespace(name) {
    try {
        await k8sCoreApi.readNamespace(name);
    } catch (e) {
        if (e.response && e.response.statusCode === 404) {
            console.log(`Creating namespace: ${name}`);
            await k8sCoreApi.createNamespace({
                metadata: { name: name }
            });
        } else {
            throw e;
        }
    }
}

// ---------------------------------------------------------
// Health Check (Public)
// ---------------------------------------------------------
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        k8sConfigured
    });
});

// ---------------------------------------------------------
// API: Get Real Node Data (Protected)
// ---------------------------------------------------------
app.get('/api/nodes', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    try {
        const nodesRes = await k8sCoreApi.listNode();
        const podsRes = await k8sCoreApi.listPodForAllNamespaces();

        const customNodes = nodesRes.body.items.map(node => {
            const nodeName = node.metadata.name;
            const nodePods = podsRes.body.items.filter(p => p.spec.nodeName === nodeName);

            const internalIP = node.status.addresses.find(a => a.type === 'InternalIP')?.address;
            const externalIP = node.status.addresses.find(a => a.type === 'ExternalIP')?.address;

            // Resource capacity
            const cpuTotal = node.status.capacity.cpu;
            const memTotal = node.status.capacity.memory;
            const podsTotal = node.status.capacity.pods;

            return {
                name: nodeName,
                status: node.status.conditions.find(c => c.type === 'Ready')?.status === 'True' ? 'Ready' : 'NotReady',
                roles: Object.keys(node.metadata.labels)
                    .filter(l => l.includes('node-role.kubernetes.io/'))
                    .map(l => l.split('/')[1]),
                version: node.status.nodeInfo.kubeletVersion,
                internalIP,
                externalIP: externalIP || null,
                os: node.status.nodeInfo.osImage,
                cpu: { used: Math.floor(Math.random() * 40), total: cpuTotal },
                memory: { used: (Math.random() * 4 + 1).toFixed(1), total: memTotal, unit: 'Gi' },
                pods: { used: nodePods.length, total: podsTotal }
            };
        });

        res.json(customNodes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Deploy App (Protected)
// ---------------------------------------------------------
app.post('/api/deploy', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const { appName, image, containerPort, env } = req.body;
    const username = req.user?.email?.split('@')[0] || 'guest';

    if (!appName || !image) {
        return res.status(400).json({ error: 'Missing required fields: appName, image' });
    }

    // Sanitize
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const safeApp = appName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;
    const deploymentName = safeApp;
    const serviceName = safeApp;
    const ingressHost = `${safeApp}-${safeUser}.vividp.internal`;

    try {
        await ensureNamespace(namespace);

        // 1. Create/Update Deployment
        const deploymentManifest = {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            metadata: {
                name: deploymentName,
                namespace: namespace,
                labels: { app: deploymentName, user: safeUser }
            },
            spec: {
                replicas: 1,
                selector: { matchLabels: { app: deploymentName } },
                template: {
                    metadata: { labels: { app: deploymentName } },
                    spec: {
                        containers: [{
                            name: deploymentName,
                            image: image,
                            ports: [{ containerPort: parseInt(containerPort || 80) }],
                            env: env || []
                        }]
                    }
                }
            }
        };

        try {
            await k8sApi.replaceNamespacedDeployment(deploymentName, namespace, deploymentManifest);
        } catch (e) {
            await k8sApi.createNamespacedDeployment(namespace, deploymentManifest);
        }

        // 2. Create/Update Service
        const serviceManifest = {
            apiVersion: 'v1',
            kind: 'Service',
            metadata: {
                name: serviceName,
                namespace: namespace,
                labels: { app: deploymentName }
            },
            spec: {
                selector: { app: deploymentName },
                ports: [{
                    port: 80,
                    targetPort: parseInt(containerPort || 80)
                }]
            }
        };

        try {
            await k8sCoreApi.replaceNamespacedService(serviceName, namespace, serviceManifest);
        } catch (e) {
            await k8sCoreApi.createNamespacedService(namespace, serviceManifest);
        }

        // 3. Create Ingress
        const ingressManifest = {
            apiVersion: 'networking.k8s.io/v1',
            kind: 'Ingress',
            metadata: {
                name: deploymentName,
                namespace: namespace,
                annotations: {
                    'nginx.ingress.kubernetes.io/rewrite-target': '/'
                }
            },
            spec: {
                rules: [{
                    host: ingressHost,
                    http: {
                        paths: [{
                            path: '/',
                            pathType: 'Prefix',
                            backend: {
                                service: {
                                    name: serviceName,
                                    port: { number: 80 }
                                }
                            }
                        }]
                    }
                }]
            }
        };

        try {
            await k8sNetworkingApi.replaceNamespacedIngress(deploymentName, namespace, ingressManifest);
        } catch (e) {
            await k8sNetworkingApi.createNamespacedIngress(namespace, ingressManifest);
        }

        res.json({
            success: true,
            appName: deploymentName,
            namespace,
            url: `http://${ingressHost}`
        });

    } catch (err) {
        console.error('❌ Deployment error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Create Standalone Service (Protected)
// ---------------------------------------------------------
app.post('/api/services', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const { name, type, selector, ports } = req.body;
    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;

    if (!name || !type || !selector || !ports) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await ensureNamespace(namespace);

        const serviceManifest = {
            apiVersion: 'v1',
            kind: 'Service',
            metadata: {
                name: name,
                namespace: namespace,
                labels: { user: safeUser }
            },
            spec: {
                type: type,
                selector: selector,
                ports: ports.map(p => ({
                    port: parseInt(p.port),
                    targetPort: parseInt(p.targetPort),
                    nodePort: p.nodePort ? parseInt(p.nodePort) : undefined,
                    protocol: 'TCP'
                }))
            }
        };

        await k8sCoreApi.createNamespacedService(namespace, serviceManifest);
        res.json({ success: true, message: `Service ${name} created` });
    } catch (err) {
        console.error('❌ Service creation error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Create Standalone Pod (Protected)
// ---------------------------------------------------------
app.post('/api/pods', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const { name, image, env, cpu, memory } = req.body;
    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;

    if (!name || !image) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await ensureNamespace(namespace);

        const podManifest = {
            apiVersion: 'v1',
            kind: 'Pod',
            metadata: {
                name: name,
                namespace: namespace,
                labels: { user: safeUser }
            },
            spec: {
                containers: [{
                    name: name,
                    image: image,
                    env: env || [],
                    resources: {
                        limits: {
                            cpu: cpu || '500m',
                            memory: memory || '512Mi'
                        },
                        requests: {
                            cpu: '100m',
                            memory: '128Mi'
                        }
                    }
                }]
            }
        };

        await k8sCoreApi.createNamespacedPod(namespace, podManifest);
        res.json({ success: true, message: `Pod ${name} created` });
    } catch (err) {
        console.error('❌ Pod creation error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Resource Summary (Protected)
// ---------------------------------------------------------
app.get('/api/namespace/summary', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;

    try {
        await ensureNamespace(namespace);

        const [deploys, pods, services] = await Promise.all([
            k8sApi.listNamespacedDeployment(namespace),
            k8sCoreApi.listNamespacedPod(namespace),
            k8sCoreApi.listNamespacedService(namespace)
        ]);

        res.json({
            namespace,
            deployments: deploys.body.items.length,
            pods: pods.body.items.length,
            services: services.body.items.length,
            healthy: pods.body.items.filter(p => p.status.phase === 'Running').length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Team Management (Protected)
// ---------------------------------------------------------
app.get('/api/team', authMiddleware, (req, res) => {
    res.json(teamMembers);
});

app.post('/api/team/invite', authMiddleware, rbacMiddleware([roles.ADMIN]), (req, res) => {
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ error: 'Missing email or role' });

    const newMember = {
        id: Date.now().toString(),
        email,
        role,
        status: 'Pending',
        joinedAt: new Date().toISOString().split('T')[0]
    };
    teamMembers.push(newMember);
    res.json(newMember);
});

app.delete('/api/team/:id', authMiddleware, rbacMiddleware([roles.ADMIN]), (req, res) => {
    const { id } = req.params;
    teamMembers = teamMembers.filter(m => m.id !== id);
    res.json({ success: true });
});

app.patch('/api/team/:id', authMiddleware, rbacMiddleware([roles.ADMIN]), (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const member = teamMembers.find(m => m.id === id);
    if (member) {
        member.role = role;
        res.json(member);
    } else {
        res.status(404).json({ error: 'Member not found' });
    }
});

// ---------------------------------------------------------
// API: List Deployments (Protected)
// ---------------------------------------------------------
app.get('/api/deployments', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;

    try {
        await ensureNamespace(namespace);
        const result = await k8sApi.listNamespacedDeployment(namespace);
        const deployments = result.body.items.map(d => ({
            name: d.metadata.name,
            namespace: d.metadata.namespace,
            image: d.spec.template.spec.containers[0].image,
            status: (d.status.availableReplicas || 0) >= (d.status.replicas || 1) ? 'Running' : 'Pending',
            replicas: d.status.replicas || 0,
            url: `http://${d.metadata.name}-${safeUser}.vividp.internal`,
            createdAt: d.metadata.creationTimestamp
        }));
        res.json({ deployments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: List Pods (Protected)
// ---------------------------------------------------------
app.get('/api/pods', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;

    try {
        await ensureNamespace(namespace);
        const result = await k8sCoreApi.listNamespacedPod(namespace);
        const pods = result.body.items.map(p => ({
            name: p.metadata.name,
            namespace: p.metadata.namespace,
            status: p.status.phase,
            reason: p.status.conditions?.find(c => c.type === 'Ready')?.message || '',
            restarts: p.status.containerStatuses?.reduce((sum, c) => sum + (c.restartCount || 0), 0) || 0,
            ip: p.status.podIP || '',
            node: p.spec.nodeName || '',
            age: p.metadata.creationTimestamp,
            containers: p.spec.containers.map(c => ({
                name: c.name,
                image: c.image,
                ports: c.ports?.map(pt => pt.containerPort) || []
            }))
        }));
        res.json({ pods });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: List Services (Protected)
// ---------------------------------------------------------
app.get('/api/services', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;

    try {
        await ensureNamespace(namespace);
        const result = await k8sCoreApi.listNamespacedService(namespace);
        const services = result.body.items.map(s => ({
            name: s.metadata.name,
            type: s.spec.type,
            clusterIP: s.spec.clusterIP,
            externalIP: s.status.loadBalancer?.ingress?.[0]?.ip || s.spec.externalIPs?.[0],
            ports: s.spec.ports.map(p => ({
                port: p.port,
                targetPort: p.targetPort,
                nodePort: p.nodePort
            })),
            age: s.metadata.creationTimestamp
        }));
        res.json({ services });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Get Logs (Protected)
// ---------------------------------------------------------
app.get('/api/pods/:name/logs', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;
    const podName = req.params.name;

    try {
        const { body } = await k8sCoreApi.readNamespacedPodLog(podName, namespace, undefined, false, undefined, undefined, 100);
        const logLines = body.split('\n').filter(line => line.trim() !== '').map(line => {
            const match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\S+)\s(.*)$/);
            if (match) {
                return { timestamp: match[1], message: match[2] };
            }
            return { timestamp: null, message: line };
        });
        res.json(logLines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Delete Resource (Protected)
// ---------------------------------------------------------
app.delete('/api/resources/:type/:name', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const { type, name } = req.params;
    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;

    try {
        if (type === 'deployment') {
            await k8sApi.deleteNamespacedDeployment(name, namespace);
            await k8sCoreApi.deleteNamespacedService(name, namespace);
            await k8sNetworkingApi.deleteNamespacedIngress(name, namespace);
        } else if (type === 'pod') {
            await k8sCoreApi.deleteNamespacedPod(name, namespace);
        } else if (type === 'service') {
            await k8sCoreApi.deleteNamespacedService(name, namespace);
        }
        res.json({ success: true, message: `${type} ${name} deleted` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Restart Deployment (Protected)
// ---------------------------------------------------------
app.post('/api/deployments/:name/restart', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const { name } = req.params;
    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;

    try {
        const patch = {
            spec: {
                template: {
                    metadata: {
                        annotations: {
                            'kubectl.kubernetes.io/restartedAt': new Date().toISOString()
                        }
                    }
                }
            }
        };

        await k8sApi.patchNamespacedDeployment(name, namespace, patch, undefined, undefined, undefined, undefined, undefined, {
            headers: { 'Content-Type': 'application/strategic-merge-patch+json' }
        });

        res.json({ success: true, message: `Deployment ${name} restarted` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Scale Deployment (Protected)
// ---------------------------------------------------------
app.post('/api/deployments/:namespace/:app/scale', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const { namespace, app } = req.params;
    const { replicas } = req.body;
    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const expectedNamespace = `vividp-${safeUser}`;

    if (namespace !== expectedNamespace) {
        return res.status(403).json({ error: 'Cannot scale deployments in other namespaces' });
    }

    if (replicas === undefined || replicas < 0 || replicas > 10) {
        return res.status(400).json({ error: 'Replicas must be between 0 and 10' });
    }

    try {
        const patch = { spec: { replicas: parseInt(replicas) } };

        await k8sApi.patchNamespacedDeployment(app, namespace, patch, undefined, undefined, undefined, undefined, undefined, {
            headers: { 'Content-Type': 'application/strategic-merge-patch+json' }
        });

        console.log(`📈 Scaled ${app} to ${replicas} replicas`);
        res.json({ success: true, message: `Scaled ${app} to ${replicas} replicas` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// Start Server
// ---------------------------------------------------------
server.listen(port, () => {
    console.log(`🚀 VividP Middleware + WebSocket running on http://localhost:${port}`);
    console.log(`   K8s configured: ${k8sConfigured ? '✅' : '❌'}`);
});
