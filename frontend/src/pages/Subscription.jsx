import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPlans, createOrder, verifyPayment } from '../services/subscriptionService';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiCheckCircle, HiSparkles, HiShieldCheck, HiBolt,
  HiGlobeAlt, HiArrowPath, HiRocketLaunch,
} from 'react-icons/hi2';

const PLAN_META = {
  free:    { color:'#6b7280', glow:'rgba(107,114,128,0.2)', border:'rgba(107,114,128,0.2)', icon: HiShieldCheck,  label:'Free' },
  basic:   { color:'#3b82f6', glow:'rgba(59,130,246,0.25)', border:'rgba(59,130,246,0.3)',  icon: HiBolt,          label:'Basic' },
  premium: { color:'#f59e0b', glow:'rgba(245,158,11,0.3)',  border:'rgba(245,158,11,0.35)', icon: HiSparkles,      label:'Premium' },
};

const FEATURES = {
  free:    ['1 Server Location (US)', '10 GB Monthly Data', 'Standard Speed', 'Basic Encryption', '1 Device'],
  basic:   ['3 Server Locations', '100 GB Monthly Data', 'High Speed', 'AES-256 Encryption', '3 Devices', 'Kill Switch'],
  premium: ['All 5 Locations Worldwide', 'Unlimited Data', 'Ultra Speed', 'AES-256-GCM', '5 Devices', 'Kill Switch', 'Priority Support', 'Custom DNS'],
};

const PlanCard = ({ plan, isCurrent, isPopular, isHighlighted, onSubscribe, processing }) => {
  const meta = PLAN_META[plan.tier] || PLAN_META.free;
  const Icon = meta.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-3xl overflow-hidden transition-all duration-300 flex flex-col"
      style={{
        background: isPopular
          ? `linear-gradient(160deg, rgba(245,158,11,0.08) 0%, rgba(0,0,0,0.4) 100%)`
          : isHighlighted
          ? `linear-gradient(160deg, ${meta.color}12 0%, rgba(0,0,0,0.4) 100%)`
          : 'rgba(255,255,255,0.03)',
        border: isHighlighted
          ? `2px solid ${meta.color}`
          : isPopular
          ? '1px solid rgba(245,158,11,0.3)'
          : hovered
          ? `1px solid ${meta.border}`
          : '1px solid rgba(255,255,255,0.07)',
        boxShadow: isHighlighted
          ? `0 0 0 4px ${meta.glow}, 0 30px 60px ${meta.glow}`
          : hovered || isPopular
          ? `0 30px 60px ${meta.glow}, 0 0 0 1px ${meta.border}`
          : 'none',
        transform: isHighlighted ? 'scale(1.04)' : isPopular ? 'scale(1.03)' : hovered ? 'translateY(-4px)' : 'none',
      }}
    >
      {/* Top glow line */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)` }} />

      {/* Popular badge */}
      {isPopular && !isHighlighted && (
        <div className="absolute top-0 right-6 px-4 py-1 rounded-b-xl text-xs font-bold uppercase tracking-widest"
          style={{ background: meta.color, color: '#000' }}>
          Most Popular
        </div>
      )}
      {isHighlighted && (
        <div className="absolute top-0 right-6 px-4 py-1 rounded-b-xl text-xs font-bold uppercase tracking-widest"
          style={{ background: meta.color, color: '#000' }}>
          Recommended
        </div>
      )}

      <div className="p-7 flex flex-col gap-6 flex-1">
        {/* Plan header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: `${meta.color}15`, border: `1px solid ${meta.border}` }}>
              <Icon className="text-2xl" style={{ color: meta.color }} />
            </div>
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">Plan</p>
              <h3 className="text-white font-bold text-xl">{meta.label}</h3>
            </div>
          </div>
          {isCurrent && (
            <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.border}` }}>
              <HiCheckCircle /> Current
            </span>
          )}
        </div>

        {/* Price */}
        <div>
          {plan.price === 0 ? (
            <div>
              <span className="text-5xl font-black text-white">Free</span>
              <p className="text-white/30 text-sm mt-1">Forever</p>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-white/40 text-lg">₹</span>
                <span className="text-5xl font-black text-white">{plan.price}</span>
                <span className="text-white/40">/mo</span>
              </div>
              <p className="text-white/30 text-sm mt-1">Billed monthly • Cancel anytime</p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="flex-1 space-y-2.5">
          {(FEATURES[plan.tier] || plan.features || []).map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `${meta.color}20` }}>
                <HiCheckCircle className="text-sm" style={{ color: meta.color }} />
              </div>
              <span className="text-white/70 text-sm">{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          disabled={isCurrent || processing || plan.price === 0}
          onClick={() => onSubscribe(plan.tier)}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
          style={isCurrent || plan.price === 0 ? {
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.3)',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'default',
          } : {
            background: isPopular
              ? `linear-gradient(135deg, ${meta.color}, #d97706)`
              : `linear-gradient(135deg, ${meta.color}30, ${meta.color}20)`,
            color: isPopular ? '#000' : meta.color,
            border: `1px solid ${meta.border}`,
            boxShadow: isPopular ? `0 0 30px ${meta.glow}` : 'none',
          }}
        >
          {processing ? (
            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : isCurrent ? (
            'Current Plan'
          ) : plan.price === 0 ? (
            'Free Forever'
          ) : (
            <>
              <HiRocketLaunch /> Upgrade Now
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

const Subscription = () => {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => { loadPlans(); }, []);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    if (orderId) handleVerify(orderId);
  }, [searchParams]);

  // Scroll plans into view when arriving from Servers page with a highlight
  useEffect(() => {
    if (searchParams.get('highlight') && !loading) {
      setTimeout(() => {
        document.getElementById('plans-grid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [searchParams, loading]);

  const loadPlans = async () => {
    try {
      const { data } = await getPlans();
      setPlans(data);
    } catch { toast.error('Failed to load plans'); }
    finally { setLoading(false); }
  };

  const handleSubscribe = async (tier) => {
    if (tier === 'free') return;
    setProcessing(true);
    try {
      const { data } = await createOrder(tier);
      if (data.paymentSessionId) {
        if (!window.Cashfree) {
          const script = document.createElement('script');
          script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
          document.body.appendChild(script);
          await new Promise((resolve) => { script.onload = resolve; });
        }
        const cashfree = window.Cashfree({ mode: 'production' });
        await cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: '_self' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
      setProcessing(false);
    }
  };

  const handleVerify = async (orderId) => {
    setProcessing(true);
    try {
      const { data } = await verifyPayment(orderId);
      if (data.status === 'success') { toast.success('Subscription activated! 🎉'); await refreshUser(); }
      else { toast.error('Payment was not successful'); }
    } catch { toast.error('Failed to verify payment'); }
    finally { setProcessing(false); }
  };

  const currentTier = user?.subscription?.tier || 'free';
  const highlightTier = searchParams.get('highlight');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary-500/30 border-t-primary-400 animate-spin" />
        <p className="text-white/30 text-sm">Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <HiSparkles className="text-primary-400 text-sm" />
          <span className="text-primary-300 text-xs font-semibold uppercase tracking-widest">Choose Your Plan</span>
        </div>
        <h1 className="text-4xl font-black mb-3"
          style={{ background: 'linear-gradient(135deg, #fff 40%, #a78bfa)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          Unlock Premium Protection
        </h1>
        <p className="text-white/40 text-base max-w-md mx-auto">
          Enterprise-grade security at every tier. Upgrade anytime.
        </p>
      </motion.div>

      {/* Plans grid */}
      <div id="plans-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {plans.map((plan) => (
          <PlanCard
            key={plan.tier}
            plan={plan}
            isCurrent={currentTier === plan.tier}
            isPopular={plan.tier === 'premium'}
            isHighlighted={highlightTier === plan.tier}
            onSubscribe={handleSubscribe}
            processing={processing}
          />
        ))}
      </div>

      {/* Trust row */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-8 flex-wrap pt-4">
        {[
          { icon: HiShieldCheck, text: 'No-Logs Policy' },
          { icon: HiGlobeAlt, text: 'Global Infrastructure' },
          { icon: HiArrowPath, text: 'Cancel Anytime' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-white/30">
            <Icon className="text-primary-400/50 text-lg" />
            <span className="text-sm">{text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Subscription;
