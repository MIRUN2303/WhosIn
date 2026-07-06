import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useAppStore } from '../../store/useAppStore';

const NAV_ITEMS = [
  { path: '/home',        icon: '⌂',  label: 'Home'    },
  { path: '/stories',     icon: '📸',  label: 'Stories' },
  { path: '/groups',      icon: '◎',  label: 'Groups'  },
  { path: '/profile',     icon: '◐',  label: 'Profile' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const unreadCount = useAppStore(s => s.unreadCount());
  if (location.pathname === '/' || location.pathname === '/landing' || location.pathname === '/login' || location.pathname === '/signup') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-lg"
        style={{
          background: 'rgba(8,8,8,0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center justify-around px-2 pt-3 pb-6">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink key={item.path} to={item.path}
                className="relative flex flex-col items-center gap-1 px-3 py-1.5 min-w-[52px]">
                {/* Active background pill */}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <div className="relative">
                  <motion.span
                    className={clsx('text-xl leading-none block transition-all duration-200',
                      isActive ? 'text-[#00ff41]' : 'text-white/30')}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    {item.icon}
                  </motion.span>
                  {item.label === 'Home' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#00ff41] rounded-full text-[8px] font-black text-black flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className={clsx('text-[10px] font-semibold transition-colors duration-200',
                  isActive ? 'text-[#00ff41]' : 'text-white/25')}>
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
// FAB
// =============================================
export const FAB: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const location = useLocation();
  if (location.pathname === '/' || location.pathname === '/landing' || location.pathname === '/login' || location.pathname === '/signup') return null;
  return (
    <motion.button
      className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full text-black text-2xl font-black flex items-center justify-center focus:outline-none"
      style={{ background: '#00ff41', boxShadow: '0 6px 24px rgba(0,255,65,0.5)' }}
      whileHover={{ scale: 1.1, boxShadow: '0 8px 32px rgba(0,255,65,0.7)' }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >+</motion.button>
  );
};

// =============================================
// APP HEADER
// =============================================
export const AppHeader: React.FC<{
  title?: string; subtitle?: string; rightAction?: React.ReactNode; transparent?: boolean;
}> = ({ title, subtitle, rightAction }) => {
  const location = useLocation();
  const notifCount = useAppStore(s => s.unreadCount());
  if (location.pathname === '/' || location.pathname === '/landing' || location.pathname === '/login' || location.pathname === '/signup') return null;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
      style={{ background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div>
        {title
          ? <h1 className="font-display font-bold text-white text-lg">{title}</h1>
          : <span className="font-logo text-2xl tracking-wider text-white">Whos<span className="text-[#00ff41] text-3xl">I</span>n</span>
        }
        {subtitle && <p className="text-white/40 text-xs">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {rightAction}
        <NavLink to="/notifications" className="relative w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-base">🔔</span>
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#00ff41] rounded-full" />
          )}
        </NavLink>
      </div>
    </header>
  );
};
