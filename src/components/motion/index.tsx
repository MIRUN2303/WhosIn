export { motion, AnimatePresence } from 'motion/react';
export { useScroll, useTransform, useSpring, useMotionValue, useVelocity, useAnimation } from 'motion/react';
export type { Variants, MotionValue } from 'motion/react';

// ===== ANIMATION VARIANTS =====
import type { Variants } from 'motion/react';

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

// ===== ANIMATED CONTAINERS =====
import React, { useEffect, useRef, useState } from 'react';
import { motion as m } from 'motion/react';

export const FadeUp: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children, delay = 0, className
}) => (
  <m.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] } },
    }}
    className={className}
  >
    {children}
  </m.div>
);

export const StaggerList: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children, className, delay = 0
}) => (
  <m.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: 0.08, delayChildren: delay } },
    }}
    className={className}
  >
    {children}
  </m.div>
);

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <m.div variants={fadeUp} className={className}>
    {children}
  </m.div>
);

export const ScaleIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children, delay = 0, className
}) => (
  <m.div
    initial={{ opacity: 0, scale: 0.92 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay, ease: [0.34, 1.56, 0.64, 1] }}
    className={className}
  >
    {children}
  </m.div>
);

// ===== ANIMATED NUMBER =====
export const AnimatedNumber: React.FC<{ value: number; duration?: number; suffix?: string; prefix?: string }> = ({
  value, duration = 1500, suffix = '', prefix = ''
}) => {
  const [display, setDisplay] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span>{prefix}{display}{suffix}</span>;
};

// ===== SCROLL PARALLAX SECTION =====
import { useScroll, useTransform, useSpring } from 'motion/react';

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  offset?: number;
  /** Spring stiffness for smooth parallax (default: 100) */
  stiffness?: number;
}

/**
 * Wraps content with a scroll-driven parallax translateY effect.
 * Content moves at a different speed than scroll for a depth illusion.
 * Uses spring physics for smooth motion.
 */
export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  className,
  offset = 50,
  stiffness = 100,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const transform = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const springTransform = useSpring(transform, { stiffness, damping: 20 });

  return (
    <div ref={ref} className={clsx('relative overflow-hidden', className)}>
      <m.div style={{ y: springTransform }}>
        {children}
      </m.div>
    </div>
  );
};

import { clsx } from 'clsx';
