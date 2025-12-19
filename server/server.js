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
// Start Server
// ---------------------------------------------------------
app.listen(port, () => {
    console.log(`🚀 VividP Middleware running on http://localhost:${port}`);
    console.log(`   K8s configured: ${k8sConfigured ? '✅' : '❌'}`);
});
