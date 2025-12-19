interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    trend?: { value: number; up: boolean };
    color?: 'cyan' | 'green' | 'purple' | 'yellow' | 'red';
    onClick?: () => void;
}

export const MetricCard = ({ title, value, subtitle, icon, trend, color = 'cyan', onClick }: MetricCardProps) => {
    const colors = {
        cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
        green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
        purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
        yellow: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
        red: 'from-red-500/20 to-rose-500/20 border-red-500/30',
    };

    return (
        <div
            className={`relative p-6 rounded-2xl bg-gradient-to-br ${colors[color]} border backdrop-blur-xl overflow-hidden group ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
            onClick={onClick}
        >
            {/* Background glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{icon}</div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-sm ${trend.up ? 'text-green-400' : 'text-red-400'}`}>
                            <span>{trend.up ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                        </div>
                    )}
                </div>
                <div className="text-3xl font-bold mb-1">{value}</div>
                <div className="text-sm text-gray-400">{title}</div>
                {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
            </div>
        </div>
    );
};

interface ProgressBarProps {
    label: string;
    value: number;
    max: number;
    color?: 'cyan' | 'green' | 'yellow' | 'red' | 'purple';
    showPercent?: boolean;
}

export const ProgressBar = ({ label, value, max, color = 'cyan', showPercent = true }: ProgressBarProps) => {
    const percent = Math.min(100, (value / max) * 100);

    const colors = {
        cyan: 'bg-cyan-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
        purple: 'bg-purple-500',
    };

    const getColor = () => {
        if (percent >= 90) return 'red';
        if (percent >= 75) return 'yellow';
        return color;
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-400">{label}</span>
                <span className="text-white font-medium">
                    {value} / {max} {showPercent && <span className="text-gray-500">({percent.toFixed(1)}%)</span>}
                </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colors[getColor()]} transition-all duration-500 rounded-full`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
};

interface SparklineProps {
    data: number[];
    color?: string;
    height?: number;
}

export const Sparkline = ({ data, color = '#06B6D4', height = 40 }: SparklineProps) => {
    if (data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width="100%" height={height} className="overflow-visible">
            <defs>
                <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
            />
            <polygon
                fill={`url(#gradient-${color})`}
                points={`0,${height} ${points} 100,${height}`}
            />
        </svg>
    );
};

export default MetricCard;
