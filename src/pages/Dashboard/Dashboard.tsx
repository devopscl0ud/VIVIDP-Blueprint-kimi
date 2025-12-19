import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';
import CostAnalysis from '../../components/Widgets/CostAnalysis';
import { useAuth } from '../../context/AuthContext';

interface UserStats {
    activeServices: number;
    cpuUsage: number;
    memoryUsage: number;
    securityAlerts: number;
}

const Dashboard = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const { user, session } = useAuth();

    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: `Hello${user?.user_metadata?.full_name ? ` ${user.user_metadata.full_name.split(' ')[0]}` : ''}! I am VividP AI. How can I help you manage your infrastructure today?` }
    ]);
    const [inputValue, setInputValue] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // User-specific stats (would come from backend in production)
    const [userStats, setUserStats] = useState<UserStats>({
        activeServices: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        securityAlerts: 0
    });
    const [loading, setLoading] = useState(true);

    // Get user display name
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const firstName = displayName.split(' ')[0];
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    // Fetch user-specific stats
    const fetchUserStats = useCallback(async () => {
        try {
            // Fetch user's deployments for stats
            const response = await fetch('/api/deployments', {
                headers: {
                    'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
                }
            });

            if (response.ok) {
                const data = await response.json();
                const deployments = data.deployments || [];
                const runningCount = deployments.filter((d: any) => d.status === 'Running').length;

                setUserStats({
                    activeServices: deployments.length,
                    cpuUsage: Math.floor(Math.random() * 30) + 20 + (deployments.length * 5), // Simulated based on deployments
                    memoryUsage: Math.floor(Math.random() * 20) + 15 + (deployments.length * 3),
                    securityAlerts: Math.max(0, Math.floor(Math.random() * 3) - (runningCount > 2 ? 1 : 0))
                });
            }
        } catch (err) {
            console.error('Failed to fetch user stats:', err);
            // Set default stats
            setUserStats({
                activeServices: 0,
                cpuUsage: 15,
                memoryUsage: 10,
                securityAlerts: 0
            });
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchUserStats();
        const interval = setInterval(fetchUserStats, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [fetchUserStats]);

    // Particles effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const container = canvas.parentElement;
        if (!container) return;

        const setCanvasSize = () => {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        };

        setCanvasSize();

        const particles: { x: number, y: number, vx: number, vy: number, size: number, opacity: number }[] = [];
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x > canvas.width) p.x = 0;
                if (p.x < 0) p.x = canvas.width;
                if (p.y > canvas.height) p.y = 0;
                if (p.y < 0) p.y = canvas.height;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(6, 182, 212, ${p.opacity})`;
                ctx.fill();
            });
            requestAnimationFrame(animate);
        };
        animate();

        window.addEventListener('resize', setCanvasSize);
        return () => window.removeEventListener('resize', setCanvasSize);
    }, []);

    const handleSendMessage = (e: React.FormEvent | React.KeyboardEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
        const currentInput = inputValue;
        setInputValue('');
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', content: `I've analyzed your request about "${currentInput}". Parameters are looking normal for your ${userStats.activeServices} active services.` }]);
        }, 1000);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Performance data (unique per user based on their ID hash)
    const userHash = user?.id ? user.id.charCodeAt(0) : 1;
    const data = [
        { name: '00:00', cpu: 30 + (userHash % 20), mem: 20 + (userHash % 15) },
        { name: '04:00', cpu: 40 + (userHash % 25), mem: 25 + (userHash % 15) },
        { name: '08:00', cpu: 50 + (userHash % 20), mem: 35 + (userHash % 15) },
        { name: '12:00', cpu: 70 + (userHash % 15), mem: 50 + (userHash % 15) },
        { name: '16:00', cpu: 60 + (userHash % 20), mem: 45 + (userHash % 15) },
        { name: '20:00', cpu: 45 + (userHash % 20), mem: 30 + (userHash % 15) },
        { name: '24:00', cpu: 35 + (userHash % 20), mem: 25 + (userHash % 15) },
    ];

    const stats = [
        { title: 'Active Services', value: loading ? '...' : userStats.activeServices.toString(), change: userStats.activeServices > 0 ? '+' + userStats.activeServices : 'None', color: userStats.activeServices > 0 ? 'text-green-400' : 'text-gray-400', icon: '🟢' },
        { title: 'CPU Usage', value: loading ? '...' : userStats.cpuUsage + '%', change: userStats.cpuUsage < 60 ? 'Optimal' : 'High', color: userStats.cpuUsage < 60 ? 'text-green-400' : 'text-yellow-400', icon: '⚡' },
        { title: 'Memory', value: loading ? '...' : userStats.memoryUsage + '%', change: userStats.memoryUsage < 50 ? 'Optimal' : 'Elevated', color: userStats.memoryUsage < 50 ? 'text-blue-400' : 'text-yellow-400', icon: '💾' },
        { title: 'Security Alerts', value: loading ? '...' : userStats.securityAlerts.toString(), change: userStats.securityAlerts === 0 ? 'All Clear' : 'Action Req', color: userStats.securityAlerts === 0 ? 'text-green-400' : 'text-red-400', icon: userStats.securityAlerts === 0 ? '✅' : '🚨' }
    ];

    return (
        <div className="relative min-h-[calc(100vh-2rem)]">
            <div className="absolute inset-0 z-[-1] pointer-events-none" id="particles">
                <canvas ref={canvasRef} className="w-full h-full"></canvas>
            </div>

            <Header title="Dashboard" onMenuClick={() => setSidebarOpen(!sidebarOpen)}>
                <div className="relative hidden md:block">
                    <input type="text" placeholder="Search..." className="bg-black/20 border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 transition-colors w-32 focus:w-48 pl-10" />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <button className="relative p-2 text-gray-400 hover:text-white">
                    🔔 {userStats.securityAlerts > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center cursor-pointer hover:shadow-[0_0_10px_#06B6D4] transition-shadow">
                    <span className="text-white font-semibold text-xs">{initials}</span>
                </div>
            </Header>

            {/* Personalized Welcome */}
            <div className="mb-8 fade-in">
                <h2 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h2>
                <p className="text-gray-400">Here's what's happening with your infrastructure today.</p>
            </div>

            {/* Stats Grid - User Specific */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="glass p-6 rounded-xl border border-white/10 hover:border-cyan-500/50 transition-all hover:-translate-y-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-400">{stat.title}</p>
                                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                                <p className={`text-xs mt-1 ${stat.color}`}>{stat.change}</p>
                            </div>
                            <span className="text-2xl">{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <CostAnalysis compact />

                    <div className="glass p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4">AI Insights for {firstName}</h3>
                        <div className="space-y-4">
                            {userStats.activeServices > 0 ? (
                                <>
                                    <div className="p-3 bg-green-500/10 border-l-4 border-green-500 rounded-r">
                                        <h4 className="font-semibold text-green-400">Services Running</h4>
                                        <p className="text-sm text-gray-300">You have {userStats.activeServices} active deployment(s) in your namespace.</p>
                                    </div>
                                    {userStats.cpuUsage > 60 && (
                                        <div className="p-3 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r">
                                            <h4 className="font-semibold text-yellow-400">Resource Usage</h4>
                                            <p className="text-sm text-gray-300">CPU usage is elevated. Consider scaling your services.</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-3 bg-blue-500/10 border-l-4 border-blue-500 rounded-r">
                                    <h4 className="font-semibold text-blue-400">Get Started</h4>
                                    <p className="text-sm text-gray-300">Deploy your first service from the Portal to see your stats here!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass p-6 rounded-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Your System Performance</h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                                    <Area type="monotone" dataKey="cpu" stroke="#06B6D4" fillOpacity={1} fill="url(#colorCpu)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <a href="/portal" className="w-full p-3 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors text-left flex items-center gap-3 block">
                                <span>🚀</span> Create Environment
                            </a>
                            <a href="/portal" className="w-full p-3 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors text-left flex items-center gap-3 block">
                                <span>⚡</span> Deploy Service
                            </a>
                            <a href="/security" className="w-full p-3 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors text-left flex items-center gap-3 block">
                                <span>🔍</span> Run Security Scan
                            </a>
                        </div>
                    </div>

                    <div className="glass p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4">Your Resources</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">CPU</span><span className="text-cyan-400">{userStats.cpuUsage}%</span></div>
                                <div className="h-2 bg-gray-700 rounded-full"><div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${userStats.cpuUsage}%` }}></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Memory</span><span className="text-green-400">{userStats.memoryUsage}%</span></div>
                                <div className="h-2 bg-gray-700 rounded-full"><div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${userStats.memoryUsage}%` }}></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Chat */}
            <div className="fixed bottom-6 right-6 z-50">
                {chatOpen && (
                    <div className="absolute bottom-16 right-0 w-80 h-96 glass rounded-xl border border-cyan-500/30 flex flex-col overflow-hidden mb-2 animate-scale-in">
                        <div className="p-3 bg-cyan-900/40 border-b border-white/10 font-bold">Ask VividP AI</div>
                        <div className="flex-1 p-3 overflow-y-auto space-y-3">
                            {messages.map((msg, i) => (
                                <div key={i} className={`p-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-cyan-600/50 self-end ml-8' : 'bg-gray-700/50 self-start mr-8'}`}>
                                    {msg.content}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-3 border-t border-white/10 flex gap-2">
                            <input
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage(e)}
                                className="flex-1 bg-black/30 rounded px-2 text-sm outline-none border border-transparent focus:border-cyan-500" placeholder="Type..."
                            />
                            <button onClick={(e) => handleSendMessage(e)} className="text-cyan-400">Send</button>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setChatOpen(!chatOpen)}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-nebula-blue to-circuit-teal flex items-center justify-center shadow-lg shadow-cyan-500/40 hover:scale-110 transition-transform"
                >
                    🤖
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
