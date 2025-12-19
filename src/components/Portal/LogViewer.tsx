import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface LogLine {
    timestamp: string | null;
    message: string;
}

interface LogViewerProps {
    podName?: string;
    namespace?: string;
    onClose?: () => void;
}

const LogViewer = ({ podName, namespace, onClose }: LogViewerProps) => {
    const [logs, setLogs] = useState<LogLine[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoScroll, setAutoScroll] = useState(true);
    const [filter, setFilter] = useState('');
    const [connected, setConnected] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!podName || !namespace) return;

        setLoading(true);
        setLogs([]);

        // Initialize socket connection
        const socket = io('http://localhost:3001');
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to log server');
            setConnected(true);
            socket.emit('watch-logs', { namespace, podName });
            setLoading(false);
        });

        socket.on('log-data', (data: string) => {
            const lines = data.split('\n').filter(l => l.trim() !== '');
            const newLogs = lines.map(line => {
                const match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\S+)\s(.*)$/);
                if (match) {
                    return { timestamp: match[1], message: match[2] };
                }
                return { timestamp: null, message: line };
            });

            setLogs(prev => [...prev.slice(-999), ...newLogs]); // Keep last 1000 lines
        });

        socket.on('log-error', (error: string) => {
            console.error('Log error:', error);
            setLogs(prev => [...prev, { timestamp: new Date().toISOString(), message: `ERROR: ${error}` }]);
            setLoading(false);
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('stop-logs');
                socketRef.current.disconnect();
            }
        };
    }, [podName, namespace]);

    useEffect(() => {
        if (autoScroll && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    const filteredLogs = filter
        ? logs.filter(log => log.message.toLowerCase().includes(filter.toLowerCase()))
        : logs;

    const formatTimestamp = (ts: string | null) => {
        if (!ts) return '';
        try {
            const date = new Date(ts);
            return date.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch {
            return ts.slice(11, 19);
        }
    };

    const getLogColor = (message: string) => {
        const lower = message.toLowerCase();
        if (lower.includes('error') || lower.includes('fail') || lower.includes('fatal')) {
            return 'text-red-400';
        }
        if (lower.includes('warn')) {
            return 'text-yellow-400';
        }
        if (lower.includes('info') || lower.includes('success')) {
            return 'text-green-400';
        }
        if (lower.includes('debug')) {
            return 'text-gray-500';
        }
        return 'text-gray-300';
    };

    return (
        <div className="glass rounded-xl overflow-hidden border border-white/10 flex flex-col h-[500px]">
            {/* Header */}
            <div className="bg-gray-900/80 border-b border-white/10 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-lg">📜</span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">Pod Logs</h3>
                            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{connected ? 'Live' : 'Offline'}</span>
                        </div>
                        {podName && <p className="text-xs text-gray-400 font-mono">{podName}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${autoScroll ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-700 text-gray-400'
                            }`}
                    >
                        Auto-scroll {autoScroll ? 'ON' : 'OFF'}
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-300 hover:bg-gray-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Filter */}
            <div className="bg-gray-900/50 border-b border-white/10 p-2">
                <input
                    type="text"
                    placeholder="Filter logs..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="w-full bg-black/40 border border-gray-700 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-cyan-500 outline-none"
                />
            </div>

            {/* Log Content */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto bg-gray-950 p-3 font-mono text-xs leading-relaxed"
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Connecting to stream...
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        {filter ? 'No logs match your filter' : 'Waiting for logs...'}
                    </div>
                ) : (
                    filteredLogs.map((log, i) => (
                        <div key={i} className="flex gap-2 hover:bg-white/5 py-0.5 px-1 rounded">
                            {log.timestamp && (
                                <span className="text-gray-600 shrink-0">
                                    [{formatTimestamp(log.timestamp)}]
                                </span>
                            )}
                            <span className={getLogColor(log.message)}>
                                {log.message}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="bg-gray-900/80 border-t border-white/10 px-3 py-2 text-xs text-gray-500 flex justify-between">
                <span>{filteredLogs.length} lines</span>
                <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {connected ? 'WebSocket Connected' : 'Disconnected'}
                </span>
            </div>
        </div>
    );
};

export default LogViewer;
