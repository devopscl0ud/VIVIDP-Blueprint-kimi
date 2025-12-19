import { ReactNode } from 'react';

interface ResourceCardProps {
    title: string;
    count: number | string;
    icon: string;
    subtitle?: string;
    color?: 'cyan' | 'green' | 'yellow' | 'red' | 'purple';
    onClick?: () => void;
    children?: ReactNode;
    loading?: boolean;
}

const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
    green: 'from-green-500/20 to-green-500/5 border-green-500/30 text-green-400',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400',
    red: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400'
};

export const ResourceCard = ({
    title,
    count,
    icon,
    subtitle,
    color = 'cyan',
    onClick,
    children,
    loading = false
}: ResourceCardProps) => {
    return (
        <div
            onClick={onClick}
            className={`
                bg-gradient-to-br ${colorClasses[color]} 
                border rounded-xl p-6 
                transition-all duration-300
                ${onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg' : ''}
            `}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{icon}</div>
                {loading ? (
                    <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                ) : (
                    <div className={`text-3xl font-bold ${colorClasses[color].split(' ').pop()}`}>
                        {count}
                    </div>
                )}
            </div>
            <h3 className="font-semibold text-white mb-1">{title}</h3>
            {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
            {children}
        </div>
    );
};

interface StatusBadgeProps {
    status: string;
    pulse?: boolean;
}

export const StatusBadge = ({ status, pulse = false }: StatusBadgeProps) => {
    const getStatusClasses = () => {
        switch (status.toLowerCase()) {
            case 'running':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'pending':
            case 'containercreating':
            case 'starting':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'terminated':
            case 'error':
            case 'crashloopbackoff':
            case 'errimagepull':
            case 'imagepullbackoff':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'restarting':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const shouldPulse = pulse || ['running'].includes(status.toLowerCase());

    return (
        <span className={`
            inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border
            ${getStatusClasses()}
        `}>
            {shouldPulse && (
                <span className={`w-2 h-2 rounded-full ${status.toLowerCase() === 'running' ? 'bg-green-400' :
                        status.toLowerCase() === 'pending' ? 'bg-yellow-400' : 'bg-gray-400'
                    } animate-pulse`}></span>
            )}
            {status}
        </span>
    );
};

interface ResourceTableProps {
    headers: string[];
    children: ReactNode;
    emptyMessage?: string;
    isEmpty?: boolean;
    loading?: boolean;
}

export const ResourceTable = ({
    headers,
    children,
    emptyMessage = 'No resources found',
    isEmpty = false,
    loading = false
}: ResourceTableProps) => {
    return (
        <div className="glass rounded-xl overflow-hidden">
            <table className="w-full">
                <thead className="bg-white/5 text-gray-400 text-sm">
                    <tr>
                        {headers.map((header, i) => (
                            <th key={i} className="text-left p-4 font-medium">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={headers.length} className="p-8 text-center">
                                <div className="flex items-center justify-center gap-2 text-gray-400">
                                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                                    Loading...
                                </div>
                            </td>
                        </tr>
                    ) : isEmpty ? (
                        <tr>
                            <td colSpan={headers.length} className="p-8 text-center text-gray-400">
                                <div className="text-3xl mb-2">📦</div>
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : children}
                </tbody>
            </table>
        </div>
    );
};

export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Delete',
    confirmColor = 'red'
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: 'red' | 'cyan';
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass w-full max-w-md rounded-xl p-6 animate-scale-in border border-white/10">
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <p className="text-gray-400 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${confirmColor === 'red'
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResourceCard;
