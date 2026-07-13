import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Sparkles,
  TrendingUp,
  Zap,
  Copy,
  Check,
  ArrowRight,
  Star,
  Quote,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { Loading, useAsync, SkeletonCard } from '../components/Loading';
import PromptCard from '../components/PromptCard';
import CategoryCard from '../components/CategoryCard';
import { fetchPrompts, fetchCategories, fetchTestimonials } from '../lib/services';

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchDifficulty, setSearchDifficulty] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [copiedDemo, setCopiedDemo] = useState(false);

  const { data: categories, loading: catLoading } = useAsync(fetchCategories, []);
  const { data: featured, loading: featLoading } = useAsync(
    () => fetchPrompts({ featured: true, limit: 6 }),
    []
  );
  const { data: trending, loading: trendLoading } = useAsync(
    () => fetchPrompts({ trending: true, limit: 3 }),
    []
  );
  const { data: latest, loading: latestLoading } = useAsync(
    () => fetchPrompts({ orderBy: 'created_at', limit: 3 }),
    []
  );
  const { data: testimonials } = useAsync(fetchTestimonials, []);

  const demoPrompt = `You are a marketing expert. Write a Facebook ad for {{BusinessName}}, a {{Industry}} company targeting {{TargetAudience}}. Highlight the offer: {{Offer}}. Include a clear CTA driving to {{Goal}}.`;

  const demoVars = useMemo(
    () => [
      { name: 'BusinessName', value: 'Acme Robotics' },
      { name: 'Industry', value: 'industrial automation' },
      { name: 'TargetAudience', value: 'factory managers' },
      { name: 'Offer', value: 'free ROI consultation' },
      { name: 'Goal', value: 'book a demo' },
    ],
    []
  );

  const filledDemo = useMemo(() => {
    let result = demoPrompt;
    demoVars.forEach((v) => {
      result = result.replace(`{{${v.name}}}`, v.value);
    });
    return result;
  }, [demoPrompt, demoVars]);

  const copyDemo = () => {
    navigator.clipboard.writeText(filledDemo);
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 2500);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-x-hidden pt-8 md:pt-12 pb-12 md:pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-brand/20 blur-3xl animate-float" />
          <div className="absolute top-40 right-10 w-96 h-96 rounded-full bg-bg-elevated/30 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-start lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 chip bg-gradient-to-r from-brand/10 to-brand-dark/10 text-brand-dark mb-6 border border-brand/20 shadow-sm backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                </span>
                Enterprise AI Prompt Library
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold mb-6 leading-[1.1] tracking-tighter">
                Forge the perfect prompt,
                <span className="block mt-2 bg-gradient-to-r from-brand via-brand-dark to-brand bg-clip-text text-transparent"> every time.</span>
              </h1>
              <p className="text-lg md:text-xl text-ink-soft mb-8 max-w-lg leading-relaxed">
                A curated library of battle-tested AI prompts with a powerful variable engine.
                Customize, copy, and deploy in seconds.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Link to="/categories" className="pill-btn-primary">
                  <Sparkles className="w-4 h-4" />
                  Browse Library
                </Link>
                <Link to="/trending" className="pill-btn-ghost">
                  <TrendingUp className="w-4 h-4" />
                  Trending Now
                </Link>
              </div>
              <div className="glass rounded-2xl p-2 max-w-full md:max-w-md">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-ink-soft ml-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search prompts…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && search.trim()) {
                        const params = new URLSearchParams();
                        if (search.trim()) params.set('q', search.trim());
                        if (searchCategory) params.set('category', searchCategory);
                        if (searchDifficulty) params.set('difficulty', searchDifficulty);
                        navigate(`/search?${params}`);
                      }
                    }}
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-soft"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-1.5 rounded-full transition-all ${showFilters ? 'bg-brand/15 text-brand-dark' : 'text-ink-soft hover:text-brand-dark'}`}
                    aria-label="Toggle filters"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (search.trim()) params.set('q', search.trim());
                      if (searchCategory) params.set('category', searchCategory);
                      if (searchDifficulty) params.set('difficulty', searchDifficulty);
                      navigate(`/search?${params}`);
                    }}
                    className="pill-btn-primary text-sm shrink-0"
                  >
                    Search
                  </button>
                </div>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="flex flex-col sm:flex-row gap-2 mt-3 px-2 pb-2 overflow-hidden"
                  >
                    <div className="relative flex-1 min-w-0">
                      <select
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                        className="w-full bg-bg-surface/60 rounded-xl px-3 py-2 text-xs outline-none border border-brand/10 focus:border-brand/30 appearance-none cursor-pointer"
                      >
                        <option value="">All Categories</option>
                        {(categories ?? []).map((c) => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
                    </div>
                    <div className="relative flex-1 min-w-0">
                      <select
                        value={searchDifficulty}
                        onChange={(e) => setSearchDifficulty(e.target.value)}
                        className="w-full bg-bg-surface/60 rounded-xl px-3 py-2 text-xs outline-none border border-brand/10 focus:border-brand/30 appearance-none cursor-pointer"
                      >
                        <option value="">Any Difficulty</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Live Prompt Demo */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-strong rounded-3xl p-6 shadow-2xl shadow-brand/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-danger/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
                <span className="text-caption text-ink-soft ml-2 font-mono">prompt-forge.demo</span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-caption text-ink-soft mb-1.5 font-medium uppercase tracking-wider">Template</p>
                  <div className="glass rounded-xl p-3 text-xs font-mono leading-relaxed text-ink-soft">
                    {demoPrompt}
                  </div>
                </div>
                <div>
                  <p className="text-caption text-ink-soft mb-1.5 font-medium uppercase tracking-wider">Variables Detected</p>
                  <div className="flex flex-wrap gap-2">
                    {demoVars.map((v) => (
                      <span key={v.name} className="chip bg-brand/10 text-brand-dark">
                        <Zap className="w-2.5 h-2.5" />
                        {v.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-caption text-ink-soft mb-1.5 font-medium uppercase tracking-wider">Generated Output</p>
                  <div className="glass rounded-xl p-3 text-xs leading-relaxed">
                    {filledDemo}
                  </div>
                </div>
                <button
                  onClick={copyDemo}
                  className={`pill-btn w-full text-sm ${copiedDemo ? 'bg-success text-white' : 'pill-btn-primary'}`}
                >
                  {copiedDemo ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedDemo ? 'Copied to clipboard!' : 'Copy Generated Prompt'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Looped Flowing Cards Marquee */}
        {((featured && featured.length > 0) || (trending && trending.length > 0)) && (
          <div className="w-full overflow-hidden mt-16 py-8 relative bg-bg-surface/30 border-y border-brand/5">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-6 px-6">
              {[...(featured ?? []), ...(trending ?? []), ...(featured ?? []), ...(trending ?? [])].map((p, i) => (
                <div key={`${p?.id}-${i}`} className="w-[320px] shrink-0 transform transition-transform hover:scale-[1.02] hover:z-20">
                  <PromptCard prompt={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>


      {/* Featured Prompts */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-h2 font-display font-bold mb-1">Featured Prompts</h2>
            <p className="text-ink-soft">Hand-picked by our team for maximum impact</p>
          </div>
          <Link to="/categories" className="pill-btn-ghost text-sm hidden md:flex">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : (featured ?? []).map((p) => <PromptCard key={p.id} prompt={p} />)}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">
        <div className="text-center mb-8">
          <h2 className="text-h2 font-display font-bold mb-1">Browse by Category</h2>
          <p className="text-ink-soft">Explore {categories?.length ?? 8} specialized prompt domains</p>
        </div>
        {catLoading ? (
          <Loading label="Loading categories" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {(categories ?? []).map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* Variable Engine Demo */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">
        <div className="glass-strong rounded-4xl p-8 md:p-12 text-center">
          <div className="inline-flex items-center gap-2 chip bg-brand/15 text-brand-dark mb-4">
            <Zap className="w-3.5 h-3.5" />
            Variable Engine
          </div>
          <h2 className="text-h2 font-display font-bold mb-3">
            Dynamic forms, auto-generated from your prompt
          </h2>
          <p className="text-ink-soft max-w-xl mx-auto mb-8">
            Drop in a prompt with <code className="bg-bg-surface/60 rounded px-1.5 py-0.5 text-brand-dark font-mono text-sm">{'{{variables}}'}</code> and PromptForge auto-detects them, builds a form, and generates a ready-to-copy output in real time.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Auto Detection', 'Dynamic Forms', 'Live Preview', 'One-Click Copy'].map((feat) => (
              <span key={feat} className="chip bg-bg-surface/60 text-ink">
                <Check className="w-3 h-3 text-success" />
                {feat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Trending + Latest */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h3 font-display font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-danger" />
                Trending Now
              </h2>
              <Link to="/trending" className="text-sm text-brand-dark hover:underline">See all</Link>
            </div>
            <div className="space-y-4">
              {trendLoading
                ? <Loading label="Loading trending" />
                : (trending ?? []).map((p) => <PromptCard key={p.id} prompt={p} />)}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h3 font-display font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-brand-dark" />
                Latest Prompts
              </h2>
              <Link to="/latest" className="text-sm text-brand-dark hover:underline">See all</Link>
            </div>
            <div className="space-y-4">
              {latestLoading
                ? <Loading label="Loading latest" />
                : (latest ?? []).map((p) => <PromptCard key={p.id} prompt={p} />)}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">
          <div className="text-center mb-8">
            <h2 className="text-h2 font-display font-bold mb-1">Loved by teams</h2>
            <p className="text-ink-soft">See what our community says about PromptForge</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((t) => (
              <div key={t.id} className="glass rounded-3xl p-6 flex flex-col gap-4">
                <Quote className="w-8 h-8 text-brand/40" />
                <p className="text-sm text-ink leading-relaxed flex-1">{t.content}</p>
                <div className="flex items-center gap-3 pt-3 border-t border-brand/10">
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-caption text-ink-soft">{t.role}{t.company ? `, ${t.company}` : ''}</p>
                  </div>
                  <div className="ml-auto flex">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-warning fill-warning" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
        <div className="glass-strong rounded-3xl md:rounded-4xl p-6 md:p-12 text-center overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-bg-elevated/30 blur-3xl" />
          <div className="relative">
            <h2 className="text-h2 font-display font-bold mb-3">Ready to forge better prompts?</h2>
            <p className="text-ink-soft max-w-xl mx-auto mb-8">
              Join thousands of teams using PromptForge to ship AI-powered products faster.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/categories" className="pill-btn-primary">
                Start Browsing
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="pill-btn-ghost">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
