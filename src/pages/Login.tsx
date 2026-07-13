import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Shield, Zap, Globe, Terminal } from 'lucide-react';
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
    return <Navigate to={from} replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthing(true);
    const { error } = await signIn(email, password);
    setAuthing(false);
    if (error) {
      toast(error, 'error');
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="cyber-page cyber-scanlines min-h-screen flex overflow-hidden">
      {/* Mouse-follow glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{ background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(0,255,136,0.05), transparent)` }}
      />

      {/* Decorative glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-cyber-accent/5 blur-[100px] animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-cyber-secondary/5 blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
      </div>

      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative">
        <div className="max-w-lg">
          <div className="w-14 h-14 border border-cyber-accent/50 flex items-center justify-center cyber-chamfer mb-8 shadow-[0_0_20px_#00ff8840]">
            <Terminal className="w-7 h-7 text-cyber-accent" />
          </div>
          <h1 className="text-5xl font-cyber font-black mb-4 leading-tight uppercase tracking-widest">
            Welcome back to<br />
            <span className="text-neon" style={{ textShadow: '0 0 20px rgba(0,255,136,0.4)' }}>PROMPTFORGE</span>
          </h1>
          <p className="text-base text-cyber-fg-soft mb-10 leading-relaxed font-mono tracking-wide">
            Your enterprise AI prompt library. Manage, analyze, and optimize your prompt collection with powerful tools.
          </p>

          <div className="space-y-4">
            {[
              { icon: Zap, text: 'Smart variable detection engine', color: 'text-cyber-accent' },
              { icon: Shield, text: 'Enterprise-grade RLS security', color: 'text-cyber-tertiary' },
              { icon: Globe, text: 'SEO-optimized prompt discovery', color: 'text-cyber-secondary' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-9 h-9 border border-cyber-border flex items-center justify-center cyber-chamfer-sm group-hover:border-cyber-accent group-hover:shadow-[0_0_10px_#00ff8840] transition-all">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-sm font-mono text-cyber-fg tracking-wide">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-cyber-fg-soft hover:text-cyber-accent mb-8 transition-colors font-mono uppercase tracking-wider group"
          >
            <div className="w-7 h-7 border border-cyber-border flex items-center justify-center cyber-chamfer-sm group-hover:border-cyber-accent transition-all">
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </div>
            BACK_TO_SITE
          </Link>

          <div className="cyber-card cyber-chamfer p-0 shadow-[0_0_30px_rgba(0,255,136,0.1)] overflow-hidden">
            {/* Terminal bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-cyber-border bg-cyber-bg">
              <div className="w-3 h-3 rounded-full bg-[#ff3366]" />
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <div className="w-3 h-3 rounded-full bg-cyber-accent" />
              <span className="text-[10px] text-cyber-fg-soft ml-2 font-mono uppercase tracking-wider">auth.terminal</span>
            </div>

            <div className="p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="w-16 h-16 border border-cyber-accent/40 flex items-center justify-center cyber-chamfer mx-auto mb-5 shadow-[0_0_20px_#00ff8840]">
                  <Shield className="w-8 h-8 text-cyber-accent" />
                </div>
                <h2 className="text-xl font-cyber font-bold uppercase tracking-widest text-cyber-fg mb-1.5">
                  ADMIN ACCESS
                </h2>
                <p className="text-cyber-fg-soft text-xs font-mono uppercase tracking-wider">
                  // AUTHENTICATE TO PROCEED
                </p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-cyber-label uppercase tracking-[0.2em] text-cyber-fg-soft">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-accent font-mono text-sm">&gt;</span>
                    <input
                      type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="cyber-input cyber-chamfer-sm text-sm"
                      placeholder="admin@promptforge.io"
                      autoComplete="email" autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-cyber-label uppercase tracking-[0.2em] text-cyber-fg-soft">Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-accent font-mono text-sm">&gt;</span>
                    <input
                      type={showPassword ? 'text' : 'password'} required value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="cyber-input cyber-chamfer-sm text-sm pr-11"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-fg-soft hover:text-cyber-accent transition-colors" tabIndex={-1}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#00ff88] border-cyber-border bg-cyber-bg" />
                    <span className="text-cyber-fg-soft group-hover:text-cyber-accent transition-colors font-mono uppercase tracking-wider text-[10px]">Remember me</span>
                  </label>
                  <Link to="/admin/forgot-password" className="text-cyber-accent hover:underline font-mono uppercase tracking-wider text-[10px]">
                    Forgot password?
                  </Link>
                </div>

                <button type="submit" disabled={authing}
                  className="w-full cyber-btn-solid cyber-chamfer-sm py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  {authing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-cyber-bg/30 border-t-cyber-bg rounded-full animate-spin" />
                      AUTHENTICATING<span className="animate-blink">_</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      SIGN_IN<ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="text-center mt-6">
            <span className="text-[10px] text-cyber-fg-soft/40 font-mono uppercase tracking-wider">
              PROMPTFORGE_AI // ENTERPRISE_PROMPT_LIBRARY_v2.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
