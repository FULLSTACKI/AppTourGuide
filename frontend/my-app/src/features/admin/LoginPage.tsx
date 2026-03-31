import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { authService } from '../../services/adminService';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await authService.login({ username, password });
      if (res.success && res.accessToken) {
        login(res.accessToken, res.displayName ?? username, res.role ?? '');
        navigate('/admin/places', { replace: true });
      } else {
        setError(res.message ?? 'Login failed');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Network error. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <span className="text-4xl">🍜</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Vinh Khanh Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your food street</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50
                       text-white font-semibold rounded-lg px-4 py-2.5 text-sm
                       transition-colors shadow-md"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Default credentials: admin / admin123
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
