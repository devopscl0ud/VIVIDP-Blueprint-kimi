import { useState } from 'react';

interface CreatePodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PodFormData) => Promise<void>;
}

interface PodFormData {
    name: string;
    image: string;
    port: string;
    command: string;
    args: string;
    env: Record<string, string>;
    cpuLimit: string;
    memoryLimit: string;
}

export const CreatePodModal = ({ isOpen, onClose, onSubmit }: CreatePodModalProps) => {
    const [form, setForm] = useState<PodFormData>({
        name: '',
        image: '',
        port: '',
        command: '',
        args: '',
        env: {},
        cpuLimit: '100m',
        memoryLimit: '128Mi'
    });
    const [envKey, setEnvKey] = useState('');
    const [envValue, setEnvValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const presets = [
        { name: 'Nginx', image: 'nginx:alpine', port: '80' },
        { name: 'Redis', image: 'redis:alpine', port: '6379' },
        { name: 'Node.js', image: 'node:18-alpine', port: '3000' },
        { name: 'Python', image: 'python:3.11-slim', port: '8000' },
        { name: 'MongoDB', image: 'mongo:6', port: '27017' },
        { name: 'PostgreSQL', image: 'postgres:15-alpine', port: '5432' },
    ];

    const addEnv = () => {
        if (envKey && envValue) {
            setForm(f => ({ ...f, env: { ...f.env, [envKey]: envValue } }));
            setEnvKey('');
            setEnvValue('');
        }
    };

    const removeEnv = (key: string) => {
        const newEnv = { ...form.env };
        delete newEnv[key];
        setForm(f => ({ ...f, env: newEnv }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!form.name || !form.image) {
            setError('Name and image are required');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(form);
            setForm({ name: '', image: '', port: '', command: '', args: '', env: {}, cpuLimit: '100m', memoryLimit: '128Mi' });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create pod');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass w-full max-w-2xl rounded-2xl border border-white/10 max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🐳</span>
                            <div>
                                <h2 className="text-xl font-bold">Create Pod</h2>
                                <p className="text-sm text-gray-400">Deploy a standalone container</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <span className="text-2xl">×</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Presets */}
                    <div className="mb-6">
                        <label className="block text-sm text-gray-400 mb-2">Quick Start Templates</label>
                        <div className="grid grid-cols-3 gap-2">
                            {presets.map(p => (
                                <button
                                    key={p.name}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, name: p.name.toLowerCase(), image: p.image, port: p.port }))}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors border border-transparent hover:border-cyan-500/30"
                                >
                                    <p className="font-medium text-sm">{p.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{p.image}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Pod Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                                    placeholder="my-pod"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Container Port</label>
                                <input
                                    type="text"
                                    value={form.port}
                                    onChange={e => setForm(f => ({ ...f, port: e.target.value }))}
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                                    placeholder="80"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Docker Image *</label>
                            <input
                                type="text"
                                value={form.image}
                                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                                className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                                placeholder="nginx:latest"
                            />
                        </div>

                        {/* Advanced */}
                        <details className="group">
                            <summary className="cursor-pointer text-sm text-cyan-400 hover:text-cyan-300">
                                Advanced Options ▾
                            </summary>
                            <div className="mt-4 space-y-4 pt-4 border-t border-white/5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Command</label>
                                        <input
                                            type="text"
                                            value={form.command}
                                            onChange={e => setForm(f => ({ ...f, command: e.target.value }))}
                                            className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none font-mono text-sm"
                                            placeholder="/bin/sh -c"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Arguments</label>
                                        <input
                                            type="text"
                                            value={form.args}
                                            onChange={e => setForm(f => ({ ...f, args: e.target.value }))}
                                            className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none font-mono text-sm"
                                            placeholder="sleep 3600"
                                        />
                                    </div>
                                </div>

                                {/* Resource Limits */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">CPU Limit</label>
                                        <select
                                            value={form.cpuLimit}
                                            onChange={e => setForm(f => ({ ...f, cpuLimit: e.target.value }))}
                                            className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                                        >
                                            <option value="50m">50m (0.05 CPU)</option>
                                            <option value="100m">100m (0.1 CPU)</option>
                                            <option value="250m">250m (0.25 CPU)</option>
                                            <option value="500m">500m (0.5 CPU)</option>
                                            <option value="1">1 CPU</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Memory Limit</label>
                                        <select
                                            value={form.memoryLimit}
                                            onChange={e => setForm(f => ({ ...f, memoryLimit: e.target.value }))}
                                            className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                                        >
                                            <option value="64Mi">64 MB</option>
                                            <option value="128Mi">128 MB</option>
                                            <option value="256Mi">256 MB</option>
                                            <option value="512Mi">512 MB</option>
                                            <option value="1Gi">1 GB</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Environment Variables */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Environment Variables</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={envKey}
                                            onChange={e => setEnvKey(e.target.value)}
                                            placeholder="KEY"
                                            className="flex-1 bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none text-sm"
                                        />
                                        <input
                                            type="text"
                                            value={envValue}
                                            onChange={e => setEnvValue(e.target.value)}
                                            placeholder="value"
                                            className="flex-1 bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={addEnv}
                                            className="px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
                                        >
                                            +
                                        </button>
                                    </div>
                                    {Object.entries(form.env).length > 0 && (
                                        <div className="space-y-1">
                                            {Object.entries(form.env).map(([k, v]) => (
                                                <div key={k} className="flex items-center gap-2 bg-white/5 rounded px-3 py-1.5 text-sm">
                                                    <code className="text-cyan-400">{k}</code>
                                                    <span className="text-gray-500">=</span>
                                                    <code className="text-gray-300 flex-1 truncate">{v}</code>
                                                    <button type="button" onClick={() => removeEnv(k)} className="text-red-400 hover:text-red-300">×</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </details>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Creating...
                            </>
                        ) : (
                            <>🐳 Create Pod</>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in { animation: scale-in 0.2s ease-out; }
            `}</style>
        </div>
    );
};

export default CreatePodModal;
