import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Save,
  Key,
  Eye,
  EyeOff,
  Shield,
  Clock,
  LogOut,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../components/Toast';
import { supabase } from '../../lib/supabase';

export default function AdminProfile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [reauthed, setReauthed] = useState(false);
  const [reauthing, setReauthing] = useState(false);

  const [signingOut, setSigningOut] = useState(false);

  const passwordChecks = useMemo(() => ({
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  }), [newPassword]);

  const passed = Object.values(passwordChecks).filter(Boolean).length;
  const strength = passed <= 2 ? 'Weak' : passed <= 4 ? 'Good' : 'Strong';
  const strengthColor = passed <= 2 ? 'bg-danger' : passed <= 4 ? 'bg-warning' : 'bg-success';

  const verifyOldPassword = async () => {
    if (!user?.email) return;
    setReauthing(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    setReauthing(false);
    if (error) {
      toast('Current password is incorrect', 'error');
      setReauthed(false);
    } else {
      setReauthed(true);
      toast('Identity verified', 'success');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast('Enter your current password', 'error');
      return;
    }
    if (!reauthed) {
      toast('Verify your current password first', 'error');
      return;
    }
    if (currentPassword === newPassword) {
      toast('New password must differ from current', 'error');
      return;
    }
    if (passed < 5) {
      toast('Meet all password requirements', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('New passwords do not match', 'error');
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setReauthed(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  const createdDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  const lastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-dark mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>

      <h1 className="text-h1 font-display font-bold flex items-center gap-3 mb-8">
        <User className="w-8 h-8 text-brand-dark" /> Profile & Security
      </h1>

      <div className="space-y-6">
        {/* Account Info */}
        <div className="glass-strong rounded-3xl p-8">
          <h3 className="font-display font-semibold flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-brand-dark" /> Account Information
          </h3>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-1">
                  Email
                </label>
                <p className="text-sm font-medium">{user?.email || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-1">
                  User ID
                </label>
                <p className="text-sm font-mono text-ink-soft truncate">
                  {user?.id || '—'}
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Account Created
                </label>
                <p className="text-sm font-medium">{createdDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Last Sign In
                </label>
                <p className="text-sm font-medium">{lastSignIn}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="glass-strong rounded-3xl p-8">
          <h3 className="font-display font-semibold flex items-center gap-2 mb-6">
            <Key className="w-5 h-5 text-brand-dark" /> Change Password
          </h3>

          {/* Step 1: Verify identity */}
          <div className="mb-6 pb-6 border-b border-brand/10">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-brand-dark" />
              <span className="text-sm font-medium">Step 1: Verify identity</span>
              {reauthed && <span className="chip bg-success/10 text-success text-xs"><Check className="w-3 h-3" /> Verified</span>}
            </div>
            <p className="text-xs text-ink-soft mb-3">Enter current password to unlock the change form</p>
            <div className="flex items-end gap-3 max-w-md">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); setReauthed(false); }}
                    className="input-field pr-10"
                    placeholder="Enter current password"
                    disabled={reauthed}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
                    tabIndex={-1}
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={verifyOldPassword}
                disabled={reauthing || !currentPassword || reauthed}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-brand text-white hover:bg-brand-dark disabled:opacity-40 transition-all inline-flex items-center gap-1.5"
              >
                {reauthing ? <Loader2 className="w-4 h-4 animate-spin" /> : reauthed ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                {reauthing ? 'Verifying...' : reauthed ? 'Verified' : 'Verify'}
              </button>
            </div>
          </div>

          {/* Step 2: New password (only after verification) */}
          <form onSubmit={handlePasswordChange}>
            <div className={`space-y-4 max-w-md transition-opacity duration-300 ${reauthed ? '' : 'opacity-30 pointer-events-none'}`}>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="Enter new password"
                    disabled={!reauthed}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password strength bar */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-bg-surface overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${strengthColor}`} style={{ width: `${(passed / 5) * 100}%` }} />
                    </div>
                    <span className={`text-xs font-medium ${
                      passed <= 2 ? 'text-danger' : passed <= 4 ? 'text-warning' : 'text-success'
                    }`}>{strength}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {[
                      { key: 'length', label: '8+ characters' },
                      { key: 'upper', label: 'Uppercase letter' },
                      { key: 'lower', label: 'Lowercase letter' },
                      { key: 'number', label: 'Number' },
                      { key: 'special', label: 'Special character' },
                    ].map(({ key, label }) => (
                      <div key={key} className={`flex items-center gap-1.5 text-xs ${passwordChecks[key as keyof typeof passwordChecks] ? 'text-success' : 'text-ink-soft'}`}>
                        {passwordChecks[key as keyof typeof passwordChecks]
                          ? <Check className="w-3 h-3" />
                          : <X className="w-3 h-3" />}
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="Re-enter new password"
                    disabled={!reauthed}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-danger mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Passwords do not match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={changingPassword || !reauthed}
                className="pill-btn-primary"
              >
                {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Sign Out */}
        <div className="glass-strong rounded-3xl p-8">
          <h3 className="font-display font-semibold flex items-center gap-2 mb-2 text-danger">
            <LogOut className="w-5 h-5" /> Sign Out
          </h3>
          <p className="text-sm text-ink-soft mb-4">
            Sign out of all sessions on this device.
          </p>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="pill-btn-danger"
          >
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
