import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, LayoutDashboard, LogOut, User, ChevronDown, Search, List, Plus, FolderTree, Settings, Terminal, Sun, Moon } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
  const { theme, toggle: toggleTheme } = useTheme();
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
  useEffect(() => { if (searchOpen && searchRef.current) searchRef.current.focus(); }, [searchOpen]);

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-mono ${
        scrolled
          ? 'py-2 bg-cyber-bg/95 backdrop-blur-xl border-b border-cyber-accent/30 shadow-[0_0_20px_rgba(0,255,136,0.15)]'
          : 'py-4 bg-cyber-bg/70 backdrop-blur-md border-b border-cyber-border/50'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 border border-cyber-accent/50 flex items-center justify-center cyber-chamfer-sm group-hover:shadow-[0_0_10px_#00ff88,0_0_20px_#00ff8840] transition-all duration-300">
            <Terminal className="w-4 h-4 text-cyber-accent" />
          </div>
          <span className="font-cyber font-bold text-lg tracking-wider hidden sm:block">
            <span className="text-cyber-fg">PROMPT</span><span className="text-neon">FORGE</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-widest transition-all duration-200 cyber-chamfer-sm ${
                location.pathname === link.to
                  ? 'text-cyber-bg bg-cyber-accent shadow-[0_0_10px_#00ff88]'
                  : 'text-cyber-fg hover:text-cyber-accent hover:shadow-[0_0_5px_#00ff8840]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center overflow-hidden"
                >
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="> search..."
                    className="cyber-input cyber-chamfer-sm text-xs"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) setSearchQuery(''); }}
              className={`p-2 transition-all duration-200 ${searchOpen ? 'text-cyber-danger' : 'text-cyber-fg-soft hover:text-cyber-accent'}`}
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {user && isAdmin && (
            <div className="relative">
              <button
                onClick={() => setAdminDropdown(!adminDropdown)}
                onBlur={() => setTimeout(() => setAdminDropdown(false), 200)}
                className="cyber-btn text-xs py-2 px-3"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
                <ChevronDown className={`w-3 h-3 transition-transform ${adminDropdown ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {adminDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 cyber-card cyber-chamfer p-2 min-w-[200px] shadow-[0_0_20px_rgba(0,255,136,0.15)] z-50"
                  >
                    {[
                      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
                      { to: '/admin/prompts', icon: List, label: 'All Prompts' },
                      { to: '/admin/new', icon: Plus, label: 'New Prompt' },
                      { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
                    ].map((item) => (
                      <Link key={item.to} to={item.to} className="flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider text-cyber-fg-soft hover:text-cyber-accent hover:bg-cyber-accent/5 transition-all">
                        <item.icon className="w-4 h-4" />{item.label}
                      </Link>
                    ))}
                    <hr className="my-1 border-cyber-border" />
                    <Link to="/admin/settings" className="flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider text-cyber-fg-soft hover:text-cyber-accent hover:bg-cyber-accent/5 transition-all">
                      <Settings className="w-4 h-4" />Settings
                    </Link>
                    <Link to="/admin/profile" className="flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider text-cyber-fg-soft hover:text-cyber-accent hover:bg-cyber-accent/5 transition-all">
                      <User className="w-4 h-4" />Profile
                    </Link>
                    <hr className="my-1 border-cyber-border" />
                    <button onClick={() => { signOut(); navigate('/admin/login'); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-mono uppercase tracking-wider text-cyber-danger hover:bg-cyber-danger/10 transition-all">
                      <LogOut className="w-4 h-4" />Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 border border-cyber-border text-cyber-fg-soft hover:text-cyber-accent hover:border-cyber-accent hover:shadow-[0_0_10px_#00ff8840] transition-all duration-300 cyber-chamfer-sm mr-1"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link to="/categories" className="cyber-btn-solid text-xs py-2 px-4 cyber-chamfer-sm">
            Browse Library
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-cyber-fg-soft hover:text-cyber-accent transition-colors" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden cyber-card cyber-chamfer mt-3 mx-4 p-4 shadow-[0_0_20px_rgba(0,255,136,0.1)]"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className={`px-4 py-3 text-xs font-mono uppercase tracking-widest transition-all ${location.pathname === link.to ? 'text-cyber-accent bg-cyber-accent/10' : 'text-cyber-fg-soft hover:text-cyber-accent'}`}>
                  {link.label}
                </Link>
              ))}
              {user && isAdmin && (
                <>
                  <hr className="my-2 border-cyber-border" />
                  {[
                    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
                    { to: '/admin/prompts', icon: List, label: 'All Prompts' },
                    { to: '/admin/new', icon: Plus, label: 'New Prompt' },
                    { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
                    { to: '/admin/settings', icon: Settings, label: 'Settings' },
                    { to: '/admin/profile', icon: User, label: 'Profile' },
                  ].map((item) => (
                    <Link key={item.to} to={item.to} className="px-4 py-3 text-xs font-mono uppercase tracking-widest text-cyber-fg-soft hover:text-cyber-accent transition-all flex items-center gap-2">
                      <item.icon className="w-4 h-4" />{item.label}
                    </Link>
                  ))}
                  <button onClick={() => { signOut(); navigate('/admin/login'); }} className="w-full px-4 py-3 text-xs font-mono uppercase tracking-widest text-cyber-danger hover:bg-cyber-danger/10 transition-all flex items-center gap-2">
                    <LogOut className="w-4 h-4" />Sign Out
                  </button>
                </>
              )}
              <div className="flex items-center justify-between px-4 py-2 mt-2 border border-cyber-border cyber-chamfer-sm">
                <span className="text-xs font-mono uppercase tracking-wider text-cyber-fg-soft">THEME: {theme.toUpperCase()}</span>
                <button
                  onClick={toggleTheme}
                  className="p-1.5 border border-cyber-border text-cyber-fg-soft hover:text-cyber-accent hover:border-cyber-accent transition-all duration-300 cyber-chamfer-sm"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
              <Link to="/categories" className="cyber-btn-solid text-xs cyber-chamfer-sm mt-2 text-center">Browse Library</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
