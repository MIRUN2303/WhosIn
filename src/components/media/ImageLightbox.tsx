import React, { useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ images, initialIndex, onClose }) => {
  const [idx, setIdx] = React.useState(initialIndex);

  const next = useCallback(() => setIdx(i => Math.min(i + 1, images.length - 1)), [images.length]);
  const prev = useCallback(() => setIdx(i => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, next, prev]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/70 text-xl z-10">✕</button>

        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/60 text-xl z-10">‹</button>
            <button onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/60 text-xl z-10">›</button>
          </>
        )}

        <motion.img
          key={idx}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          src={images[idx]} alt=""
          className="max-w-full max-h-full object-contain px-4"
          onClick={e => e.stopPropagation()}
        />

        {images.length > 1 && (
          <div className="absolute bottom-6 flex items-center gap-1.5">
            {images.map((_, i) => (
              <div key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
                className="w-2 h-2 rounded-full cursor-pointer transition-all"
                style={{ background: i === idx ? '#00ff41' : 'rgba(255,255,255,0.2)', width: i === idx ? 10 : 6, height: i === idx ? 10 : 6 }} />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
