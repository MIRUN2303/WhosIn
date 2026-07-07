import React, { useRef, useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { useAppStore } from '../../store/useAppStore';
import {
  IconHome,
  IconEvents as IconCalendarIcon,
  IconStories,
  IconGroups,
  IconProfile,
  IconPlus,
  IconBell,
} from '../ui/icons';

const NAV_ITEMS = [
  { path: '/home',    icon: IconHome,         label: 'Home'    },
  { path: '/events',  icon: IconCalendarIcon,  label: 'Events'  },
  { path: '/stories', icon: IconStories,       label: 'Stories' },
  { path: '/groups',  icon: IconGroups,        label: 'Groups'  },
  { path: '/profile', icon: IconProfile,       label: 'Profile' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const unreadCount = useAppStore(s => s.unreadCount());
  const navRef = useRef<HTMLDivElement>(null);
  const [indicators, setIndicators] = useState<{ left: number; width: number }[]>([]);

  const hiddenRoute = location.pathname === '/' || location.pathname === '/landing' || location.pathname === '/login' || location.pathname === '/signup';

  const activeIdx = NAV_ITEMS.findIndex(item => location.pathname.startsWith(item.path));
  const safeIdx = activeIdx >= 0 ? activeIdx : 0;

  // Measure each nav link position for precise indicator placement
  const measure = useCallback(() => {
    if (!navRef.current) return;
    const links = navRef.current.querySelectorAll<HTMLAnchorElement>('a');
    const rects: { left: number; width: number }[] = [];
    links.forEach(link => {
      const parent = link.parentElement;
      const el = parent || link;
      const r = el.getBoundingClientRect();
      const parentRect = navRef.current!.getBoundingClientRect();
      rects.push({
        left: r.left - parentRect.left + el.scrollLeft,
        width: r.width,
      });
    });
    if (rects.length === NAV_ITEMS.length) setIndicators(rects);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  // Re-measure after mount when layout settles
  useEffect(() => {
    const t = setTimeout(measure, 100);
    return () => clearTimeout(t);
  }, [measure, location.pathname]);

  if (hiddenRoute) return null;

  const indicator = indicators[safeIdx];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bottom-nav">
      <div className="bottom-nav-inner glass-dark"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div ref={navRef} className="relative flex items-center justify-around px-2 pt-3 pb-[calc(8px+env(safe-area-inset-bottom,0px))]">
          {/* Single floating pill indicator — moves with spring physics */}
          {indicator && (
            <motion.div
              className="absolute rounded-xl pointer-events-none"
              style={{
                background: 'rgba(var(--green-rgb), 0.08)',
                border: '1px solid rgba(var(--green-rgb), 0.15)',
              }}
              animate={{
                left: indicator.left,
                width: indicator.width,
                top: 0,
                bottom: 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 32,
                mass: 0.6,
              }}
            />
          )}

          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const IconComp = item.icon;
            return (
              <NavLink key={item.path} to={item.path}
                className="relative flex flex-col items-center gap-1 px-3 py-1.5 min-w-[52px] tap-scale"
              >
                <div className="relative">
                  <motion.span
                    className={clsx('block transition-colors duration-150',
                      isActive ? 'text-[var(--green)]' : 'text-white/30')}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 25 }}
                  >
                    <IconComp size={22} />
                  </motion.span>
                  {item.label === 'Home' && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-[var(--green)] rounded-full text-[9px] font-black text-black flex items-center justify-center leading-none pulse-green">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className={clsx('text-[10px] font-semibold transition-colors duration-150',
                  isActive ? 'text-[var(--green)]' : 'text-white/25')}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

// =============================================
// FAB — responsive position on desktop
// =============================================
export const FAB: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const location = useLocation();
  if (location.pathname === '/' || location.pathname === '/landing' || location.pathname === '/login' || location.pathname === '/signup') return null;

  return (
    <motion.button
      className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center focus:outline-none"
      style={{
        background: 'var(--green)',
        boxShadow: '0 6px 24px rgba(var(--green-rgb), 0.5)',
      }}
      whileHover={{ scale: 1.1, boxShadow: '0 8px 32px rgba(var(--green-rgb), 0.7)' }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
    >
      <IconPlus size={26} strokeWidth={2.5} className="text-black" />
    </motion.button>
  );
};

// =============================================
// APP HEADER — responsive width
// =============================================
export const AppHeader: React.FC<{
  title?: string; subtitle?: string; rightAction?: React.ReactNode;
}> = ({ title, subtitle, rightAction }) => {
  const location = useLocation();
  const notifCount = useAppStore(s => s.unreadCount());
  const isLoggedIn = useAppStore(s => s.isLoggedIn);
  if (location.pathname === '/' || location.pathname === '/landing' || location.pathname === '/login' || location.pathname === '/signup') return null;

  return (
    <header className="sticky top-0 z-40 flex justify-center"
      style={{
        background: 'rgba(8,8,8,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="app-header-inner flex items-center justify-between px-4 py-3 w-full">
        <div>
          {title
            ? <h1 className="font-display font-bold text-white text-lg">{title}</h1>
            : <span className="font-logo text-2xl tracking-wider text-white">
                Whos<span
                  className="inline-block text-[var(--green)]"
                  style={{ textShadow: '0 0 12px rgba(var(--green-rgb), 0.5)' }}
                >I</span>n
              </span>
          }
          {subtitle && <p className="text-white/40 text-xs">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {rightAction}
          {isLoggedIn ? (
            <NavLink to="/notifications"
              className="relative w-9 h-9 flex items-center justify-center rounded-xl tap-scale"
              style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}
            >
              <IconBell size={18} className="text-white/50" />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full pulse-green" />
              )}
            </NavLink>
          ) : (
            <NavLink to="/login"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'var(--green)', color: 'black' }}
            >
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};
