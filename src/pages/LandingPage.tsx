import { useEffect } from 'react';
import { Link } from 'react-router-dom';

// We'll need to define types for the global variables if we want TS to be happy, 
// or just use any for now since we are relying on CDNs.
declare global {
    interface Window {
        Matter: any;
        Typed: any;
        anime: any;
    }
}

const LandingPage = () => {

    useEffect(() => {
        // Initialize Typed.js
        if (window.Typed) {
            new window.Typed('#typed-text', {
                strings: [
                    'Elite Engineering Teams',
                    'Modern Infrastructure',
                    'Secure Platforms',
                    'AI-Native Operations'
                ],
                typeSpeed: 80,
                backSpeed: 50,
                backDelay: 2000,
                loop: true,
                showCursor: true,
                cursorChar: '|'
            });
        }
    }, []);

    return (
        <div className="font-sans text-slate-50 antialiased overflow-x-hidden selection:bg-cyan-500/30">
            {/* Background Effects */}
            <div className="circuit-bg"></div>
            <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" id="particles"></div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-deep-space/80 backdrop-blur-md border-b border-circuit-teal/20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {/* Placeholder for Logo */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nebula-blue to-electric-cyan flex items-center justify-center">
                            <span className="font-bold text-white">V</span>
                        </div>
                        <span className="text-xl font-bold gradient-text">VividP</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-gray-300 hover:text-cyan-400 transition-colors">Features</a>
                        <a href="#pricing" className="text-gray-300 hover:text-cyan-400 transition-colors">Pricing</a>
                        <a href="#faq" className="text-gray-300 hover:text-cyan-400 transition-colors">FAQ</a>
                        <Link to="/login" className="text-gray-300 hover:text-cyan-400 transition-colors">Login</Link>
                        <Link to="/signup" className="bg-gradient-to-r from-nebula-blue to-circuit-teal hover:shadow-lg hover:shadow-cyan-400/20 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:-translate-y-0.5">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-deep-space via-nebula-blue/20 to-circuit-teal/10 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center px-4 py-2 rounded-full glass text-sm font-medium border border-cyan-500/20 bg-blue-900/10">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                AI-Native Platform • Now Available
                            </div>

                            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                                The <span className="gradient-text">AI-Native</span> Internal Developer Platform for <br />
                                <span className="gradient-text" id="typed-text"></span>
                            </h1>

                            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                                Zero-trust authentication, AI-powered predictive analytics, WebGPU-accelerated rendering,
                                eBPF-based security observability, and "ask-to-visualize" natural language queries.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/signup" className="flex items-center justify-center bg-gradient-to-r from-nebula-blue to-circuit-teal text-white px-8 py-3 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-1">
                                Request Access
                            </Link>
                            <button className="flex items-center justify-center bg-transparent border border-electric-cyan text-electric-cyan hover:bg-electric-cyan hover:text-white px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:-translate-y-1">
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    <div className="relative hidden lg:block">
                        <div className="animate-float">
                            {/* Replaced img with a placeholder div if image is missing, or reuse provided path if valid */}
                            <div className="w-full aspect-video rounded-xl glass border border-electric-cyan/30 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black relative overflow-hidden group">
                                <div className="absolute inset-0 bg-grid-slate-700/[0.2] bg-[bottom_1px_center]"></div>
                                <div className="text-cyan-400/50 font-mono text-lg">System Architecture Visualization</div>
                                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-20 blur group-hover:opacity-40 transition duration-1000"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 relative overflow-hidden bg-deep-space">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Core Capabilities</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to scale your engineering organization from startup to enterprise.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: 'Zero-Trust Security', icon: '🔒', desc: 'eBPF-based observability and automated policy enforcement.' },
                            { title: 'AI-Native Insights', icon: '🧠', desc: 'Predictive analytics for resource scaling and anomaly detection.' },
                            { title: 'Self-Service Portal', icon: '⚡', desc: 'One-click environment provisioning with "Golden Paths".' },
                            { title: 'GitOps Workflow', icon: '🐙', desc: 'Automated deployments synced directly with your repositories.' },
                            { title: 'Cost Intelligence', icon: '💰', desc: 'Real-time cloud cost tracking and budget alerts.' },
                            { title: 'Compliance Radar', icon: '🛡️', desc: 'Continuous compliance monitoring (SOC2, HIPAA, ISO).' },
                        ].map((feature, i) => (
                            <div key={i} className="glass p-8 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all hover:-translate-y-1">
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-400 text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 relative overflow-hidden bg-black/20">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-gray-400">Start small and scale as you grow.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 items-start">
                        {/* Starter */}
                        <div className="glass p-8 rounded-2xl border border-white/5 relative">
                            <h3 className="text-xl font-bold text-gray-400">Starter</h3>
                            <div className="text-4xl font-bold mt-4 mb-2">$0</div>
                            <p className="text-sm text-gray-500 mb-6">Forever free for small teams.</p>
                            <ul className="space-y-3 mb-8 text-sm text-gray-300">
                                <li>✓ Up to 5 Developers</li>
                                <li>✓ Basic Service Catalog</li>
                                <li>✓ Community Support</li>
                            </ul>
                            <button className="w-full py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">Start Free</button>
                        </div>
                        {/* Pro */}
                        <div className="glass p-8 rounded-2xl border border-cyan-500/50 relative transform scale-105 shadow-2xl shadow-cyan-500/10">
                            <div className="absolute top-0 right-0 bg-cyan-500 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>
                            <h3 className="text-xl font-bold text-white">Pro</h3>
                            <div className="text-4xl font-bold mt-4 mb-2 gradient-text">$29</div>
                            <p className="text-sm text-gray-500 mb-6">Per user / month</p>
                            <ul className="space-y-3 mb-8 text-sm text-gray-300">
                                <li>✓ Up to 50 Developers</li>
                                <li>✓ Advanced Analytics</li>
                                <li>✓ SSO & RBAC</li>
                                <li>✓ Priority Support</li>
                            </ul>
                            <Link to="/signup" className="block text-center w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-bold transition-colors">Get Started</Link>
                        </div>
                        {/* Enterprise */}
                        <div className="glass p-8 rounded-2xl border border-white/5 relative">
                            <h3 className="text-xl font-bold text-gray-400">Enterprise</h3>
                            <div className="text-4xl font-bold mt-4 mb-2">Custom</div>
                            <p className="text-sm text-gray-500 mb-6">For large organizations.</p>
                            <ul className="space-y-3 mb-8 text-sm text-gray-300">
                                <li>✓ Unlimited Users</li>
                                <li>✓ On-premise Deployment</li>
                                <li>✓ Dedicated Success Manager</li>
                                <li>✓ Custom SLAs</li>
                            </ul>
                            <button className="w-full py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">Contact Sales</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 relative overflow-hidden bg-deep-space">
                <div className="max-w-3xl mx-auto px-6 relative z-10">
                    <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { q: 'Can I host VividP on my own infrastructure?', a: 'Yes! Our Enterprise plan supports self-hosted deployments on AWS, GCP, Azure, or bare metal.' },
                            { q: 'Does it support Kubernetes?', a: 'Absolutely. VividP is built for Kubernetes-native workflows and integrates seamlessly with Helm and Kustomize.' },
                            { q: 'How does the AI assistant work?', a: 'Our AI is trained on your documentation and codebase (securely) to answer contextual questions about your infrastructure.' },
                        ].map((item, i) => (
                            <div key={i} className="glass rounded-lg overflow-hidden">
                                <details className="group">
                                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-4">
                                        <span>{item.q}</span>
                                        <span className="transition group-open:rotate-180">
                                            <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                        </span>
                                    </summary>
                                    <div className="text-gray-400 mt-3 group-open:animate-fadeIn p-4 pt-0 text-sm">
                                        {item.a}
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="py-8 text-center text-gray-500 text-sm bg-black/50">
                <p>&copy; 2024 VividP Inc. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
