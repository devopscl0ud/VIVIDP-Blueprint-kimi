import { useState, useEffect } from 'react';

interface CreateServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ServiceFormData) => Promise<void>;
    existingPods: { name: string }[];
}

interface ServiceFormData {
    name: string;
    selector: string;
    port: string;
    targetPort: string;
    type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
    nodePort: string;
}

export const CreateServiceModal = ({ isOpen, onClose, onSubmit, existingPods }: CreateServiceModalProps) => {
    const [form, setForm] = useState<ServiceFormData>({
        name: '',
        selector: '',
        port: '80',
        targetPort: '80',
        type: 'ClusterIP',
        nodePort: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Auto-generate name from selector
    useEffect(() => {
        if (form.selector && !form.name) {
            setForm(f => ({ ...f, name: `${form.selector}-svc` }));
        }
    }, [form.selector]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!form.name || !form.selector || !form.port) {
            setError('Name, selector, and port are required');
            return;
        }

        if (form.type === 'NodePort' && form.nodePort) {
            const np = parseInt(form.nodePort);
            if (np < 30000 || np > 32767) {
                setError('NodePort must be between 30000 and 32767');
                return;
            }
        }

        setLoading(true);
        try {
            await onSubmit(form);
            setForm({ name: '', selector: '', port: '80', targetPort: '80', type: 'ClusterIP', nodePort: '' });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create service');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass w-full max-w-xl rounded-2xl border border-white/10 animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🌐</span>
                            <div>
                                <h2 className="text-xl font-bold">Create Service</h2>
                                <p className="text-sm text-gray-400">Expose your pods to the network</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <span className="text-2xl">×</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Service Type */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Service Type *</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'ClusterIP', icon: '🔒', desc: 'Internal only' },
                                    { value: 'NodePort', icon: '🌐', desc: 'Expose on node' },
                                    { value: 'LoadBalancer', icon: '⚖️', desc: 'External LB' }
                                ].map(t => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, type: t.value as any }))}
                                        className={`p-3 rounded-lg text-left transition-all border ${form.type === t.value
                                                ? 'bg-purple-500/20 border-purple-500/50'
                                                : 'bg-white/5 border-transparent hover:border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{t.icon}</span>
                                            <span className="font-medium text-sm">{t.value}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Selector */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Target Pod/Deployment *</label>
                            {existingPods.length > 0 ? (
                                <select
                                    value={form.selector}
                                    onChange={e => setForm(f => ({ ...f, selector: e.target.value }))}
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none"
                                >
                                    <option value="">Select a pod/deployment...</option>
                                    {existingPods.map(p => (
                                        <option key={p.name} value={p.name}>{p.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={form.selector}
                                    onChange={e => setForm(f => ({ ...f, selector: e.target.value }))}
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none"
                                    placeholder="my-app"
                                />
                            )}
                        </div>

                        {/* Service Name */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Service Name *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none"
                                placeholder="my-service"
                            />
                        </div>

                        {/* Ports */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Service Port *</label>
                                <input
                                    type="number"
                                    value={form.port}
                                    onChange={e => setForm(f => ({ ...f, port: e.target.value }))}
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none"
                                    placeholder="80"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Container Port</label>
                                <input
                                    type="number"
                                    value={form.targetPort}
                                    onChange={e => setForm(f => ({ ...f, targetPort: e.target.value }))}
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none"
                                    placeholder="80"
                                />
                            </div>
                        </div>

                        {/* NodePort field */}
                        {form.type === 'NodePort' && (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <label className="block text-sm text-yellow-400 mb-2">
                                    NodePort (30000-32767)
                                </label>
                                <input
                                    type="number"
                                    value={form.nodePort}
                                    onChange={e => setForm(f => ({ ...f, nodePort: e.target.value }))}
                                    className="w-full bg-black/40 border border-yellow-500/30 rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 outline-none"
                                    placeholder="Leave empty for auto-assign"
                                    min={30000}
                                    max={32767}
                                />
                                <p className="text-xs text-yellow-400/70 mt-2">
                                    💡 Access via: http://&lt;node-ip&gt;:{form.nodePort || '<auto>'}
                                </p>
                            </div>
                        )}

                        {form.type === 'LoadBalancer' && (
                            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <p className="text-sm text-blue-400">
                                    ⚖️ LoadBalancer will provision an external IP (cloud provider dependent)
                                </p>
                            </div>
                        )}
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
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Creating...
                            </>
                        ) : (
                            <>🌐 Create Service</>
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

export default CreateServiceModal;
