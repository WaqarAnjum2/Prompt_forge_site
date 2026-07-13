import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
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
          className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white/60 backdrop-blur-xl border-r border-brand/10 flex flex-col transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-brand/10">
          <Link to="/admin" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shadow-lg shadow-brand/30 shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="font-display font-bold text-lg text-ink truncate">PromptForge</span>
            )}
          </Link>
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="p-1.5 rounded-lg hover:bg-brand/10 text-ink-soft hover:text-brand-dark transition-all hidden lg:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-brand/10 text-ink-soft lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(item.to)
                  ? 'bg-gradient-to-r from-brand/15 to-brand/5 text-brand-dark shadow-sm'
                  : 'text-ink-soft hover:text-ink hover:bg-white/40'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-brand/10 space-y-1">
          {bottomItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(item.to)
                  ? 'bg-gradient-to-r from-brand/15 to-brand/5 text-brand-dark shadow-sm'
                  : 'text-ink-soft hover:text-ink hover:bg-white/40'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-danger/70 hover:text-danger hover:bg-danger/10 transition-all duration-200"
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white/40 backdrop-blur-md border-b border-brand/10 flex items-center gap-4 px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-brand/10 text-ink-soft lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-ink-soft hover:text-brand-dark hover:bg-brand/10 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            View Site
          </Link>

          <Link
            to="/admin/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-brand/10 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-xs font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="text-sm font-medium text-ink hidden sm:block truncate max-w-[120px]">
              {user?.email?.split('@')[0] || 'Admin'}
            </span>
          </Link>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
