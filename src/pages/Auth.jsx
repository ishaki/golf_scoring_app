import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SignInForm from '../components/auth/SignInForm';
import SignUpForm from '../components/auth/SignUpForm';
import useAuthStore from '../store/authStore';

export default function Auth() {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSuccess = () => {
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Fighter Golf Score
          </h1>
          <p className="text-gray-600">F2F Golf Scoring System</p>
        </div>

        {/* Auth Form Container */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          {mode === 'signin' ? (
            <SignInForm
              onSuccess={handleSuccess}
              onSwitchToSignUp={() => setMode('signup')}
            />
          ) : (
            <SignUpForm
              onSuccess={() => setMode('signin')}
              onSwitchToSignIn={() => setMode('signin')}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Secure authentication powered by Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
