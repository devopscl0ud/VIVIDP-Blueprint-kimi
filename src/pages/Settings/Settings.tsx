import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

type SettingsTab = 'profile' | 'team' | 'security' | 'integrations' | 'billing';

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    role: string;
}

const Settings = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // User-specific profile data
    const [profile, setProfile] = useState<UserProfile>({
        firstName: '',
        lastName: '',
        email: '',
        bio: '',
        role: 'Developer'
    });

    // Load user data on mount
    useEffect(() => {
        if (user) {
            const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
            const nameParts = fullName.split(' ');

            setProfile({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                email: user.email || '',
                bio: user.user_metadata?.bio || '',
                role: user.user_metadata?.role || 'Developer'
            });
        }
    }, [user]);

    // Get initials for avatar
    const initials = `${profile.firstName[0] || ''}${profile.lastName[0] || profile.firstName[1] || ''}`.toUpperCase();

    // Save profile changes
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaveMessage('');

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: `${profile.firstName} ${profile.lastName}`.trim(),
                    bio: profile.bio,
                    role: profile.role
                }
            });

            if (error) throw error;
            setSaveMessage('Profile saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (err: any) {
            setSaveMessage(`Error: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="glass p-8 rounded-xl max-w-2xl animate-fade-in">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative group cursor-pointer">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-3xl font-bold">
                                    {initials || '?'}
                                </div>
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs">Change</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{profile.firstName} {profile.lastName}</h3>
                                <p className="text-gray-400">{profile.role}</p>
                                <p className="text-cyan-400 text-sm">{profile.email}</p>
                            </div>
                        </div>
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">First Name</label>
                                    <input
                                        type="text"
                                        value={profile.firstName}
                                        onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                                        className="w-full bg-black/20 border border-gray-700 rounded-lg px-4 py-2 focus:border-cyan-500 outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Last Name</label>
                                    <input
                                        type="text"
                                        value={profile.lastName}
                                        onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                                        className="w-full bg-black/20 border border-gray-700 rounded-lg px-4 py-2 focus:border-cyan-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Email Address</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full bg-black/20 border border-gray-700 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500">Email cannot be changed</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Role</label>
                                <select
                                    value={profile.role}
                                    onChange={e => setProfile({ ...profile, role: e.target.value })}
                                    className="w-full bg-black/20 border border-gray-700 rounded-lg px-4 py-2 focus:border-cyan-500 outline-none transition-colors"
                                >
                                    <option value="Developer">Developer</option>
                                    <option value="DevOps Engineer">DevOps Engineer</option>
                                    <option value="Platform Engineer">Platform Engineer</option>
                                    <option value="Team Lead">Team Lead</option>
                                    <option value="Manager">Manager</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Bio</label>
                                <textarea
                                    rows={4}
                                    value={profile.bio}
                                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="Tell us about yourself..."
                                    className="w-full bg-black/20 border border-gray-700 rounded-lg px-4 py-2 focus:border-cyan-500 outline-none transition-colors"
                                ></textarea>
                            </div>

                            {saveMessage && (
                                <div className={`p-3 rounded-lg text-sm ${saveMessage.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                    {saveMessage}
                                </div>
                            )}

                            <div className="pt-4 flex justify-between items-center">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="text-red-400 hover:text-red-300 text-sm"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </form>
                    </div>
                );
            case 'security':
                return (
                    <div className="glass p-8 rounded-xl max-w-2xl animate-fade-in">
                        <h3 className="text-xl font-bold mb-6">Security Settings</h3>

                        <div className="space-y-6">
                            {/* Password Change */}
                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                <h4 className="font-medium mb-2">Change Password</h4>
                                <p className="text-sm text-gray-400 mb-4">Update your password to keep your account secure.</p>
                                <button
                                    onClick={async () => {
                                        try {
                                            await supabase.auth.resetPasswordForEmail(user?.email || '');
                                            alert('Password reset email sent!');
                                        } catch { alert('Failed to send reset email'); }
                                    }}
                                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                >
                                    Send Password Reset Email
                                </button>
                            </div>

                            {/* Active Sessions */}
                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                <h4 className="font-medium mb-2">Current Session</h4>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400">Logged in as {user?.email}</p>
                                        <p className="text-xs text-gray-500">Last sign in: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Active</span>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                                <h4 className="font-medium text-red-400 mb-2">Danger Zone</h4>
                                <p className="text-sm text-gray-400 mb-4">Once you delete your account, there is no going back.</p>
                                <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm transition-colors">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'team':
                return (
                    <div className="glass p-6 rounded-xl animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Team Members</h3>
                            <button className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-lg hover:bg-cyan-500/30 transition-colors">
                                + Invite Member
                            </button>
                        </div>
                        <div className="space-y-4">
                            {/* Current User */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-cyan-500/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center font-bold">
                                        {initials}
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{profile.firstName} {profile.lastName} <span className="text-cyan-400 text-xs">(You)</span></h4>
                                        <p className="text-sm text-gray-400">{profile.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">Active</span>
                                    <span className="text-sm text-gray-400">Owner</span>
                                </div>
                            </div>

                            {/* Placeholder for team members */}
                            <div className="text-center py-8 text-gray-400">
                                <p className="text-2xl mb-2">👥</p>
                                <p>No other team members yet.</p>
                                <p className="text-sm">Invite colleagues to collaborate!</p>
                            </div>
                        </div>
                    </div>
                );
            case 'integrations':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        {[
                            { name: 'GitHub', desc: 'Sync repositories and deployments', connected: false, icon: '🐙' },
                            { name: 'Slack', desc: 'Get alerts and notifications', connected: false, icon: '💬' },
                            { name: 'AWS', desc: 'Manage cloud resources', connected: false, icon: '☁️' },
                            { name: 'Datadog', desc: 'Sync metrics and logs', connected: false, icon: '🐶' }
                        ].map((integration, i) => (
                            <div key={i} className="glass p-6 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-3xl">{integration.icon}</div>
                                    <div className={`w-3 h-3 rounded-full ${integration.connected ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                </div>
                                <h3 className="text-lg font-bold mb-1">{integration.name}</h3>
                                <p className="text-sm text-gray-400 mb-4">{integration.desc}</p>
                                <button className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${integration.connected
                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                    : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                                    }`}>
                                    {integration.connected ? 'Disconnect' : 'Connect'}
                                </button>
                            </div>
                        ))}
                    </div>
                );
            case 'billing':
                return (
                    <div className="glass p-8 rounded-xl animate-fade-in">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-bold">Plan & Billing</h3>
                                <p className="text-gray-400">Manage your subscription and payment methods.</p>
                            </div>
                            <div className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium border border-cyan-500/30">
                                Current Plan: Free
                            </div>
                        </div>

                        <div className="text-center py-8">
                            <a href="/billing" className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block">
                                Go to Billing Page →
                            </a>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="glass p-12 rounded-xl text-center">
                        <div className="text-4xl mb-4">🚧</div>
                        <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                        <p className="text-gray-400">The {activeTab} settings are currently under development.</p>
                    </div>
                );
        }
    };

    return (
        <>
            <Header title="Settings" onMenuClick={() => setSidebarOpen(!sidebarOpen)}>
                <div className="flex bg-gray-800 rounded-lg p-1 overflow-x-auto">
                    {(['profile', 'team', 'security', 'integrations', 'billing'] as SettingsTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm rounded-md transition-colors capitalize whitespace-nowrap ${activeTab === tab ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </Header>

            {renderContent()}
        </>
    );
};

export default Settings;
