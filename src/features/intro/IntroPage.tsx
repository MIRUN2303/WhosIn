import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';

export const IntroPage: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = useAppStore(s => s.isLoggedIn);
  const loaded = useAppStore(s => s.loaded);
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'fadeout'>('logo');

  useEffect(() => {
    if (!loaded) return;
    const target = isLoggedIn ? '/home' : '/login';
    // Quick 1s splash then redirect
    const t1 = setTimeout(() => setPhase('tagline'), 400);
    const t2 = setTimeout(() => navigate(target, { replace: true }), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [navigate, isLoggedIn, loaded]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0" style={{ background: '#080808' }} />

      <AnimatePresence mode="wait">
        {phase === 'logo' && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center relative z-10"
          >
            <motion.span
              className="font-logo text-5xl tracking-[0.08em] text-white/85 select-none"
              style={{ letterSpacing: '0.08em' }}
            >
              Whos<span className="text-[var(--green)] text-6xl" style={{ textShadow: '0 0 20px rgba(var(--green-rgb),0.5)' }}>I</span>n
            </motion.span>
          </motion.div>
        )}

        {phase === 'tagline' && (
          <motion.div
            key="tagline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-4 relative z-10"
          >
            <motion.span
              className="font-logo text-4xl tracking-[0.08em] text-white/85 select-none"
              style={{ letterSpacing: '0.08em' }}
            >
              Whos<span className="text-[var(--green)] text-5xl" style={{ textShadow: '0 0 20px rgba(var(--green-rgb),0.5)' }}>I</span>n
            </motion.span>
            <p className="text-[10px] font-semibold tracking-[0.35em] uppercase select-none"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              Play. Compete. Conquer.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
