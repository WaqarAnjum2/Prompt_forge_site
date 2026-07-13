import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';

export default function Login() {
  const { signIn, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authing, setAuthing] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  if (user && isAdmin) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthing(true);
    const { error } = await signIn(email, password);
    setAuthing(false);
    if (error) {
      toast(error, 'error');
    } else {
      toast('Signed in successfully', 'success');
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#FBEFEF] via-[#FFF5F5] to-[#FFE2E2] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(197,179,211,0.15), transparent)`,
        }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-brand/20 to-brand/5 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-brand/15 to-transparent blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-bg-elevated/20 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative">
        <div className="max-w-lg">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shadow-lg shadow-brand/30 mb-8">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-5xl font-display font-bold mb-4 leading-tight">
            Welcome back to<br />
            <span className="text-brand-dark">PromptForge</span>
          </h1>
          <p className="text-lg text-ink-soft mb-10 leading-relaxed">
            Your enterprise AI prompt library. Manage, analyze, and optimize your prompt collection with powerful tools.
          </p>

          <div className="space-y-4">
            {[
              { icon: Zap, text: 'Smart variable detection engine', color: 'text-brand-dark' },
              { icon: Shield, text: 'Enterprise-grade RLS security', color: 'text-success' },
              { icon: Globe, text: 'SEO-optimized prompt discovery', color: 'text-warning' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/60 backdrop-blur flex items-center justify-center shadow-sm">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-sm font-medium text-ink">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-dark mb-8 transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-white/60 backdrop-blur flex items-center justify-center group-hover:bg-brand/10 transition-all">
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </div>
            Back to site
          </Link>

          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl shadow-brand/10 border border-white/40">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-1.5">
                Admin Access
              </h2>
              <p className="text-ink-soft text-sm">
                Sign in to manage your prompt library
              </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink">Email address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/60 backdrop-blur rounded-xl px-4 py-3 pl-11 text-sm outline-none focus:ring-2 focus:ring-brand/30 transition-all placeholder:text-ink-soft/60 border border-white/40 focus:border-brand/40"
                    placeholder="admin@promptforge.io"
                    autoComplete="email"
                    autoFocus
                  />
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/60 backdrop-blur rounded-xl px-4 py-3 pl-11 pr-11 text-sm outline-none focus:ring-2 focus:ring-brand/30 transition-all placeholder:text-ink-soft/60 border border-white/40 focus:border-brand/40"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-brand border-white/40" />
                  <span className="text-ink-soft group-hover:text-ink transition-colors">Remember me</span>
                </label>
                <Link
                  to="/admin/forgot-password"
                  className="text-brand-dark hover:text-brand font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={authing}
                className="w-full bg-gradient-to-r from-brand to-brand-dark text-white rounded-xl px-5 py-3 font-medium text-sm hover:shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {authing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <span className="text-xs text-ink-soft/60">
              PromptForge AI &mdash; Enterprise Prompt Library Platform
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
