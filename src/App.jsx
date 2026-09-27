import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { RealSocialProvider } from './contexts/RealSocialContext';
import AppLayout from './components/layout/AppLayout';

// Pages
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import FriendsPage from './pages/FriendsPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import ReelsPage from './pages/ReelsPage';
import DatingPage from './pages/DatingPage';
import DatingSetupPage from './pages/DatingSetupPage';
import MatchesPage from './pages/MatchesPage';
import DatingSettingsPage from './pages/DatingSettingsPage';
import SettingsPage from './pages/SettingsPage';
import SavedPostsPage from './pages/SavedPostsPage';
import SearchPage from './pages/SearchPage';
import PostDetailPage from './pages/PostDetailPage';
import AdminPage from './pages/AdminPage';

// Auth Pages
import Login from './components/Login';
import Register from './components/Register';
import VerifyEmail from './components/VerifyEmail';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

// Smooth Page Transition
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

// Route Guard for Authenticated Users
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdmin, isLoading: isUserLoading } = useUser();
  const location = useLocation();

  if (isLoading || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Route Guard for Guest-Only Pages (Login / Register / etc.)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Authentication Flow (Guest-only access) */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <PageTransition><Login /></PageTransition>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <PageTransition><Register /></PageTransition>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/verify-email"
          element={<PageTransition><VerifyEmail /></PageTransition>}
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <PageTransition><ForgotPassword /></PageTransition>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicOnlyRoute>
              <PageTransition><ResetPassword /></PageTransition>
            </PublicOnlyRoute>
          }
        />

        {/* Public Social Application Routes (Wrapped in AppLayout) */}
        <Route
          path="/"
          element={
            <AppLayout>
              <PageTransition><HomePage /></PageTransition>
            </AppLayout>
          }
        />
        <Route
          path="/reels"
          element={
            <AppLayout hideRightSidebar={true}>
              <PageTransition><ReelsPage /></PageTransition>
            </AppLayout>
          }
        />
        <Route
          path="/search"
          element={
            <AppLayout>
              <PageTransition><SearchPage /></PageTransition>
            </AppLayout>
          }
        />
        <Route
          path="/posts/:postId"
          element={
            <AppLayout>
              <PageTransition><PostDetailPage /></PageTransition>
            </AppLayout>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <AppLayout>
              <PageTransition><ProfilePage /></PageTransition>
            </AppLayout>
          }
        />

        {/* Protected Authenticated Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition><ProfilePage /></PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <AppLayout hideRightSidebar={true}>
                <PageTransition><EditProfilePage /></PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition><FriendsPage /></PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <AppLayout hideRightSidebar={true}>
                <PageTransition><MessagesPage /></PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition><NotificationsPage /></PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dating"
          element={
            <ProtectedRoute>
              <AppLayout hideRightSidebar={true}>
                <PageTransition><DatingPage /></PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dating/setup"
          element={
            <ProtectedRoute>
              <AppLayout hideRightSidebar={true}>
                <PageTransition><DatingSetupPage /></PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dating/matches"
          element={
            <ProtectedRoute>
              <AppLayout hideRightSidebar={true}>
                <PageTransition><MatchesPage /></PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dating/settings"
          element={
            <ProtectedRoute>
              <AppLayout hideRightSidebar={true}>
                <PageTransition><DatingSettingsPage /></PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout hideRightSidebar={true}>
                <PageTransition><SettingsPage /></PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition><SavedPostsPage /></PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AppLayout hideRightSidebar={true}>
                <PageTransition><AdminPage /></PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <RealSocialProvider>
          <BrowserRouter>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '16px',
                  background: '#0f172a',
                  color: '#f8fafc',
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                },
              }}
            />
            <AnimatedRoutes />
          </BrowserRouter>
        </RealSocialProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
