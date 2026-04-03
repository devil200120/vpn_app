import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', animate = true, accentColor, ...props }) => {
  const Component = animate ? motion.div : 'div';
  const animateProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      }
    : {};

  return (
    <Component
      className={`rounded-2xl p-6 relative overflow-hidden ${className}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      {...animateProps}
      {...props}
    >
      {accentColor && (
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }} />
      )}
      {children}
    </Component>
  );
};

export default GlassCard;
