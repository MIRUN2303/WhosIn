import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/useAppStore';
import * as auth from './lib/auth';
import { connectionManager } from './lib/connection';

import { BottomNav, AppHeader, FAB } from './components/layout/Navigation';
import { HomePage } from './features/home/HomePage';
import { EventDetailPage, EventsPage } from './features/events/EventsPage';
import { CalendarPage } from './features/calendar/CalendarPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { GroupsPage, GroupDetailPage } from './features/groups/GroupsPage';
import { NotificationsPage } from './features/notifications/NotificationsPage';
import { IntroPage } from './features/intro/IntroPage';
import { StoriesPage } from './features/stories/StoriesPage';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';

// ===== Energetic page transition with spring physics =====
const pageVariants = {
  initial: { opacity: 0, y: 24, scale: 0.97, filter: 'blur(6px)' },
  animate: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 180,
      damping: 22,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0, y: -16, scale: 0.98, filter: 'blur(4px)',
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {children}
  </motion.div>
);

const PageSkeleton = () => (
  <div className="page-container space-y-4">
    <div className="skeleton h-8 w-48 rounded-2xl" />
    {[...Array(3)].map((_, i) => (
      <div key={i} className="skeleton h-32 rounded-3xl" />
    ))}
  </div>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const loadFromSupabase = useAppStore(s => s.loadFromSupabase);

  useEffect(() => {
    loadFromSupabase();
    connectionManager.startPolling(60000);
    const unsub = auth.onAuthStateChange(() => {
      loadFromSupabase();
    });
    return () => {
      connectionManager.stopPolling();
      unsub.data.subscription.unsubscribe();
    };
  }, [loadFromSupabase]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-sport">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-150px] left-[-80px] w-[600px] h-[600px] rounded-full blur-[180px]"
          style={{ background: 'radial-gradient(circle, rgba(var(--green-rgb),0.05), transparent)' }} />
        <div className="absolute top-[35%] right-[-120px] w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, rgba(var(--amber-rgb),0.06), transparent)' }} />
        <div className="absolute bottom-[-80px] left-[25%] w-[400px] h-[400px] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(var(--green-rgb),0.03), transparent)' }} />
      </div>

      {!isAuthPage && <AppHeader />}

      <main className={isAuthPage ? '' : 'safe-bottom'}>
        <Suspense fallback={<PageSkeleton />}>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<IntroPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              <Route path="/home" element={<PageWrapper><HomePage /></PageWrapper>} />
              <Route path="/events" element={<PageWrapper><EventsPage /></PageWrapper>} />
              <Route path="/events/:id" element={<PageWrapper><EventDetailPage /></PageWrapper>} />
              <Route path="/calendar" element={<PageWrapper><CalendarPage /></PageWrapper>} />
              <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
              <Route path="/groups" element={<PageWrapper><GroupsPage /></PageWrapper>} />
              <Route path="/groups/:id" element={<PageWrapper><GroupDetailPage /></PageWrapper>} />
              <Route path="/stories" element={<PageWrapper><StoriesPage /></PageWrapper>} />
              <Route path="/notifications" element={<PageWrapper><NotificationsPage /></PageWrapper>} />
              <Route path="*" element={<Navigate to={'/home'} replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      {/* FAB — always above nav, never affected by page transforms */}
      {!isAuthPage && <FAB />}
      {!isAuthPage && <BottomNav />}

      {/* Premium dark toast styling */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(8,8,8,0.92)',
            color: '#f5f5f5',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            backdropFilter: 'blur(20px)',
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 18px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: { primary: '#22d45b', secondary: '#080808' },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#080808' },
          },
        }}
      />
    </div>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
