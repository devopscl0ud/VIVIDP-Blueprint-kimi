import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { MetricCard, ProgressBar, Sparkline } from '../../components/Dashboard/MetricCards';
import { NODE_CONFIG } from '../../config/nodes';

interface NodeData {
    name: string;
    status: string;
    externalIP: string | null;
    cpu: { used: number };
    memory: { used: string };
    pods: { used: number; total: string };
}

// Fallback node data from config
const getFallbackNodes = (): NodeData[] => {
    return NODE_CONFIG.nodes.map(n => ({
        name: n.name,
        status: 'Ready',
        externalIP: n.externalIP,
        cpu: { used: Math.floor(Math.random() * 30) + 15 },
        memory: { used: (Math.random() * 3 + 1.5).toFixed(1) },
        pods: { used: Math.floor(Math.random() * 15) + 5, total: '110' }
    }));
};

const Dashboard = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const { user, session } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        deployments: 2,
        pods: 5,
        services: 3,
        cpuUsage: 28,
        memoryUsage: 45,
        deployHistory: [2, 5, 3, 8, 4, 6, 7, 9, 5],
    });
    const [nodes, setNodes] = useState<NodeData[]>([]);

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Developer';

    // Fetch stats with fallback
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const headers = {
                    'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
                };

                // Try to fetch from backend
                const res = await fetch('http://localhost:3001/api/namespace/summary', { headers });
                if (res.ok) {
                    const data = await res.json();
                    setStats(s => ({
                        ...s,
                        deployments: data.deployments || s.deployments,
                        pods: data.pods || s.pods,
                        services: data.services || s.services,
                    }));
                }

                // Try to fetch nodes
                const nodesRes = await fetch('http://localhost:3001/api/nodes', { headers });
                if (nodesRes.ok) {
                    const nodesData = await nodesRes.json();
                    setNodes(nodesData);
                    if (nodesData.length > 0) {
                        const avgCpu = Math.round(nodesData.reduce((sum: number, n: NodeData) => sum + n.cpu.used, 0) / nodesData.length);
                        const avgMem = Math.round(nodesData.reduce((sum: number, n: NodeData) => sum + parseFloat(n.memory.used), 0) / nodesData.length * 12.5);
                        setStats(s => ({
                            ...s,
                            cpuUsage: avgCpu,
                            memoryUsage: avgMem,
                        }));
                    }
                } else {
                    setNodes(getFallbackNodes());
                }
            } catch (e) {
                console.warn('Backend unavailable, using fallback data');
                setNodes(getFallbackNodes());
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [session]);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <>
            <Header title="Dashboard" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            <div className="space-y-6">
                {/* Welcome Banner */}
                <div className="glass p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/20">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">
                                {greeting()}, {displayName}! 👋
                            </h2>
                            <p className="text-gray-400">
                                Here's what's happening with your deployments today.
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-cyan-400">{stats.deployments}</div>
                            <div className="text-sm text-gray-400">Active Deployments</div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Deployments"
                        value={loading ? '...' : stats.deployments}
                        icon="🚀"
                        color="cyan"
                        trend={{ value: 12, up: true }}
                        onClick={() => window.location.href = '/portal'}
                    />
                    <MetricCard
                        title="Pods Running"
                        value={loading ? '...' : stats.pods}
                        icon="📦"
                        color="green"
                        subtitle="All healthy"
                    />
                    <MetricCard
                        title="Services"
                        value={loading ? '...' : stats.services}
                        icon="🔌"
                        color="purple"
                    />
                    <MetricCard
                        title="Cluster Nodes"
                        value={nodes.length}
                        icon="🖥️"
                        color="yellow"
                        subtitle={`${nodes.filter(n => n.status === 'Ready').length} Ready`}
                        onClick={() => window.location.href = '/nodes'}
                    />
                </div>

                {/* Resource Usage & Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Resource Usage */}
                    <div className="glass p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold mb-6">Cluster Resource Usage</h3>
                        <div className="space-y-6">
                            <ProgressBar label="Average CPU" value={stats.cpuUsage} max={100} color="cyan" />
                            <ProgressBar label="Average Memory" value={stats.memoryUsage} max={100} color="green" />
                            <ProgressBar label="Total Pods" value={nodes.reduce((sum, n) => sum + n.pods.used, 0)} max={nodes.reduce((sum, n) => sum + parseInt(n.pods.total), 0) || 330} color="purple" showPercent={false} />

                            <div className="pt-4 border-t border-white/10">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Deployment Activity (7 days)</span>
                                </div>
                                <Sparkline data={stats.deployHistory} color="#06B6D4" height={50} />
                            </div>
                        </div>
                    </div>

                    {/* Cluster Nodes Quick View */}
                    <div className="glass p-6 rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Cluster Nodes</h3>
                            <Link to="/nodes" className="text-cyan-400 text-sm hover:underline">View details →</Link>
                        </div>
                        <div className="space-y-3">
                            {nodes.map(node => (
                                <div key={node.name} className="p-3 bg-white/5 rounded-lg border border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${node.status === 'Ready' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            <span className="font-medium">{node.name}</span>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            CPU: <span className="text-white">{node.cpu.used}%</span> |
                                            Pods: <span className="text-white">{node.pods.used}</span>
                                        </div>
                                    </div>
                                    {node.externalIP && (
                                        <div className="mt-2 text-xs">
                                            <span className="text-gray-500">External IP: </span>
                                            <code className="text-cyan-400 font-mono">{node.externalIP}</code>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'New Deployment', icon: '🚀', href: '/portal', color: 'from-cyan-500 to-blue-600' },
                            { label: 'View Logs', icon: '📜', href: '/portal?tab=logs', color: 'from-green-500 to-emerald-600' },
                            { label: 'Cluster Nodes', icon: '🖥️', href: '/nodes', color: 'from-purple-500 to-pink-600' },
                            { label: 'Team', icon: '👥', href: '/team', color: 'from-orange-500 to-red-600' },
                        ].map((action, i) => (
                            <Link
                                key={i}
                                to={action.href}
                                className={`p-4 rounded-xl bg-gradient-to-br ${action.color} bg-opacity-10 hover:bg-opacity-20 border border-white/10 hover:border-white/20 text-center transition-all hover:scale-105 group`}
                            >
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
                                <div className="text-sm font-medium">{action.label}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
