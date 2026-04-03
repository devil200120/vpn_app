import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnection } from '../hooks/useConnection';
import { getServers, seedServers, downloadVpnConfig } from '../services/serverService';
import { connectToServer, disconnectFromServer } from '../services/connectionService';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiGlobeAlt, HiSignalSlash, HiCheckCircle, HiLockClosed,
  HiArrowPath, HiBolt, HiSignal,
} from 'react-icons/hi2';

const tierColors = { free:'#10b981', basic:'#3b82f6', premium:'#f59e0b' };
const tierBg = { free:'rgba(16,185,129,0.1)', basic:'rgba(59,130,246,0.1)', premium:'rgba(245,158,11,0.1)' };
const tierBorder = { free:'rgba(16,185,129,0.2)', basic:'rgba(59,130,246,0.2)', premium:'rgba(245,158,11,0.2)' };

const ServerCard = ({ server, onConnect, isConnected, isConnecting, onUpgrade, onDownload }) => {
  const locked = !server.accessible;
  const loadColor = server.load > 80 ? '#ef4444' : server.load > 50 ? '#f59e0b' : '#10b981';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={!locked ? { y: -3, transition: { duration: 0.2 } } : {}}
      className="rounded-2xl relative overflow-hidden cursor-pointer transition-all duration-300"
      style={{
        background: isConnected
          ? 'rgba(16,185,129,0.08)'
          : locked
          ? 'rgba(255,255,255,0.02)'
          : 'rgba(255,255,255,0.04)',
        border: isConnected
          ? '1px solid rgba(16,185,129,0.3)'
          : locked
          ? '1px solid rgba(255,255,255,0.04)'
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isConnected ? '0 0 40px rgba(16,185,129,0.1)' : 'none',
      }}
      onClick={() => !locked && !isConnecting && onConnect(server)}
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: isConnected ? 'linear-gradient(90deg, transparent, rgba(16,185,129,0.8), transparent)' : `linear-gradient(90deg, transparent, ${tierColors[server.tier] || '#7c3aed'}50, transparent)` }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{server.flag}</span>
            <div>
              <h3 className="text-white font-semibold text-sm">{server.name}</h3>
              <p className="text-white/40 text-xs mt-0.5 flex items-center gap-1">
                <HiGlobeAlt className="text-xs" /> {server.city}, {server.country}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase"
              style={{ background: tierBg[server.tier], color: tierColors[server.tier], border: `1px solid ${tierBorder[server.tier]}` }}>
              {server.tier}
            </span>
            {isConnected && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-400" style={{ boxShadow: '0 0 6px #10b981' }} />
                <span className="text-emerald-400 text-xs font-medium">Live</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-white/30 text-xs">Latency</p>
            <p className="text-white text-xs font-semibold mt-0.5">{server.latency || Math.floor(20 + Math.random() * 60)}ms</p>
          </div>
          <div className="text-center p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-white/30 text-xs">Load</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: loadColor }}>{server.load}%</p>
          </div>
          <div className="text-center p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-white/30 text-xs">Status</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: server.status === 'online' ? '#10b981' : '#ef4444' }}>
              {server.status}
            </p>
          </div>
        </div>

        {/* Load bar */}
        <div className="mb-4">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${server.load}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ background: `linear-gradient(90deg, ${loadColor}, ${loadColor}aa)` }} />
          </div>
        </div>

        {/* Action button */}
        {locked ? (
          <button
            onClick={() => onUpgrade(server.tier)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{ background: 'rgba(245,158,11,0.08)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background='rgba(245,158,11,0.18)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background='rgba(245,158,11,0.08)'; }}
          >
            <HiLockClosed className="text-sm" /> Upgrade to unlock
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <button disabled={isConnecting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: isConnected ? 'rgba(239,68,68,0.15)' : 'rgba(124,58,237,0.2)',
                color: isConnected ? '#f87171' : '#c4b5fd',
                border: `1px solid ${isConnected ? 'rgba(239,68,68,0.25)' : 'rgba(124,58,237,0.3)'}`,
              }}>
              {isConnecting ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : isConnected ? (
                <><HiSignalSlash className="text-sm" /> Disconnect</>
              ) : (
                <><HiBolt className="text-sm" /> Connect</>
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(server); }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{ background: 'rgba(16,185,129,0.08)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background='rgba(16,185,129,0.18)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background='rgba(16,185,129,0.08)'; }}
            >
              ⬇ Download WireGuard Config
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Servers = () => {
  const navigate = useNavigate();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const { activeConnection, setActiveConnection } = useConnection();

  useEffect(() => { loadServers(); }, []);

  const handleUpgrade = (tier) => {
    navigate(`/subscription?highlight=${tier}`);
  };

  const handleDownload = async (server) => {
    try {
      const { data } = await downloadVpnConfig(server._id);
      const url = URL.createObjectURL(new Blob([data], { type: 'text/plain' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `shieldvpn-${server.countryCode.toLowerCase()}-${server.city.toLowerCase().replace(/\s+/g, '-')}.conf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`WireGuard config downloaded for ${server.name}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download config');
    }
  };

  const loadServers = async () => {
    try {
      try { await seedServers(); } catch { /* already seeded */ }
      const { data } = await getServers();
      setServers(data);
    } catch {
      toast.error('Failed to load servers');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (server) => {
    if (activeConnection?.serverId?._id === server._id) {
      try {
        await disconnectFromServer(activeConnection._id);
        setActiveConnection(null);
        toast.success('Disconnected');
      } catch { toast.error('Failed to disconnect'); }
      return;
    }
    if (activeConnection) {
      try { await disconnectFromServer(activeConnection._id); } catch { /* proceed */ }
    }
    setConnectingId(server._id);
    try {
      const { data } = await connectToServer(server._id);
      setActiveConnection(data);
      toast.success(`Connected to ${server.name}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to connect');
    } finally {
      setConnectingId(null);
    }
  };

  const filters = ['all', 'accessible', 'free', 'basic', 'premium'];
  const filteredServers = servers.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'accessible') return s.accessible;
    return s.tier === filter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary-500/30 border-t-primary-400 animate-spin" />
        <p className="text-white/30 text-sm">Loading servers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #fff 50%, #a78bfa)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            <HiGlobeAlt className="text-primary-400" style={{ WebkitTextFillColor: '#a78bfa' }} />
            VPN Servers
          </h1>
          <p className="text-white/40 mt-1 text-sm">{servers.length} servers across {[...new Set(servers.map(s => s.country))].length} countries</p>
        </div>
        {activeConnection && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 8px #10b981' }} />
            <span className="text-emerald-300 text-sm font-medium">Connected: {activeConnection.serverId?.name}</span>
          </div>
        )}
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              background: filter === f ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.05)',
              color: filter === f ? '#c4b5fd' : 'rgba(255,255,255,0.45)',
              border: filter === f ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.08)',
            }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && f !== 'accessible' && (
              <span className="ml-1.5 opacity-60">{servers.filter(s => s.tier === f).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Server grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredServers.map((server) => (
            <ServerCard
              key={server._id}
              server={server}
              onConnect={handleConnect}
              isConnected={activeConnection?.serverId?._id === server._id}
              isConnecting={connectingId === server._id}
              onUpgrade={handleUpgrade}
              onDownload={handleDownload}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredServers.length === 0 && (
        <div className="text-center py-16">
          <HiGlobeAlt className="text-5xl text-white/10 mx-auto mb-3" />
          <p className="text-white/30">No servers match your filter</p>
        </div>
      )}
    </div>
  );
};

export default Servers;
