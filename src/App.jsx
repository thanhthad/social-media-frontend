import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider, useUser } from './contexts/UserContext';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import VerifyEmail from './components/VerifyEmail';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import SearchPage from './pages/SearchPage';
import HomePage from './pages/HomePage';
import MessagesPage from './pages/MessagesPage';
import DatingPage from './pages/DatingPage';
import DatingSettingsPage from './pages/DatingSettingsPage';
import DatingSetupPage from './pages/DatingSetupPage';
import MatchesPage from './pages/MatchesPage';
import FriendsPage from './pages/FriendsPage';
import SavedPostsPage from './pages/SavedPostsPage';
import PostDetailPage from './pages/PostDetailPage';
import ReelsPage from './pages/ReelsPage';
import AdminPage from './pages/AdminPage';
import NotificationsPage from './pages/NotificationsPage';
import NotificationBanner from './components/notification/NotificationBanner';
import NotificationDropdown from './components/notification/NotificationDropdown';
import InstagramSidebar from './components/layout/InstagramSidebar';
import InstagramMobileHeader from './components/layout/InstagramMobileHeader';
import CreateChoiceModal from './components/common/CreateChoiceModal';
import CreatePostModal from './components/post/CreatePostModal';
import CreateReelModal from './components/reel/CreateReelModal';
import CreateStoryModal from './components/story/CreateStoryModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useWebSocketStore from './stores/useWebSocketStore';
import {
  Home,
  Search,
  MessageSquare,
  Heart,
  Users,
  Bookmark,
  Shield,
  LogOut,
  Clapperboard,
  User,
  Settings,
  ChevronDown,
  PlusSquare,
} from 'lucide-react';

const queryClient = new QueryClient();

// WebSocket Connector
const WebSocketConnector = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const connect = useWebSocketStore((state) => state.connect);
  const disconnect = useWebSocketStore((state) => state.disconnect);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('accessToken');
      if (token) connect(token);
    } else {
      disconnect();
    }
  }, [isAuthenticated, connect, disconnect]);

  return children;
};

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

// Admin route wrapper
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdmin, isLoading: userLoading } = useUser();

  if (isLoading || userLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
};

// Guest route wrapper
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
};

// Mobile Bottom Navigation Bar
const MobileBottomNav = ({ onOpenCreateChoice }) => {
  const { isAuthenticated } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  if (!isAuthenticated) return null;

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLink = (to, icon, label, special) => {
    const active = isActive(to);
    let color = active ? 'text-indigo-600' : 'text-slate-500';
    if (special === 'dating')  color = active ? 'text-rose-600'    : 'text-slate-500 hover:text-rose-600';
    if (special === 'reels')   color = active ? 'text-fuchsia-600' : 'text-slate-500 hover:text-fuchsia-600';

    const IconEl = icon;
    const isDating = special === 'dating';

    return (
      <Link
        to={to}
        className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all active:scale-90 ${color}`}
        aria-label={label}
      >
        <IconEl
          size={22}
          className={`${active ? 'stroke-[2.2]' : 'stroke-[1.75]'} ${isDating && active ? 'fill-rose-500 text-rose-500' : ''}`}
        />
        <span className={`text-[10px] font-medium leading-none ${active ? 'font-semibold' : ''}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 safe-area-pb">
      <div className="flex items-center justify-around px-1 pt-1">
        {navLink('/', Home, 'Trang chủ')}
        {navLink('/reels', Clapperboard, 'Reels', 'reels')}

        {/* Center Create Button */}
        <button
          type="button"
          onClick={onOpenCreateChoice}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 active:scale-90 transition-transform"
          aria-label="Tạo mới"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
            <PlusSquare size={19} className="stroke-[2.2]" />
          </div>
        </button>

        {navLink('/dating', Heart, 'Hẹn hò', 'dating')}

        {/* Profile */}
        <Link
          to="/profile"
          className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all active:scale-90 ${
            isActive('/profile') ? 'text-indigo-600' : 'text-slate-500'
          }`}
          aria-label="Cá nhân"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className={`w-6 h-6 rounded-full object-cover ${
                isActive('/profile') ? 'ring-2 ring-indigo-600 ring-offset-1' : ''
              }`}
            />
          ) : (
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[10px] font-bold flex items-center justify-center ${
              isActive('/profile') ? 'ring-2 ring-indigo-600 ring-offset-1' : ''
            }`}>
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <span className={`text-[10px] font-medium leading-none ${isActive('/profile') ? 'font-semibold' : ''}`}>
            Cá nhân
          </span>
        </Link>
      </div>
    </nav>
  );
};


// Page Transition
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="w-full h-full"
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
        {/* Auth routes (guest only) */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <PageTransition>
                <Login />
              </PageTransition>
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <PageTransition>
                <Register />
              </PageTransition>
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PageTransition>
              <ForgotPassword />
            </PageTransition>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PageTransition>
              <ResetPassword />
            </PageTransition>
          }
        />
        <Route
          path="/verify-email"
          element={
            <PageTransition>
              <VerifyEmail />
            </PageTransition>
          }
        />

        {/* Protected App Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PageTransition>
                <HomePage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageTransition>
                <ProfilePage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:userId"
          element={
            <ProtectedRoute>
              <PageTransition>
                <ProfilePage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <PageTransition>
                <EditProfilePage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <PageTransition>
                <SearchPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <PageTransition>
                <FriendsPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-posts"
          element={
            <ProtectedRoute>
              <PageTransition>
                <SavedPostsPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/:postId"
          element={
            <ProtectedRoute>
              <PageTransition>
                <PostDetailPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <PageTransition>
                <NotificationsPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <PageTransition>
                <MessagesPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reels"
          element={
            <ProtectedRoute>
              <PageTransition>
                <ReelsPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Dating Routes */}
        <Route
          path="/dating"
          element={
            <ProtectedRoute>
              <PageTransition>
                <DatingPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dating/settings"
          element={
            <ProtectedRoute>
              <PageTransition>
                <DatingSettingsPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dating/setup"
          element={
            <ProtectedRoute>
              <PageTransition>
                <DatingSetupPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dating/matches"
          element={
            <ProtectedRoute>
              <PageTransition>
                <MatchesPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <PageTransition>
                <AdminPage />
              </PageTransition>
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateReel, setShowCreateReel] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);

  const isFullScreenPage = ['/dating', '/reels', '/messages'].some((p) =>
    location.pathname === p || (p !== '/' && location.pathname.startsWith(p))
  );

  return (
    <div
      className={`min-h-screen bg-[#FAFAFA] flex flex-col font-sans antialiased text-gray-900 ${
        isFullScreenPage ? 'h-screen max-h-screen overflow-hidden' : ''
      }`}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '16px',
            background: '#1e293b',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
          },
        }}
      />

      <NotificationBanner />

      {isAuthenticated && (
        <>
          <InstagramSidebar onOpenCreateChoice={() => setShowChoiceModal(true)} />
          <InstagramMobileHeader />
          <MobileBottomNav onOpenCreateChoice={() => setShowChoiceModal(true)} />
        </>
      )}

      {/* Main Content Area */}
      <main
        className={`flex-grow w-full transition-all ${
          isAuthenticated
            ? `md:pl-18 xl:pl-60 ${
                isFullScreenPage
                  ? 'h-[100dvh] max-h-[100dvh] pt-14 md:pt-0 pb-16 md:pb-0 px-2 sm:px-4 overflow-hidden flex flex-col'
                  : 'pt-14 md:pt-4 pb-20 md:pb-6 px-2 sm:px-4'
              }`
            : ''
        }`}
      >
        <AnimatedRoutes />
      </main>

      {/* Creation Modals */}
      <CreateChoiceModal
        isOpen={showChoiceModal}
        onClose={() => setShowChoiceModal(false)}
        onOpenCreatePost={() => setShowCreatePost(true)}
        onOpenCreateReel={() => setShowCreateReel(true)}
        onOpenCreateStory={() => setShowCreateStory(true)}
      />

      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={() => window.location.reload()}
      />

      {showCreateReel && (
        <CreateReelModal
          onClose={() => setShowCreateReel(false)}
          onSuccess={() => window.location.reload()}
        />
      )}

      {showCreateStory && (
        <CreateStoryModal
          onClose={() => setShowCreateStory(false)}
          onCreated={() => window.location.reload()}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <WebSocketConnector>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </WebSocketConnector>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
