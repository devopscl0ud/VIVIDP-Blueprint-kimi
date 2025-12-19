import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/AuthContext';

interface ApiKey {
    id: string;
    name: string;
    key: string;
    createdAt: Date;
    lastUsed: Date | null;
    permissions: string[];
}

const ApiKeys = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const { user } = useAuth();
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([
        {
            id: '1',
            name: 'Production Key',
            key: 'vp_live_xxxxxxxxxxxxxxxxxxxx',
            createdAt: new Date('2024-01-15'),
            lastUsed: new Date('2024-12-18'),
            permissions: ['read', 'deploy', 'delete']
        },
        {
            id: '2',
            name: 'Development Key',
            key: 'vp_test_yyyyyyyyyyyyyyyyyyyy',
            createdAt: new Date('2024-03-20'),
            lastUsed: null,
            permissions: ['read', 'deploy']
        }
    ]);
    const [showKey, setShowKey] = useState<Record<string, boolean>>({});
    const [isCreating, setIsCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyPerms, setNewKeyPerms] = useState<string[]>(['read']);
    const [newKey, setNewKey] = useState<string | null>(null);

    const generateKey = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let key = 'vp_live_';
        for (let i = 0; i < 24; i++) {
            key += chars[Math.floor(Math.random() * chars.length)];
        }
        return key;
    };

    const createKey = () => {
        if (!newKeyName) return;

        const key = generateKey();
        const newApiKey: ApiKey = {
            id: Date.now().toString(),
            name: newKeyName,
            key,
            createdAt: new Date(),
            lastUsed: null,
            permissions: newKeyPerms
        };

        setApiKeys(k => [...k, newApiKey]);
        setNewKey(key);
        setNewKeyName('');
        setNewKeyPerms(['read']);
    };

    const deleteKey = (id: string) => {
        setApiKeys(k => k.filter(key => key.id !== id));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatDate = (date: Date | null) => {
        if (!date) return 'Never';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <>
            <Header title="API Keys" onMenuClick={() => setSidebarOpen(!sidebarOpen)}>
                <button
                    onClick={() => { setIsCreating(true); setNewKey(null); }}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    <span>🔑</span> Create Key
                </button>
            </Header>

            <div className="space-y-6">
                {/* Info Banner */}
                <div className="glass p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <p className="font-medium text-yellow-400">Keep your API keys secure</p>
                        <p className="text-sm text-gray-400 mt-1">
                            API keys provide full access to your account. Never share them publicly or commit them to version control.
                        </p>
                    </div>
                </div>

                {/* Keys List */}
                <div className="glass rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <h3 className="font-semibold">Your API Keys</h3>
                    </div>

                    {apiKeys.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <div className="text-4xl mb-2">🔑</div>
                            <p>No API keys yet</p>
                            <p className="text-sm">Create one to get started with the API</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {apiKeys.map(key => (
                                <div key={key.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{key.name}</span>
                                            <div className="flex gap-1">
                                                {key.permissions.map(p => (
                                                    <span key={p} className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm text-gray-400 font-mono">
                                                {showKey[key.id] ? key.key : key.key.slice(0, 12) + '••••••••••••'}
                                            </code>
                                            <button
                                                onClick={() => setShowKey(s => ({ ...s, [key.id]: !s[key.id] }))}
                                                className="text-gray-500 hover:text-white text-sm"
                                            >
                                                {showKey[key.id] ? '🙈' : '👁️'}
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(key.key)}
                                                className="text-gray-500 hover:text-white text-sm"
                                            >
                                                📋
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Created {formatDate(key.createdAt)} • Last used {formatDate(key.lastUsed)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteKey(key.id)}
                                        className="p-2 hover:bg-red-500/20 rounded text-red-400"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Usage Example */}
                <div className="glass p-6 rounded-xl">
                    <h4 className="font-semibold mb-4">📖 Quick Start</h4>
                    <div className="bg-black/40 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                        <div className="text-gray-500"># Deploy using curl</div>
                        <div className="text-cyan-400 mt-2">
                            curl -X POST https://api.vividp.cloud/v1/deploy \
                        </div>
                        <div className="text-cyan-400 pl-4">
                            -H "Authorization: Bearer YOUR_API_KEY" \
                        </div>
                        <div className="text-cyan-400 pl-4">
                            -d '{`{"image": "nginx:latest", "name": "my-app"}`}'
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="glass w-full max-w-md rounded-xl border border-white/10 animate-scale-in">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span>🔑</span> {newKey ? 'Key Created!' : 'Create API Key'}
                            </h3>
                        </div>

                        {newKey ? (
                            <div className="p-6 space-y-4">
                                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                    <p className="text-sm text-green-400 mb-2">
                                        ✅ Your new API key has been created. Copy it now - you won't see it again!
                                    </p>
                                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded">
                                        <code className="flex-1 text-sm font-mono text-white overflow-x-auto">{newKey}</code>
                                        <button onClick={() => copyToClipboard(newKey)} className="p-2 hover:bg-white/10 rounded">
                                            📋
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setIsCreating(false); setNewKey(null); }}
                                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Key Name</label>
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={e => setNewKeyName(e.target.value)}
                                        placeholder="My API Key"
                                        className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Permissions</label>
                                    <div className="flex gap-2">
                                        {['read', 'deploy', 'delete', 'admin'].map(perm => (
                                            <button
                                                key={perm}
                                                onClick={() => setNewKeyPerms(p =>
                                                    p.includes(perm) ? p.filter(x => x !== perm) : [...p, perm]
                                                )}
                                                className={`px-3 py-1.5 rounded-lg text-sm capitalize ${newKeyPerms.includes(perm)
                                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                        : 'bg-white/5 text-gray-400'
                                                    }`}
                                            >
                                                {perm}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setIsCreating(false)}
                                        className="flex-1 py-2.5 bg-white/5 rounded-lg hover:bg-white/10"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={createKey}
                                        disabled={!newKeyName}
                                        className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold disabled:opacity-50"
                                    >
                                        Create Key
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in { animation: scale-in 0.2s ease-out; }
            `}</style>
        </>
    );
};

export default ApiKeys;
