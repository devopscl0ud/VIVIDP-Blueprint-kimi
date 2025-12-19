import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchResult {
    type: 'deployment' | 'pod' | 'service' | 'page';
    name: string;
    description?: string;
    path?: string;
    icon: string;
}

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
    session: any;
}

const GlobalSearch = ({ isOpen, onClose, session }: GlobalSearchProps) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Static pages
    const pages: SearchResult[] = [
        { type: 'page', name: 'Dashboard', path: '/dashboard', icon: '📊', description: 'Main dashboard' },
        { type: 'page', name: 'Portal', path: '/portal', icon: '🚀', description: 'Deploy and manage apps' },
        { type: 'page', name: 'Analytics', path: '/analytics', icon: '📈', description: 'View analytics' },
        { type: 'page', name: 'Activity', path: '/activity', icon: '📋', description: 'Activity log' },
        { type: 'page', name: 'Security', path: '/security', icon: '🔒', description: 'Security settings' },
        { type: 'page', name: 'Billing', path: '/billing', icon: '💳', description: 'Billing & subscription' },
        { type: 'page', name: 'Settings', path: '/settings', icon: '⚙️', description: 'Account settings' },
    ];

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setResults(pages);
        }
    }, [isOpen]);

    // Search handler
    const handleSearch = useCallback(async (q: string) => {
        if (!q.trim()) {
            setResults(pages);
            return;
        }

        setLoading(true);
        const lowerQuery = q.toLowerCase();

        // Filter pages
        const pageResults = pages.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description?.toLowerCase().includes(lowerQuery)
        );

        // Fetch deployments
        try {
            const headers = {
                'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
            };

            const res = await fetch('http://localhost:3001/api/deployments', { headers });
            if (res.ok) {
                const data = await res.json();
                const deploymentResults: SearchResult[] = (data.deployments || [])
                    .filter((d: any) => d.name.toLowerCase().includes(lowerQuery))
                    .map((d: any) => ({
                        type: 'deployment',
                        name: d.name,
                        description: d.image,
                        path: '/portal',
                        icon: '🚀'
                    }));

                setResults([...pageResults, ...deploymentResults]);
            } else {
                setResults(pageResults);
            }
        } catch {
            setResults(pageResults);
        } finally {
            setLoading(false);
        }
    }, [session]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => handleSearch(query), 200);
        return () => clearTimeout(timer);
    }, [query, handleSearch]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            const result = results[selectedIndex];
            if (result.path) {
                window.location.href = result.path;
            }
            onClose();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full max-w-xl bg-gray-900 rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-white/10">
                    <span className="text-gray-400">🔍</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search pages, deployments, pods..."
                        className="flex-1 bg-transparent text-white text-lg outline-none placeholder-gray-500"
                    />
                    {loading && <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>}
                    <kbd className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">ESC</kbd>
                </div>

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto">
                    {results.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            No results found for "{query}"
                        </div>
                    ) : (
                        <div className="p-2">
                            {results.map((result, i) => (
                                <a
                                    key={`${result.type}-${result.name}`}
                                    href={result.path}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${i === selectedIndex ? 'bg-cyan-500/20 text-white' : 'text-gray-300 hover:bg-white/5'
                                        }`}
                                    onMouseEnter={() => setSelectedIndex(i)}
                                >
                                    <span className="text-xl">{result.icon}</span>
                                    <div className="flex-1">
                                        <p className="font-medium">{result.name}</p>
                                        {result.description && (
                                            <p className="text-sm text-gray-500">{result.description}</p>
                                        )}
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400 capitalize">
                                        {result.type}
                                    </span>
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex gap-2">
                        <span>↑↓ Navigate</span>
                        <span>↵ Select</span>
                        <span>ESC Close</span>
                    </div>
                    <span>⌘K to open</span>
                </div>
            </div>

            <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in { animation: scale-in 0.15s ease-out; }
            `}</style>
        </div>
    );
};

export default GlobalSearch;
