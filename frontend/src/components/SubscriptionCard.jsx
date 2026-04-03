import { motion } from 'framer-motion';
import { HiCheck, HiXMark } from 'react-icons/hi2';

const SubscriptionCard = ({ plan, currentTier, onSubscribe, isPopular }) => {
  const isCurrent = currentTier === plan.tier;
  const isDowngrade = 
    (currentTier === 'premium' && plan.tier !== 'premium') ||
    (currentTier === 'basic' && plan.tier === 'free');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className={`glass p-6 relative ${
        isPopular ? 'border-primary-400/40 shadow-primary-500/20 shadow-xl scale-105' : ''
      } ${isCurrent ? 'border-emerald-400/40' : ''}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-primary-500 to-primary-700 text-white text-xs font-bold px-4 py-1 rounded-full">
            POPULAR
          </span>
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-xs font-bold px-4 py-1 rounded-full">
            CURRENT PLAN
          </span>
        </div>
      )}

      <div className="text-center mb-6 mt-2">
        <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-white">
            {plan.price === 0 ? 'Free' : `₹${plan.price}`}
          </span>
          {plan.price > 0 && <span className="text-white/40 text-sm">/month</span>}
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <HiCheck className="text-emerald-400 flex-shrink-0" />
            <span className="text-white/70">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSubscribe(plan.tier)}
        disabled={isCurrent || isDowngrade || plan.tier === 'free'}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
          isCurrent
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
            : plan.tier === 'free'
            ? 'bg-white/5 text-white/30 border border-white/10 cursor-default'
            : isDowngrade
            ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
            : 'btn-primary'
        }`}
      >
        {isCurrent
          ? '✓ Current Plan'
          : plan.tier === 'free'
          ? 'Default Plan'
          : isDowngrade
          ? 'Downgrade N/A'
          : `Upgrade to ${plan.name}`}
      </button>
    </motion.div>
  );
};

export default SubscriptionCard;
