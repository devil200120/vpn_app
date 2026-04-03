import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen relative" style={{ background: 'radial-gradient(ellipse at 50% -20%, #1a0533 0%, #060612 55%)' }}>
      {/* Subtle ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute w-[700px] h-[700px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)', top: '-20%', left: '-10%' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #4f46e5, transparent 70%)', bottom: '-15%', right: '-10%' }} />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      </div>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative" style={{ zIndex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
