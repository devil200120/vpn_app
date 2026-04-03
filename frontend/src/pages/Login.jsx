import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiShieldCheck, HiEnvelope, HiLockClosed,
  HiEye, HiEyeSlash, HiArrowRight, HiSparkles
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back! 🛡️');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0533 0%, #060612 60%)' }}
    >
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
            top: '-15%', left: '-10%',
            animation: 'orbMove1 18s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)',
            bottom: '-10%', right: '-10%',
            animation: 'orbMove2 22s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[350px] h-[350px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
            top: '50%', right: '20%',
            animation: 'orbMove3 14s ease-in-out infinite',
          }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div
          className="rounded-3xl p-8 sm:p-10 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Inner glow */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent)' }}
          />

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={{ boxShadow: ['0 0 30px rgba(139,92,246,0.4)', '0 0 60px rgba(139,92,246,0.6)', '0 0 30px rgba(139,92,246,0.4)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 relative"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              <HiShieldCheck className="text-white text-4xl" />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#060612] flex items-center justify-center">
                <HiSparkles className="text-emerald-900 text-xs" />
              </div>
            </motion.div>
            <h1
              className="text-3xl font-bold mb-1"
              style={{ background: 'linear-gradient(135deg, #fff 30%, #a78bfa)', WebkitBackgroundClip: 'text', color: 'transparent' }}
            >
              Welcome Back
            </h1>
            <p className="text-white/40 text-sm">Sign in to ShieldVPN</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest pl-1">Email</label>
              <div className="relative group">
                <HiEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary-400 transition-colors text-lg" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input pl-12 h-13 text-base"
                  style={{ height: '52px' }}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest pl-1">Password</label>
              <div className="relative group">
                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary-400 transition-colors text-lg" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pl-12 pr-12"
                  style={{ height: '52px' }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors text-lg"
                >
                  {showPassword ? <HiEyeSlash /> : <HiEye />}
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl font-semibold text-base flex items-center justify-center gap-3 relative overflow-hidden transition-all duration-300 mt-2"
              style={{
                background: loading
                  ? 'rgba(124,58,237,0.4)'
                  : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                boxShadow: loading ? 'none' : '0 0 40px rgba(124,58,237,0.4)',
              }}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="spinner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </motion.div>
                ) : (
                  <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    Sign In <HiArrowRight className="text-lg" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <p className="text-center text-white/30 text-sm mt-7">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Create Account
            </Link>
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          {['256-bit Encryption', 'No Logs', 'Kill Switch'].map((f) => (
            <span key={f} className="text-xs text-white/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 inline-block" />
              {f}
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

export default Login;
