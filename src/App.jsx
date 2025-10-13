import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Setup from './pages/Setup';
import Game from './pages/Game';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Courses from './pages/Courses';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import PublicDashboard from './pages/PublicDashboard';
import Admin from './pages/Admin';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EmailVerificationBanner from './components/auth/EmailVerificationBanner';
import useAuthStore from './store/authStore';
import { onAuthStateChange } from './lib/supabase';

function App() {
  const { initialize, setAuthState } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initialize();

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setAuthState(session?.user || null, session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [initialize, setAuthState]);

  return (
    <BrowserRouter>
      {/* Email verification banner (shown globally if logged in but not verified) */}
      <EmailVerificationBanner />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/shared/:token" element={<PublicDashboard />} />

        {/* Protected routes (require authentication) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Protected routes (require email verification) */}
        <Route
          path="/setup"
          element={
            <ProtectedRoute requireEmailVerification={true}>
              <Setup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game"
          element={
            <ProtectedRoute requireEmailVerification={true}>
              <Game />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute requireEmailVerification={true}>
              <Courses />
            </ProtectedRoute>
          }
        />

        {/* Other protected routes (auth only, no email verification required) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
