import { useState } from 'react';

interface ScaleDeploymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (replicas: number) => Promise<void>;
    deploymentName: string;
    currentReplicas: number;
}

export const ScaleDeploymentModal = ({ isOpen, onClose, onSubmit, deploymentName, currentReplicas }: ScaleDeploymentModalProps) => {
    const [replicas, setReplicas] = useState(currentReplicas);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onSubmit(replicas);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass w-full max-w-md rounded-2xl border border-white/10 animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">📈</span>
                        <div>
                            <h2 className="text-xl font-bold">Scale Deployment</h2>
                            <p className="text-sm text-gray-400">{deploymentName}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                            {replicas}
                        </div>
                        <p className="text-gray-400 mt-2">replicas</p>
                    </div>

                    {/* Slider */}
                    <div className="relative mb-6">
                        <input
                            type="range"
                            min={0}
                            max={10}
                            value={replicas}
                            onChange={e => setReplicas(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>0</span>
                            <span>5</span>
                            <span>10</span>
                        </div>
                    </div>

                    {/* Quick buttons */}
                    <div className="grid grid-cols-5 gap-2">
                        {[0, 1, 2, 3, 5].map(n => (
                            <button
                                key={n}
                                onClick={() => setReplicas(n)}
                                className={`py-2 rounded-lg font-medium transition-all ${replicas === n
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>

                    {/* Warning for 0 */}
                    {replicas === 0 && (
                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <p className="text-sm text-yellow-400">
                                ⚠️ Setting replicas to 0 will stop all pods
                            </p>
                        </div>
                    )}

                    {/* Cost indicator */}
                    {replicas > currentReplicas && (
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <p className="text-sm text-blue-400">
                                📈 Scaling up by {replicas - currentReplicas} replica(s)
                            </p>
                        </div>
                    )}
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
                        disabled={loading || replicas === currentReplicas}
                        className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Scaling...
                            </>
                        ) : (
                            <>📈 Scale to {replicas}</>
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

export default ScaleDeploymentModal;
