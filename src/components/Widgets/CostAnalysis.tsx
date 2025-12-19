import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface CostAnalysisProps {
    compact?: boolean;
}

const CostAnalysis = ({ compact = false }: CostAnalysisProps) => {
    // Mock cost data
    const costTrend = [
        { day: 'Mon', cost: 12 },
        { day: 'Tue', cost: 18 },
        { day: 'Wed', cost: 15 },
        { day: 'Thu', cost: 22 },
        { day: 'Fri', cost: 19 },
        { day: 'Sat', cost: 8 },
        { day: 'Sun', cost: 5 },
    ];

    const costBreakdown = [
        { name: 'Compute', value: 45, color: '#06B6D4' },
        { name: 'Storage', value: 25, color: '#8B5CF6' },
        { name: 'Network', value: 20, color: '#10B981' },
        { name: 'Other', value: 10, color: '#F59E0B' },
    ];

    const totalCost = 99;
    const projectedCost = 127;
    const savings = 15;

    if (compact) {
        return (
            <div className="glass p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg">Cost Analysis</h3>
                        <p className="text-gray-400 text-sm">This billing cycle</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">${totalCost}</div>
                        <div className="text-xs text-gray-400">of $150 budget</div>
                    </div>
                </div>

                {/* Mini Chart */}
                <div className="h-24 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={costTrend}>
                            <defs>
                                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="cost" stroke="#06B6D4" fill="url(#costGradient)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-cyan-400">${projectedCost}</div>
                        <div className="text-xs text-gray-400">Projected</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-green-400">${savings}</div>
                        <div className="text-xs text-gray-400">Savings</div>
                    </div>
                </div>
            </div>
        );
    }

    // Full version - detailed view
    return (
        <div className="space-y-6">
            <div className="glass p-6 rounded-xl">
                <h3 className="font-bold text-xl mb-6">Cost Analysis</h3>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/5 p-4 rounded-lg">
                        <div className="text-gray-400 text-sm mb-1">Current Spend</div>
                        <div className="text-2xl font-bold text-white">${totalCost}</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                        <div className="text-gray-400 text-sm mb-1">Projected</div>
                        <div className="text-2xl font-bold text-yellow-400">${projectedCost}</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                        <div className="text-gray-400 text-sm mb-1">Budget</div>
                        <div className="text-2xl font-bold text-white">$150</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                        <div className="text-gray-400 text-sm mb-1">Savings</div>
                        <div className="text-2xl font-bold text-green-400">+${savings}</div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Trend Chart */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Daily Trend</h4>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={costTrend}>
                                    <defs>
                                        <linearGradient id="costGradientFull" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                                    <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip
                                        contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        formatter={(value: number) => [`$${value}`, 'Cost']}
                                    />
                                    <Area type="monotone" dataKey="cost" stroke="#06B6D4" fill="url(#costGradientFull)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Breakdown Pie */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Cost Breakdown</h4>
                        <div className="flex items-center gap-4">
                            <div className="h-48 w-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={costBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            dataKey="value"
                                        >
                                            {costBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2">
                                {costBreakdown.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-sm text-gray-300">{item.name}</span>
                                        <span className="text-sm text-gray-500">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CostAnalysis;
