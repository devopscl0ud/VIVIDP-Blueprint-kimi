import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
    const location = useLocation();
    const { user } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    const mainNavItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/portal', label: 'Portal', icon: '🚀' },
        { path: '/nodes', label: 'Nodes', icon: '🖥️' },
        { path: '/analytics', label: 'Analytics', icon: '📈' },
        { path: '/activity', label: 'Activity', icon: '📋' },
        { path: '/security', label: 'Security', icon: '🔒' },
        { path: '/team', label: 'Team', icon: '👥' },
        { path: '/integrations', label: 'Integrations', icon: '🔗' },
    ];

    const bottomNavItems = [
        { path: '/api-keys', label: 'API Keys', icon: '🔑' },
        { path: '/billing', label: 'Billing', icon: '💳' },
        { path: '/settings', label: 'Settings', icon: '⚙️' },
        { path: '/help', label: 'Help', icon: '❓' },
    ];

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <>
            {/* Overlay for mobile */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-[280px] z-40 glass transition-transform duration-300 flex flex-col ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Logo */}
                <div className="p-6 border-b border-gray-700 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nebula-blue to-electric-cyan flex items-center justify-center font-bold text-lg shadow-lg shadow-cyan-500/30">V</div>
                    <span className="text-xl font-bold gradient-text">VividP</span>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="text-xs text-gray-500 uppercase tracking-wider px-4 mb-2">Main</p>
                    {mainNavItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)
                                ? 'bg-cyan-500/20 border-l-4 border-electric-cyan text-white shadow-lg shadow-cyan-500/10'
                                : 'hover:bg-white/5 text-gray-400 hover:text-white border-l-4 border-transparent'
                                }`}
                        >
                            <span className={`text-lg ${isActive(item.path) ? '' : 'grayscale opacity-70'}`}>
                                {item.icon}
                            </span>
                            <span className={isActive(item.path) ? 'font-medium' : ''}>
                                {item.label}
                            </span>
                        </Link>
                    ))}

                    <div className="my-4 border-t border-gray-700"></div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider px-4 mb-2">System</p>
                    {bottomNavItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)
                                ? 'bg-cyan-500/20 border-l-4 border-electric-cyan text-white shadow-lg shadow-cyan-500/10'
                                : 'hover:bg-white/5 text-gray-400 hover:text-white border-l-4 border-transparent'
                                }`}
                        >
                            <span className={`text-lg ${isActive(item.path) ? '' : 'grayscale opacity-70'}`}>
                                {item.icon}
                            </span>
                            <span className={isActive(item.path) ? 'font-medium' : ''}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-gray-700">
                    <Link to="/settings" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <span className="text-white font-semibold text-sm">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{displayName}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </Link>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
