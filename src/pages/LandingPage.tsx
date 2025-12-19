import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scrollY, setScrollY] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});

    const phrases = ['Deploy Instantly.', 'Scale Infinitely.', 'Monitor Everything.'];
    const [phraseIndex, setPhraseIndex] = useState(0);

    // Redirect if logged in
    useEffect(() => {
        if (user) navigate('/dashboard');
    }, [user, navigate]);

    // Particle Network Animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        interface Particle {
            x: number; y: number; vx: number; vy: number; size: number; color: string;
        }

        const particles: Particle[] = [];
        const colors = ['#06B6D4', '#8B5CF6', '#EC4899', '#22C55E'];

        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        let animationId: number;
        const animate = () => {
            ctx.fillStyle = 'rgba(3, 7, 18, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                // Connect nearby particles
                particles.slice(i + 1).forEach(p2 => {
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(6, 182, 212, ${0.1 * (1 - dist / 120)})`;
                        ctx.stroke();
                    }
                });
            });

            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    // Scroll tracking
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Mouse tracking
    useEffect(() => {
        const handleMouse = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouse);
        return () => window.removeEventListener('mousemove', handleMouse);
    }, []);

    // Typing effect
    useEffect(() => {
        let charIndex = 0;
        let deleting = false;

        const type = () => {
            const currentPhrase = phrases[phraseIndex];

            if (!deleting) {
                setTypedText(currentPhrase.slice(0, charIndex + 1));
                charIndex++;

                if (charIndex === currentPhrase.length) {
                    deleting = true;
                    setTimeout(type, 2000);
                    return;
                }
            } else {
                setTypedText(currentPhrase.slice(0, charIndex - 1));
                charIndex--;

                if (charIndex === 0) {
                    deleting = false;
                    setPhraseIndex(p => (p + 1) % phrases.length);
                }
            }

            setTimeout(type, deleting ? 50 : 100);
        };

        const timer = setTimeout(type, 500);
        return () => clearTimeout(timer);
    }, [phraseIndex]);

    // Testimonial rotation
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTestimonial(t => (t + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Intersection observer for scroll reveals
    const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setIsVisible(v => ({ ...v, [entry.target.id]: true }));
            }
        });
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(observerCallback, { threshold: 0.1 });
        document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [observerCallback]);

    const features = [
        { icon: '🚀', title: 'One-Click Deploy', desc: 'Push your Docker image and get a URL in seconds. No YAML, no config.', color: 'from-cyan-500 to-blue-600' },
        { icon: '📊', title: 'Real-Time Dashboard', desc: 'Watch your pods spin up, monitor CPU/memory, stream logs live.', color: 'from-purple-500 to-pink-600' },
        { icon: '🔒', title: 'Isolated Namespaces', desc: 'Each user gets their own Kubernetes namespace. Fully isolated.', color: 'from-green-500 to-emerald-600' },
        { icon: '⚡', title: 'Auto-Scaling', desc: 'Scale from 0 to 10 replicas with a slider. Pay for what you use.', color: 'from-orange-500 to-red-600' },
        { icon: '🌐', title: 'Instant URLs', desc: 'Every deployment gets a unique URL. Share instantly.', color: 'from-blue-500 to-indigo-600' },
        { icon: '📋', title: 'Activity Logs', desc: 'Full audit trail of every deployment, scale, and delete action.', color: 'from-pink-500 to-rose-600' },
    ];

    const testimonials = [
        { name: 'Alex Chen', role: 'Senior DevOps Engineer', company: 'TechCorp', quote: 'VividP reduced our deployment time from hours to seconds. Game changer.', avatar: '👨‍💻' },
        { name: 'Sarah Kim', role: 'Platform Lead', company: 'StartupXYZ', quote: 'Finally, a developer platform that actually understands developers.', avatar: '👩‍💼' },
        { name: 'Mike Johnson', role: 'CTO', company: 'CloudNative Inc', quote: 'We migrated our entire platform to VividP in a week. No regrets.', avatar: '👨‍🔬' },
    ];

    const stats = [
        { value: '99.99%', label: 'Uptime' },
        { value: '<500ms', label: 'Deploy' },
        { value: '50K+', label: 'Deploys' },
        { value: '24/7', label: 'Support' },
    ];

    const pricing = [
        { name: 'Free', price: '$0', features: ['3 Deployments', '256MB RAM each', 'Shared namespace', 'Community support'], cta: 'Start Free', popular: false },
        { name: 'Pro', price: '$29', features: ['Unlimited Deploys', '2GB RAM each', 'Dedicated namespace', 'Priority support', 'Custom domains'], cta: 'Start Trial', popular: true },
        { name: 'Enterprise', price: 'Custom', features: ['Everything in Pro', 'On-prem option', 'SSO/SAML', 'SLA guarantee', 'Dedicated support'], cta: 'Contact Sales', popular: false },
    ];

    return (
        <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
            {/* Particle Canvas */}
            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            {/* Mouse glow effect */}
            <div
                className="fixed w-96 h-96 rounded-full pointer-events-none z-10 transition-transform duration-100"
                style={{
                    background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
                    left: mousePos.x - 192,
                    top: mousePos.y - 192,
                }}
            />

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'py-3 bg-black/80 backdrop-blur-xl border-b border-white/5' : 'py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl blur group-hover:blur-md transition-all" />
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-lg">
                                V
                            </div>
                        </div>
                        <span className="text-2xl font-bold tracking-tight">
                            <span className="text-cyan-400">Vivid</span>P
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-8">
                        {['Features', 'Pricing', 'Docs', 'Blog'].map(item => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors font-medium">
                            Sign In
                        </Link>
                        <Link to="/signup" className="relative group px-6 py-2.5 rounded-xl font-semibold overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-cyan-400 to-blue-500" />
                            <span className="relative">Get Started</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
                <div className="max-w-6xl mx-auto text-center relative z-20">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 mb-8 animate-float">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm text-cyan-300 font-medium">Now with Kubernetes Auto-Scaling</span>
                        <span className="text-cyan-500">→</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8">
                        <span className="block">The Developer Platform</span>
                        <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x">
                            That Just Works
                        </span>
                    </h1>

                    {/* Typing effect */}
                    <div className="h-12 flex items-center justify-center mb-8">
                        <span className="text-2xl md:text-3xl text-gray-400 font-mono">
                            {typedText}<span className="animate-blink text-cyan-400">|</span>
                        </span>
                    </div>

                    {/* Subheading */}
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Deploy Docker containers to Kubernetes in seconds. No YAML. No complexity.
                        Just push and ship.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            to="/signup"
                            className="group relative px-8 py-4 rounded-2xl font-semibold text-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-cyan-500/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient-x" />
                            <span className="relative flex items-center gap-2">
                                Start Deploying Free
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </Link>
                        <button className="group px-8 py-4 rounded-2xl font-semibold text-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                            Watch Demo
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-20">
                        {stats.map((stat, i) => (
                            <div key={i} className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all hover:scale-105 cursor-default">
                                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Terminal Preview */}
                    <div
                        className="relative mx-auto max-w-4xl"
                        style={{
                            transform: `perspective(1500px) rotateX(${Math.max(0, 5 - scrollY * 0.02)}deg)`,
                            opacity: Math.max(0, 1 - scrollY * 0.002)
                        }}
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur-lg opacity-50 animate-pulse-slow" />
                        <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
                            <div className="flex items-center gap-2 px-4 py-3 bg-black/50 border-b border-white/5">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer" />
                                    <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer" />
                                </div>
                                <span className="text-sm text-gray-500 ml-2 font-mono">vividp-cli</span>
                            </div>
                            <div className="p-6 font-mono text-sm leading-loose text-left overflow-hidden">
                                <div className="text-green-400 flex gap-2">
                                    <span className="text-gray-500">$</span>
                                    vividp deploy --image nginx:latest --name my-app
                                </div>
                                <div className="text-gray-500 mt-3">
                                    <span className="text-cyan-400">→</span> Creating namespace <span className="text-white">vividp-user</span>...
                                </div>
                                <div className="text-gray-500">
                                    <span className="text-cyan-400">→</span> Pulling image <span className="text-white">nginx:latest</span>...
                                </div>
                                <div className="text-gray-500">
                                    <span className="text-cyan-400">→</span> Creating deployment...
                                </div>
                                <div className="text-gray-500">
                                    <span className="text-cyan-400">→</span> Creating service...
                                </div>
                                <div className="text-gray-500">
                                    <span className="text-cyan-400">→</span> Creating ingress...
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-white">Deployed successfully in</span>
                                    <span className="text-cyan-400 font-bold">1.2s</span>
                                </div>
                                <div className="mt-3 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                                    <span className="text-gray-400">🌐 URL:</span>
                                    <span className="text-cyan-400 ml-2">https://my-app.vividp.cloud</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
                    <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll</span>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="relative py-32 px-6" data-animate>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">Features</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4">
                            Everything You Need to <span className="text-cyan-400">Ship Faster</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            A complete internal developer platform that your team will actually love using.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-2"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundImage: `linear-gradient(135deg, ${feature.color.split(' ')[0].replace('from-', '')} 0%, ${feature.color.split(' ')[1].replace('to-', '')} 100%)` }} />
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="relative py-32 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-transparent to-purple-950/20" />
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Testimonials</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4">
                            Loved by <span className="text-purple-400">Developers</span>
                        </h2>
                    </div>

                    <div className="relative h-64">
                        {testimonials.map((t, i) => (
                            <div
                                key={i}
                                className={`absolute inset-0 transition-all duration-500 ${i === activeTestimonial
                                        ? 'opacity-100 translate-x-0'
                                        : i < activeTestimonial
                                            ? 'opacity-0 -translate-x-full'
                                            : 'opacity-0 translate-x-full'
                                    }`}
                            >
                                <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl p-8 border border-white/10 h-full flex flex-col justify-center">
                                    <p className="text-xl md:text-2xl text-gray-300 mb-6 italic">
                                        "{t.quote}"
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{t.name}</div>
                                            <div className="text-sm text-gray-400">{t.role} at {t.company}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-8">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTestimonial(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? 'bg-purple-500 w-6' : 'bg-gray-600 hover:bg-gray-500'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="relative py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-green-400 text-sm font-semibold uppercase tracking-wider">Pricing</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4">
                            Simple, <span className="text-green-400">Transparent</span> Pricing
                        </h2>
                        <p className="text-xl text-gray-400">
                            Start free. Scale as you grow.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {pricing.map((plan, i) => (
                            <div
                                key={i}
                                className={`relative p-8 rounded-3xl border transition-all hover:-translate-y-2 ${plan.popular
                                        ? 'bg-gradient-to-b from-cyan-950/50 to-purple-950/50 border-cyan-500/50'
                                        : 'bg-white/[0.02] border-white/10'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-sm font-semibold">
                                        Most Popular
                                    </div>
                                )}
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mt-2">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        {plan.price !== 'Custom' && <span className="text-gray-400">/month</span>}
                                    </div>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-2 text-gray-300">
                                            <span className="text-green-400">✓</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/signup"
                                    className={`block text-center py-3 rounded-xl font-semibold transition-all ${plan.popular
                                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:shadow-lg hover:shadow-cyan-500/25'
                                            : 'bg-white/5 hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="relative p-12 rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 animate-gradient-x" />
                        <div className="absolute inset-0 backdrop-blur-xl" />
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Ready to Ship Faster?
                            </h2>
                            <p className="text-xl text-gray-400 mb-8 max-w-xl mx-auto">
                                Join thousands of developers who deploy with confidence.
                            </p>
                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-gray-100 hover:scale-105 transition-all shadow-2xl shadow-white/10"
                            >
                                Get Started for Free
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative py-16 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold">V</div>
                                <span className="font-bold text-lg">VividP</span>
                            </div>
                            <p className="text-sm text-gray-500">
                                The AI-Native Internal Developer Platform for modern teams.
                            </p>
                        </div>
                        {[
                            { title: 'Product', links: ['Features', 'Pricing', 'Documentation', 'Changelog'] },
                            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
                            { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Compliance'] }
                        ].map((section, i) => (
                            <div key={i}>
                                <h4 className="font-semibold mb-4">{section.title}</h4>
                                <ul className="space-y-2">
                                    {section.links.map((link, j) => (
                                        <li key={j}>
                                            <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{link}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500">
                            © 2024 VividP. All rights reserved.
                        </div>
                        <div className="flex gap-6">
                            {['GitHub', 'Twitter', 'Discord', 'LinkedIn'].map(social => (
                                <a key={social} href="#" className="text-sm text-gray-500 hover:text-white transition-colors">
                                    {social}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            {/* CSS Animations */}
            <style>{`
                @keyframes gradient-x {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 6s ease infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float { animation: float 3s ease-in-out infinite; }
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
                .animate-blink { animation: blink 1s infinite; }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 0.8; }
                }
                .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default LandingPage;
