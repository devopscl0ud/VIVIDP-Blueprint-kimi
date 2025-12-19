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
import Activity from './pages/Activity/Activity';
import Help from './pages/Help/Help';
import ApiKeys from './pages/ApiKeys/ApiKeys';
import Team from './pages/Team/Team';
import Integrations from './pages/Integrations/Integrations';
import Nodes from './pages/Nodes/Nodes';
import MainLayout from './components/Layout/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-deep-space flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-nebula-blue to-electric-cyan flex items-center justify-center font-bold text-2xl animate-pulse shadow-lg shadow-cyan-500/30">V</div>
                    <p className="text-cyan-400 animate-pulse">Loading VividP...</p>
                    <div className="mt-4 flex justify-center gap-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Auto redirect if logged in
function PublicRoute({ children }: { children: JSX.Element }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-deep-space flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-nebula-blue to-electric-cyan flex items-center justify-center font-bold text-xl animate-pulse">V</div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
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
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/security" element={<Security />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/portal" element={<Portal />} />
                        <Route path="/billing" element={<Billing />} />
                        <Route path="/activity" element={<Activity />} />
                        <Route path="/help" element={<Help />} />
                        <Route path="/api-keys" element={<ApiKeys />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/integrations" element={<Integrations />} />
                        <Route path="/nodes" element={<Nodes />} />
                    </Route>

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
