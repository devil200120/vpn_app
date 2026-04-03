import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiShieldCheck, HiGlobeAlt, HiClock, HiArrowsUpDown } from 'react-icons/hi2';

const ConnectionStatus = ({ connection }) => {
  const [elapsed, setElapsed] = useState(0);
  const [dataUsed, setDataUsed] = useState(0);

  useEffect(() => {
    if (!connection) {
      setElapsed(0);
      setDataUsed(0);
      return;
    }

    const start = new Date(connection.connectedAt).getTime();

    const timer = setInterval(() => {
      const now = Date.now();
      const seconds = Math.floor((now - start) / 1000);
      setElapsed(seconds);
      setDataUsed(parseFloat((seconds * (0.8 + Math.random() * 0.4) / 60).toFixed(2)));
    }, 1000);

    return () => clearInterval(timer);
  }, [connection]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatData = (mb) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(2)} MB`;
  };

  if (!connection) {
    return (
      <div className="glass p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <HiShieldCheck className="text-4xl text-white/20" />
        </div>
        <h3 className="text-white/60 font-medium mb-1">Not Connected</h3>
        <p className="text-white/30 text-sm">Select a server to establish a secure connection</p>
      </div>
    );
  }

  const server = connection.serverId;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-8 border-emerald-400/20"
    >
      {/* Animated shield */}
      <div className="flex justify-center mb-6">
        <motion.div
          animate={{ boxShadow: [
            '0 0 20px rgba(52, 211, 153, 0.3)',
            '0 0 60px rgba(52, 211, 153, 0.5)',
            '0 0 20px rgba(52, 211, 153, 0.3)',
          ]}}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-400/40 flex items-center justify-center"
        >
          <HiShieldCheck className="text-5xl text-emerald-400" />
        </motion.div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-emerald-400 font-bold text-lg mb-1">Secure Connection Active</h3>
        <p className="text-white/40 text-sm">Your traffic is encrypted and protected</p>
      </div>

      {/* Server info */}
      <div className="glass-light p-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{server?.flag}</span>
          <div>
            <p className="text-white font-medium text-sm">{server?.name}</p>
            <p className="text-white/40 text-xs">{server?.city}, {server?.country}</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-light p-3 text-center">
          <HiGlobeAlt className="text-primary-400 text-lg mx-auto mb-1" />
          <p className="text-white/40 text-xs mb-0.5">VPN IP</p>
          <p className="text-white text-xs font-mono">{connection.assignedIp}</p>
        </div>
        <div className="glass-light p-3 text-center">
          <HiClock className="text-primary-400 text-lg mx-auto mb-1" />
          <p className="text-white/40 text-xs mb-0.5">Duration</p>
          <p className="text-white text-xs font-mono">{formatTime(elapsed)}</p>
        </div>
        <div className="glass-light p-3 text-center">
          <HiArrowsUpDown className="text-primary-400 text-lg mx-auto mb-1" />
          <p className="text-white/40 text-xs mb-0.5">Data</p>
          <p className="text-white text-xs font-mono">{formatData(dataUsed)}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ConnectionStatus;
