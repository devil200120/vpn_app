import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConnection } from '../hooks/useConnection';
import { connectToServer, disconnectFromServer, getConnectionHistory } from '../services/connectionService';
import { getServers } from '../services/serverService';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiShieldCheck, HiShieldExclamation, HiGlobeAlt, HiClock,
  HiArrowsUpDown, HiSignal, HiBolt, HiChevronRight, HiMapPin,
} from 'react-icons/hi2';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="rounded-2xl p-5 relative overflow-hidden"
    style={{
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}
  >
    <div className="absolute inset-x-0 top-0 h-px"
      style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }} />
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}20` }}>
        <Icon className="text-xl" style={{ color }} />
      </div>
      <div>
        <p className="text-white/40 text-xs font-medium">{label}</p>
        <p className="text-white font-bold text-lg leading-tight">{value}</p>
      </div>
    </div>
  </motion.div>
);

const PowerButton = ({ connected, connecting, onClick }) => {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {/* Outer ring glow */}
      {connected && (
        <>
          <div className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }} />
          <div className="absolute w-[220px] h-[220px] rounded-full"
            style={{
              border: '1px solid rgba(16,185,129,0.2)',
              animation: 'ring1 2.5s ease-out infinite',
            }} />
          <div className="absolute w-[260px] h-[260px] rounded-full"
            style={{
              border: '1px solid rgba(16,185,129,0.12)',
              animation: 'ring1 2.5s ease-out infinite 0.5s',
            }} />
          <div className="absolute w-[300px] h-[300px] rounded-full"
            style={{
              border: '1px solid rgba(16,185,129,0.07)',
              animation: 'ring1 2.5s ease-out infinite 1s',
            }} />
        </>
      )}
      {/* Tick marks ring */}
      <svg className="absolute" width="200" height="200" viewBox="0 0 200 200">
        {Array.from({ length: 36 }, (_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const r1 = 90, r2 = 96;
          const x1 = 100 + r1 * Math.sin(angle), y1 = 100 - r1 * Math.cos(angle);
          const x2 = 100 + r2 * Math.sin(angle), y2 = 100 - r2 * Math.cos(angle);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={connected ? 'rgba(16,185,129,0.6)' : 'rgba(255,255,255,0.15)'}
              strokeWidth="1.5" strokeLinecap="round" />
          );
        })}
      </svg>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={onClick}
        disabled={connecting}
        className="relative w-[150px] h-[150px] rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer"
        style={{
          background: connecting
            ? 'conic-gradient(#7c3aed 60%, rgba(255,255,255,0.05) 0)'
            : connected
            ? 'radial-gradient(circle at 40% 30%, #34d399, #059669)'
            : 'radial-gradient(circle at 40% 30%, #374151, #111827)',
          boxShadow: connecting
            ? '0 0 40px rgba(124,58,237,0.5)'
            : connected
            ? '0 0 50px rgba(16,185,129,0.5), 0 0 100px rgba(16,185,129,0.2), inset 0 2px 4px rgba(255,255,255,0.2)'
            : '0 0 30px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.1)',
          border: `2px solid ${connected ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        <div className="flex flex-col items-center gap-1">
          {connecting ? (
            <div className="w-10 h-10 border-2 border-primary-300/30 border-t-primary-300 rounded-full animate-spin" />
          ) : (
            <>
              <div className="relative">
                {connected
                  ? <HiShieldCheck className="text-5xl text-white drop-shadow" />
                  : <HiShieldExclamation className="text-5xl text-white/40" />}
              </div>
            </>
          )}
        </div>
      </motion.button>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { activeConnection, setActiveConnection, refetch } = useConnection();
  const [servers, setServers] = useState([]);
  const [history, setHistory] = useState([]);
  const [connecting, setConnecting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeConnection) {
      const start = new Date(activeConnection.connectedAt).getTime();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [activeConnection]);

  const loadData = async () => {
    try {
      const [sr, hr] = await Promise.all([getServers(), getConnectionHistory(1, 5)]);
      setServers(sr.data.filter((s) => s.accessible && s.status === 'online'));
      setHistory(hr.data.connections);
    } catch { /* silently handle */ }
  };

  const handleConnect = async () => {
    if (activeConnection) {
      try {
        await disconnectFromServer(activeConnection._id);
        setActiveConnection(null);
        toast.success('Disconnected successfully');
        loadData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to disconnect');
      }
      return;
    }
    if (servers.length === 0) { toast.error('No servers available'); return; }
    const best = servers.reduce((a, b) => a.load < b.load ? a : b);
    setConnecting(true);
    try {
      const { data } = await connectToServer(best._id);
      setActiveConnection(data);
      toast.success(`Connected to ${best.name}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to connect');
    } finally {
      setConnecting(false);
    }
  };

  const fmt = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${ss.toString().padStart(2,'0')}`;
  };

  const totalDataToday = history
    .filter((c) => new Date(c.createdAt).toDateString() === new Date().toDateString())
    .reduce((s, c) => s + (c.dataUsed || 0), 0);

  const tier = user?.subscription?.tier || 'free';

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold"
            style={{ background: 'linear-gradient(135deg, #fff 50%, #a78bfa)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            Welcome, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-white/40 mt-1 text-sm">
            {activeConnection ? 'Your connection is encrypted and secure' : 'Your connection is not protected'}
          </p>
        </div>
        <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
          style={{
            background: tier === 'premium' ? 'rgba(245,158,11,0.15)' : tier === 'basic' ? 'rgba(59,130,246,0.15)' : 'rgba(107,114,128,0.15)',
            color: tier === 'premium' ? '#fbbf24' : tier === 'basic' ? '#60a5fa' : '#9ca3af',
            border: `1px solid ${tier === 'premium' ? 'rgba(245,158,11,0.3)' : tier === 'basic' ? 'rgba(59,130,246,0.3)' : 'rgba(107,114,128,0.3)'}`,
          }}>
          {tier} Plan
        </span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Power button panel — 2 cols */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2 rounded-3xl p-8 flex flex-col items-center justify-center gap-6 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(30px)',
            border: activeConnection ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.07)',
            boxShadow: activeConnection ? '0 0 60px rgba(16,185,129,0.08) inset' : 'none',
            minHeight: '340px',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: activeConnection ? 'linear-gradient(90deg, transparent, rgba(16,185,129,0.6), transparent)' : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)' }} />

          <PowerButton connected={!!activeConnection} connecting={connecting} onClick={handleConnect} />

          <div className="text-center">
            <p className="font-bold text-lg" style={{ color: activeConnection ? '#34d399' : 'rgba(255,255,255,0.5)' }}>
              {connecting ? 'Connecting...' : activeConnection ? 'Protected' : 'Not Protected'}
            </p>
            {activeConnection && (
              <p className="text-white/40 text-sm mt-1 font-mono">{fmt(elapsed)}</p>
            )}
            {activeConnection && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-lg">{activeConnection.serverId?.flag}</span>
                <p className="text-white/60 text-sm">
                  {activeConnection.serverId?.name}
                </p>
              </div>
            )}
          </div>

          {/* Disconnect button */}
          {activeConnection && (
            <button onClick={handleConnect}
              className="px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: 'rgba(239,68,68,0.15)', color: '#f87171',
                border: '1px solid rgba(239,68,68,0.25)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background='rgba(239,68,68,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background='rgba(239,68,68,0.15)'; }}>
              Disconnect
            </button>
          )}
        </motion.div>

        {/* Right panel — 3 cols */}
        <div className="lg:col-span-3 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={HiArrowsUpDown} label="Today" value={`${totalDataToday.toFixed(1)} MB`} color="#a78bfa" delay={0.1} />
            <StatCard icon={HiSignal} label="Sessions" value={history.length} color="#34d399" delay={0.2} />
            <StatCard icon={HiGlobeAlt} label="Servers" value={servers.length} color="#fbbf24" delay={0.3} />
          </div>

          {/* Connected server info */}
          <AnimatePresence>
            {activeConnection && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl p-5 overflow-hidden"
                style={{
                  background: 'rgba(16,185,129,0.07)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  backdropFilter: 'blur(20px)',
                }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/40 text-xs mb-1">VPN IP Address</p>
                    <p className="text-white font-mono font-medium text-sm">{activeConnection.assignedIp}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Protocol</p>
                    <p className="text-white font-medium text-sm">{activeConnection.protocol || 'OpenVPN'}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Encryption</p>
                    <p className="text-white font-medium text-sm">AES-256-GCM</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Data Usage</p>
                    <p className="text-white font-medium text-sm">{(elapsed * 0.9 / 60).toFixed(2)} MB</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick server selector */}
          {!activeConnection && servers.length > 0 && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">Recommended</span>
                <Link to="/servers" className="text-primary-400 text-xs hover:text-primary-300 flex items-center gap-1">
                  All Servers <HiChevronRight />
                </Link>
              </div>
              {servers.slice(0, 3).map((s) => (
                <button key={s._id} onClick={() => {
                  setConnecting(true);
                  connectToServer(s._id).then(({ data }) => { setActiveConnection(data); toast.success(`Connected to ${s.name}`); })
                    .catch((e) => toast.error(e.response?.data?.message || 'Failed')).finally(() => setConnecting(false));
                }}
                  className="w-full px-4 py-3 flex items-center justify-between transition-all duration-150"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background='transparent'}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{s.flag}</span>
                    <div className="text-left">
                      <p className="text-white text-sm font-medium">{s.name}</p>
                      <p className="text-white/30 text-xs">{s.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${s.load}%`,
                        background: s.load > 80 ? '#ef4444' : s.load > 50 ? '#f59e0b' : '#10b981',
                      }} />
                    </div>
                    <span className="text-white/30 text-xs">{s.load}%</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="font-semibold text-white flex items-center gap-2 text-sm">
            <HiClock className="text-primary-400" /> Recent Activity
          </h2>
          <span className="text-white/30 text-xs">{history.length} sessions</span>
        </div>
        {history.length === 0 ? (
          <div className="py-12 text-center">
            <HiGlobeAlt className="mx-auto text-4xl text-white/10 mb-3" />
            <p className="text-white/30 text-sm">No connection history yet</p>
          </div>
        ) : (
          <div>
            {history.map((conn, i) => (
              <div key={conn._id}
                className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {conn.serverId?.flag || '🌐'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{conn.serverId?.name || 'Unknown'}</p>
                    <p className="text-white/30 text-xs">{new Date(conn.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-sm font-mono">{conn.duration ? `${Math.floor(conn.duration / 60)}m ${conn.duration % 60}s` : '-'}</p>
                  <p className="text-white/30 text-xs">{conn.dataUsed ? `${conn.dataUsed.toFixed(1)} MB` : '-'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <style>{`
        @keyframes ring1 {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
