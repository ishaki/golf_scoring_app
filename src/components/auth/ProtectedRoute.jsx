import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 *
 * @param {boolean} requireEmailVerification - If true, also check email verification
 * @param {React.ReactNode} children - Child components to render if authenticated
 */
export default function ProtectedRoute({ requireEmailVerification = false, children }) {
  const { user, loading, isEmailVerified } = useAuthStore();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check email verification if required
  if (requireEmailVerification && !isEmailVerified()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Email Verification Required
            </h2>
            <p className="text-gray-600 mb-4">
              You need to verify your email address before accessing this feature.
            </p>
            <p className="text-sm text-gray-500">
              Check your inbox for the verification link, or go to your profile to resend it.
            </p>
          </div>
          <div className="flex gap-3">
            <Navigate to="/" replace />
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated (and email verified if required)
  return children;
}
