import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface Deployment {
    name: string;
    namespace: string;
    image: string;
    status: string;
    replicas: number;
    url: string;
    createdAt: string;
}

const Portal = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const { user, session } = useAuth();

    // Deployment Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deployData, setDeployData] = useState({ appName: '', image: '', port: '80' });
    const [deployStatus, setDeployStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
    const [deployedUrl, setDeployedUrl] = useState('');
    const [deployedNamespace, setDeployedNamespace] = useState('');
    const [deployedAppName, setDeployedAppName] = useState('');
    const [logs, setLogs] = useState<string[]>([]);

    // Deployments List
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [loadingDeployments, setLoadingDeployments] = useState(true);
    const [pollingActive, setPollingActive] = useState(false);

    // Get auth token for API requests
    const getAuthHeaders = useCallback(() => {
        return {
            'Content-Type': 'application/json',
            'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
        };
    }, [session]);

    // Fetch user's deployments
    const fetchDeployments = useCallback(async () => {
        try {
            const response = await fetch('/api/deployments', {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                setDeployments(data.deployments || []);
            }
        } catch (err) {
            console.error('Failed to fetch deployments:', err);
        } finally {
            setLoadingDeployments(false);
        }
    }, [getAuthHeaders]);

    // Initial load and polling
    useEffect(() => {
        fetchDeployments();

        // Poll every 10 seconds for status updates
        const interval = setInterval(fetchDeployments, 10000);
        return () => clearInterval(interval);
    }, [fetchDeployments]);

    // Poll during deployment
    useEffect(() => {
        if (!pollingActive || !deployedNamespace || !deployedAppName) return;

        const pollStatus = async () => {
            try {
                const response = await fetch(`/api/status/${deployedNamespace}/${deployedAppName}`, {
                    headers: getAuthHeaders()
                });

                if (response.ok) {
                    const data = await response.json();
                    setLogs(prev => [...prev, `📡 Status: ${data.status}`]);

                    if (data.ready) {
                        setLogs(prev => [...prev, '✅ Deployment is ready!']);
                        setPollingActive(false);
                        fetchDeployments();
                    } else if (data.status === 'ErrImagePull' || data.status === 'CrashLoopBackOff') {
                        setLogs(prev => [...prev, `❌ Deployment failed: ${data.status}`]);
                        setPollingActive(false);
                        setDeployStatus('error');
                    }
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        };

        const interval = setInterval(pollStatus, 5000);
        pollStatus(); // Initial poll

        return () => clearInterval(interval);
    }, [pollingActive, deployedNamespace, deployedAppName, getAuthHeaders, fetchDeployments]);

    // Deploy handler
    const handleDeploy = async (e: React.FormEvent) => {
        e.preventDefault();
        setDeployStatus('deploying');
        setLogs(['🚀 Initiating deployment sequence...']);

        try {
            setLogs(prev => [...prev, '📦 Pulling Docker image: ' + deployData.image]);

            const response = await fetch('/api/deploy', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    appName: deployData.appName,
                    image: deployData.image,
                    containerPort: deployData.port
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Deployment failed');
            }

            setLogs(prev => [...prev, '🔧 Creating Kubernetes resources...']);
            setLogs(prev => [...prev, '🌐 Configuring Ingress...']);
            setDeployedUrl(data.url);
            setDeployedNamespace(data.namespace);
            setDeployedAppName(data.deploymentName);
            setPollingActive(true);

            setTimeout(() => {
                setLogs(prev => [...prev, '✅ Resources created! Waiting for pod to be ready...']);
                setDeployStatus('success');
            }, 1000);

        } catch (err: any) {
            setLogs(prev => [...prev, '❌ Error: ' + err.message]);
            setDeployStatus('error');
        }
    };

    // Delete deployment
    const handleDelete = async (deployment: Deployment) => {
        if (!confirm(`Delete ${deployment.name}? This cannot be undone.`)) return;

        try {
            const response = await fetch(`/api/deployments/${deployment.namespace}/${deployment.name}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                setDeployments(prev => prev.filter(d => d.name !== deployment.name));
            } else {
                const data = await response.json();
                alert(`Delete failed: ${data.error}`);
            }
        } catch (err: any) {
            alert(`Delete failed: ${err.message}`);
        }
    };

    // Restart deployment
    const handleRestart = async (deployment: Deployment) => {
        try {
            const response = await fetch(`/api/deployments/${deployment.namespace}/${deployment.name}/restart`, {
                method: 'POST',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                setDeployments(prev => prev.map(d =>
                    d.name === deployment.name ? { ...d, status: 'Restarting' } : d
                ));
                setTimeout(fetchDeployments, 5000);
            } else {
                const data = await response.json();
                alert(`Restart failed: ${data.error}`);
            }
        } catch (err: any) {
            alert(`Restart failed: ${err.message}`);
        }
    };

    // Reset modal state
    const closeModal = () => {
        setIsModalOpen(false);
        setDeployStatus('idle');
        setDeployData({ appName: '', image: '', port: '80' });
        setLogs([]);
        setPollingActive(false);
    };

    const templates = [
        { title: 'Nginx Web Server', desc: 'Static site hosting', icon: '🌐', image: 'nginx:alpine', port: '80' },
        { title: 'Node.js API', desc: 'Express.js backend', icon: '⚡', image: 'node:18-alpine', port: '3000' },
        { title: 'Redis Cache', desc: 'In-memory data store', icon: '🔴', image: 'redis:alpine', port: '6379' },
        { title: 'PostgreSQL', desc: 'Relational database', icon: '🐘', image: 'postgres:15-alpine', port: '5432' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Running': return 'bg-green-500/20 text-green-400';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'Restarting': return 'bg-blue-500/20 text-blue-400';
            case 'ContainerCreating': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-red-500/20 text-red-400';
        }
    };

    return (
        <>
            <Header title="Developer Portal" onMenuClick={() => setSidebarOpen(!sidebarOpen)}>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-cyan-500/20 transition-all hover:-translate-y-0.5"
                >
                    + New Deployment
                </button>
            </Header>

            {/* Deployment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="glass w-full max-w-lg rounded-xl overflow-hidden border border-cyan-500/30 animate-scale-in">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold">One-Click Deploy</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white text-xl">✕</button>
                        </div>

                        {deployStatus === 'idle' || deployStatus === 'error' ? (
                            <form onSubmit={handleDeploy} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Application Name</label>
                                    <input
                                        required
                                        type="text"
                                        pattern="[a-z0-9-]+"
                                        title="Lowercase letters, numbers, and hyphens only"
                                        placeholder="my-app"
                                        className="w-full bg-black/40 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none"
                                        value={deployData.appName}
                                        onChange={e => setDeployData({ ...deployData, appName: e.target.value.toLowerCase() })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Docker Image</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="nginx:latest"
                                        className="w-full bg-black/40 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none"
                                        value={deployData.image}
                                        onChange={e => setDeployData({ ...deployData, image: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Container Port</label>
                                    <input
                                        type="number"
                                        placeholder="80"
                                        className="w-full bg-black/40 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none"
                                        value={deployData.port}
                                        onChange={e => setDeployData({ ...deployData, port: e.target.value })}
                                    />
                                </div>

                                {deployStatus === 'error' && logs.length > 0 && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                        {logs[logs.length - 1]}
                                    </div>
                                )}

                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                    <button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                                        🚀 Deploy Now
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="p-6 space-y-4">
                                {/* Log Output */}
                                <div className="bg-black/40 rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-sm space-y-1">
                                    {logs.map((log, i) => (
                                        <div key={i} className={`${log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : 'text-cyan-400'}`}>
                                            {log}
                                        </div>
                                    ))}
                                    {pollingActive && (
                                        <div className="animate-pulse text-cyan-500">_ Polling for status...</div>
                                    )}
                                </div>

                                {deployStatus === 'success' && !pollingActive && (
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                                        <div className="text-2xl mb-2">🎉</div>
                                        <div className="text-lg font-bold mb-2">Deployed Successfully!</div>
                                        <a href={deployedUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all block mb-3">
                                            {deployedUrl}
                                        </a>
                                        <p className="text-xs text-gray-400 mb-4">
                                            Add this host to your /etc/hosts file pointing to your cluster IP to access it.
                                        </p>
                                        <button onClick={closeModal} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors">
                                            Done
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Deploy Templates */}
                    <section>
                        <h3 className="text-xl font-bold mb-4">Quick Deploy Templates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {templates.map((t, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setDeployData({ appName: t.title.toLowerCase().replace(/\s+/g, '-'), image: t.image, port: t.port });
                                        setIsModalOpen(true);
                                    }}
                                    className="glass p-6 rounded-xl border border-white/10 hover:border-cyan-500/50 transition-all hover:-translate-y-1 text-left group"
                                >
                                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform inline-block">{t.icon}</div>
                                    <h4 className="font-bold text-lg">{t.title}</h4>
                                    <p className="text-sm text-gray-400">{t.desc}</p>
                                    <p className="text-xs text-cyan-400 mt-2 font-mono">{t.image}</p>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Deployments List */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Your Deployments</h3>
                            <button onClick={fetchDeployments} className="text-sm text-cyan-400 hover:underline">
                                ↻ Refresh
                            </button>
                        </div>
                        <div className="glass rounded-xl overflow-hidden">
                            {loadingDeployments ? (
                                <div className="p-8 text-center text-gray-400">Loading deployments...</div>
                            ) : deployments.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <div className="text-4xl mb-2">📦</div>
                                    <p>No deployments yet. Create your first one!</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-gray-400 text-sm">
                                        <tr>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Image</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {deployments.map((dep) => (
                                            <tr key={dep.name} className="border-t border-gray-700 hover:bg-white/5">
                                                <td className="p-4">
                                                    <div className="font-medium">{dep.name}</div>
                                                    <a href={dep.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline">
                                                        {dep.url}
                                                    </a>
                                                </td>
                                                <td className="p-4 text-gray-400 font-mono text-xs">{dep.image}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(dep.status)}`}>
                                                        {dep.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleRestart(dep)}
                                                            className="text-blue-400 hover:text-blue-300"
                                                            title="Restart"
                                                        >
                                                            🔄
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(dep)}
                                                            className="text-red-400 hover:text-red-300"
                                                            title="Delete"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="glass p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-lg text-center">
                                <div className="text-2xl font-bold text-cyan-400">{deployments.length}</div>
                                <div className="text-xs text-gray-400">Active Deployments</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-lg text-center">
                                <div className="text-2xl font-bold text-green-400">
                                    {deployments.filter(d => d.status === 'Running').length}
                                </div>
                                <div className="text-xs text-gray-400">Running</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4">User Info</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                                    <span className="text-white font-semibold">
                                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium">{user?.user_metadata?.full_name || 'User'}</p>
                                    <p className="text-xs text-gray-400">{user?.email}</p>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-white/10">
                                <p className="text-xs text-gray-400">Namespace:</p>
                                <p className="font-mono text-cyan-400 text-sm">
                                    vividp-{user?.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'guest'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                .animate-scale-in { animation: scale-in 0.2s ease-out; }
            `}</style>
        </>
    );
};

export default Portal;
