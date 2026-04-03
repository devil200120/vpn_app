import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConnection } from '../hooks/useConnection';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  HiShieldCheck, HiServer, HiCreditCard, HiUser,
  HiArrowRightOnRectangle, HiBars3, HiXMark
} from 'react-icons/hi2';

const tierColors = {
  free: { bg: 'rgba(107,114,128,0.2)', text: '#9ca3af', border: 'rgba(107,114,128,0.3)' },
  basic: { bg: 'rgba(59,130,246,0.2)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  premium: { bg: 'rgba(245,158,11,0.2)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { activeConnection } = useConnection();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: HiShieldCheck },
    { to: '/servers', label: 'Servers', icon: HiServer },
    { to: '/subscription', label: 'Plans', icon: HiCreditCard },
    { to: '/profile', label: 'Profile', icon: HiUser },
  ];

  const isActive = (path) => location.pathname === path;
  const tier = user?.subscription?.tier || 'free';
  const tc = tierColors[tier] || tierColors.free;

  return (
    <>
      <nav style={{
        background: 'rgba(6,6,18,0.7)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
                <HiShieldCheck className="text-white text-xl" />
              </div>
              <span className="text-lg font-bold"
                style={{ background: 'linear-gradient(135deg, #e9d5ff, #7c3aed)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                ShieldVPN
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative"
                  style={{
                    color: isActive(link.to) ? '#fff' : 'rgba(255,255,255,0.5)',
                    background: isActive(link.to) ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}
                >
                  <link.icon className="text-base" />
                  {link.label}
                  {isActive(link.to) && (
                    <motion.div layoutId="nav-indicator"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }} />
                  )}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {/* Connection pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full"
                    style={{ background: activeConnection ? '#10b981' : '#6b7280', boxShadow: activeConnection ? '0 0 8px #10b981' : 'none' }} />
                  {activeConnection && (
                    <div className="absolute inset-0 rounded-full animate-ping opacity-60"
                      style={{ background: '#10b981' }} />
                  )}
                </div>
                <span className="text-xs font-medium"
                  style={{ color: activeConnection ? '#6ee7b7' : 'rgba(255,255,255,0.4)' }}>
                  {activeConnection ? 'Protected' : 'Unprotected'}
                </span>
              </div>

              {/* Tier badge */}
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                {tier}
              </span>

              {/* Logout */}
              <button onClick={handleLogout}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{ color: 'rgba(255,255,255,0.4)', background: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.color='#f87171'; e.currentTarget.style.background='rgba(239,68,68,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color='rgba(255,255,255,0.4)'; e.currentTarget.style.background='transparent'; }}
                title="Logout">
                <HiArrowRightOnRectangle className="text-xl" />
              </button>
            </div>

            {/* Mobile hamburger */}
            <button className="md:hidden p-2 rounded-xl transition-colors"
              style={{ color: 'rgba(255,255,255,0.7)', background: mobileOpen ? 'rgba(255,255,255,0.1)' : 'transparent' }}
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <HiXMark className="text-xl" /> : <HiBars3 className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(6,6,18,0.95)', overflow: 'hidden' }}
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      color: isActive(link.to) ? '#fff' : 'rgba(255,255,255,0.5)',
                      background: isActive(link.to) ? 'rgba(124,58,237,0.15)' : 'transparent',
                      border: isActive(link.to) ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                    }}>
                    <link.icon className="text-base" />
                    {link.label}
                  </Link>
                ))}
                <div className="pt-3 pb-1 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2.5 h-2.5 rounded-full"
                        style={{ background: activeConnection ? '#10b981' : '#6b7280', boxShadow: activeConnection ? '0 0 8px #10b981' : 'none' }} />
                      {activeConnection && <div className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ background: '#10b981' }} />}
                    </div>
                    <span className="text-xs" style={{ color: activeConnection ? '#6ee7b7' : 'rgba(255,255,255,0.4)' }}>
                      {activeConnection ? 'Protected' : 'Unprotected'}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>{tier}</span>
                </div>
                <button onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ color: '#f87171' }}
                  onMouseEnter={(e) => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background='transparent'}>
                  <HiArrowRightOnRectangle className="text-base" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
