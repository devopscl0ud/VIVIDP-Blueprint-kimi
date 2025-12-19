import { useState, useEffect, useCallback } from 'react';

interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    meta?: boolean;
    description: string;
    action: () => void;
}

interface KeyboardShortcutsProps {
    shortcuts: KeyboardShortcut[];
    children: React.ReactNode;
}

export const KeyboardShortcutsProvider = ({ shortcuts, children }: KeyboardShortcutsProps) => {
    const [showHelp, setShowHelp] = useState(false);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Don't trigger shortcuts when typing in inputs
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
            return;
        }

        for (const shortcut of shortcuts) {
            const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
            const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true;
            const metaMatch = shortcut.meta ? e.metaKey : true;

            if (keyMatch && ctrlMatch && metaMatch) {
                e.preventDefault();
                shortcut.action();
                return;
            }
        }

        // ? for help
        if (e.key === '?') {
            e.preventDefault();
            setShowHelp(s => !s);
        }
    }, [shortcuts]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <>
            {children}
            {showHelp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowHelp(false)}>
                    <div className="glass w-full max-w-md rounded-2xl border border-white/10 animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span>⌨️</span> Keyboard Shortcuts
                            </h2>
                        </div>
                        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                            {shortcuts.map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                    <span className="text-gray-300">{s.description}</span>
                                    <kbd className="px-2 py-1 bg-gray-800 rounded text-xs font-mono text-cyan-400">
                                        {s.ctrl && 'Ctrl + '}{s.meta && '⌘ + '}{s.key.toUpperCase()}
                                    </kbd>
                                </div>
                            ))}
                            <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                <span className="text-gray-300">Show this help</span>
                                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs font-mono text-cyan-400">?</kbd>
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/10 text-center">
                            <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-white">
                                Press <kbd className="mx-1 px-2 py-0.5 bg-gray-800 rounded text-xs">ESC</kbd> or <kbd className="mx-1 px-2 py-0.5 bg-gray-800 rounded text-xs">?</kbd> to close
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
            )}
        </>
    );
};

export default KeyboardShortcutsProvider;
