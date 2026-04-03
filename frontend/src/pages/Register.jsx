import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiShieldCheck, HiEnvelope, HiLockClosed,
  HiUser, HiEye, HiEyeSlash, HiArrowRight, HiCheck
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = () => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 8) return 2;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return 4;
    return 3;
  };

  const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({ name, email, password });
      toast.success('Account created! Welcome to ShieldVPN');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'name', label: 'Full Name', icon: HiUser, type: 'text', value: name, setter: setName, placeholder: 'John Doe' },
    { id: 'email', label: 'Email', icon: HiEnvelope, type: 'email', value: email, setter: setEmail, placeholder: 'you@example.com' },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 60% 0%, #130828 0%, #060612 60%)' }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)', top: '-5%', right: '-5%', animation: 'orbMove1 20s ease-in-out infinite' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #2563eb, transparent 70%)', bottom: '-5%', left: '-5%', animation: 'orbMove2 25s ease-in-out infinite' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)', top: '40%', left: '30%', animation: 'orbMove3 16s ease-in-out infinite' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-3xl p-8 sm:p-10 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent)' }} />

          <div className="flex flex-col items-center mb-7">
            <motion.div
              animate={{ boxShadow: ['0 0 30px rgba(139,92,246,0.4)', '0 0 60px rgba(139,92,246,0.6)', '0 0 30px rgba(139,92,246,0.4)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              <HiShieldCheck className="text-white text-3xl" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-1"
              style={{ background: 'linear-gradient(135deg, #fff 30%, #a78bfa)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Create Account
            </h1>
            <p className="text-white/40 text-sm">Start your secure journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.id} className="space-y-1.5">
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest pl-1">{f.label}</label>
                <div className="relative group">
                  <f.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary-400 transition-colors text-lg" />
                  <input type={f.type} value={f.value} onChange={(e) => f.setter(e.target.value)}
                    className="glass-input pl-12" style={{ height: '50px' }} placeholder={f.placeholder} required />
                </div>
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest pl-1">Password</label>
              <div className="relative group">
                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary-400 transition-colors text-lg" />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} className="glass-input pl-12 pr-12"
                  style={{ height: '50px' }} placeholder="Min. 6 characters" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors text-lg">
                  {showPassword ? <HiEyeSlash /> : <HiEye />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex gap-1 pt-1">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                      style={{ background: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.1)' }} />
                  ))}
                  <span className="text-xs ml-1" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest pl-1">Confirm Password</label>
              <div className="relative group">
                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary-400 transition-colors text-lg" />
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} className="glass-input pl-12 pr-12"
                  style={{ height: '50px' }} placeholder="Repeat password" required />
                {confirmPassword && (
                  <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-lg ${password === confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                    {password === confirmPassword ? <HiCheck /> : '✗'}
                  </div>
                )}
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              className="w-full h-14 rounded-xl font-semibold text-base flex items-center justify-center gap-3 mt-2 transition-all duration-300"
              style={{
                background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                boxShadow: loading ? 'none' : '0 0 40px rgba(124,58,237,0.4)',
              }}>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </motion.div>
                ) : (
                  <motion.span key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    Create Account <HiArrowRight className="text-lg" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">Sign In</Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
          {['Free to Start', 'No Credit Card', '30-Day Guarantee'].map((f) => (
            <span key={f} className="text-xs text-white/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400/60 inline-block" />{f}
            </span>
          ))}
        </div>
      </motion.div>

      <style>{`
        @keyframes orbMove1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(80px,-60px) scale(1.1)} 66%{transform:translate(-40px,80px) scale(0.9)} }
        @keyframes orbMove2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-70px,50px) scale(0.9)} 66%{transform:translate(60px,-70px) scale(1.1)} }
        @keyframes orbMove3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-80px,60px)} }
      `}</style>
    </div>
  );
};

export default Register;
