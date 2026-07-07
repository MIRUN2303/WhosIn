import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

interface WaveDividerProps {
  className?: string;
  flip?: boolean;
  color1?: string;
  color2?: string;
  height?: number;
}

/**
 * Animated SVG wave divider with organic morphing.
 * Use between sections for a flowing, modern separation.
 */
export const WaveDivider: React.FC<WaveDividerProps> = ({
  className,
  flip,
  color1 = 'rgba(34,212,91,0.06)',
  color2 = 'rgba(34,212,91,0.02)',
  height = 80,
}) => (
  <div className={clsx('relative w-full overflow-hidden', flip && 'rotate-180', className)} style={{ height }}>
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className="absolute bottom-0 w-[200%] h-full left-[-50%]"
    >
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="50%" stopColor={color2} />
          <stop offset="100%" stopColor={color1} />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,120 L0,120 Z"
        fill="url(#waveGrad)"
        animate={{
          d: [
            "M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,120 L0,120 Z",
            "M0,50 C240,20 480,70 720,35 C960,60 1200,25 1440,50 L1440,120 L0,120 Z",
            "M0,35 C240,60 480,10 720,50 C960,30 1200,55 1440,35 L1440,120 L0,120 Z",
            "M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,120 L0,120 Z",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.path
        d="M0,60 C240,90 480,40 720,60 C960,80 1200,30 1440,60 L1440,120 L0,120 Z"
        fill={color1}
        opacity={0.5}
        animate={{
          d: [
            "M0,60 C240,90 480,40 720,60 C960,80 1200,30 1440,60 L1440,120 L0,120 Z",
            "M0,55 C240,75 480,50 720,55 C960,70 1200,45 1440,55 L1440,120 L0,120 Z",
            "M0,65 C240,85 480,45 720,65 C960,75 1200,50 1440,65 L1440,120 L0,120 Z",
            "M0,60 C240,90 480,40 720,60 C960,80 1200,30 1440,60 L1440,120 L0,120 Z",
          ],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </svg>
  </div>
);

interface AnimatedBlobProps {
  className?: string;
  color?: string;
  size?: number;
}

/**
 * Organic morphing blob for ambient background decoration.
 */
export const AnimatedBlob: React.FC<AnimatedBlobProps> = ({
  className,
  color = 'rgba(34,212,91,0.04)',
  size = 400,
}) => (
  <div className={clsx('absolute pointer-events-none', className)} style={{ width: size, height: size }}>
    <svg viewBox="0 0 500 500" className="w-full h-full">
      <motion.path
        d="M250,50 C350,50 430,120 450,220 C470,320 420,420 320,450 C220,480 120,430 80,330 C40,230 80,120 180,80 C220,60 230,50 250,50Z"
        fill={color}
        animate={{
          d: [
            "M250,50 C350,50 430,120 450,220 C470,320 420,420 320,450 C220,480 120,430 80,330 C40,230 80,120 180,80 C220,60 230,50 250,50Z",
            "M250,70 C330,40 440,100 460,200 C480,300 400,440 300,460 C200,480 100,420 70,320 C40,220 100,110 190,90 C210,85 220,80 250,70Z",
            "M250,40 C370,60 420,140 440,240 C460,340 400,440 300,440 C200,440 100,400 60,300 C20,200 90,100 190,70 C210,55 220,50 250,40Z",
            "M250,50 C350,50 430,120 450,220 C470,320 420,420 320,450 C220,480 120,430 80,330 C40,230 80,120 180,80 C220,60 230,50 250,50Z",
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </svg>
  </div>
);

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Scroll-triggered fade-up reveal using IntersectionObserver.
 * Lightweight — no viewport animation frame overhead.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({ children, className, delay = 0 }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
