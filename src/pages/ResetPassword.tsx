import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
      }
    });
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (!hashParams.get('access_token') && !hashParams.get('type')) {
      setError('Invalid or expired reset link. Please request a new one.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast('Password must be at least 8 characters', 'error');
      return;
    }
    if (password !== confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }
    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);
    if (error) {
      toast(error, 'error');
    } else {
      setDone(true);
      toast('Password updated successfully', 'success');
      setTimeout(() => navigate('/admin/login'), 2000);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-danger/15 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-danger">!</span>
          </div>
          <h1 className="text-h2 font-display font-bold mb-2">Invalid Link</h1>
          <p className="text-ink-soft mb-6">{error}</p>
          <a href="/admin/forgot-password" className="pill-btn-primary">
            Request New Reset Link
          </a>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-success/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-h2 font-display font-bold mb-2">
            Password updated
          </h1>
          <p className="text-ink-soft">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-bg-elevated/30 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/30">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-h2 font-display font-bold mb-2">
            Set new password
          </h1>
          <p className="text-ink-soft text-sm">
            Must be at least 8 characters
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-strong rounded-3xl p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              New password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="••••••••"
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Confirm new password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="pill-btn-primary w-full"
          >
            {submitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
