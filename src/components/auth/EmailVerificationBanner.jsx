import { useState } from 'react';
import useAuthStore from '../../store/authStore';

export default function EmailVerificationBanner() {
  const { user, isEmailVerified, resendVerification, loading } = useAuthStore();
  const [showSuccess, setShowSuccess] = useState(false);

  // Don't show if email is verified or no user
  if (!user || isEmailVerified()) {
    return null;
  }

  const handleResend = async () => {
    try {
      await resendVerification();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to resend verification:', error);
    }
  };

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Please verify your email address
            </p>
            <p className="text-xs text-yellow-700">
              Check your inbox for the verification link. You must verify your email before creating games.
            </p>
          </div>
        </div>

        <button
          onClick={handleResend}
          disabled={loading}
          className="px-4 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Resend Email'}
        </button>
      </div>

      {showSuccess && (
        <div className="max-w-7xl mx-auto mt-2">
          <p className="text-sm text-green-700">
            ✓ Verification email sent! Check your inbox.
          </p>
        </div>
      )}
    </div>
  );
}
