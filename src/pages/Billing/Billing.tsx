import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';

const Billing = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();

    // Mock billing data
    const currentPlan = {
        name: 'Free',
        price: 0,
        deploymentLimit: 3,
        deploymentsUsed: 2,
        storageLimit: '1 GB',
        storageUsed: '0.3 GB'
    };

    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: 0,
            features: ['3 Deployments', '1 GB Storage', 'Community Support', 'Basic Analytics'],
            popular: false
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 29,
            features: ['20 Deployments', '10 GB Storage', 'Priority Support', 'Advanced Analytics', 'Custom Domains'],
            popular: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 99,
            features: ['Unlimited Deployments', '100 GB Storage', '24/7 Support', 'AI Insights', 'SSO/SAML', 'Audit Logs'],
            popular: false
        }
    ];

    const invoices = [
        { id: 'INV-001', date: 'Dec 1, 2024', amount: '$0.00', status: 'Paid', plan: 'Free' },
        { id: 'INV-002', date: 'Nov 1, 2024', amount: '$0.00', status: 'Paid', plan: 'Free' },
    ];

    const handleUpgrade = (planId: string) => {
        // In production, this would open a payment modal/checkout
        alert(`Upgrade to ${planId} coming soon! Payment integration pending.`);
    };

    return (
        <>
            <Header title="Billing & Subscription" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            <div className="space-y-8 animate-fade-in">
                {/* Current Plan Overview */}
                <section className="glass p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Current Plan</h3>
                            <p className="text-gray-400">Manage your subscription and billing</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold gradient-text">{currentPlan.name}</div>
                            <div className="text-gray-400 text-sm">
                                {currentPlan.price === 0 ? 'Free forever' : `$${currentPlan.price}/month`}
                            </div>
                        </div>
                    </div>

                    {/* Usage Meters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 p-4 rounded-lg">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Deployments</span>
                                <span className="text-white">{currentPlan.deploymentsUsed} / {currentPlan.deploymentLimit}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${(currentPlan.deploymentsUsed / currentPlan.deploymentLimit) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Storage</span>
                                <span className="text-white">{currentPlan.storageUsed} / {currentPlan.storageLimit}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                    style={{ width: '30%' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Plans */}
                <section>
                    <h3 className="text-xl font-bold mb-4">Choose Your Plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`glass p-6 rounded-xl relative ${plan.popular ? 'border-2 border-cyan-500' : 'border border-white/10'
                                    } hover:border-cyan-500/50 transition-all hover:-translate-y-1`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full">
                                        Most Popular
                                    </div>
                                )}
                                <div className="text-center mb-6">
                                    <h4 className="text-lg font-bold mb-2">{plan.name}</h4>
                                    <div className="text-3xl font-bold">
                                        ${plan.price}
                                        <span className="text-sm text-gray-400 font-normal">/mo</span>
                                    </div>
                                </div>
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                            <span className="text-green-400">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={plan.id === 'free'}
                                    className={`w-full py-2 rounded-lg font-medium transition-all ${plan.id === 'free'
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : plan.popular
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                >
                                    {plan.id === 'free' ? 'Current Plan' : 'Upgrade'}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Invoice History */}
                <section className="glass rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-xl font-bold">Invoice History</h3>
                    </div>
                    <table className="w-full">
                        <thead className="bg-white/5 text-gray-400 text-sm">
                            <tr>
                                <th className="text-left p-4">Invoice</th>
                                <th className="text-left p-4">Date</th>
                                <th className="text-left p-4">Plan</th>
                                <th className="text-left p-4">Amount</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-left p-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="border-t border-white/5 hover:bg-white/5">
                                    <td className="p-4 font-mono text-sm">{invoice.id}</td>
                                    <td className="p-4 text-gray-400">{invoice.date}</td>
                                    <td className="p-4">{invoice.plan}</td>
                                    <td className="p-4">{invoice.amount}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button className="text-cyan-400 hover:underline text-sm">Download</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Payment Method */}
                <section className="glass p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Payment Method</h3>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                                VISA
                            </div>
                            <div>
                                <p className="text-white">No payment method added</p>
                                <p className="text-gray-400 text-sm">Add a card to upgrade your plan</p>
                            </div>
                        </div>
                        <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                            Add Card
                        </button>
                    </div>
                </section>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default Billing;
