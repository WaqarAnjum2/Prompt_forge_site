import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Plus,
  FolderTree,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  List,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../lib/auth';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/prompts', label: 'All Prompts', icon: List },
  { to: '/admin/new', label: 'New Prompt', icon: Plus },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
];

const bottomItems = [
  { to: '/admin/profile', label: 'Profile', icon: User },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-ink/50 backdrop-blur-md z-40 lg:hidden transition-all duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white/70 backdrop-blur-2xl border-r border-brand/10 shadow-2xl shadow-brand/5 flex flex-col transition-all duration-300 ${
          collapsed ? 'w-[80px]' : 'w-[280px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between h-20 px-5 border-b border-brand/5">
          <Link to="/admin" className="flex items-center gap-3 min-w-0 group">
            <img src="/logo.png" alt="PromptForge Logo" className="w-10 h-10 rounded-xl shadow-md group-hover:scale-105 transition-transform object-cover shrink-0" />
            {!collapsed && (
              <span className="font-display font-extrabold text-xl text-ink tracking-tight truncate">PromptForge</span>
            )}
          </Link>
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="p-1.5 rounded-xl hover:bg-brand/10 text-ink-soft hover:text-brand-dark transition-all hidden lg:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl bg-bg-surface/50 text-ink-soft lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                isActive(item.to)
                  ? 'bg-gradient-to-r from-brand to-brand-dark text-white shadow-xl shadow-brand/20 translate-x-1'
                  : 'text-ink-soft hover:text-ink hover:bg-brand/5 hover:translate-x-1'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive(item.to) ? 'text-white' : 'text-brand-dark/70'}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-brand/5 space-y-2">
          {bottomItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                isActive(item.to)
                  ? 'bg-gradient-to-r from-brand to-brand-dark text-white shadow-xl shadow-brand/20 translate-x-1'
                  : 'text-ink-soft hover:text-ink hover:bg-brand/5 hover:translate-x-1'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive(item.to) ? 'text-white' : 'text-ink-soft'}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-semibold text-danger/80 hover:text-white hover:bg-danger hover:shadow-lg hover:shadow-danger/20 transition-all duration-300 group"
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0 text-danger/80 group-hover:text-white transition-colors" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-20 bg-white/70 backdrop-blur-2xl border-b border-brand/5 flex items-center gap-4 px-6 lg:px-10 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2.5 rounded-xl bg-white shadow-sm border border-brand/10 text-ink-soft hover:text-brand-dark lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-ink-soft hover:text-white hover:bg-brand-dark transition-all duration-300 border border-brand/10 hover:border-transparent shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">View Site</span>
          </Link>

          <Link
            to="/admin/profile"
            className="flex items-center gap-3 px-2 py-1.5 rounded-2xl hover:bg-brand/5 border border-transparent hover:border-brand/10 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-sm font-bold shadow-md">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden sm:block pr-2">
              <p className="text-sm font-bold text-ink truncate max-w-[120px]">
                {user?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-xs font-medium text-brand-dark">Super Admin</p>
            </div>
          </Link>
        </header>

        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
