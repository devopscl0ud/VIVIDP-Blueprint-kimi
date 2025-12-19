import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { MetricCard, ProgressBar, Sparkline } from '../../components/Dashboard/MetricCards';

const Dashboard = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const { user, session } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        deployments: 0,
        pods: 0,
        services: 0,
        cpuUsage: 45,
        memoryUsage: 62,
        deployHistory: [2, 5, 3, 8, 4, 6, 7, 9, 5],
    });
    const [recentActivity, setRecentActivity] = useState<{ action: string; time: string; icon: string }[]>([]);

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Developer';

    // Fetch stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const headers = {
                    'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
                };

                const res = await fetch('/api/namespace/summary', { headers });
                if (res.ok) {
                    const data = await res.json();
                    setStats(s => ({
                        ...s,
                        deployments: data.summary?.deployments?.total || 0,
                        pods: data.summary?.pods?.total || 0,
                        services: data.summary?.services?.total || 0,
                    }));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [session]);

    // Simulated recent activity
    useEffect(() => {
        setRecentActivity([
            { action: 'Deployment created: my-app', time: '2 minutes ago', icon: '🚀' },
            { action: 'Service updated: my-app-svc', time: '5 minutes ago', icon: '🔌' },
            { action: 'Pod restarted: my-app-xyz123', time: '10 minutes ago', icon: '🔄' },
            { action: 'Logged in from new device', time: '1 hour ago', icon: '🔐' },
        ]);
    }, []);

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
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">
                                {greeting()}, {displayName}! 👋
                            </h2>
                            <p className="text-gray-400">
                                Here's what's happening with your deployments today.
                            </p>
                        </div>
                        <div className="hidden md:block text-right">
                            <div className="text-3xl font-bold text-cyan-400">{stats.deployments}</div>
                            <div className="text-sm text-gray-400">Active Deployments</div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Deployments"
                        value={stats.deployments}
                        icon="🚀"
                        color="cyan"
                        trend={{ value: 12, up: true }}
                        onClick={() => window.location.href = '/portal'}
                    />
                    <MetricCard
                        title="Pods Running"
                        value={stats.pods}
                        icon="📦"
                        color="green"
                        subtitle="All healthy"
                    />
                    <MetricCard
                        title="Services"
                        value={stats.services}
                        icon="🔌"
                        color="purple"
                    />
                    <MetricCard
                        title="Uptime"
                        value="99.9%"
                        icon="⚡"
                        color="yellow"
                        subtitle="Last 30 days"
                    />
                </div>

                {/* Resource Usage & Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Resource Usage */}
                    <div className="glass p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold mb-6">Resource Usage</h3>
                        <div className="space-y-6">
                            <ProgressBar label="CPU Usage" value={stats.cpuUsage} max={100} color="cyan" />
                            <ProgressBar label="Memory" value={stats.memoryUsage} max={100} color="green" />
                            <ProgressBar label="Storage" value={2.4} max={10} color="purple" showPercent={false} />

                            <div className="pt-4 border-t border-white/10">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Deployment Activity (7 days)</span>
                                </div>
                                <Sparkline data={stats.deployHistory} color="#06B6D4" height={50} />
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="glass p-6 rounded-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold">Recent Activity</h3>
                            <a href="/activity" className="text-cyan-400 text-sm hover:underline">View all →</a>
                        </div>
                        <div className="space-y-4">
                            {recentActivity.map((item, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                    <span className="text-xl">{item.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{item.action}</p>
                                        <p className="text-xs text-gray-500">{item.time}</p>
                                    </div>
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
                            { label: 'API Keys', icon: '🔑', href: '/api-keys', color: 'from-purple-500 to-pink-600' },
                            { label: 'Settings', icon: '⚙️', href: '/settings', color: 'from-orange-500 to-red-600' },
                        ].map((action, i) => (
                            <a
                                key={i}
                                href={action.href}
                                className={`p-4 rounded-xl bg-gradient-to-br ${action.color} bg-opacity-10 hover:bg-opacity-20 border border-white/10 hover:border-white/20 text-center transition-all hover:scale-105 group`}
                            >
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
                                <div className="text-sm font-medium">{action.label}</div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
