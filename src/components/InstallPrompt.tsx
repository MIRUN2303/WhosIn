import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Iconic } from './ui/icons';

const STORAGE_KEY = 'whosin-install-dismissed';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') setVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed top-4 left-4 right-4 z-[999] max-w-md mx-auto"
        >
          <div className="glass border border-white/10 rounded-2xl p-4 flex items-start gap-3 shadow-2xl"
            style={{ background: 'rgba(8,8,8,0.96)', backdropFilter: 'blur(24px)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(170,235,0,0.12)' }}>
              <span className="text-2xl font-black" style={{ color: '#aaeb00', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Wi</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Install WhosIn</p>
              <p className="text-xs text-white/50 mt-0.5">Add to your home screen for the best experience</p>
              <div className="flex gap-2 mt-2.5">
                <button onClick={handleInstall}
                  className="text-[11px] font-bold px-4 py-1.5 rounded-xl transition-all active:scale-95"
                  style={{ background: '#aaeb00', color: '#080808' }}>
                  Install
                </button>
                <button onClick={handleDismiss}
                  className="text-[11px] font-medium px-4 py-1.5 rounded-xl transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                  Not now
                </button>
              </div>
            </div>
            <button onClick={handleDismiss} className="p-1 flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity">
              <Iconic name="close" size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
