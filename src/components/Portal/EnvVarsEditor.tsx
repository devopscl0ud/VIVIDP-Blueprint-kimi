import { useState } from 'react';

interface EnvVarsEditorProps {
    env: Record<string, string>;
    onChange: (env: Record<string, string>) => void;
    readOnly?: boolean;
}

export const EnvVarsEditor = ({ env, onChange, readOnly = false }: EnvVarsEditorProps) => {
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const [showValues, setShowValues] = useState<Record<string, boolean>>({});

    const addEnv = () => {
        if (newKey && newValue && !env[newKey]) {
            onChange({ ...env, [newKey]: newValue });
            setNewKey('');
            setNewValue('');
        }
    };

    const removeEnv = (key: string) => {
        const newEnv = { ...env };
        delete newEnv[key];
        onChange(newEnv);
    };

    const updateValue = (key: string, value: string) => {
        onChange({ ...env, [key]: value });
    };

    const toggleShow = (key: string) => {
        setShowValues(s => ({ ...s, [key]: !s[key] }));
    };

    const isSecret = (key: string) => {
        const secretPatterns = ['SECRET', 'PASSWORD', 'TOKEN', 'KEY', 'API_KEY', 'PRIVATE'];
        return secretPatterns.some(p => key.toUpperCase().includes(p));
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <span>🔐</span> Environment Variables
                    <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">{Object.keys(env).length}</span>
                </h4>
            </div>

            {/* Existing Variables */}
            {Object.keys(env).length > 0 && (
                <div className="space-y-2">
                    {Object.entries(env).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-white/5 group">
                            <code className="text-cyan-400 text-sm font-medium min-w-[120px]">{key}</code>
                            <span className="text-gray-500">=</span>
                            {readOnly ? (
                                <code className="flex-1 text-gray-300 text-sm truncate">
                                    {isSecret(key) && !showValues[key] ? '••••••••' : value}
                                </code>
                            ) : (
                                <input
                                    type={isSecret(key) && !showValues[key] ? 'password' : 'text'}
                                    value={value}
                                    onChange={e => updateValue(key, e.target.value)}
                                    className="flex-1 bg-transparent border-b border-gray-600 focus:border-cyan-500 outline-none text-gray-300 text-sm py-1"
                                />
                            )}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isSecret(key) && (
                                    <button
                                        onClick={() => toggleShow(key)}
                                        className="p-1.5 hover:bg-white/10 rounded text-gray-400"
                                        title={showValues[key] ? 'Hide' : 'Show'}
                                    >
                                        {showValues[key] ? '👁️' : '🙈'}
                                    </button>
                                )}
                                {!readOnly && (
                                    <button
                                        onClick={() => removeEnv(key)}
                                        className="p-1.5 hover:bg-red-500/20 rounded text-red-400"
                                        title="Remove"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add New */}
            {!readOnly && (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newKey}
                        onChange={e => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                        placeholder="KEY_NAME"
                        className="flex-1 bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none font-mono"
                    />
                    <input
                        type="text"
                        value={newValue}
                        onChange={e => setNewValue(e.target.value)}
                        placeholder="value"
                        className="flex-1 bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
                    />
                    <button
                        onClick={addEnv}
                        disabled={!newKey || !newValue}
                        className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                    >
                        + Add
                    </button>
                </div>
            )}

            {/* Empty State */}
            {Object.keys(env).length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                    <span className="text-2xl block mb-2">🔐</span>
                    No environment variables configured
                </div>
            )}

            {/* Presets */}
            {!readOnly && (
                <div className="pt-2 border-t border-white/5">
                    <p className="text-xs text-gray-500 mb-2">Quick add:</p>
                    <div className="flex flex-wrap gap-2">
                        {['NODE_ENV', 'PORT', 'DATABASE_URL', 'API_KEY', 'LOG_LEVEL'].map(preset => (
                            !env[preset] && (
                                <button
                                    key={preset}
                                    onClick={() => { setNewKey(preset); }}
                                    className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-400 hover:text-white"
                                >
                                    + {preset}
                                </button>
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnvVarsEditor;
