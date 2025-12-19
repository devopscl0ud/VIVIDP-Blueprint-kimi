const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const k8s = require('@kubernetes/client-node');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { authMiddleware, optionalAuth } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Load Kubeconfig
const kubeData = path.join(__dirname, '../.kube/admin-config');
const kc = new k8s.KubeConfig();

let k8sApi, k8sCoreApi, k8sNetworkingApi;
let k8sConfigured = false;

try {
    if (fs.existsSync(kubeData)) {
        kc.loadFromFile(kubeData);
        k8sApi = kc.makeApiClient(k8s.AppsV1Api);
        k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
        k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api);
        k8sConfigured = true;
        console.log('✅ Loaded kubeconfig from:', kubeData);
    } else {
        console.warn('⚠️ Kubeconfig not found at:', kubeData);
    }
} catch (e) {
    console.error('❌ Failed to load kubeconfig:', e.message);
}

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
                labels: { app: safeApp, owner: safeUser, 'vividp.io/managed': 'true' }
            },
            spec: {
                replicas: 1,
                selector: { matchLabels: { app: safeApp } },
                template: {
                    metadata: { labels: { app: safeApp } },
                    spec: {
                        containers: [{
                            name: safeApp,
                            image: image,
                            ports: [{ containerPort: parseInt(containerPort) || 80 }],
                            env: env || [],
                            resources: {
                                limits: { cpu: '500m', memory: '512Mi' },
                                requests: { cpu: '100m', memory: '128Mi' }
                            }
                        }]
                    }
                }
            }
        };

        try {
            await k8sApi.createNamespacedDeployment(namespace, deploymentManifest);
            console.log(`✅ Created deployment: ${deploymentName}`);
        } catch (e) {
            if (e.response && e.response.statusCode === 409) {
                await k8sApi.replaceNamespacedDeployment(deploymentName, namespace, deploymentManifest);
                console.log(`🔄 Updated deployment: ${deploymentName}`);
            } else {
                throw e;
            }
        }

        // 2. Create Service
        const serviceManifest = {
            apiVersion: 'v1',
            kind: 'Service',
            metadata: {
                name: serviceName,
                namespace: namespace,
                labels: { app: safeApp }
            },
            spec: {
                selector: { app: safeApp },
                ports: [{ port: 80, targetPort: parseInt(containerPort) || 80 }],
                type: 'ClusterIP'
            }
        };

        try {
            await k8sCoreApi.createNamespacedService(namespace, serviceManifest);
            console.log(`✅ Created service: ${serviceName}`);
        } catch (e) {
            if (e.response && e.response.statusCode === 409) {
                console.log(`ℹ️ Service ${serviceName} already exists`);
            } else {
                throw e;
            }
        }

        // 3. Create Ingress
        const ingressManifest = {
            apiVersion: 'networking.k8s.io/v1',
            kind: 'Ingress',
            metadata: {
                name: safeApp,
                namespace: namespace,
                annotations: {
                    'nginx.ingress.kubernetes.io/rewrite-target': '/'
                }
            },
            spec: {
                ingressClassName: 'nginx',
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
            await k8sNetworkingApi.createNamespacedIngress(namespace, ingressManifest);
            console.log(`✅ Created ingress: ${ingressHost}`);
        } catch (e) {
            if (e.response && e.response.statusCode === 409) {
                console.log(`ℹ️ Ingress for ${ingressHost} already exists`);
            } else {
                throw e;
            }
        }

        res.json({
            success: true,
            message: 'Deployment triggered',
            url: `http://${ingressHost}`,
            namespace: namespace,
            deploymentName: deploymentName
        });

    } catch (err) {
        console.error('❌ Deployment Failed:', err);
        res.status(500).json({ error: err.message, details: err.body });
    }
});

// ---------------------------------------------------------
// API: List User's Deployments (Protected)
// ---------------------------------------------------------
app.get('/api/deployments', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;

    try {
        const deployments = await k8sApi.listNamespacedDeployment(namespace);

        const apps = await Promise.all(deployments.body.items.map(async (dep) => {
            const name = dep.metadata.name;
            let status = 'Unknown';
            let podStatus = 'Pending';

            try {
                const pods = await k8sCoreApi.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, `app=${name}`);
                if (pods.body.items.length > 0) {
                    const pod = pods.body.items[0];
                    podStatus = pod.status.phase;

                    if (pod.status.containerStatuses && pod.status.containerStatuses.length > 0) {
                        const state = pod.status.containerStatuses[0].state;
                        if (state.running) {
                            status = 'Running';
                        } else if (state.waiting) {
                            status = state.waiting.reason || 'Waiting';
                        } else if (state.terminated) {
                            status = 'Terminated';
                        }
                    } else {
                        status = podStatus;
                    }
                }
            } catch (e) {
                status = 'Error';
            }

            return {
                name,
                namespace,
                image: dep.spec.template.spec.containers[0]?.image || 'unknown',
                replicas: dep.status.readyReplicas || 0,
                status,
                createdAt: dep.metadata.creationTimestamp,
                url: `http://${name}-${safeUser}.vividp.internal`
            };
        }));

        res.json({ deployments: apps });
    } catch (err) {
        if (err.response && err.response.statusCode === 404) {
            return res.json({ deployments: [] });
        }
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Get Deployment Status (Protected)
// ---------------------------------------------------------
app.get('/api/status/:namespace/:app', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const { namespace, app } = req.params;

    try {
        const pods = await k8sCoreApi.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, `app=${app}`);

        let status = 'Pending';
        let reason = '';
        let ready = false;

        if (pods.body.items.length > 0) {
            const pod = pods.body.items[0];
            status = pod.status.phase;

            if (pod.status.containerStatuses && pod.status.containerStatuses.length > 0) {
                const containerState = pod.status.containerStatuses[0].state;
                if (containerState.waiting) {
                    reason = containerState.waiting.reason;
                    status = reason;
                } else if (containerState.running) {
                    status = 'Running';
                    ready = true;
                }
            }
        } else {
            status = 'NotFound';
        }

        res.json({ status, reason, ready });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Delete Deployment (Protected)
// ---------------------------------------------------------
app.delete('/api/deployments/:namespace/:app', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const { namespace, app } = req.params;
    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const expectedNamespace = `vividp-${safeUser}`;

    // Security: Only allow deletion in user's own namespace
    if (namespace !== expectedNamespace) {
        return res.status(403).json({ error: 'Cannot delete deployments in other namespaces' });
    }

    try {
        // Delete Deployment
        try {
            await k8sApi.deleteNamespacedDeployment(app, namespace);
            console.log(`🗑️ Deleted deployment: ${app}`);
        } catch (e) {
            if (e.response?.statusCode !== 404) throw e;
        }

        // Delete Service
        try {
            await k8sCoreApi.deleteNamespacedService(app, namespace);
            console.log(`🗑️ Deleted service: ${app}`);
        } catch (e) {
            if (e.response?.statusCode !== 404) throw e;
        }

        // Delete Ingress
        try {
            await k8sNetworkingApi.deleteNamespacedIngress(app, namespace);
            console.log(`🗑️ Deleted ingress: ${app}`);
        } catch (e) {
            if (e.response?.statusCode !== 404) throw e;
        }

        res.json({ success: true, message: `Deleted ${app} from ${namespace}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Restart Deployment (Protected)
// ---------------------------------------------------------
app.post('/api/deployments/:namespace/:app/restart', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const { namespace, app } = req.params;
    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const expectedNamespace = `vividp-${safeUser}`;

    if (namespace !== expectedNamespace) {
        return res.status(403).json({ error: 'Cannot restart deployments in other namespaces' });
    }

    try {
        // Trigger rollout restart by patching annotation
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

        await k8sApi.patchNamespacedDeployment(app, namespace, patch, undefined, undefined, undefined, undefined, undefined, {
            headers: { 'Content-Type': 'application/strategic-merge-patch+json' }
        });

        console.log(`🔄 Restarted deployment: ${app}`);
        res.json({ success: true, message: `Restarted ${app}` });
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
        const pods = await k8sCoreApi.listNamespacedPod(namespace);

        const podList = pods.body.items.map(pod => {
            const containerStatuses = pod.status.containerStatuses || [];
            const mainContainer = containerStatuses[0];

            let status = pod.status.phase;
            let reason = '';
            let restarts = 0;

            if (mainContainer) {
                restarts = mainContainer.restartCount || 0;
                if (mainContainer.state?.waiting) {
                    status = mainContainer.state.waiting.reason || 'Waiting';
                    reason = mainContainer.state.waiting.message || '';
                } else if (mainContainer.state?.terminated) {
                    status = 'Terminated';
                    reason = mainContainer.state.terminated.reason || '';
                } else if (mainContainer.state?.running) {
                    status = mainContainer.ready ? 'Running' : 'Starting';
                }
            }

            return {
                name: pod.metadata.name,
                namespace: pod.metadata.namespace,
                status,
                reason,
                restarts,
                ip: pod.status.podIP || 'N/A',
                node: pod.spec.nodeName || 'Pending',
                age: pod.metadata.creationTimestamp,
                labels: pod.metadata.labels || {},
                containers: pod.spec.containers.map(c => ({
                    name: c.name,
                    image: c.image,
                    ports: c.ports?.map(p => p.containerPort) || []
                }))
            };
        });

        res.json({ pods: podList, namespace });
    } catch (err) {
        if (err.response?.statusCode === 404) {
            return res.json({ pods: [], namespace });
        }
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
        const services = await k8sCoreApi.listNamespacedService(namespace);

        const serviceList = services.body.items.map(svc => ({
            name: svc.metadata.name,
            namespace: svc.metadata.namespace,
            type: svc.spec.type,
            clusterIP: svc.spec.clusterIP,
            ports: svc.spec.ports?.map(p => ({
                port: p.port,
                targetPort: p.targetPort,
                protocol: p.protocol
            })) || [],
            selector: svc.spec.selector || {},
            age: svc.metadata.creationTimestamp
        }));

        res.json({ services: serviceList, namespace });
    } catch (err) {
        if (err.response?.statusCode === 404) {
            return res.json({ services: [], namespace });
        }
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Get Pod Logs (Protected)
// ---------------------------------------------------------
app.get('/api/pods/:podName/logs', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const { podName } = req.params;
    const { container, tail = '100' } = req.query;
    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;

    try {
        const options = {
            tailLines: parseInt(tail) || 100,
            timestamps: true
        };

        if (container) {
            options.container = container;
        }

        const logs = await k8sCoreApi.readNamespacedPodLog(
            podName,
            namespace,
            container,
            undefined, // follow
            undefined, // insecureSkipTLSVerifyBackend
            undefined, // limitBytes
            undefined, // pretty
            undefined, // previous
            undefined, // sinceSeconds
            parseInt(tail) || 100, // tailLines
            true // timestamps
        );

        // Parse logs into array
        const logLines = logs.body
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                const match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z)\s+(.*)$/);
                if (match) {
                    return { timestamp: match[1], message: match[2] };
                }
                return { timestamp: null, message: line };
            });

        res.json({ logs: logLines, podName, namespace });
    } catch (err) {
        if (err.response?.statusCode === 404) {
            return res.status(404).json({ error: `Pod ${podName} not found` });
        }
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Get Namespace Resources Summary (Protected)
// ---------------------------------------------------------
app.get('/api/namespace/summary', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;

    try {
        // Get counts
        const [deployments, pods, services] = await Promise.all([
            k8sApi.listNamespacedDeployment(namespace).catch(() => ({ body: { items: [] } })),
            k8sCoreApi.listNamespacedPod(namespace).catch(() => ({ body: { items: [] } })),
            k8sCoreApi.listNamespacedService(namespace).catch(() => ({ body: { items: [] } }))
        ]);

        const runningPods = pods.body.items.filter(p => p.status.phase === 'Running').length;
        const readyDeployments = deployments.body.items.filter(d =>
            d.status.readyReplicas === d.status.replicas
        ).length;

        res.json({
            namespace,
            summary: {
                deployments: {
                    total: deployments.body.items.length,
                    ready: readyDeployments
                },
                pods: {
                    total: pods.body.items.length,
                    running: runningPods
                },
                services: {
                    total: services.body.items.length
                }
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Delete Pod (Protected)
// ---------------------------------------------------------
app.delete('/api/pods/:podName', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const { podName } = req.params;
    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;

    try {
        await k8sCoreApi.deleteNamespacedPod(podName, namespace);
        console.log(`🗑️ Deleted pod: ${podName}`);
        res.json({ success: true, message: `Deleted pod ${podName}` });
    } catch (err) {
        if (err.response?.statusCode === 404) {
            return res.status(404).json({ error: `Pod ${podName} not found` });
        }
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Delete Service (Protected)
// ---------------------------------------------------------
app.delete('/api/services/:serviceName', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const { serviceName } = req.params;
    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;

    try {
        await k8sCoreApi.deleteNamespacedService(serviceName, namespace);
        console.log(`🗑️ Deleted service: ${serviceName}`);
        res.json({ success: true, message: `Deleted service ${serviceName}` });
    } catch (err) {
        if (err.response?.statusCode === 404) {
            return res.status(404).json({ error: `Service ${serviceName} not found` });
        }
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Create Pod (Protected)
// ---------------------------------------------------------
app.post('/api/pods', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const { name, image, port, command, args, env } = req.body;
    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;

    if (!name || !image) {
        return res.status(400).json({ error: 'Missing required fields: name, image' });
    }

    const safeName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 50);

    try {
        await ensureNamespace(namespace);

        const podSpec = {
            apiVersion: 'v1',
            kind: 'Pod',
            metadata: {
                name: safeName,
                namespace: namespace,
                labels: {
                    app: safeName,
                    'vividp-user': safeUser,
                    'vividp-managed': 'true'
                }
            },
            spec: {
                containers: [{
                    name: safeName,
                    image: image,
                    ports: port ? [{ containerPort: parseInt(port) }] : [],
                    command: command ? command.split(' ') : undefined,
                    args: args ? args.split(' ') : undefined,
                    env: env ? Object.entries(env).map(([k, v]) => ({ name: k, value: v })) : undefined
                }],
                restartPolicy: 'Always'
            }
        };

        await k8sCoreApi.createNamespacedPod(namespace, podSpec);
        console.log(`✅ Created pod: ${safeName} in ${namespace}`);

        res.json({ success: true, name: safeName, namespace });
    } catch (err) {
        console.error('Create pod error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// API: Create Service (Protected)
// ---------------------------------------------------------
app.post('/api/services', authMiddleware, async (req, res) => {
    if (!k8sConfigured) {
        return res.status(503).json({ error: 'Kubernetes not configured' });
    }

    const { name, selector, port, targetPort, type = 'ClusterIP', nodePort } = req.body;
    const username = req.user?.email?.split('@')[0] || 'guest';
    const safeUser = username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const namespace = `vividp-${safeUser}`;

    if (!name || !selector || !port) {
        return res.status(400).json({ error: 'Missing required fields: name, selector, port' });
    }

    const safeName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 50);
    const serviceType = ['ClusterIP', 'NodePort', 'LoadBalancer'].includes(type) ? type : 'ClusterIP';

    try {
        await ensureNamespace(namespace);

        const serviceSpec = {
            apiVersion: 'v1',
            kind: 'Service',
            metadata: {
                name: safeName,
                namespace: namespace,
                labels: {
                    'vividp-user': safeUser,
                    'vividp-managed': 'true'
                }
            },
            spec: {
                type: serviceType,
                selector: typeof selector === 'string' ? { app: selector } : selector,
                ports: [{
                    port: parseInt(port),
                    targetPort: parseInt(targetPort || port),
                    protocol: 'TCP',
                    ...(serviceType === 'NodePort' && nodePort ? { nodePort: parseInt(nodePort) } : {})
                }]
            }
        };

        await k8sCoreApi.createNamespacedService(namespace, serviceSpec);
        console.log(`✅ Created service: ${safeName} (${serviceType}) in ${namespace}`);

        res.json({ success: true, name: safeName, type: serviceType, namespace });
    } catch (err) {
        console.error('Create service error:', err.message);
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
app.listen(port, () => {
    console.log(`🚀 VividP Middleware running on http://localhost:${port}`);
    console.log(`   K8s configured: ${k8sConfigured ? '✅' : '❌'}`);
});
