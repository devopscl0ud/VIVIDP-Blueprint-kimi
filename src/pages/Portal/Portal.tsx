import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { ResourceCard, StatusBadge, ResourceTable, ConfirmModal } from '../../components/Portal/ResourceCard';
import LogViewer from '../../components/Portal/LogViewer';
import CreatePodModal from '../../components/Portal/CreatePodModal';
import CreateServiceModal from '../../components/Portal/CreateServiceModal';
import ScaleDeploymentModal from '../../components/Portal/ScaleDeploymentModal';

interface Pod {
    name: string;
    namespace: string;
    status: string;
    reason: string;
    restarts: number;
    ip: string;
    node: string;
    age: string;
    containers: { name: string; image: string; ports: number[] }[];
}

interface Service {
    name: string;
    namespace: string;
    type: string;
    clusterIP: string;
    ports: { port: number; targetPort: string | number; protocol: string }[];
    age: string;
}

interface Deployment {
    name: string;
    namespace: string;
    image: string;
    status: string;
    replicas: number;
    url: string;
    createdAt: string;
}

interface LogLine {
    timestamp: string | null;
    message: string;
}

interface Summary {
    deployments: { total: number; ready: number };
    pods: { total: number; running: number };
    services: { total: number };
}

type TabType = 'overview' | 'deployments' | 'pods' | 'services' | 'logs';

const Portal = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const { user, session } = useAuth();

    // UI State
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ type: string; name: string } | null>(null);
    const [selectedPodForLogs, setSelectedPodForLogs] = useState<string | null>(null);
    const [isPodModalOpen, setIsPodModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [scaleModal, setScaleModal] = useState<{ name: string; replicas: number } | null>(null);

    // Data State
    const [summary, setSummary] = useState<Summary | null>(null);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [pods, setPods] = useState<Pod[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [logs, setLogs] = useState<LogLine[]>([]);
    const [namespace, setNamespace] = useState('');

    // Loading States
    const [loading, setLoading] = useState({ summary: true, deployments: true, pods: true, services: true, logs: false });

    // Deploy Form
    const [deployForm, setDeployForm] = useState({ appName: '', image: '', port: '80' });
    const [deployStatus, setDeployStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
    const [deployLogs, setDeployLogs] = useState<string[]>([]);

    // Auth headers
    const getAuthHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
    }), [session]);

    // Fetch functions
    const fetchSummary = useCallback(async () => {
        try {
            const res = await fetch('/api/namespace/summary', { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setSummary(data.summary);
                setNamespace(data.namespace);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(l => ({ ...l, summary: false })); }
    }, [getAuthHeaders]);

    const fetchDeployments = useCallback(async () => {
        try {
            const res = await fetch('/api/deployments', { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setDeployments(data.deployments || []);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(l => ({ ...l, deployments: false })); }
    }, [getAuthHeaders]);

    const fetchPods = useCallback(async () => {
        try {
            const res = await fetch('/api/pods', { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setPods(data.pods || []);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(l => ({ ...l, pods: false })); }
    }, [getAuthHeaders]);

    const fetchServices = useCallback(async () => {
        try {
            const res = await fetch('/api/services', { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setServices(data.services || []);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(l => ({ ...l, services: false })); }
    }, [getAuthHeaders]);

    const fetchLogs = useCallback(async (podName: string) => {
        setLoading(l => ({ ...l, logs: true }));
        try {
            const res = await fetch(`/api/pods/${podName}/logs?tail=100`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || []);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(l => ({ ...l, logs: false })); }
    }, [getAuthHeaders]);

    // Initial load
    useEffect(() => {
        fetchSummary();
        fetchDeployments();
        fetchPods();
        fetchServices();
    }, [fetchSummary, fetchDeployments, fetchPods, fetchServices]);

    // Auto-refresh
    useEffect(() => {
        const interval = setInterval(() => {
            fetchSummary();
            fetchDeployments();
            fetchPods();
        }, 10000);
        return () => clearInterval(interval);
    }, [fetchSummary, fetchDeployments, fetchPods]);

    // Load logs when pod selected
    useEffect(() => {
        if (selectedPodForLogs) {
            fetchLogs(selectedPodForLogs);
        }
    }, [selectedPodForLogs, fetchLogs]);

    // Deploy handler
    const handleDeploy = async (e: React.FormEvent) => {
        e.preventDefault();
        setDeployStatus('deploying');
        setDeployLogs(['🚀 Starting deployment...']);

        try {
            setDeployLogs(l => [...l, `📦 Pulling image: ${deployForm.image}`]);

            const res = await fetch('/api/deploy', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    appName: deployForm.appName,
                    image: deployForm.image,
                    containerPort: deployForm.port
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setDeployLogs(l => [...l, '✅ Deployment created!', `🌐 URL: ${data.url}`]);
            setDeployStatus('success');

            // Refresh data
            setTimeout(() => {
                fetchSummary();
                fetchDeployments();
                fetchPods();
                fetchServices();
            }, 2000);

        } catch (err: any) {
            setDeployLogs(l => [...l, `❌ Error: ${err.message}`]);
            setDeployStatus('error');
        }
    };

    // Delete handlers
    const handleDeleteDeployment = async (name: string) => {
        try {
            await fetch(`/api/deployments/${namespace}/${name}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            fetchDeployments();
            fetchPods();
            fetchServices();
            fetchSummary();
        } catch (e) { console.error(e); }
    };

    const handleDeletePod = async (name: string) => {
        try {
            await fetch(`/api/pods/${name}`, { method: 'DELETE', headers: getAuthHeaders() });
            fetchPods();
            fetchSummary();
        } catch (e) { console.error(e); }
    };

    const handleDeleteService = async (name: string) => {
        try {
            await fetch(`/api/services/${name}`, { method: 'DELETE', headers: getAuthHeaders() });
            fetchServices();
            fetchSummary();
        } catch (e) { console.error(e); }
    };

    const handleRestart = async (name: string) => {
        try {
            await fetch(`/api/deployments/${namespace}/${name}/restart`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            fetchPods();
            fetchDeployments();
        } catch (e) { console.error(e); }
    };

    // Calculate time ago
    const timeAgo = (date: string) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    };

    const templates = [
        { name: 'nginx', title: 'Nginx', icon: '🌐', image: 'nginx:alpine', port: '80' },
        { name: 'node', title: 'Node.js', icon: '💚', image: 'node:18-alpine', port: '3000' },
        { name: 'redis', title: 'Redis', icon: '🔴', image: 'redis:alpine', port: '6379' },
        { name: 'postgres', title: 'PostgreSQL', icon: '🐘', image: 'postgres:15-alpine', port: '5432' },
    ];

    return (
        <>
            <Header title="Developer Portal" onMenuClick={() => setSidebarOpen(!sidebarOpen)}>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-sm">
                        <span className="text-gray-400">Namespace:</span>
                        <code className="bg-black/30 px-2 py-1 rounded text-cyan-400 font-mono text-xs">{namespace || '...'}</code>
                    </div>
                    <button
                        onClick={() => { setIsDeployModalOpen(true); setDeployStatus('idle'); setDeployLogs([]); }}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl flex items-center gap-2"
                    >
                        <span>🚀</span> Deploy
                    </button>
                </div>
            </Header>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-lg overflow-x-auto">
                {[
                    { id: 'overview', label: 'Overview', icon: '📊' },
                    { id: 'deployments', label: 'Deployments', icon: '🚀' },
                    { id: 'pods', label: 'Pods', icon: '📦' },
                    { id: 'services', label: 'Services', icon: '🔌' },
                    { id: 'logs', label: 'Logs', icon: '📜' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-cyan-500 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ResourceCard
                                title="Deployments"
                                count={summary?.deployments.total ?? 0}
                                subtitle={`${summary?.deployments.ready ?? 0} ready`}
                                icon="🚀"
                                color="cyan"
                                loading={loading.summary}
                                onClick={() => setActiveTab('deployments')}
                            />
                            <ResourceCard
                                title="Pods"
                                count={summary?.pods.total ?? 0}
                                subtitle={`${summary?.pods.running ?? 0} running`}
                                icon="📦"
                                color="green"
                                loading={loading.summary}
                                onClick={() => setActiveTab('pods')}
                            />
                            <ResourceCard
                                title="Services"
                                count={summary?.services.total ?? 0}
                                subtitle="Exposed"
                                icon="🔌"
                                color="purple"
                                loading={loading.summary}
                                onClick={() => setActiveTab('services')}
                            />
                        </div>

                        {/* Quick Deploy Templates */}
                        <div className="glass p-6 rounded-xl">
                            <h3 className="text-lg font-bold mb-4">Quick Deploy Templates</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {templates.map(t => (
                                    <button
                                        key={t.name}
                                        onClick={() => {
                                            setDeployForm({ appName: `${t.name}-app`, image: t.image, port: t.port });
                                            setIsDeployModalOpen(true);
                                            setDeployStatus('idle');
                                            setDeployLogs([]);
                                        }}
                                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-cyan-500/50 transition-all hover:-translate-y-1 text-center group"
                                    >
                                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{t.icon}</div>
                                        <div className="font-medium">{t.title}</div>
                                        <div className="text-xs text-gray-500 font-mono mt-1">{t.image}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Deployments */}
                        <div className="glass p-6 rounded-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Recent Deployments</h3>
                                <button onClick={() => setActiveTab('deployments')} className="text-cyan-400 text-sm hover:underline">
                                    View All →
                                </button>
                            </div>
                            {deployments.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <div className="text-4xl mb-2">🚀</div>
                                    <p>No deployments yet. Create your first one!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {deployments.slice(0, 3).map(d => (
                                        <div key={d.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <StatusBadge status={d.status} pulse />
                                                <div>
                                                    <div className="font-medium">{d.name}</div>
                                                    <div className="text-xs text-gray-400 font-mono">{d.image}</div>
                                                </div>
                                            </div>
                                            <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-xs hover:underline">
                                                {d.url}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'deployments' && (
                    <ResourceTable
                        headers={['Name', 'Image', 'Status', 'Replicas', 'URL', 'Actions']}
                        isEmpty={deployments.length === 0}
                        loading={loading.deployments}
                        emptyMessage="No deployments found. Deploy your first app!"
                    >
                        {deployments.map(d => (
                            <tr key={d.name} className="border-t border-white/5 hover:bg-white/5">
                                <td className="p-4 font-medium">{d.name}</td>
                                <td className="p-4 font-mono text-xs text-gray-400">{d.image}</td>
                                <td className="p-4"><StatusBadge status={d.status} pulse /></td>
                                <td className="p-4">{d.replicas}</td>
                                <td className="p-4">
                                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm">
                                        {d.url}
                                    </a>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button onClick={() => setScaleModal({ name: d.name, replicas: d.replicas })} className="p-1.5 hover:bg-green-500/20 rounded text-green-400" title="Scale">📈</button>
                                        <button onClick={() => handleRestart(d.name)} className="p-1.5 hover:bg-blue-500/20 rounded text-blue-400" title="Restart">🔄</button>
                                        <button onClick={() => setDeleteModal({ type: 'deployment', name: d.name })} className="p-1.5 hover:bg-red-500/20 rounded text-red-400" title="Delete">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </ResourceTable>
                )}

                {activeTab === 'pods' && (
                    <>
                        <div className="mb-4 flex justify-end">
                            <button onClick={() => setIsPodModalOpen(true)} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                                <span>🐳</span> Create Pod
                            </button>
                        </div>
                        <ResourceTable
                            headers={['Name', 'Status', 'Restarts', 'IP', 'Node', 'Age', 'Actions']}
                            isEmpty={pods.length === 0}
                            loading={loading.pods}
                            emptyMessage="No pods found in your namespace."
                        >
                            {pods.map(p => (
                                <tr key={p.name} className="border-t border-white/5 hover:bg-white/5">
                                    <td className="p-4">
                                        <div className="font-medium">{p.name}</div>
                                        <div className="text-xs text-gray-500">{p.containers[0]?.image}</div>
                                    </td>
                                    <td className="p-4"><StatusBadge status={p.status} pulse /></td>
                                    <td className="p-4">{p.restarts}</td>
                                    <td className="p-4 font-mono text-xs">{p.ip}</td>
                                    <td className="p-4 text-gray-400 text-sm">{p.node}</td>
                                    <td className="p-4 text-gray-400 text-sm">{timeAgo(p.age)}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => { setSelectedPodForLogs(p.name); setActiveTab('logs'); }} className="p-1.5 hover:bg-cyan-500/20 rounded text-cyan-400" title="Logs">📜</button>
                                            <button onClick={() => setDeleteModal({ type: 'pod', name: p.name })} className="p-1.5 hover:bg-red-500/20 rounded text-red-400" title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </ResourceTable>
                    </>
                )}

                {activeTab === 'services' && (
                    <>
                        <div className="mb-4 flex justify-end">
                            <button onClick={() => setIsServiceModalOpen(true)} className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-purple-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                                <span>🌐</span> Create Service
                            </button>
                        </div>
                        <ResourceTable
                            headers={['Name', 'Type', 'Cluster IP', 'Ports', 'Age', 'Actions']}
                            isEmpty={services.length === 0}
                            loading={loading.services}
                            emptyMessage="No services found in your namespace."
                        >
                            {services.map(s => (
                                <tr key={s.name} className="border-t border-white/5 hover:bg-white/5">
                                    <td className="p-4 font-medium">{s.name}</td>
                                    <td className="p-4"><span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">{s.type}</span></td>
                                    <td className="p-4 font-mono text-xs">{s.clusterIP}</td>
                                    <td className="p-4 font-mono text-xs">{s.ports.map(p => `${p.port}:${p.targetPort}`).join(', ')}</td>
                                    <td className="p-4 text-gray-400 text-sm">{timeAgo(s.age)}</td>
                                    <td className="p-4">
                                        <button onClick={() => setDeleteModal({ type: 'service', name: s.name })} className="p-1.5 hover:bg-red-500/20 rounded text-red-400" title="Delete">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </ResourceTable>
                    </>
                )}

                {activeTab === 'logs' && (
                    <div className="space-y-4">
                        {/* Pod Selector */}
                        <div className="flex items-center gap-4">
                            <label className="text-gray-400">Select Pod:</label>
                            <select
                                value={selectedPodForLogs || ''}
                                onChange={e => setSelectedPodForLogs(e.target.value)}
                                className="bg-black/40 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none"
                            >
                                <option value="">-- Select a pod --</option>
                                {pods.map(p => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedPodForLogs ? (
                            <LogViewer
                                logs={logs}
                                loading={loading.logs}
                                podName={selectedPodForLogs}
                                onRefresh={() => fetchLogs(selectedPodForLogs)}
                            />
                        ) : (
                            <div className="glass p-12 rounded-xl text-center text-gray-400">
                                <div className="text-4xl mb-4">📜</div>
                                <p>Select a pod to view its logs</p>
                            </div>
                        )}
                    </div>
                )}
            </div>


            {/* Deploy Modal */}
            {isDeployModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="glass w-full max-w-lg rounded-xl overflow-hidden border border-cyan-500/30 animate-scale-in">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span>🚀</span> Deploy Application
                            </h3>
                            <button onClick={() => setIsDeployModalOpen(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
                        </div>

                        {deployStatus === 'idle' || deployStatus === 'error' ? (
                            <form onSubmit={handleDeploy} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Application Name *</label>
                                    <input
                                        required
                                        pattern="[a-z0-9-]+"
                                        title="Lowercase letters, numbers, and hyphens only"
                                        placeholder="my-app"
                                        className="w-full bg-black/40 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition-colors"
                                        value={deployForm.appName}
                                        onChange={e => setDeployForm({ ...deployForm, appName: e.target.value.toLowerCase() })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Docker Image *</label>
                                    <input
                                        required
                                        placeholder="nginx:latest"
                                        className="w-full bg-black/40 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition-colors"
                                        value={deployForm.image}
                                        onChange={e => setDeployForm({ ...deployForm, image: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Container Port</label>
                                    <input
                                        type="number"
                                        placeholder="80"
                                        className="w-full bg-black/40 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition-colors"
                                        value={deployForm.port}
                                        onChange={e => setDeployForm({ ...deployForm, port: e.target.value })}
                                    />
                                </div>

                                {deployStatus === 'error' && deployLogs.length > 0 && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                        {deployLogs[deployLogs.length - 1]}
                                    </div>
                                )}

                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsDeployModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                        Cancel
                                    </button>
                                    <button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition-all">
                                        🚀 Deploy Now
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="p-6 space-y-4">
                                <div className="bg-black/40 rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-sm space-y-1">
                                    {deployLogs.map((log, i) => (
                                        <div key={i} className={log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : 'text-cyan-400'}>
                                            {log}
                                        </div>
                                    ))}
                                    {deployStatus === 'deploying' && (
                                        <div className="animate-pulse text-cyan-500">_ Processing...</div>
                                    )}
                                </div>

                                {deployStatus === 'success' && (
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🎉</div>
                                        <p className="text-green-400 font-medium">Deployment created successfully!</p>
                                        <button onClick={() => setIsDeployModalOpen(false)} className="mt-4 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg">
                                            Done
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                onConfirm={() => {
                    if (deleteModal?.type === 'deployment') handleDeleteDeployment(deleteModal.name);
                    if (deleteModal?.type === 'pod') handleDeletePod(deleteModal.name);
                    if (deleteModal?.type === 'service') handleDeleteService(deleteModal.name);
                }}
                title={`Delete ${deleteModal?.type}?`}
                message={`Are you sure you want to delete "${deleteModal?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmColor="red"
            />

            {/* Create Pod Modal */}
            <CreatePodModal
                isOpen={isPodModalOpen}
                onClose={() => setIsPodModalOpen(false)}
                onSubmit={async (data) => {
                    const res = await fetch('/api/pods', {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify(data)
                    });
                    if (!res.ok) {
                        const err = await res.json();
                        throw new Error(err.error || 'Failed to create pod');
                    }
                    fetchPods();
                    fetchSummary();
                }}
            />

            {/* Create Service Modal */}
            <CreateServiceModal
                isOpen={isServiceModalOpen}
                onClose={() => setIsServiceModalOpen(false)}
                onSubmit={async (data) => {
                    const res = await fetch('/api/services', {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify(data)
                    });
                    if (!res.ok) {
                        const err = await res.json();
                        throw new Error(err.error || 'Failed to create service');
                    }
                    fetchServices();
                    fetchSummary();
                }}
                existingPods={[...pods.map(p => ({ name: p.name })), ...deployments.map(d => ({ name: d.name }))]}
            />

            {/* Scale Deployment Modal */}
            {scaleModal && (
                <ScaleDeploymentModal
                    isOpen={!!scaleModal}
                    onClose={() => setScaleModal(null)}
                    deploymentName={scaleModal.name}
                    currentReplicas={scaleModal.replicas}
                    onSubmit={async (replicas) => {
                        const res = await fetch(`/api/deployments/${namespace}/${scaleModal.name}/scale`, {
                            method: 'POST',
                            headers: getAuthHeaders(),
                            body: JSON.stringify({ replicas })
                        });
                        if (!res.ok) {
                            const err = await res.json();
                            throw new Error(err.error || 'Failed to scale');
                        }
                        fetchDeployments();
                        fetchPods();
                        fetchSummary();
                    }}
                />
            )}

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
