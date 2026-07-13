import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await resetPassword(email);
    setSubmitting(false);
    if (error) {
      toast(error, 'error');
    } else {
      setSent(true);
      toast('Reset link sent to your email', 'success');
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-success/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-h2 font-display font-bold mb-2">Check your email</h1>
          <p className="text-ink-soft mb-6">
            We've sent a password reset link to <strong>{email}</strong>. Click the
            link in the email to reset your password.
          </p>
          <p className="text-sm text-ink-soft mb-6">
            Didn't receive it? Check your spam folder or{' '}
            <button
              onClick={() => setSent(false)}
              className="text-brand-dark hover:underline font-medium"
            >
              try again
            </button>
          </p>
          <Link to="/admin/login" className="pill-btn-primary">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-bg-elevated/30 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-dark mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/30">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-h2 font-display font-bold mb-2">
            Reset your password
          </h1>
          <p className="text-ink-soft text-sm">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-strong rounded-3xl p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="admin@promptforge.io"
              autoComplete="email"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="pill-btn-primary w-full"
          >
            {submitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
