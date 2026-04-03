import { motion } from 'framer-motion';
import { HiLockClosed, HiSignal } from 'react-icons/hi2';

const ServerCard = ({ server, onConnect, isConnected, isConnecting }) => {
  const loadColor =
    server.load < 40
      ? 'bg-emerald-400'
      : server.load < 70
      ? 'bg-yellow-400'
      : 'bg-red-400';

  const statusColor =
    server.status === 'online'
      ? 'status-online'
      : server.status === 'maintenance'
      ? 'status-connecting'
      : 'status-offline';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className={`glass p-5 cursor-pointer transition-all duration-300 ${
        isConnected ? 'border-emerald-400/50 shadow-emerald-500/20 shadow-lg' : ''
      } ${!server.accessible ? 'opacity-60' : ''}`}
      onClick={() => server.accessible && server.status === 'online' && onConnect(server)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{server.flag}</span>
          <div>
            <h3 className="text-white font-semibold text-sm">{server.name}</h3>
            <p className="text-white/40 text-xs">{server.city}, {server.country}</p>
          </div>
        </div>
        <div className={`status-dot ${statusColor}`} />
      </div>

      {/* Load bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-white/40 mb-1">
          <span>Server Load</span>
          <span>{server.load}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${loadColor} transition-all duration-500`}
            style={{ width: `${server.load}%` }}
          />
        </div>
      </div>

      {/* Latency */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-white/40 text-xs">
          <HiSignal className="text-sm" />
          <span>{server.latency}ms</span>
        </div>

        {!server.accessible ? (
          <div className="flex items-center gap-1 text-amber-400/80 text-xs">
            <HiLockClosed className="text-sm" />
            <span className="uppercase font-semibold">{server.tier}</span>
          </div>
        ) : isConnected ? (
          <span className="text-emerald-400 text-xs font-semibold">● Connected</span>
        ) : isConnecting ? (
          <span className="text-yellow-400 text-xs font-semibold animate-pulse">Connecting...</span>
        ) : (
          <span className="text-primary-300 text-xs font-medium">Click to connect</span>
        )}
      </div>
    </motion.div>
  );
};

export default ServerCard;
