import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiUser, HiEnvelope, HiLockClosed, HiPencilSquare,
  HiCheckBadge, HiCalendar, HiCheck, HiXMark,
  HiShieldCheck, HiSparkles,
} from 'react-icons/hi2';

const tierMeta = {
  free:    { label:'Free',    color:'#9ca3af', bg:'rgba(107,114,128,0.15)', border:'rgba(107,114,128,0.25)' },
  basic:   { label:'Basic',   color:'#60a5fa', bg:'rgba(59,130,246,0.15)',  border:'rgba(59,130,246,0.25)' },
  premium: { label:'Premium', color:'#fbbf24', bg:'rgba(245,158,11,0.15)',  border:'rgba(245,158,11,0.25)' },
};

const InfoRow = ({ icon: Icon, label, value, accent }) => (
  <div className="flex items-center justify-between py-3.5"
    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <div className="flex items-center gap-3">
      <Icon className="text-lg text-white/25" />
      <span className="text-white/50 text-sm">{label}</span>
    </div>
    <span className="text-sm font-medium" style={{ color: accent || 'rgba(255,255,255,0.85)' }}>
      {value || '-'}
    </span>
  </div>
);

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name, email };
      if (currentPassword && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      await updateProfile(payload);
      await refreshUser();
      toast.success('Profile updated!');
      setEditing(false);
      setCurrentPassword(''); setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const tier = user?.subscription?.tier || 'free';
  const tm = tierMeta[tier] || tierMeta.free;
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold"
          style={{ background: 'linear-gradient(135deg, #fff 50%, #a78bfa)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          My Profile
        </h1>
        <p className="text-white/30 text-sm mt-1">Manage your account and subscription</p>
      </motion.div>

      {/* Avatar + Name card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-3xl p-7 relative overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${tm.color}80, transparent)` }} />

        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}>
              {initials}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: user?.subscription?.isActive ? '#10b981' : '#6b7280', border: '2px solid rgba(6,6,18,1)' }}>
              {user?.subscription?.isActive ? <HiShieldCheck className="text-white text-sm" /> : <HiXMark className="text-white text-sm" />}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{user?.name}</h2>
            <p className="text-white/40 text-sm truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1"
                style={{ background: tm.bg, color: tm.color, border: `1px solid ${tm.border}` }}>
                {tier === 'premium' && <HiSparkles className="text-xs" />}
                {tm.label}
              </span>
              {user?.subscription?.isActive && (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <HiCheckBadge /> Active
                </span>
              )}
            </div>
          </div>

          <button onClick={() => setEditing(!editing)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0"
            style={{
              background: editing ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)',
              border: editing ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.1)',
              color: editing ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
            }}>
            <HiPencilSquare className="text-lg" />
          </button>
        </div>
      </motion.div>

      {/* Subscription stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider text-white/40">Subscription Details</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Plan', value: tm.label, accent: tm.color },
            { label: 'Status', value: user?.subscription?.isActive ? 'Active' : 'Inactive', accent: user?.subscription?.isActive ? '#34d399' : '#f87171' },
            { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' }) : '-' },
            { label: 'Expires', value: user?.subscription?.expiresAt ? new Date(user.subscription.expiresAt).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' }) : 'Never' },
          ].map(({ label, value, accent }) => (
            <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-white/35 text-xs mb-1 font-medium">{label}</p>
              <p className="text-sm font-semibold" style={{ color: accent || '#fff' }}>{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Edit form */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl p-6 overflow-hidden"
              style={{
                background: 'rgba(124,58,237,0.06)',
                border: '1px solid rgba(124,58,237,0.2)',
                backdropFilter: 'blur(30px)',
              }}>
              <div className="absolute inset-x-0 top-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.6), transparent)' }} />

              <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest text-white/40">Edit Profile</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">Display Name</label>
                  <div className="relative">
                    <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-lg" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="glass-input pl-12" style={{ height:'48px' }} required />
                  </div>
                </div>
                <div>
                  <label className="block text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <HiEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-lg" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="glass-input pl-12" style={{ height:'48px' }} required />
                  </div>
                </div>

                <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-white/30 text-xs mb-3 uppercase tracking-widest font-medium">Change Password (optional)</p>
                  <div className="space-y-3">
                    <div className="relative">
                      <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-lg" />
                      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                        className="glass-input pl-12" style={{ height:'48px' }} placeholder="Current password" />
                    </div>
                    <div className="relative">
                      <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-lg" />
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        className="glass-input pl-12" style={{ height:'48px' }} placeholder="New password (min 6 chars)" minLength={6} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 30px rgba(124,58,237,0.3)' }}>
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><HiCheck />Save Changes</>}
                  </motion.button>
                  <button type="button" onClick={() => setEditing(false)}
                    className="px-5 py-3 rounded-xl font-semibold text-sm transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
