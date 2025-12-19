import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import Analytics from './pages/Analytics/Analytics';
import Security from './pages/Security/Security';
import Settings from './pages/Settings/Settings';
import Portal from './pages/Portal/Portal';
import Billing from './pages/Billing/Billing';
import MainLayout from './components/Layout/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-deep-space flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-nebula-blue to-electric-cyan flex items-center justify-center font-bold text-xl animate-pulse">V</div>
                    <p className="text-cyan-400">Loading VividP...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/security" element={<Security />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/portal" element={<Portal />} />
                        <Route path="/billing" element={<Billing />} />
                    </Route>

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
