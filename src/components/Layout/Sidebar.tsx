import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
    const location = useLocation();
    const { user } = useAuth();

    // Helper to determine if a link is active
    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <>
            {/* Sidebar Overlay for Mobile */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar Container */}
            <aside className={`fixed top-0 left-0 h-full w-[280px] z-40 glass transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nebula-blue to-electric-cyan flex items-center justify-center font-bold">V</div>
                        <span className="text-xl font-bold gradient-text">VividP</span>
                    </div>
                    {/* Close button for mobile within sidebar if needed, though usually overlay click is enough. 
                        Some designs have an 'X' inside. The original didn't explicitly show one in the code I saw, 
                        but standard practice is overlay click or toggle button. 
                        Let's keep it clean for now.
                    */}
                </div>
                <nav className="p-4 space-y-2">
                    <Link
                        to="/dashboard"
                        onClick={onClose}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/dashboard')
                            ? 'bg-cyan-500/20 border-l-4 border-electric-cyan text-white'
                            : 'hover:bg-white/5 text-gray-400 hover:text-white'
                            }`}
                    >
                        <span className={isActive('/dashboard') ? 'text-cyan-400' : ''}>📊</span>
                        <span className={isActive('/dashboard') ? 'font-medium' : ''}>Dashboard</span>
                    </Link>

                    <Link
                        to="/analytics"
                        onClick={onClose}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/analytics')
                            ? 'bg-cyan-500/20 border-l-4 border-electric-cyan text-white'
                            : 'hover:bg-white/5 text-gray-400 hover:text-white'
                            }`}
                    >
                        <span className={isActive('/analytics') ? 'text-cyan-400' : ''}>📈</span>
                        <span className={isActive('/analytics') ? 'font-medium' : ''}>Analytics</span>
                    </Link>

                    <Link
                        to="/security"
                        onClick={onClose}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/security')
                            ? 'bg-cyan-500/20 border-l-4 border-electric-cyan text-white'
                            : 'hover:bg-white/5 text-gray-400 hover:text-white'
                            }`}
                    >
                        <span className={isActive('/security') ? 'text-cyan-400' : ''}>🛡️</span>
                        <span className={isActive('/security') ? 'font-medium' : ''}>Security</span>
                    </Link>

                    <Link
                        to="/portal"
                        onClick={onClose}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/portal')
                            ? 'bg-cyan-500/20 border-l-4 border-electric-cyan text-white'
                            : 'hover:bg-white/5 text-gray-400 hover:text-white'
                            }`}
                    >
                        <span className={isActive('/portal') ? 'text-cyan-400' : ''}>🧩</span>
                        <span className={isActive('/portal') ? 'font-medium' : ''}>Portal</span>
                    </Link>

                    <Link
                        to="/settings"
                        onClick={onClose}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/settings')
                            ? 'bg-cyan-500/20 border-l-4 border-electric-cyan text-white'
                            : 'hover:bg-white/5 text-gray-400 hover:text-white'
                            }`}
                    >
                        <span className={isActive('/settings') ? 'text-cyan-400' : ''}>⚙️</span>
                        <span className={isActive('/settings') ? 'font-medium' : ''}>Settings</span>
                    </Link>

                    <Link
                        to="/billing"
                        onClick={onClose}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/billing')
                            ? 'bg-cyan-500/20 border-l-4 border-electric-cyan text-white'
                            : 'hover:bg-white/5 text-gray-400 hover:text-white'
                            }`}
                    >
                        <span className={isActive('/billing') ? 'text-cyan-400' : ''}>💳</span>
                        <span className={isActive('/billing') ? 'font-medium' : ''}>Billing</span>
                    </Link>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                                {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.user_metadata?.full_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
