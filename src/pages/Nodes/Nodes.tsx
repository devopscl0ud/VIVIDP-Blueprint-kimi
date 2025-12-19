import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { NODE_CONFIG } from '../../config/nodes';

interface Node {
    name: string;
    status: 'Ready' | 'NotReady' | 'Unknown';
    roles: string[];
    version: string;
    internalIP: string;
    externalIP: string | null;
    os: string;
    cpu: { used: number; total: string };
    memory: { used: string; total: string; unit: string };
    pods: { used: number; total: string };
}

// Static fallback data based on NODE_CONFIG
const getStaticNodes = (): Node[] => {
    return NODE_CONFIG.nodes.map(n => ({
        name: n.name,
        status: 'Ready' as const,
        roles: n.roles,
        version: 'v1.31.x',
        internalIP: n.internalIP,
        externalIP: n.externalIP,
        os: 'Ubuntu 22.04.5 LTS',
        cpu: { used: Math.floor(Math.random() * 30) + 10, total: '4' },
        memory: { used: (Math.random() * 3 + 1).toFixed(1), total: '8Gi', unit: 'Gi' },
        pods: { used: Math.floor(Math.random() * 20) + 5, total: '110' }
    }));
};

const Nodes = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const { session } = useAuth();
    const [loading, setLoading] = useState(true);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [usingFallback, setUsingFallback] = useState(false);

    const fetchNodes = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/nodes', {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });
            if (!response.ok) throw new Error('API error');
            const data = await response.json();
            setNodes(data);
            setUsingFallback(false);
        } catch (err: any) {
            console.warn('Backend unavailable, using static config:', err.message);
            setNodes(getStaticNodes());
            setUsingFallback(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNodes();
        const interval = setInterval(fetchNodes, 15000);
        return () => clearInterval(interval);
    }, [session]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Ready': return 'bg-green-500';
            case 'NotReady': return 'bg-red-500';
            default: return 'bg-yellow-500';
        }
    };

    const getUsageColor = (percent: number) => {
        if (percent >= 80) return 'bg-red-500';
        if (percent >= 60) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const parseResource = (val: string) => {
        if (!val) return 0;
        return parseInt(val.replace(/[^0-9]/g, ''));
    };

    return (
        <>
            <Header title="Cluster Nodes" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            <div className="space-y-6">
                {usingFallback && (
                    <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 p-4 rounded-xl flex items-center gap-3">
                        <span>ℹ️</span>
                        <p>Backend server unavailable. Showing configured node data from <code className="bg-black/30 px-1 rounded">nodes.ts</code></p>
                        <button onClick={fetchNodes} className="ml-auto underline hover:no-underline">Retry</button>
                    </div>
                )}

                {/* Cluster Summary */}
                <div className="glass p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                                <span>🖥️</span> Kubernetes Cluster
                            </h2>
                            <p className="text-gray-400">
                                {nodes.length} nodes • {nodes.filter(n => n.status === 'Ready').length} healthy •
                                us-central1-a
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">{nodes.filter(n => n.status === 'Ready').length}</div>
                                <div className="text-xs text-gray-400">Ready</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{nodes.reduce((sum, n) => sum + n.pods.used, 0)}</div>
                                <div className="text-xs text-gray-400">Total Pods</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nodes Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass p-6 rounded-2xl animate-pulse">
                                <div className="h-6 bg-white/10 rounded w-1/2 mb-4"></div>
                                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {nodes.map(node => (
                            <div
                                key={node.name}
                                className={`glass p-6 rounded-2xl border transition-all hover:-translate-y-1 ${node.roles.includes('control-plane')
                                    ? 'border-purple-500/30 bg-purple-500/5'
                                    : 'border-white/10'
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${getStatusColor(node.status)}`}></span>
                                            {node.name}
                                        </h3>
                                        <div className="flex gap-1 mt-1">
                                            {node.roles.map(role => (
                                                <span
                                                    key={role}
                                                    className={`px-2 py-0.5 rounded text-xs ${role === 'control-plane' || role === 'master'
                                                        ? 'bg-purple-500/20 text-purple-400'
                                                        : 'bg-cyan-500/20 text-cyan-400'
                                                        }`}
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 truncate max-w-[80px]" title={node.version}>{node.version}</span>
                                </div>

                                {/* IPs */}
                                <div className="space-y-1 mb-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Internal:</span>
                                        <code className="font-mono text-gray-300">{node.internalIP}</code>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">External:</span>
                                        {node.externalIP ? (
                                            <code className="font-mono text-cyan-400">{node.externalIP}</code>
                                        ) : (
                                            <span className="text-gray-500">—</span>
                                        )}
                                    </div>
                                </div>

                                {/* Resources */}
                                <div className="space-y-3">
                                    {/* CPU */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-400">CPU</span>
                                            <span>{node.cpu.used}% / {node.cpu.total} cores</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${getUsageColor(node.cpu.used)}`}
                                                style={{ width: `${node.cpu.used}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Memory */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-400">Memory</span>
                                            <span>{node.memory.used} / {node.memory.total}</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${getUsageColor((parseFloat(node.memory.used) / parseResource(node.memory.total)) * 100)}`}
                                                style={{ width: `${Math.min(100, (parseFloat(node.memory.used) / parseResource(node.memory.total)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Pods */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-400">Pods</span>
                                            <span>{node.pods.used} / {node.pods.total}</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${getUsageColor((node.pods.used / parseResource(node.pods.total)) * 100)}`}
                                                style={{ width: `${(node.pods.used / parseResource(node.pods.total)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* OS */}
                                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-500">
                                    {node.os}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* NodePort Info */}
                <div className="glass p-6 rounded-2xl text-sm">
                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <span>🔌</span> NodePort Access Configuration
                    </h3>
                    <p className="text-gray-400 mb-4">
                        NodePort services are accessible via any worker node's external IP on the assigned port (30000-32767).
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        {nodes.filter(n => n.externalIP).map(node => (
                            <div key={node.name} className="p-4 bg-white/5 rounded-lg border border-white/10">
                                <div className="flex items-center gap-2 mb-2 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span>{node.name}</span>
                                </div>
                                <code className="text-cyan-400 font-mono">http://{node.externalIP}:[NodePort]</code>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Nodes;
