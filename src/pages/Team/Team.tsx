import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { LayoutContextType } from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/AuthContext';

interface TeamMember {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'developer' | 'viewer';
    status: 'active' | 'pending' | 'inactive';
    joinedAt: Date;
    lastActive: Date | null;
    avatar?: string;
}

const roleColors = {
    admin: 'from-red-500 to-orange-500',
    developer: 'from-cyan-500 to-blue-500',
    viewer: 'from-gray-500 to-gray-600'
};

const rolePermissions = {
    admin: ['Full access', 'Manage team', 'Billing', 'Delete resources', 'API keys'],
    developer: ['Deploy', 'Scale', 'View logs', 'Restart pods', 'Create services'],
    viewer: ['View deployments', 'View logs', 'View metrics']
};

const Team = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContextType>();
    const { user } = useAuth();
    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'developer' | 'viewer'>('developer');

    const [members, setMembers] = useState<TeamMember[]>([
        {
            id: '1',
            email: user?.email || 'owner@example.com',
            name: user?.user_metadata?.full_name || 'Team Owner',
            role: 'admin',
            status: 'active',
            joinedAt: new Date('2024-01-01'),
            lastActive: new Date()
        },
        {
            id: '2',
            email: 'dev@example.com',
            name: 'John Developer',
            role: 'developer',
            status: 'active',
            joinedAt: new Date('2024-06-15'),
            lastActive: new Date('2024-12-18')
        },
        {
            id: '3',
            email: 'viewer@example.com',
            name: 'Sarah Viewer',
            role: 'viewer',
            status: 'pending',
            joinedAt: new Date('2024-12-01'),
            lastActive: null
        }
    ]);

    const inviteMember = () => {
        if (!inviteEmail) return;

        const newMember: TeamMember = {
            id: Date.now().toString(),
            email: inviteEmail,
            name: inviteEmail.split('@')[0],
            role: inviteRole,
            status: 'pending',
            joinedAt: new Date(),
            lastActive: null
        };

        setMembers(m => [...m, newMember]);
        setInviteEmail('');
        setIsInviting(false);
    };

    const removeMember = (id: string) => {
        setMembers(m => m.filter(member => member.id !== id));
    };

    const changeRole = (id: string, newRole: 'admin' | 'developer' | 'viewer') => {
        setMembers(m => m.map(member =>
            member.id === id ? { ...member, role: newRole } : member
        ));
    };

    const formatDate = (date: Date | null) => {
        if (!date) return 'Never';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
                {/* Role Legend */}
                <div className="glass p-4 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Role Permissions</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                        {(['admin', 'developer', 'viewer'] as const).map(role => (
                            <div key={role} className="p-3 bg-white/5 rounded-lg">
                                <div className={`inline-flex px-2 py-1 rounded text-xs font-bold bg-gradient-to-r ${roleColors[role]} mb-2 capitalize`}>
                                    {role}
                                </div>
                                <ul className="space-y-1">
                                    {rolePermissions[role].map((perm, i) => (
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
                        {members.map(member => (
                            <div key={member.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                {/* Avatar */}
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${roleColors[member.role]} flex items-center justify-center font-bold text-lg`}>
                                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium truncate">{member.name}</span>
                                        {member.status === 'pending' && (
                                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                                Pending
                                            </span>
                                        )}
                                        {member.id === '1' && (
                                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                                                Owner
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-400 truncate">{member.email}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Joined {formatDate(member.joinedAt)} • Last active {formatDate(member.lastActive)}
                                    </div>
                                </div>

                                {/* Role Selector */}
                                <div className="flex items-center gap-3">
                                    <select
                                        value={member.role}
                                        onChange={e => changeRole(member.id, e.target.value as any)}
                                        disabled={member.id === '1'}
                                        className="bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="developer">Developer</option>
                                        <option value="viewer">Viewer</option>
                                    </select>

                                    {member.id !== '1' && (
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

                {/* Pending Invites */}
                {members.some(m => m.status === 'pending') && (
                    <div className="glass p-6 rounded-xl">
                        <h4 className="font-semibold mb-4">Pending Invites</h4>
                        <div className="space-y-2">
                            {members.filter(m => m.status === 'pending').map(m => (
                                <div key={m.id} className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <div>
                                        <span className="text-yellow-400">{m.email}</span>
                                        <span className="text-gray-400 text-sm ml-2">as {m.role}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 bg-white/10 rounded text-sm hover:bg-white/20">
                                            Resend
                                        </button>
                                        <button
                                            onClick={() => removeMember(m.id)}
                                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
                                    {(['developer', 'viewer'] as const).map(role => (
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
                                                {role === 'developer' ? 'Can deploy & manage' : 'View only access'}
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

            <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in { animation: scale-in 0.2s ease-out; }
            `}</style>
        </>
    );
};

export default Team;
