import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSignup, setIsSignup] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Password strength calculation
    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    };

    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const strengthColors = ['#EF4444', '#F59E0B', '#EAB308', '#22C55E', '#10B981'];
    const passwordStrength = getPasswordStrength(formData.password);

    // Background animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            });
        }

        const animate = () => {
            ctx.fillStyle = 'rgba(10, 14, 26, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(6, 182, 212, 0.5)';
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };
        animate();

        return () => window.removeEventListener('resize', setCanvasSize);
    }, []);

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (isSignup) {
            if (formData.password.length < 8) {
                setError('Password must be at least 8 characters');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
        }
        return true;
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            if (isSignup) {
                const { error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName || formData.email.split('@')[0]
                        }
                    }
                });

                if (error) throw error;

                // Auto-login after signup
                const { error: loginError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });

                if (!loginError) {
                    navigate('/dashboard');
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });

                if (error) throw error;
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Google authentication failed');
        }
    };

    return (
        <div className="min-h-screen bg-deep-space flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <canvas ref={canvasRef} className="absolute inset-0 z-0" />
            <div className="circuit-bg absolute inset-0 z-0"></div>
            <div className="absolute inset-0 z-0 opacity-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* Auth Card */}
            <div className="glass relative z-10 w-full max-w-md p-8 rounded-2xl shadow-2xl animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nebula-blue to-electric-cyan flex items-center justify-center font-bold text-xl">V</div>
                        <span className="text-2xl font-bold gradient-text">VividP</span>
                    </Link>
                    <h2 className="text-xl font-semibold mt-4 text-white">
                        {isSignup ? 'Create your account' : 'Welcome back'}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {isSignup ? 'Start your journey with VividP' : 'Sign in to continue'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleAuth} className="space-y-4">
                    {isSignup && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full bg-black/40 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                            placeholder="••••••••"
                        />
                        {/* Password Strength Indicator */}
                        {isSignup && formData.password && (
                            <div className="mt-2">
                                <div className="flex gap-1 mb-1">
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <div
                                            key={i}
                                            className="h-1 flex-1 rounded-full transition-colors"
                                            style={{
                                                backgroundColor: i < passwordStrength ? strengthColors[passwordStrength - 1] : '#374151'
                                            }}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs" style={{ color: strengthColors[passwordStrength - 1] || '#6B7280' }}>
                                    {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Enter a password'}
                                </p>
                            </div>
                        )}
                    </div>

                    {isSignup && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full bg-black/40 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                                placeholder="••••••••"
                            />
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                            </span>
                        ) : isSignup ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-gray-700"></div>
                    <span className="px-4 text-gray-500 text-sm">or</span>
                    <div className="flex-1 border-t border-gray-700"></div>
                </div>

                {/* Google OAuth */}
                <button
                    onClick={handleGoogleAuth}
                    className="w-full bg-white/5 border border-gray-600 hover:bg-white/10 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-3 transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                {/* Toggle Sign Up / Sign In */}
                <p className="text-center text-gray-400 text-sm mt-6">
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignup(!isSignup);
                            setError('');
                        }}
                        className="text-cyan-400 hover:underline"
                    >
                        {isSignup ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default Signup;
