import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    ScatterChart, Scatter
} from 'recharts';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';

const Analytics = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const [selectedTimeRange, setSelectedTimeRange] = useState('1H');

    // Mock Data for Predictive Chart
    const predictiveData = [
        { time: 'Mon', historical: 65, predicted: null, lower: null, upper: null },
        { time: 'Tue', historical: 72, predicted: null, lower: null, upper: null },
        { time: 'Wed', historical: 68, predicted: null, lower: null, upper: null },
        { time: 'Thu', historical: 75, predicted: null, lower: null, upper: null },
        { time: 'Fri', historical: 82, predicted: null, lower: null, upper: null },
        { time: 'Sat', historical: 78, predicted: 85, lower: 82, upper: 88 },
        { time: 'Sun', historical: null, predicted: 88, lower: 85, upper: 91 },
        { time: 'Mon', historical: null, predicted: 92, lower: 89, upper: 95 },
        { time: 'Tue', historical: null, predicted: 89, lower: 86, upper: 92 },
    ];

    // Mock Data for Anomaly Chart
    const anomalyData = Array.from({ length: 50 }, (_, i) => ({
        x: i,
        y: 50 + Math.sin(i / 5) * 20 + Math.random() * 10,
        isAnomaly: i === 15 || i === 35
    }));

    return (
        <>
            {/* Header */}
            <Header title="Analytics" onMenuClick={() => setSidebarOpen(!sidebarOpen)}>
                <div className="flex bg-gray-800 rounded-lg p-1">
                    {['1H', '24H', '7D', '30D'].map(range => (
                        <button
                            key={range}
                            onClick={() => setSelectedTimeRange(range)}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedTimeRange === range ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
                <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Export</button>
            </Header>

            {/* NLQ Interface */}
            <div className="mb-8">
                <div className="bg-blue-900/10 border border-circuit-teal/30 p-6 rounded-2xl">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">✨</div>
                        <div>
                            <h2 className="text-xl font-bold">Ask VividP Analytics</h2>
                            <p className="text-gray-400 text-sm">Query your infrastructure using natural language</p>
                        </div>
                    </div>
                    <div className="relative">
                        <input type="text" placeholder="e.g., Show me deployment latency trends for the last 30 days..." className="w-full bg-black/20 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-cyan-400 outline-none transition-colors" />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400">➤</button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 text-sm">
                        {['CPU usage trends', 'Memory utilization', 'Network traffic', 'Resource prediction'].map(q => (
                            <span key={q} className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 cursor-pointer">{q}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* 3D Topology Placeholder */}
                    <div className="glass p-6 rounded-xl relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Network Topology</h3>
                            <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">Live View</span>
                        </div>
                        <div className="h-[300px] w-full bg-black/40 rounded-lg flex items-center justify-center relative">
                            <div className="absolute inset-0 grid grid-cols-[repeat(20,minmax(0,1fr))] grid-rows-[repeat(10,minmax(0,1fr))] opacity-20">
                                {Array.from({ length: 200 }).map((_, i) => (
                                    <div key={i} className="border-[0.5px] border-cyan-500/30"></div>
                                ))}
                            </div>
                            <div className="text-center z-10">
                                <div className="text-4xl mb-2">🕸️</div>
                                <p className="text-cyan-400 font-mono">Interactive WebGPU Topology</p>
                                <p className="text-sm text-gray-500 mt-1">(Visualization Placeholder)</p>
                            </div>
                            {/* Animated nodes */}
                            <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_20px_#06B6D4] animate-pulse"></div>
                            <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_#3B82F6]"></div>
                            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_#10B981]"></div>
                        </div>
                    </div>

                    {/* Predictive Analytics Chart */}
                    <div className="glass p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-6">Predictive Resource Usage</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={predictiveData}>
                                    <defs>
                                        <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="time" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                                    <Area type="monotone" dataKey="historical" stroke="#06B6D4" fill="url(#colorHist)" name="Historical" />
                                    <Area type="monotone" dataKey="predicted" stroke="#10B981" strokeDasharray="5 5" fill="none" name="Predicted" />
                                    <Area type="monotone" dataKey="upper" stroke="#F59E0B" fill="none" strokeOpacity={0} />
                                    <Area type="monotone" dataKey="lower" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.1} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Anomaly Detection */}
                    <div className="glass p-6 rounded-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Anomaly Detection</h3>
                            <button className="text-cyan-400 text-sm">Refresh</button>
                        </div>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis type="number" dataKey="x" name="Time" hide />
                                    <YAxis type="number" dataKey="y" name="Value" stroke="#9CA3AF" />
                                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1F2937' }} />
                                    <Scatter name="Normal" data={anomalyData.filter(d => !d.isAnomaly)} fill="#06B6D4" />
                                    <Scatter name="Anomaly" data={anomalyData.filter(d => d.isAnomaly)} fill="#EF4444" shape="square" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="space-y-6">
                    <div className="glass p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4">AI Insights</h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-purple-500/10 border-l-4 border-purple-500 rounded-r">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-purple-400 text-sm">Prediction (High Confidence)</h4>
                                </div>
                                <p className="text-sm text-gray-300 mt-1">CPU usage expected to spike by 25% next Tuesday based on historical trends.</p>
                            </div>
                            <div className="p-3 bg-red-500/10 border-l-4 border-red-500 rounded-r">
                                <h4 className="font-semibold text-red-400 text-sm">Anomaly (Medium)</h4>
                                <p className="text-sm text-gray-300 mt-1">Unusual outbound traffic detected on port 8080.</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4">Key Metrics</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Avg Response</span><span className="text-green-400 font-mono">142ms</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Error Rate</span><span className="text-green-400 font-mono">0.02%</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Throughput</span><span className="text-cyan-400 font-mono">2.4K RPS</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Availability</span><span className="text-green-400 font-mono">99.99%</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Analytics;
