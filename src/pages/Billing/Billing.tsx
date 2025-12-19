import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/AuthContext';

interface PlanFeature {
    name: string;
    free: boolean | string;
    pro: boolean | string;
    enterprise: boolean | string;
}

const Billing = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const { user } = useAuth();
    const [currentPlan] = useState('free');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            id: 'free',
            name: 'Free',
            monthlyPrice: 0,
            yearlyPrice: 0,
            description: 'Perfect for getting started',
            features: ['3 Deployments', '256MB RAM each', 'Community support', 'Shared namespace'],
            cta: 'Current Plan',
            popular: false,
        },
        {
            id: 'pro',
            name: 'Pro',
            monthlyPrice: 29,
            yearlyPrice: 290,
            description: 'For growing teams',
            features: ['Unlimited Deploys', '2GB RAM each', 'Priority support', 'Dedicated namespace', 'Custom domains', 'API access'],
            cta: 'Upgrade',
            popular: true,
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            monthlyPrice: 99,
            yearlyPrice: 990,
            description: 'For large organizations',
            features: ['Everything in Pro', 'On-premise option', 'SSO/SAML', 'SLA guarantee', 'Dedicated support', 'Audit logs'],
            cta: 'Contact Sales',
            popular: false,
        },
    ];

    const comparison: PlanFeature[] = [
        { name: 'Deployments', free: '3', pro: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'Memory per pod', free: '256MB', pro: '2GB', enterprise: '8GB' },
        { name: 'CPU per pod', free: '0.1 CPU', pro: '1 CPU', enterprise: '4 CPU' },
        { name: 'Custom domains', free: false, pro: true, enterprise: true },
        { name: 'SSL certificates', free: true, pro: true, enterprise: true },
        { name: 'API access', free: false, pro: true, enterprise: true },
        { name: 'Team members', free: '1', pro: '10', enterprise: 'Unlimited' },
        { name: 'Support', free: 'Community', pro: 'Priority', enterprise: 'Dedicated' },
        { name: 'SLA', free: false, pro: false, enterprise: '99.9%' },
    ];

    const usage = {
        deployments: { used: 2, limit: 3 },
        memory: { used: 384, limit: 768, unit: 'MB' },
        bandwidth: { used: 1.2, limit: 10, unit: 'GB' },
    };

    return (
        <>
            <Header title="Billing" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            <div className="space-y-8">
                {/* Current Plan Banner */}
                <div className="glass p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">💳</span>
                                <h2 className="text-xl font-bold">Current Plan: <span className="text-cyan-400 capitalize">{currentPlan}</span></h2>
                            </div>
                            <p className="text-gray-400">
                                {currentPlan === 'free'
                                    ? 'Upgrade to Pro for unlimited deployments and more resources.'
                                    : 'Your billing cycle renews on the 1st of each month.'}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">${plans.find(p => p.id === currentPlan)?.[billingCycle === 'monthly' ? 'monthlyPrice' : 'yearlyPrice']}</div>
                            <div className="text-sm text-gray-400">/{billingCycle === 'monthly' ? 'month' : 'year'}</div>
                        </div>
                    </div>
                </div>

                {/* Usage */}
                <div className="glass p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold mb-4">Current Usage</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.entries(usage).map(([key, val]) => (
                            <div key={key} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400 capitalize">{key}</span>
                                    <span>{val.used} / {val.limit} {'unit' in val ? val.unit : ''}</span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${(val.used / val.limit) > 0.8 ? 'bg-red-500' : 'bg-cyan-500'}`}
                                        style={{ width: `${Math.min(100, (val.used / val.limit) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center">
                    <div className="glass inline-flex p-1 rounded-lg">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'yearly' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Yearly <span className="text-green-400 ml-1">Save 17%</span>
                        </button>
                    </div>
                </div>

                {/* Plans */}
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map(plan => (
                        <div
                            key={plan.id}
                            className={`relative glass p-6 rounded-2xl border transition-all hover:-translate-y-1 ${plan.popular ? 'border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 to-transparent' : 'border-white/10'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-xs font-semibold">
                                    Most Popular
                                </div>
                            )}
                            <div className="mb-4">
                                <h4 className="text-xl font-bold">{plan.name}</h4>
                                <p className="text-sm text-gray-400">{plan.description}</p>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">
                                    ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                                </span>
                                <span className="text-gray-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                            </div>
                            <ul className="space-y-2 mb-6">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                        <span className="text-green-400">✓</span>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button
                                className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.id === currentPlan
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : plan.popular
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/25'
                                            : 'bg-white/10 hover:bg-white/20'
                                    }`}
                                disabled={plan.id === currentPlan}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Feature Comparison */}
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-lg font-semibold">Feature Comparison</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="text-left p-4 text-gray-400 font-medium">Feature</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Free</th>
                                    <th className="text-center p-4 text-cyan-400 font-medium">Pro</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparison.map((row, i) => (
                                    <tr key={i} className="border-t border-white/5">
                                        <td className="p-4">{row.name}</td>
                                        <td className="p-4 text-center">
                                            {typeof row.free === 'boolean'
                                                ? row.free ? <span className="text-green-400">✓</span> : <span className="text-gray-600">—</span>
                                                : row.free}
                                        </td>
                                        <td className="p-4 text-center">
                                            {typeof row.pro === 'boolean'
                                                ? row.pro ? <span className="text-green-400">✓</span> : <span className="text-gray-600">—</span>
                                                : <span className="text-cyan-400">{row.pro}</span>}
                                        </td>
                                        <td className="p-4 text-center">
                                            {typeof row.enterprise === 'boolean'
                                                ? row.enterprise ? <span className="text-green-400">✓</span> : <span className="text-gray-600">—</span>
                                                : row.enterprise}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Billing;
