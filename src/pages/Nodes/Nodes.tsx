import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/AuthContext';

interface Node {
    name: string;
    status: 'Ready' | 'NotReady' | 'Unknown';
    roles: string[];
    version: string;
    internalIP: string;
    externalIP: string | null;
    os: string;
    cpu: { used: number; total: number };
    memory: { used: number; total: number; unit: string };
    pods: { used: number; total: number };
}

const Nodes = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const { session } = useAuth();
    const [loading, setLoading] = useState(true);

    // Static node data based on user's cluster
    const [nodes] = useState<Node[]>([
        {
            name: 'k8s-worker1',
            status: 'Ready',
            roles: ['worker'],
            version: 'v1.31.14',
            internalIP: '10.128.0.22',
            externalIP: '136.113.65.16',
            os: 'Ubuntu 22.04.5 LTS',
            cpu: { used: 25, total: 100 },
            memory: { used: 2.1, total: 8, unit: 'GB' },
            pods: { used: 12, total: 110 }
        },
        {
            name: 'k8s-worker2',
            status: 'Ready',
            roles: ['worker'],
            version: 'v1.31.14',
            internalIP: '10.128.0.21',
            externalIP: '34.58.110.43',
            os: 'Ubuntu 22.04.5 LTS',
            cpu: { used: 18, total: 100 },
            memory: { used: 1.8, total: 8, unit: 'GB' },
            pods: { used: 8, total: 110 }
        },
        {
            name: 'k8s-master',
            status: 'Ready',
            roles: ['control-plane'],
            version: 'v1.32.10',
            internalIP: '10.128.0.20',
            externalIP: null,
            os: 'Ubuntu 22.04.5 LTS',
            cpu: { used: 35, total: 100 },
            memory: { used: 3.2, total: 8, unit: 'GB' },
            pods: { used: 24, total: 110 }
        }
    ]);

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 500);
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

    return (
        <>
            <Header title="Cluster Nodes" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            <div className="space-y-6">
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
                                                    className={`px-2 py-0.5 rounded text-xs ${role === 'control-plane'
                                                            ? 'bg-purple-500/20 text-purple-400'
                                                            : 'bg-cyan-500/20 text-cyan-400'
                                                        }`}
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">{node.version}</span>
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
                                            <span>{node.cpu.used}%</span>
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
                                            <span>{node.memory.used}/{node.memory.total} {node.memory.unit}</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${getUsageColor((node.memory.used / node.memory.total) * 100)}`}
                                                style={{ width: `${(node.memory.used / node.memory.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Pods */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-400">Pods</span>
                                            <span>{node.pods.used}/{node.pods.total}</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${getUsageColor((node.pods.used / node.pods.total) * 100)}`}
                                                style={{ width: `${(node.pods.used / node.pods.total) * 100}%` }}
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
                <div className="glass p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>🔌</span> NodePort Access
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                        NodePort services can be accessed via any worker node's external IP on the assigned port (30000-32767).
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        {nodes.filter(n => n.externalIP && n.roles.includes('worker')).map(node => (
                            <div key={node.name} className="p-4 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span className="font-medium">{node.name}</span>
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
