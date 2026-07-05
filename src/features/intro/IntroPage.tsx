import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const IntroPage: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'done'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 1200);
    const t2 = setTimeout(() => setPhase('done'), 2400);
    const t3 = setTimeout(() => navigate('/home', { replace: true }), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#080808' }}>
      {/* Sporty diagonal accent bars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Thick angled stripe top-right */}
        <div className="absolute top-[-10%] right-[-20%] w-[60%] h-[30%] rotate-[25deg]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,255,65,0.06), transparent)',
            transform: 'rotate(25deg)',
          }}
        />
        {/* Thick angled stripe bottom-left */}
        <div className="absolute bottom-[-10%] left-[-20%] w-[60%] h-[30%]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,255,65,0.04), transparent)',
            transform: 'rotate(-25deg)',
          }}
        />
        {/* Speed lines */}
        <div className="absolute inset-0"
          style={{
            background: `
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 30px,
                rgba(255,255,255,0.012) 30px,
                rgba(255,255,255,0.012) 31px
              ),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 50px,
                rgba(255,255,255,0.008) 50px,
                rgba(255,255,255,0.008) 51px
              )
            `,
          }}
        />
        {/* Hexagon/grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #00ff41 0.5px, transparent 0.5px),
              radial-gradient(circle at 75% 75%, #00ff41 0.5px, transparent 0.5px)
            `,
            backgroundSize: '40px 40px, 40px 40px',
          }}
        />
        {/* Ribbon-like curved accent */}
        <svg className="absolute bottom-0 left-0 w-full h-32 opacity-[0.07]" viewBox="0 0 400 80" preserveAspectRatio="none">
          <path d="M0,80 Q50,20 100,50 T200,20 T300,50 T400,20 L400,80 Z" fill="#00ff41" />
        </svg>
        <svg className="absolute top-0 right-0 w-48 h-48 opacity-[0.05]" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#00ff41" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="55" fill="none" stroke="#00ff41" strokeWidth="0.3" />
          <circle cx="100" cy="100" r="30" fill="none" stroke="#00ff41" strokeWidth="0.2" />
        </svg>
      </div>

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,255,65,0.15), transparent)' }} />

      <AnimatePresence mode="wait">
        {phase === 'logo' && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(4px)' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center relative z-10"
          >
            <motion.span
              animate={{ textShadow: ['0 0 20px rgba(0,255,65,0.3)', '0 0 50px rgba(0,255,65,0.6)', '0 0 20px rgba(0,255,65,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="font-logo text-6xl gradient-text tracking-wider"
              style={{ letterSpacing: '0.04em' }}
            >
              MachiVerse
            </motion.span>
          </motion.div>
        )}

        {phase === 'tagline' && (
          <motion.div
            key="tagline"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-5 relative z-10"
          >
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="font-logo text-6xl gradient-text tracking-wider"
              style={{ letterSpacing: '0.04em' }}
            >
              MachiVerse
            </motion.span>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '60px' }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="h-[2px] rounded-full"
              style={{ background: '#00ff41', boxShadow: '0 0 10px rgba(0,255,65,0.5)' }}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-sm text-white/40 font-medium tracking-[0.25em] uppercase"
            >
              Play. Compete. Conquer.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
