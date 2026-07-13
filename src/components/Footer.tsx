import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-cyber-border relative overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Circuit grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 border border-cyber-accent/50 flex items-center justify-center cyber-chamfer-sm group-hover:shadow-[0_0_10px_#00ff88] transition-all">
                <Terminal className="w-4 h-4 text-cyber-accent" />
              </div>
              <span className="font-cyber font-bold text-lg tracking-wider">
                <span className="text-cyber-fg">PROMPT</span><span className="text-neon">FORGE</span>
              </span>
            </Link>
            <p className="text-sm text-cyber-fg-soft leading-relaxed max-w-xs mb-6 font-mono">
              The enterprise AI prompt library with a powerful variable-driven generation engine.
            </p>
            <div className="flex gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 border border-cyber-border flex items-center justify-center cyber-chamfer-sm text-cyber-fg-soft hover:text-cyber-accent hover:border-cyber-accent hover:shadow-[0_0_10px_#00ff8840] transition-all duration-300">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Explore', links: [
              { to: '/categories', label: 'Categories' }, { to: '/trending', label: 'Trending' },
              { to: '/latest', label: 'Latest' }, { to: '/popular', label: 'Popular' }, { to: '/search', label: 'Search' },
            ]},
            { title: 'Platform', links: [
              { to: '/contact', label: 'Contact' }, { to: '/privacy', label: 'Privacy Policy' },
              { to: '/terms', label: 'Terms of Service' }, { to: '/admin', label: 'Admin Dashboard' },
            ]},
            { title: 'Resources', links: [
              { to: '#', label: 'Documentation' }, { to: '#', label: 'API Reference' },
              { to: '#', label: 'Community' }, { to: '#', label: 'Enterprise' },
            ]},
          ].map((section) => (
            <div key={section.title}>
              <h4 className="font-cyber font-bold mb-5 text-xs uppercase tracking-[0.2em] text-cyber-accent">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-cyber-fg-soft hover:text-cyber-accent transition-colors duration-200 font-mono flex items-center gap-1 group">
                      <span className="text-cyber-accent/0 group-hover:text-cyber-accent transition-colors">&gt;</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Neon separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-cyber-accent/30 to-transparent mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cyber-fg-soft font-mono">
            © 2026 PROMPTFORGE AI // ALL_RIGHTS_RESERVED
          </p>
          <div className="flex gap-6 text-xs text-cyber-fg-soft font-mono uppercase tracking-wider">
            <Link to="/privacy" className="hover:text-cyber-accent transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-cyber-accent transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-cyber-accent transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
