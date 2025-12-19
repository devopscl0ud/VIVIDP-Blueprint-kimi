import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/AuthContext';

interface ActivityItem {
    id: string;
    type: 'deploy' | 'delete' | 'scale' | 'login' | 'settings' | 'create';
    action: string;
    resource?: string;
    timestamp: Date;
    status: 'success' | 'error' | 'pending';
    details?: string;
}

const Activity = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const { user, session } = useAuth();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    // Get auth headers
    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
    });

    // Generate activity based on deployments
    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await fetch('/api/deployments', { headers: getAuthHeaders() });
                if (res.ok) {
                    const data = await res.json();
                    const deploymentActivities: ActivityItem[] = (data.deployments || []).map((d: any, i: number) => ({
                        id: `deploy-${i}`,
                        type: 'deploy' as const,
                        action: `Deployed ${d.name}`,
                        resource: d.name,
                        timestamp: new Date(d.createdAt),
                        status: d.status === 'Running' ? 'success' : 'pending',
                        details: `Image: ${d.image}`
                    }));

                    // Add login activity
                    const loginActivity: ActivityItem = {
                        id: 'login-0',
                        type: 'login',
                        action: 'Signed in',
                        timestamp: new Date(user?.last_sign_in_at || Date.now()),
                        status: 'success',
                        details: user?.email
                    };

                    setActivities([loginActivity, ...deploymentActivities].slice(0, 20));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, [session]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'deploy': return '🚀';
            case 'delete': return '🗑️';
            case 'scale': return '📈';
            case 'login': return '🔐';
            case 'settings': return '⚙️';
            case 'create': return '➕';
            default: return '📋';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const filteredActivities = filter === 'all'
        ? activities
        : activities.filter(a => a.type === filter);

    return (
        <>
            <Header title="Activity Log" onMenuClick={() => setSidebarOpen(!sidebarOpen)}>
                <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-cyan-500 outline-none"
                >
                    <option value="all">All Activity</option>
                    <option value="deploy">Deployments</option>
                    <option value="login">Logins</option>
                    <option value="delete">Deletions</option>
                    <option value="settings">Settings</option>
                </select>
            </Header>

            <div className="space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Actions', value: activities.length, icon: '📊', color: 'cyan' },
                        { label: 'Deployments', value: activities.filter(a => a.type === 'deploy').length, icon: '🚀', color: 'green' },
                        { label: 'Success Rate', value: `${Math.round((activities.filter(a => a.status === 'success').length / (activities.length || 1)) * 100)}%`, icon: '✅', color: 'blue' },
                        { label: 'Today', value: activities.filter(a => a.timestamp.toDateString() === new Date().toDateString()).length, icon: '📅', color: 'purple' }
                    ].map((stat, i) => (
                        <div key={i} className="glass p-4 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">{stat.label}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                                <span className="text-2xl">{stat.icon}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Activity Timeline */}
                <div className="glass rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-semibold text-lg">Recent Activity</h3>
                        <span className="text-sm text-gray-400">{filteredActivities.length} items</span>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-400">
                            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            Loading activity...
                        </div>
                    ) : filteredActivities.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <div className="text-4xl mb-2">📋</div>
                            <p>No activity yet</p>
                            <p className="text-sm">Deploy something to see it here!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {filteredActivities.map(activity => (
                                <div key={activity.id} className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4">
                                    <div className="text-2xl">{getIcon(activity.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-white">{activity.action}</p>
                                            <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(activity.status)}`}>
                                                {activity.status}
                                            </span>
                                        </div>
                                        {activity.details && (
                                            <p className="text-sm text-gray-400 truncate">{activity.details}</p>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500 whitespace-nowrap">
                                        {formatTime(activity.timestamp)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Activity;
