import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, LayoutDashboard, LogOut, User, ChevronDown, Search, List, Plus, FolderTree, Settings } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setSearchOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/categories', label: 'Categories' },
    { to: '/trending', label: 'Trending' },
    { to: '/latest', label: 'Latest' },
    { to: '/popular', label: 'Popular' },

  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong py-3' : 'py-5 bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="PromptForge Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-brand/30 group-hover:scale-110 transition-transform object-cover" />
          <span className="font-display font-bold text-xl text-ink hidden sm:block">PromptForge</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                location.pathname === link.to
                  ? 'bg-brand/15 text-brand-dark'
                  : 'text-ink-soft hover:text-ink hover:bg-bg-surface/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {/* Animated Search */}
          <form onSubmit={handleSearch} className="relative flex items-center">
            <div
              className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${
                searchOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'
              }`}
            >
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts..."
                className="w-full bg-bg-surface/60 rounded-l-full pl-4 pr-2 py-2 text-sm outline-none border border-brand/20 focus:border-brand transition-colors"
              />
              <button
                type="submit"
                className="bg-brand hover:bg-brand-dark text-white px-3 py-2 rounded-r-full text-sm transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (!searchOpen) setSearchQuery('');
              }}
              className={`p-2 rounded-full transition-all duration-300 ${
                searchOpen
                  ? 'bg-danger/10 text-danger rotate-90'
                  : 'text-ink-soft hover:text-brand-dark hover:bg-bg-surface/50'
              }`}
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {user && isAdmin ? (
            <div className="relative">
              <button
                onClick={() => setAdminDropdown(!adminDropdown)}
                onBlur={() => setTimeout(() => setAdminDropdown(false), 200)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-brand-dark bg-brand/10 hover:bg-brand/20 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {adminDropdown && (
                <div className="absolute right-0 mt-2 glass-strong rounded-2xl p-2 min-w-[200px] shadow-xl animate-fade-down z-50">
                  <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand/10 transition-all">
                    <LayoutDashboard className="w-4 h-4 text-brand-dark" />
                    Dashboard
                  </Link>
                  <Link to="/admin/prompts" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand/10 transition-all">
                    <List className="w-4 h-4 text-brand-dark" />
                    All Prompts
                  </Link>
                  <Link to="/admin/new" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand/10 transition-all">
                    <Plus className="w-4 h-4 text-brand-dark" />
                    New Prompt
                  </Link>
                  <Link to="/admin/categories" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand/10 transition-all">
                    <FolderTree className="w-4 h-4 text-brand-dark" />
                    Categories
                  </Link>
                  <hr className="my-1 border-brand/10" />
                  <Link to="/admin/settings" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand/10 transition-all">
                    <Settings className="w-4 h-4 text-ink-soft" />
                    Settings
                  </Link>
                  <Link to="/admin/profile" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand/10 transition-all">
                    <User className="w-4 h-4 text-ink-soft" />
                    Profile
                  </Link>
                  <hr className="my-1 border-brand/10" />
                  <button
                    onClick={() => { signOut(); navigate('/admin/login'); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-ink-soft hover:text-brand-dark hover:bg-bg-surface/50 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
          )}
          <Link to="/categories" className="pill-btn-primary text-sm">
            Browse Library
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-bg-surface/50"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden glass-strong mt-3 mx-4 rounded-3xl p-4 animate-fade-in">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-bg-surface/50 transition-all"
              >
                {link.label}
              </Link>
            ))}
            {user && isAdmin ? (
              <>
                <Link to="/admin" className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-bg-surface/50 transition-all flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link to="/admin/prompts" className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-bg-surface/50 transition-all flex items-center gap-2">
                  <List className="w-4 h-4" />
                  All Prompts
                </Link>
                <Link to="/admin/new" className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-bg-surface/50 transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Prompt
                </Link>
                <Link to="/admin/categories" className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-bg-surface/50 transition-all flex items-center gap-2">
                  <FolderTree className="w-4 h-4" />
                  Categories
                </Link>
                <Link to="/admin/settings" className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-bg-surface/50 transition-all flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <Link to="/admin/profile" className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-bg-surface/50 transition-all flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  onClick={() => { signOut(); navigate('/admin/login'); }}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-all flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-bg-surface/50 transition-all flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Login
              </Link>
            )}
            <Link to="/categories" className="pill-btn-primary text-sm mt-2">
              Browse Library
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
