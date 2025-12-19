import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';

const Security = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const [activeTab, setActiveTab] = useState<'overview' | 'policies'>('overview');

    // Mock Data for eBPF Traces
    const traceData = Array.from({ length: 20 }, (_, i) => ({
        time: `${i}:00`,
        syscalls: Math.floor(Math.random() * 500) + 100,
        packets: Math.floor(Math.random() * 300) + 50,
    }));

    // Mock Security Events
    const events = [
        { id: 1, type: 'Blocked', source: '192.168.1.105', target: 'auth-service', risk: 'High', time: '10:42 AM' },
        { id: 2, type: 'Escalation', source: 'user-service', target: 'db-primary', risk: 'Medium', time: '10:38 AM' },
        { id: 3, type: 'Anomaly', source: 'payment-gateway', target: 'external-api', risk: 'Low', time: '10:15 AM' },
        { id: 4, type: 'Blocked', source: '192.168.1.112', target: 'ssh-bastion', risk: 'Critical', time: '09:55 AM' },
    ];

    return (
        <>
            {/* Header */}
            <Header title="Security Observability" onMenuClick={() => setSidebarOpen(!sidebarOpen)}>
                <div className="flex bg-gray-800 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === 'overview' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('policies')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === 'policies' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Policies
                    </button>
                </div>
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <span>🛡️</span> Lockdown
                </button>
            </Header>

            {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Live Events Feed */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass p-6 rounded-xl h-full">
                            <h3 className="text-xl font-bold mb-4 flex justify-between items-center">
                                <span>Live Events</span>
                                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full animate-pulse">● Live</span>
                            </h3>
                            <div className="space-y-4">
                                {events.map(event => (
                                    <div key={event.id} className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-cyan-500/30 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${event.risk === 'Critical' ? 'bg-red-500/20 text-red-500' :
                                                    event.risk === 'High' ? 'bg-orange-500/20 text-orange-500' :
                                                        event.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                                                            'bg-blue-500/20 text-blue-500'
                                                }`}>{event.risk}</span>
                                            <span className="text-xs text-gray-500">{event.time}</span>
                                        </div>
                                        <h4 className="font-medium text-sm text-gray-200">{event.type}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                            <span>{event.source}</span>
                                            <span>→</span>
                                            <span>{event.target}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        {/* eBPF Traces Chart */}
                        <div className="glass p-6 rounded-xl">
                            <h3 className="text-xl font-bold mb-2">eBPF Kernel Traces</h3>
                            <p className="text-sm text-gray-400 mb-6">Real-time system calls and network packets captured via eBPF probes.</p>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={traceData}>
                                        <defs>
                                            <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorPkt" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="time" stroke="#9CA3AF" />
                                        <YAxis stroke="#9CA3AF" />
                                        <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                                        <Area type="monotone" dataKey="syscalls" stroke="#06B6D4" fill="url(#colorSys)" name="Syscalls/sec" />
                                        <Area type="monotone" dataKey="packets" stroke="#8B5CF6" fill="url(#colorPkt)" name="Net Packets/sec" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Threat Intel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass p-6 rounded-xl">
                                <h4 className="font-bold flex items-center gap-2 mb-2">
                                    <span className="text-xl">🌍</span> Global Threat Intel
                                </h4>
                                <div className="space-y-3 mt-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Known Malicious IPs</span>
                                        <span className="text-red-400">142 Detected</span>
                                    </div>
                                    <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-red-500 h-full w-[45%]"></div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mt-2">
                                        <span className="text-gray-400">Vulnerable Libs</span>
                                        <span className="text-yellow-400">3 Critical</span>
                                    </div>
                                    <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-yellow-500 h-full w-[15%]"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="glass p-6 rounded-xl">
                                <h4 className="font-bold flex items-center gap-2 mb-2">
                                    <span className="text-xl">🔒</span> Zero-Trust Score
                                </h4>
                                <div className="flex items-center justify-center h-[100px]">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold gradient-text">85/100</div>
                                        <p className="text-sm text-green-400 mt-1">Good Standing</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass p-6 rounded-xl animate-fade-in">
                    <h3 className="text-xl font-bold mb-6">Zero-Trust Network Policies</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-700 text-gray-400 text-sm">
                                    <th className="p-3">Policy Name</th>
                                    <th className="p-3">Source</th>
                                    <th className="p-3">Destination</th>
                                    <th className="p-3">Action</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <tr className="border-b border-gray-800 hover:bg-white/5">
                                    <td className="p-3">Default Deny All</td>
                                    <td className="p-3 font-mono text-xs">*</td>
                                    <td className="p-3 font-mono text-xs">*</td>
                                    <td className="p-3"><span className="text-red-400">DENY</span></td>
                                    <td className="p-3">🟢 Active</td>
                                </tr>
                                <tr className="border-b border-gray-800 hover:bg-white/5">
                                    <td className="p-3">Allow Frontend to API</td>
                                    <td className="p-3 font-mono text-xs">svc:frontend</td>
                                    <td className="p-3 font-mono text-xs">svc:api-gateway</td>
                                    <td className="p-3"><span className="text-green-400">ALLOW</span></td>
                                    <td className="p-3">🟢 Active</td>
                                </tr>
                                <tr className="border-b border-gray-800 hover:bg-white/5">
                                    <td className="p-3">Allow DB Access</td>
                                    <td className="p-3 font-mono text-xs">svc:api-gateway</td>
                                    <td className="p-3 font-mono text-xs">svc:postgres-primary</td>
                                    <td className="p-3"><span className="text-green-400">ALLOW</span></td>
                                    <td className="p-3">🟢 Active</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-lg hover:bg-cyan-500/30 transition-colors">
                            + Add New Policy
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Security;
