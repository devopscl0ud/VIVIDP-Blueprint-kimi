import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';

const Help = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();

    const sections = [
        {
            title: '🚀 Getting Started',
            items: [
                { q: 'How do I deploy my first app?', a: 'Go to Portal → Click "+ Deploy" → Enter your Docker image → Click "Deploy Now"' },
                { q: 'What Docker images can I use?', a: 'Any public Docker image from Docker Hub. Private registries require authentication setup.' },
                { q: 'Where are my apps deployed?', a: 'In your personal Kubernetes namespace (vividp-<username>)' }
            ]
        },
        {
            title: '⚙️ Managing Deployments',
            items: [
                { q: 'How do I view logs?', a: 'Portal → Logs tab → Select a pod from the dropdown' },
                { q: 'How do I restart an app?', a: 'Portal → Deployments tab → Click 🔄 button on your deployment' },
                { q: 'How do I delete an app?', a: 'Portal → Deployments tab → Click 🗑️ button → Confirm deletion' }
            ]
        },
        {
            title: '🔐 Security & Access',
            items: [
                { q: 'How do I change my password?', a: 'Settings → Security → Click "Send Password Reset Email"' },
                { q: 'Is my data secure?', a: 'Yes! Each user has isolated Kubernetes namespaces with resource isolation.' },
                { q: 'How do I sign out?', a: 'Settings → Profile → Click "Sign Out" at the bottom' }
            ]
        },
        {
            title: '⌨️ Keyboard Shortcuts',
            items: [
                { q: '⌘/Ctrl + K', a: 'Open global search' },
                { q: 'ESC', a: 'Close modals and dialogs' },
                { q: '↑↓ + Enter', a: 'Navigate and select in search results' }
            ]
        }
    ];

    return (
        <>
            <Header title="Help & Support" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            <div className="max-w-4xl space-y-8">
                {/* Welcome Banner */}
                <div className="glass p-8 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">👋</div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Welcome to VividP Help Center</h2>
                            <p className="text-gray-400">
                                Find answers to common questions and learn how to use VividP effectively.
                            </p>
                        </div>
                    </div>
                </div>

                {/* FAQ Sections */}
                {sections.map((section, i) => (
                    <div key={i} className="glass rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 bg-white/5">
                            <h3 className="text-lg font-semibold">{section.title}</h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {section.items.map((item, j) => (
                                <div key={j} className="p-4">
                                    <p className="font-medium text-white mb-2">{item.q}</p>
                                    <p className="text-gray-400 text-sm">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Contact Section */}
                <div className="glass p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">📧 Need More Help?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a href="#" className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center">
                            <div className="text-2xl mb-2">📖</div>
                            <p className="font-medium">Documentation</p>
                            <p className="text-xs text-gray-400">Read the full docs</p>
                        </a>
                        <a href="#" className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center">
                            <div className="text-2xl mb-2">💬</div>
                            <p className="font-medium">Community</p>
                            <p className="text-xs text-gray-400">Join our Discord</p>
                        </a>
                        <a href="#" className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center">
                            <div className="text-2xl mb-2">🐛</div>
                            <p className="font-medium">Report Issue</p>
                            <p className="text-xs text-gray-400">GitHub Issues</p>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Help;
