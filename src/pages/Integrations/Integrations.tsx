import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';

interface Integration {
    id: string;
    name: string;
    icon: string;
    description: string;
    enabled: boolean;
    webhookUrl?: string;
    events: string[];
}

const Integrations = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const [configuring, setConfiguring] = useState<string | null>(null);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

    const [integrations, setIntegrations] = useState<Integration[]>([
        {
            id: 'slack',
            name: 'Slack',
            icon: '💬',
            description: 'Get deployment notifications in your Slack channels',
            enabled: false,
            events: []
        },
        {
            id: 'discord',
            name: 'Discord',
            icon: '🎮',
            description: 'Send alerts to your Discord server via webhooks',
            enabled: false,
            events: []
        },
        {
            id: 'github',
            name: 'GitHub Actions',
            icon: '🐙',
            description: 'Trigger deployments from GitHub workflows',
            enabled: true,
            events: ['deployment.created', 'deployment.deleted']
        },
        {
            id: 'pagerduty',
            name: 'PagerDuty',
            icon: '🚨',
            description: 'Alert on-call engineers when deployments fail',
            enabled: false,
            events: []
        },
        {
            id: 'datadog',
            name: 'Datadog',
            icon: '📊',
            description: 'Send metrics and logs to Datadog',
            enabled: false,
            events: []
        },
        {
            id: 'webhook',
            name: 'Custom Webhook',
            icon: '🔗',
            description: 'Send events to any HTTP endpoint',
            enabled: false,
            events: []
        }
    ]);

    const eventTypes = [
        { id: 'deployment.created', label: 'Deployment Created', icon: '🚀' },
        { id: 'deployment.deleted', label: 'Deployment Deleted', icon: '🗑️' },
        { id: 'deployment.scaled', label: 'Deployment Scaled', icon: '📈' },
        { id: 'deployment.failed', label: 'Deployment Failed', icon: '❌' },
        { id: 'pod.crashed', label: 'Pod Crashed', icon: '💥' },
        { id: 'service.created', label: 'Service Created', icon: '🔌' },
    ];

    const openConfig = (id: string) => {
        const integration = integrations.find(i => i.id === id);
        if (integration) {
            setWebhookUrl(integration.webhookUrl || '');
            setSelectedEvents(integration.events);
        }
        setConfiguring(id);
    };

    const saveConfig = () => {
        if (!configuring) return;

        setIntegrations(ints => ints.map(i =>
            i.id === configuring
                ? { ...i, enabled: true, webhookUrl, events: selectedEvents }
                : i
        ));
        setConfiguring(null);
    };

    const toggleEvent = (eventId: string) => {
        setSelectedEvents(e =>
            e.includes(eventId) ? e.filter(x => x !== eventId) : [...e, eventId]
        );
    };

    const disableIntegration = (id: string) => {
        setIntegrations(ints => ints.map(i =>
            i.id === id ? { ...i, enabled: false, webhookUrl: '', events: [] } : i
        ));
    };

    return (
        <>
            <Header title="Integrations" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            <div className="space-y-6">
                {/* Header */}
                <div className="glass p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">🔗</span>
                        <div>
                            <h2 className="text-xl font-bold">Connect Your Tools</h2>
                            <p className="text-gray-400">
                                Integrate VividP with your favorite services to automate notifications and workflows.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Integrations Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {integrations.map(int => (
                        <div
                            key={int.id}
                            className={`glass p-6 rounded-2xl border transition-all hover:-translate-y-1 ${int.enabled ? 'border-green-500/30 bg-green-500/5' : 'border-white/10'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{int.icon}</span>
                                    <div>
                                        <h3 className="font-semibold">{int.name}</h3>
                                        {int.enabled && (
                                            <span className="text-xs text-green-400">● Connected</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">{int.description}</p>

                            {int.enabled ? (
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-1">
                                        {int.events.slice(0, 2).map(e => (
                                            <span key={e} className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                                                {e.split('.')[1]}
                                            </span>
                                        ))}
                                        {int.events.length > 2 && (
                                            <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded text-xs">
                                                +{int.events.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openConfig(int.id)}
                                            className="flex-1 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20"
                                        >
                                            Configure
                                        </button>
                                        <button
                                            onClick={() => disableIntegration(int.id)}
                                            className="py-2 px-3 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                                        >
                                            Disable
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => openConfig(int.id)}
                                    className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
                                >
                                    Connect
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Webhook Events */}
                <div className="glass p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold mb-4">Available Event Types</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                        {eventTypes.map(event => (
                            <div key={event.id} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                                <span>{event.icon}</span>
                                <span className="text-sm">{event.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Configure Modal */}
            {configuring && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="glass w-full max-w-lg rounded-xl border border-white/10 animate-scale-in">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span>{integrations.find(i => i.id === configuring)?.icon}</span>
                                Configure {integrations.find(i => i.id === configuring)?.name}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Webhook URL</label>
                                <input
                                    type="url"
                                    value={webhookUrl}
                                    onChange={e => setWebhookUrl(e.target.value)}
                                    placeholder="https://hooks.slack.com/services/..."
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Events to Send</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {eventTypes.map(event => (
                                        <button
                                            key={event.id}
                                            onClick={() => toggleEvent(event.id)}
                                            className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all ${selectedEvents.includes(event.id)
                                                    ? 'bg-purple-500/20 border border-purple-500/50'
                                                    : 'bg-white/5 border border-transparent'
                                                }`}
                                        >
                                            <span>{event.icon}</span>
                                            <span className="truncate">{event.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setConfiguring(null)}
                                    className="flex-1 py-2.5 bg-white/5 rounded-lg hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveConfig}
                                    disabled={!webhookUrl || selectedEvents.length === 0}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-semibold disabled:opacity-50"
                                >
                                    Save Integration
                                </button>
                            </div>
                        </div>
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

export default Integrations;
