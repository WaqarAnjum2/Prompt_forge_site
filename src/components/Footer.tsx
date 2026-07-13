import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-brand/10 bg-white/20 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg">PromptForge</span>
            </Link>
            <p className="text-sm text-ink-soft leading-relaxed max-w-xs">
              The enterprise AI prompt library with a powerful variable-driven generation engine.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:bg-brand/15 transition-all" aria-label="GitHub">
                <Github className="w-4 h-4 text-ink-soft" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:bg-brand/15 transition-all" aria-label="Twitter">
                <Twitter className="w-4 h-4 text-ink-soft" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:bg-brand/15 transition-all" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4 text-ink-soft" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-ink-soft">
              Explore
            </h4>
            <ul className="space-y-3">
              <li><Link to="/categories" className="text-sm text-ink-soft hover:text-brand-dark transition-colors">Categories</Link></li>
              <li><Link to="/trending" className="text-sm text-ink-soft hover:text-brand-dark transition-colors">Trending</Link></li>
              <li><Link to="/latest" className="text-sm text-ink-soft hover:text-brand-dark transition-colors">Latest</Link></li>
              <li><Link to="/popular" className="text-sm text-ink-soft hover:text-brand-dark transition-colors">Popular</Link></li>
              <li><Link to="/search" className="text-sm text-ink-soft hover:text-brand-dark transition-colors">Search</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-ink-soft">
              Platform
            </h4>
            <ul className="space-y-3">
              <li><Link to="/contact" className="text-sm text-ink-soft hover:text-brand-dark transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="text-sm text-ink-soft hover:text-brand-dark transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-ink-soft hover:text-brand-dark transition-colors">Terms of Service</Link></li>
              <li><Link to="/admin" className="text-sm text-ink-soft hover:text-brand-dark transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-ink-soft">
              Resources
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-ink-soft hover:text-brand-dark transition-colors">Documentation</a></li>
              <li><a href="#" className="text-sm text-ink-soft hover:text-brand-dark transition-colors">API Reference</a></li>
              <li><a href="#" className="text-sm text-ink-soft hover:text-brand-dark transition-colors">Community</a></li>
              <li><a href="#" className="text-sm text-ink-soft hover:text-brand-dark transition-colors">Enterprise</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-brand/10">
          <p className="text-sm text-ink-soft">
            © 2026 PromptForge AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-ink-soft">
            <Link to="/privacy" className="hover:text-brand-dark transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-brand-dark transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-brand-dark transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
