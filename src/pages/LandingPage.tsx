import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const heroRef = useRef<HTMLDivElement>(null);
    const [scrollY, setScrollY] = useState(0);
    const [activeFeature, setActiveFeature] = useState(0);
    const [typedText, setTypedText] = useState('');
    const fullText = 'Deploy. Scale. Monitor.';

    // Redirect if logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Typing animation
    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            setTypedText(fullText.slice(0, index));
            index++;
            if (index > fullText.length) {
                setTimeout(() => { index = 0; }, 2000);
            }
        }, 100);
        return () => clearInterval(timer);
    }, []);

    // Mouse tracking for parallax
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                setMousePosition({
                    x: (e.clientX - rect.left - rect.width / 2) / 50,
                    y: (e.clientY - rect.top - rect.height / 2) / 50
                });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Scroll tracking
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Feature rotation
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveFeature(prev => (prev + 1) % 4);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const features = [
        { icon: '🚀', title: 'One-Click Deploy', desc: 'Deploy Docker containers instantly', color: 'from-cyan-500 to-blue-500' },
        { icon: '📊', title: 'Real-Time Metrics', desc: 'Monitor pods, services, and logs', color: 'from-purple-500 to-pink-500' },
        { icon: '🔐', title: 'Secure by Default', desc: 'Isolated namespaces per user', color: 'from-green-500 to-emerald-500' },
        { icon: '⚡', title: 'Lightning Fast', desc: 'Scale from 0 to 100 in seconds', color: 'from-orange-500 to-red-500' }
    ];

    const stats = [
        { value: '99.9%', label: 'Uptime SLA' },
        { value: '<1s', label: 'Deploy Time' },
        { value: '10K+', label: 'Deployments' },
        { value: '24/7', label: 'Support' }
    ];

    return (
        <div className="min-h-screen bg-[#030712] text-white overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                {/* Gradient orbs */}
                <div
                    className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
                    style={{
                        background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)',
                        top: `${-100 + scrollY * 0.1}px`,
                        left: '-200px',
                        transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`
                    }}
                />
                <div
                    className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
                    style={{
                        background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
                        top: '40%',
                        right: '-150px',
                        transform: `translate(${-mousePosition.x * 1.5}px, ${-mousePosition.y * 1.5}px)`
                    }}
                />
                <div
                    className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-10"
                    style={{
                        background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)',
                        bottom: '-100px',
                        left: '30%',
                        transform: `translate(${mousePosition.x}px, ${-mousePosition.y}px)`
                    }}
                />
                {/* Grid lines */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                        backgroundSize: '100px 100px'
                    }}
                />
                {/* Noise texture */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-xl bg-black/20 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 group-hover:scale-110 transition-all">
                            V
                        </div>
                        <span className="text-xl font-bold">
                            <span className="text-cyan-400">Vivid</span>
                            <span className="text-white">P</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How it Works</a>
                        <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors font-medium">
                            Sign In
                        </Link>
                        <Link to="/signup" className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 transition-all">
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 px-6">
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 mb-8 animate-fade-in">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-sm text-cyan-300">Now with Kubernetes Auto-Scaling</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
                        <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400 animate-gradient">
                            The Developer Platform
                        </span>
                        <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-slow">
                            You've Been Waiting For
                        </span>
                    </h1>

                    {/* Typing effect */}
                    <div className="h-12 flex items-center justify-center mb-8">
                        <span className="text-2xl md:text-3xl text-gray-400 font-mono">
                            {typedText}<span className="animate-blink">|</span>
                        </span>
                    </div>

                    {/* Subheading */}
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Deploy containers in seconds. Monitor in real-time. Scale infinitely.
                        Your internal developer platform, powered by Kubernetes.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            to="/signup"
                            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-semibold text-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-cyan-500/30 hover:scale-105"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Start Deploying Free
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <button className="px-8 py-4 rounded-2xl font-semibold text-lg border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Watch Demo
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center group hover:scale-110 transition-transform cursor-default">
                                <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Floating Terminal Preview */}
                    <div
                        className="mt-20 relative mx-auto max-w-4xl"
                        style={{ transform: `perspective(1000px) rotateX(${2 - scrollY * 0.01}deg) translateY(${scrollY * 0.1}px)` }}
                    >
                        <div className="absolute -inset-px bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur-sm opacity-50" />
                        <div className="relative bg-gray-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                            {/* Terminal Header */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-white/5">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <span className="text-sm text-gray-500 ml-2">vividp deploy</span>
                            </div>
                            {/* Terminal Content */}
                            <div className="p-6 font-mono text-sm leading-relaxed text-left">
                                <div className="text-green-400">$ vividp deploy --image nginx:latest</div>
                                <div className="text-gray-500 mt-2">Creating namespace vividp-user...</div>
                                <div className="text-gray-500">Creating deployment...</div>
                                <div className="text-gray-500">Creating service...</div>
                                <div className="text-gray-500">Creating ingress...</div>
                                <div className="text-cyan-400 mt-2">✓ Deployed successfully!</div>
                                <div className="text-white mt-2">🌐 https://my-app.vividp.cloud</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Everything You Need to <span className="text-cyan-400">Ship Faster</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            A complete internal developer platform with all the tools your team needs.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className={`group relative p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all cursor-pointer ${activeFeature === i ? 'bg-white/5 scale-105' : 'hover:bg-white/[0.02]'}`}
                                onMouseEnter={() => setActiveFeature(i)}
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-gray-400">{feature.desc}</p>
                                {activeFeature === i && (
                                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} rounded-b-3xl`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="relative py-32 px-6 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Deploy in <span className="text-cyan-400">3 Simple Steps</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { step: '01', title: 'Sign Up', desc: 'Create your free account in seconds with GitHub or email.', icon: '👤' },
                            { step: '02', title: 'Push Image', desc: 'Enter your Docker image name - that\'s all we need.', icon: '📦' },
                            { step: '03', title: 'Go Live', desc: 'Get your URL instantly. Monitor, scale, repeat.', icon: '🚀' }
                        ].map((item, i) => (
                            <div key={i} className="relative group">
                                <div className="text-6xl font-bold text-white/5 absolute -top-4 -left-4 group-hover:text-cyan-500/10 transition-colors">
                                    {item.step}
                                </div>
                                <div className="relative z-10 p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all">
                                    <div className="text-4xl mb-4">{item.icon}</div>
                                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                    <p className="text-gray-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="relative p-12 rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20" />
                        <div className="absolute inset-0 backdrop-blur-xl" />
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Ready to Transform Your Workflow?
                            </h2>
                            <p className="text-xl text-gray-400 mb-8">
                                Join thousands of developers shipping faster with VividP.
                            </p>
                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-semibold text-lg hover:bg-gray-100 hover:scale-105 transition-all"
                            >
                                Start Free Trial
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative py-12 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold">V</div>
                        <span className="font-semibold">VividP</span>
                    </div>
                    <div className="flex gap-8 text-sm text-gray-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Docs</a>
                        <a href="#" className="hover:text-white transition-colors">Support</a>
                    </div>
                    <div className="text-sm text-gray-500">
                        © 2024 VividP. All rights reserved.
                    </div>
                </div>
            </footer>

            {/* Animations CSS */}
            <style>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient {
                    background-size: 200% auto;
                    animation: gradient 3s ease infinite;
                }
                .animate-gradient-slow {
                    background-size: 200% auto;
                    animation: gradient 6s ease infinite;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
                .animate-blink {
                    animation: blink 1s infinite;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
