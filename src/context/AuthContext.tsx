import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // If we have a session and we're on login/signup/home, redirect to dashboard
            if (session?.user) {
                const path = window.location.pathname;
                if (path === '/' || path === '/login' || path === '/signup') {
                    window.location.href = '/dashboard';
                }
            }
        });

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Handle OAuth sign in - redirect to dashboard
            if (event === 'SIGNED_IN' && session?.user) {
                const path = window.location.pathname;
                if (path === '/' || path === '/login' || path === '/signup') {
                    window.location.href = '/dashboard';
                }
            }

            // Handle sign out - redirect to home
            if (event === 'SIGNED_OUT') {
                window.location.href = '/';
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
