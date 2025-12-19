import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';

const CLI = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const [selectedOS, setSelectedOS] = useState<'linux' | 'macos' | 'windows'>('linux');

    const downloads = {
        linux: {
            name: 'Linux',
            icon: '🐧',
            filename: 'vividp-cli-linux-amd64',
            command: 'curl -fsSL https://cli.vividp.cloud/install.sh | bash',
            size: '12.4 MB'
        },
        macos: {
            name: 'macOS',
            icon: '🍎',
            filename: 'vividp-cli-darwin-amd64',
            command: 'brew install vividp/tap/vividp-cli',
            size: '13.1 MB'
        },
        windows: {
            name: 'Windows',
            icon: '🪟',
            filename: 'vividp-cli-windows-amd64.exe',
            command: 'winget install VividP.CLI',
            size: '14.2 MB'
        }
    };

    const copyCommand = (cmd: string) => {
        navigator.clipboard.writeText(cmd);
    };

    return (
        <>
            <Header title="CLI Tool" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            <div className="space-y-8">
                {/* Hero */}
                <div className="glass p-8 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 text-center">
                    <div className="text-5xl mb-4">⌨️</div>
                    <h2 className="text-3xl font-bold mb-2">VividP CLI</h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        Deploy, manage, and monitor your applications directly from the terminal.
                        A powerful command-line tool for power users.
                    </p>
                </div>

                {/* OS Selector */}
                <div className="flex justify-center">
                    <div className="glass inline-flex p-1 rounded-lg">
                        {(['linux', 'macos', 'windows'] as const).map(os => (
                            <button
                                key={os}
                                onClick={() => setSelectedOS(os)}
                                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${selectedOS === os
                                        ? 'bg-green-500 text-white'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <span>{downloads[os].icon}</span>
                                {downloads[os].name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Download Section */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Quick Install */}
                    <div className="glass p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span>⚡</span> Quick Install
                        </h3>
                        <div className="bg-black/40 rounded-lg p-4 font-mono text-sm group relative">
                            <code className="text-green-400">{downloads[selectedOS].command}</code>
                            <button
                                onClick={() => copyCommand(downloads[selectedOS].command)}
                                className="absolute top-2 right-2 p-2 bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                                title="Copy"
                            >
                                📋
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Installs the latest version automatically
                        </p>
                    </div>

                    {/* Direct Download */}
                    <div className="glass p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span>📥</span> Direct Download
                        </h3>
                        <a
                            href={`https://releases.vividp.cloud/cli/${downloads[selectedOS].filename}`}
                            className="block p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg hover:border-green-500/50 transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{downloads[selectedOS].filename}</div>
                                    <div className="text-sm text-gray-400">{downloads[selectedOS].size}</div>
                                </div>
                                <div className="text-2xl group-hover:scale-110 transition-transform">⬇️</div>
                            </div>
                        </a>
                        <p className="text-xs text-gray-500 mt-2">
                            Version 1.2.0 • Released Dec 15, 2024
                        </p>
                    </div>
                </div>

                {/* Usage Examples */}
                <div className="glass p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <span>📖</span> Quick Start
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { title: 'Login', cmd: 'vividp auth login', desc: 'Authenticate with your account' },
                            { title: 'Deploy', cmd: 'vividp deploy --image nginx:latest --name my-app', desc: 'Deploy a container' },
                            { title: 'List', cmd: 'vividp list deployments', desc: 'List all deployments' },
                            { title: 'Logs', cmd: 'vividp logs my-app --follow', desc: 'Stream pod logs' },
                            { title: 'Scale', cmd: 'vividp scale my-app --replicas 3', desc: 'Scale replicas' },
                            { title: 'Delete', cmd: 'vividp delete my-app', desc: 'Delete deployment' },
                        ].map((example, i) => (
                            <div key={i} className="p-4 bg-white/5 rounded-lg group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-300">{example.title}</span>
                                    <button
                                        onClick={() => copyCommand(example.cmd)}
                                        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 rounded"
                                    >
                                        📋
                                    </button>
                                </div>
                                <code className="text-sm text-green-400 font-mono">{example.cmd}</code>
                                <p className="text-xs text-gray-500 mt-2">{example.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Full Documentation Link */}
                <div className="text-center">
                    <a
                        href="/docs/cli"
                        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        📚 View Full CLI Documentation
                        <span>→</span>
                    </a>
                </div>
            </div>
        </>
    );
};

export default CLI;
