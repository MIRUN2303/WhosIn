import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const IntroPage: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'done'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 2800);
    const t2 = setTimeout(() => setPhase('done'), 4200);
    const t3 = setTimeout(() => navigate('/home', { replace: true }), 5600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url('/bg-intro.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} />
      {/* Ribbony texture overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay opacity-40">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="none">
          <defs>
            <filter id="ribbonWobble">
              <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          {/* Main ribbon sweeps */}
          <path d="M-50,100 Q80,-20 200,80 T450,50 T700,120 T900,60" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" filter="url(#ribbonWobble)" />
          <path d="M-50,250 Q100,150 220,250 T480,200 T720,280 T900,220" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" filter="url(#ribbonWobble)" />
          <path d="M-50,450 Q120,320 250,430 T520,370 T760,460 T900,390" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" filter="url(#ribbonWobble)" />
          <path d="M-50,600 Q60,500 180,590 T440,530 T680,620 T900,550" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" filter="url(#ribbonWobble)" />
          {/* Cross ribbons */}
          <path d="M100,-50 Q200,60 110,180 T300,320 T180,470 T380,620" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7" filter="url(#ribbonWobble)" />
          <path d="M300,-50 Q420,80 330,220 T540,380 T410,540 T600,700" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" filter="url(#ribbonWobble)" />
        </svg>
        {/* Grain texture */}
        <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {phase === 'logo' && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, filter: 'blur(20px)', scale: 0.8 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(6px)', scale: 0.95 }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center relative z-10"
          >
            <motion.span
              className="font-logo text-5xl tracking-[0.08em] text-white/85 select-none"
              style={{ letterSpacing: '0.08em' }}
            >
              Whos<span className="text-white text-6xl">I</span>n
            </motion.span>
          </motion.div>
        )}

        {phase === 'tagline' && (
          <motion.div
            key="tagline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-6 relative z-10"
          >
            <motion.span
              initial={{ scale: 0.9, filter: 'blur(4px)' }}
              animate={{ scale: 1, filter: 'blur(0px)' }}
              transition={{ delay: 0.2, duration: 1 }}
              className="font-logo text-5xl tracking-[0.08em] text-white/85 select-none"
              style={{ letterSpacing: '0.08em' }}
            >
              Whos<span className="text-white text-6xl">I</span>n
            </motion.span>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '40px' }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="h-px rounded-full"
              style={{ background: 'rgba(255,255,255,0.25)' }}
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-[11px] text-white/30 font-medium tracking-[0.3em] uppercase"
            >
              Play. Compete. Conquer.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
