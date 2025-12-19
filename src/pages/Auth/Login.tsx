import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Particles visual effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: { x: number, y: number, r: number, dx: number, dy: number }[] = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2 + 1,
                dx: (Math.random() - 0.5) * 0.5,
                dy: (Math.random() - 0.5) * 0.5
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
            particles.forEach(p => {
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0 || p.x > canvas.width) p.dx = -p.dx;
                if (p.y < 0 || p.y > canvas.height) p.dy = -p.dy;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: email.split('@')[0],
                            avatar_url: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`
                        }
                    }
                });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="relative min-h-screen bg-deep-space text-white flex items-center justify-center font-sans overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <canvas ref={canvasRef} className="opacity-50"></canvas>
            </div>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none"></div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md p-8 glass rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.15)] animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-4 animate-float">
                        <span className="text-3xl font-bold text-white">V</span>
                    </div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-gray-400 text-sm">Enter your credentials to access the IDP</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all pl-10"
                                placeholder="name@company.com"
                                required
                            />
                            <span className="absolute left-3 top-3.5 text-gray-500">✉️</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all pl-10"
                                placeholder="••••••••"
                                minLength={6}
                                required
                            />
                            <span className="absolute left-3 top-3.5 text-gray-500">🔒</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-size-200 animate-gradient hover:scale-[1.02] transform transition-all duration-300 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')} {loading ? '⏳' : '🚀'}
                    </button>
                    {!isSignUp && (
                        <div className="text-center">
                            <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">Forgot password?</a>
                        </div>
                    )}
                </form>

                <div className="mt-8 pt-6 border-t border-gray-700">
                    <p className="text-center text-gray-500 text-sm mb-4">Or continue with</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2.5 transition-colors group">
                            <span className="text-lg group-hover:scale-110 transition-transform">G</span>
                            <span className="text-sm font-medium text-gray-300">Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2.5 transition-colors group">
                            <span className="text-lg group-hover:scale-110 transition-transform">🐙</span>
                            <span className="text-sm font-medium text-gray-300">GitHub</span>
                        </button>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
