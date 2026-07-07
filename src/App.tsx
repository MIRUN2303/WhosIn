import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/useAppStore';
import { connectionManager } from './lib/connection';

import { BottomNav, AppHeader } from './components/layout/Navigation';
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
import { CompleteProfilePage } from './features/auth/CompleteProfilePage';

// ===== Energetic page transition with spring physics =====
const pageVariants = {
  initial: { opacity: 0, y: 24, scale: 0.97, filter: 'blur(6px)' },
  animate: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 180,
      damping: 22,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0, y: -16, scale: 0.98, filter: 'blur(4px)',
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
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

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = useAppStore(s => s.isLoggedIn);
  const needsPhone = useAppStore(s => s.needsPhone);
  const loaded = useAppStore(s => s.loaded);
  const location = useLocation();
  if (!loaded) return <PageSkeleton />;
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  if (needsPhone && location.pathname !== '/complete-profile') return <Navigate to="/complete-profile" replace />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const loadFromSupabase = useAppStore(s => s.loadFromSupabase);
  const loaded = useAppStore(s => s.loaded);
  const isLoggedIn = useAppStore(s => s.isLoggedIn);

  useEffect(() => {
    if (!loaded) loadFromSupabase();
    connectionManager.startPolling(60000);
    return () => connectionManager.stopPolling();
  }, [loaded, loadFromSupabase]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/complete-profile';

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
              <Route path="/complete-profile" element={<CompleteProfilePage />} />
              <Route path="/home" element={<AuthGuard><PageWrapper><HomePage /></PageWrapper></AuthGuard>} />
              <Route path="/events" element={<AuthGuard><PageWrapper><EventsPage /></PageWrapper></AuthGuard>} />
              <Route path="/events/:id" element={<AuthGuard><PageWrapper><EventDetailPage /></PageWrapper></AuthGuard>} />
              <Route path="/calendar" element={<AuthGuard><PageWrapper><CalendarPage /></PageWrapper></AuthGuard>} />
              <Route path="/profile" element={<AuthGuard><PageWrapper><ProfilePage /></PageWrapper></AuthGuard>} />
              <Route path="/groups" element={<AuthGuard><PageWrapper><GroupsPage /></PageWrapper></AuthGuard>} />
              <Route path="/groups/:id" element={<AuthGuard><PageWrapper><GroupDetailPage /></PageWrapper></AuthGuard>} />
              <Route path="/stories" element={<AuthGuard><PageWrapper><StoriesPage /></PageWrapper></AuthGuard>} />
              <Route path="/notifications" element={<AuthGuard><PageWrapper><NotificationsPage /></PageWrapper></AuthGuard>} />
              <Route path="*" element={<Navigate to={isLoggedIn ? '/home' : '/login'} replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

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
