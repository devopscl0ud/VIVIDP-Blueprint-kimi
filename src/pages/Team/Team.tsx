import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface TeamMember {
    id: string;
    member_email: string;
    role: string;
    status: string;
    invited_at: string;
}

const roleColors: Record<string, string> = {
    'Admin': 'from-red-500 to-orange-500',
    'Developer': 'from-cyan-500 to-blue-500',
    'Viewer': 'from-gray-500 to-gray-600'
};

const rolePermissions: Record<string, string[]> = {
    'Admin': ['Full access', 'Manage team', 'Billing', 'Delete resources', 'API keys'],
    'Developer': ['Deploy', 'Scale', 'View logs', 'Restart pods', 'Create services'],
    'Viewer': ['View deployments', 'View logs', 'View metrics']
};

const Team = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const { user } = useAuth();
    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('Developer');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);

    // Fetch team from Supabase
    const fetchTeam = async () => {
        if (!user) return;

        try {
            const { data, error: fetchError } = await supabase
                .from('team_members')
                .select('*')
                .eq('owner_id', user.id)
                .order('invited_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Add the owner as first member
            const ownerMember: TeamMember = {
                id: 'owner',
                member_email: user.email || '',
                role: 'Admin',
                status: 'Active',
                invited_at: user.created_at || new Date().toISOString()
            };

            setMembers([ownerMember, ...(data || [])]);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching team:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, [user]);

    const inviteMember = async () => {
        if (!inviteEmail || !user) return;

        try {
            const { error: insertError } = await supabase
                .from('team_members')
                .insert({
                    owner_id: user.id,
                    member_email: inviteEmail,
                    role: inviteRole,
                    status: 'Pending'
                });

            if (insertError) throw insertError;

            fetchTeam();
            setInviteEmail('');
            setIsInviting(false);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const removeMember = async (id: string) => {
        if (id === 'owner') return;
        if (!window.confirm('Are you sure you want to remove this member?')) return;

        try {
            const { error: deleteError } = await supabase
                .from('team_members')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            fetchTeam();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const changeRole = async (id: string, newRole: string) => {
        if (id === 'owner') return;

        try {
            const { error: updateError } = await supabase
                .from('team_members')
                .update({ role: newRole })
                .eq('id', id);

            if (updateError) throw updateError;
            fetchTeam();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <>
            <Header title="Team Management" onMenuClick={() => setSidebarOpen(!sidebarOpen)}>
                <button
                    onClick={() => setIsInviting(true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    <span>➕</span> Invite Member
                </button>
            </Header>

            <div className="space-y-6">
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center gap-3">
                        <span>⚠️</span>
                        <p>{error}</p>
                        <button onClick={fetchTeam} className="ml-auto underline hover:no-underline">Retry</button>
                    </div>
                )}

                {/* Role Legend */}
                <div className="glass p-4 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Role Permissions</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                        {['Admin', 'Developer', 'Viewer'].map(role => (
                            <div key={role} className="p-3 bg-white/5 rounded-lg">
                                <div className={`inline-flex px-2 py-1 rounded text-xs font-bold bg-gradient-to-r ${roleColors[role]} mb-2 capitalize`}>
                                    {role}
                                </div>
                                <ul className="space-y-1">
                                    {(rolePermissions[role] || []).map((perm, i) => (
                                        <li key={i} className="text-xs text-gray-400 flex items-center gap-1">
                                            <span className="text-green-400">✓</span> {perm}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team Members */}
                <div className="glass rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-semibold">Team Members ({members.length})</h3>
                    </div>

                    <div className="divide-y divide-white/5">
                        {loading ? (
                            <div className="p-12 text-center text-gray-500">
                                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                Loading team...
                            </div>
                        ) : members.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">No members found.</div>
                        ) : members.map(member => (
                            <div key={member.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${roleColors[member.role] || 'from-gray-500 to-gray-600'} flex items-center justify-center font-bold text-lg text-white`}>
                                    {member.member_email[0].toUpperCase()}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium truncate text-white">{member.member_email}</span>
                                        {member.status === 'Pending' && (
                                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                                Pending
                                            </span>
                                        )}
                                        {member.id === 'owner' && (
                                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                                                Owner
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {member.id === 'owner' ? 'Account owner' : `Invited ${formatDate(member.invited_at)}`}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <select
                                        value={member.role}
                                        onChange={e => changeRole(member.id, e.target.value)}
                                        disabled={member.id === 'owner'}
                                        className="bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none disabled:opacity-50"
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Developer">Developer</option>
                                        <option value="Viewer">Viewer</option>
                                    </select>

                                    {member.id !== 'owner' && (
                                        <button
                                            onClick={() => removeMember(member.id)}
                                            className="p-2 hover:bg-red-500/20 rounded text-red-400"
                                            title="Remove"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {isInviting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="glass w-full max-w-md rounded-xl border border-white/10 animate-scale-in">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span>➕</span> Invite Team Member
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    placeholder="colleague@company.com"
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Role</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Developer', 'Viewer'].map(role => (
                                        <button
                                            key={role}
                                            onClick={() => setInviteRole(role)}
                                            className={`p-3 rounded-lg text-left transition-all border ${inviteRole === role
                                                ? 'bg-cyan-500/20 border-cyan-500/50'
                                                : 'bg-white/5 border-transparent hover:border-white/10'
                                                }`}
                                        >
                                            <div className={`text-sm font-medium capitalize bg-gradient-to-r ${roleColors[role]} bg-clip-text text-transparent`}>
                                                {role}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {role === 'Developer' ? 'Can deploy & manage' : 'View only access'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setIsInviting(false)}
                                    className="flex-1 py-2.5 bg-white/5 rounded-lg hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={inviteMember}
                                    disabled={!inviteEmail}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold disabled:opacity-50"
                                >
                                    Send Invite
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Team;
