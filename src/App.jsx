import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
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

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Authentication Flow (Independent full-screen layouts) */}
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />

        {/* Core Social Application (Wrapped in AppLayout Shell) */}
        <Route
          path="/"
          element={
            <AppLayout>
              <PageTransition><HomePage /></PageTransition>
            </AppLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <AppLayout>
              <PageTransition><ProfilePage /></PageTransition>
            </AppLayout>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <AppLayout hideRightSidebar={true}>
              <PageTransition><EditProfilePage /></PageTransition>
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
        <Route
          path="/posts/:postId"
          element={
            <AppLayout>
              <PageTransition><PostDetailPage /></PageTransition>
            </AppLayout>
          }
        />
        <Route
          path="/friends"
          element={
            <AppLayout>
              <PageTransition><FriendsPage /></PageTransition>
            </AppLayout>
          }
        />
        <Route
          path="/messages"
          element={
            <AppLayout hideRightSidebar={true}>
              <PageTransition><MessagesPage /></PageTransition>
            </AppLayout>
          }
        />
        <Route
          path="/notifications"
          element={
            <AppLayout>
              <PageTransition><NotificationsPage /></PageTransition>
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
          path="/dating"
          element={
            <AppLayout hideRightSidebar={true}>
              <PageTransition><DatingPage /></PageTransition>
            </AppLayout>
          }
        />
        <Route
          path="/dating/setup"
          element={
            <AppLayout hideRightSidebar={true}>
              <PageTransition><DatingSetupPage /></PageTransition>
            </AppLayout>
          }
        />
        <Route
          path="/dating/matches"
          element={
            <AppLayout hideRightSidebar={true}>
              <PageTransition><MatchesPage /></PageTransition>
            </AppLayout>
          }
        />
        <Route
          path="/dating/settings"
          element={
            <AppLayout hideRightSidebar={true}>
              <PageTransition><DatingSettingsPage /></PageTransition>
            </AppLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AppLayout hideRightSidebar={true}>
              <PageTransition><SettingsPage /></PageTransition>
            </AppLayout>
          }
        />
        <Route
          path="/saved"
          element={
            <AppLayout>
              <PageTransition><SavedPostsPage /></PageTransition>
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
          path="/admin"
          element={
            <AppLayout hideRightSidebar={true}>
              <PageTransition><AdminPage /></PageTransition>
            </AppLayout>
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
