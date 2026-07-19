import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Copy, Check, ArrowRight, Star, Quote, ChevronDown, SlidersHorizontal, Terminal } from 'lucide-react';
import { Loading, useAsync, SkeletonCard } from '../components/Loading';
import PromptCard from '../components/PromptCard';
import CategoryCard from '../components/CategoryCard';
import { fetchPrompts, fetchCategories, fetchTestimonials } from '../lib/services';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, delay },
});

const staggerContainer = { whileInView: { transition: { staggerChildren: 0.08 } }, viewport: { once: true } };
const staggerItem = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchDifficulty, setSearchDifficulty] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [copiedDemo, setCopiedDemo] = useState(false);

  const { data: categories, loading: catLoading } = useAsync(fetchCategories, []);
  const { data: featured, loading: featLoading } = useAsync(() => fetchPrompts({ featured: true, limit: 6 }), []);
  const { data: trending, loading: trendLoading } = useAsync(() => fetchPrompts({ trending: true, limit: 3 }), []);
  const { data: latest, loading: latestLoading } = useAsync(() => fetchPrompts({ orderBy: 'created_at', limit: 3 }), []);
  const { data: testimonials } = useAsync(fetchTestimonials, []);

  const demoPrompt = `You are a marketing expert. Write a Facebook ad for {{BusinessName}}, a {{Industry}} company targeting {{TargetAudience}}. Highlight the offer: {{Offer}}. Include a clear CTA driving to {{Goal}}.`;
  const demoVars = useMemo(() => [
    { name: 'BusinessName', value: 'Acme Robotics' },
    { name: 'Industry', value: 'industrial automation' },
    { name: 'TargetAudience', value: 'factory managers' },
    { name: 'Offer', value: 'free ROI consultation' },
    { name: 'Goal', value: 'book a demo' },
  ], []);
  const filledDemo = useMemo(() => {
    let r = demoPrompt;
    demoVars.forEach((v) => { r = r.replace(`{{${v.name}}}`, v.value); });
    return r;
  }, [demoPrompt, demoVars]);
  const copyDemo = () => { navigator.clipboard.writeText(filledDemo); setCopiedDemo(true); setTimeout(() => setCopiedDemo(false), 2500); };

  const doSearch = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (searchCategory) params.set('category', searchCategory);
    if (searchDifficulty) params.set('difficulty', searchDifficulty);
    navigate(`/search?${params}`);
  };

  return (
    <div className="cyber-page cyber-scanlines min-h-screen" style={{ backgroundImage: 'none' }}>
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 md:pt-36 pb-16 md:pb-24 bg-[var(--cyber-bg)]">
        {/* Decorative glows */}
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full bg-cyber-accent/5 blur-[100px] animate-float" />
        <div className="absolute top-40 right-10 w-96 h-96 rounded-full bg-cyber-secondary/5 blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full bg-cyber-tertiary/5 blur-[100px] animate-float" style={{ animationDelay: '4s' }} />
        {/* Floating corner brackets */}
        <div className="absolute top-32 left-8 text-cyber-accent/20 font-mono text-6xl animate-pulse-soft hidden lg:block">[</div>
        <div className="absolute top-32 right-8 text-cyber-accent/20 font-mono text-6xl animate-pulse-soft hidden lg:block">]</div>

        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-14 items-start lg:items-center">
            <motion.div {...fadeUp()}>
              <motion.div {...fadeUp(0.1)} className="cyber-chip cyber-chamfer-sm mb-6 !border-cyber-accent/40 shadow-[0_0_10px_#00ff8830]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-accent" />
                </span>
                ENTERPRISE AI PROMPT LIBRARY
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-5xl md:text-6xl lg:text-7xl font-cyber font-black mb-6 leading-[1.05] tracking-widest uppercase"
              >
                <span className="cyber-glitch text-cyber-fg" data-text="FORGE THE">FORGE THE</span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="block mt-2 text-neon animate-rgb-shift"
                  style={{ textShadow: '0 0 20px rgba(0,255,136,0.4), 0 0 40px rgba(0,255,136,0.2)' }}
                >
                  PERFECT PROMPT<span className="animate-blink text-cyber-secondary">_</span>
                </motion.span>
              </motion.h1>

              <motion.p {...fadeUp(0.2)} className="text-base md:text-lg text-cyber-fg-soft mb-8 max-w-lg leading-relaxed font-mono tracking-wide">
                A curated library of battle-tested AI prompts with a powerful variable engine. Customize, copy, and deploy in seconds.
              </motion.p>

              <motion.div {...fadeUp(0.3)} className="flex flex-wrap gap-3 mb-8">
                <Link to="/categories" className="cyber-btn-solid cyber-chamfer-sm text-xs">
                  <Zap className="w-4 h-4" />BROWSE LIBRARY
                </Link>
                <Link to="/trending" className="cyber-btn-ghost cyber-chamfer-sm text-xs">
                  <TrendingUp className="w-4 h-4" />TRENDING NOW
                </Link>
              </motion.div>

              {/* Search */}
              <motion.div {...fadeUp(0.4)} className="cyber-card cyber-chamfer p-2 max-w-full md:max-w-md">
                <div className="flex items-center gap-2">
                  <span className="text-cyber-accent ml-3 font-mono text-sm">&gt;</span>
                  <input type="text" placeholder="search_prompts..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && search.trim()) doSearch(); }}
                    className="flex-1 bg-transparent outline-none text-sm text-cyber-accent font-mono placeholder:text-cyber-fg-soft"
                  />
                  <button type="button" onClick={() => setShowFilters(!showFilters)}
                    className={`p-1.5 transition-all ${showFilters ? 'text-cyber-secondary' : 'text-cyber-fg-soft hover:text-cyber-accent'}`}>
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                  <button onClick={doSearch} className="cyber-btn-solid cyber-chamfer-sm text-xs py-2 px-4">SEARCH</button>
                </div>
                {showFilters && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex flex-col sm:flex-row gap-2 mt-3 px-2 pb-2 overflow-hidden">
                    <div className="relative flex-1">
                      <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} className="cyber-input cyber-chamfer-sm text-xs w-full appearance-none cursor-pointer !pl-4">
                        <option value="">ALL_CATEGORIES</option>
                        {(categories ?? []).map((c) => (<option key={c.id} value={c.slug}>{c.name}</option>))}
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-cyber-fg-soft pointer-events-none" />
                    </div>
                    <div className="relative flex-1">
                      <select value={searchDifficulty} onChange={(e) => setSearchDifficulty(e.target.value)} className="cyber-input cyber-chamfer-sm text-xs w-full appearance-none cursor-pointer !pl-4">
                        <option value="">ANY_DIFFICULTY</option>
                        <option value="Beginner">BEGINNER</option>
                        <option value="Intermediate">INTERMEDIATE</option>
                        <option value="Advanced">ADVANCED</option>
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-cyber-fg-soft pointer-events-none" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Live Demo - Terminal variant */}
            <motion.div {...fadeUp(0.3)} className="cyber-card cyber-chamfer p-0 shadow-[0_0_30px_rgba(0,255,136,0.1)] overflow-hidden">
              {/* Terminal bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-cyber-border bg-cyber-bg">
                <div className="w-3 h-3 rounded-full bg-[#ff3366]" />
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <div className="w-3 h-3 rounded-full bg-cyber-accent" />
                <span className="text-[10px] text-cyber-fg-soft ml-2 font-mono uppercase tracking-wider">prompt-forge.terminal</span>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[10px] text-cyber-fg-soft mb-1.5 font-cyber-label uppercase tracking-[0.2em]">// TEMPLATE</p>
                  <div className="bg-cyber-bg border border-cyber-border p-3 text-xs font-mono leading-relaxed text-cyber-fg-soft cyber-chamfer-sm">{demoPrompt}</div>
                </div>
                <div>
                  <p className="text-[10px] text-cyber-fg-soft mb-1.5 font-cyber-label uppercase tracking-[0.2em]">// VARIABLES_DETECTED</p>
                  <div className="flex flex-wrap gap-2">
                    {demoVars.map((v, i) => (
                      <motion.span key={v.name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }}
                        className="cyber-chip cyber-chamfer-sm !border-cyber-tertiary/30 !text-cyber-tertiary">
                        <Zap className="w-2.5 h-2.5" />{v.name}
                      </motion.span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-cyber-fg-soft mb-1.5 font-cyber-label uppercase tracking-[0.2em]">// GENERATED_OUTPUT</p>
                  <div className="bg-cyber-bg border border-cyber-accent/20 p-3 text-xs font-mono leading-relaxed text-cyber-fg cyber-chamfer-sm">{filledDemo}</div>
                </div>
                <button onClick={copyDemo} className={`w-full text-xs cyber-chamfer-sm ${copiedDemo ? 'cyber-btn-solid !bg-[#10B981] !border-[#10B981]' : 'cyber-btn-solid'}`}>
                  {copiedDemo ? <><Check className="w-4 h-4" />COPIED_TO_CLIPBOARD</> : <><Copy className="w-4 h-4" />COPY_GENERATED_PROMPT</>}
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Marquee */}
        {((featured && featured.length > 0) || (trending && trending.length > 0)) && (
          <div className="w-full overflow-hidden mt-20 py-10 relative border-y border-cyber-border/30">
            <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-cyber-bg to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-cyber-bg to-transparent z-10 pointer-events-none" />
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-6 px-6">
              {[...(featured ?? []), ...(trending ?? []), ...(featured ?? []), ...(trending ?? [])].map((p, i) => (
                <div key={`${p?.id}-${i}`} className="w-[320px] shrink-0"><PromptCard prompt={p} /></div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Featured Prompts */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20">
        <div className="flex items-center justify-between mb-10">
          <motion.div {...fadeUp()}>
            <h2 className="font-cyber font-bold text-2xl md:text-3xl uppercase tracking-widest text-cyber-fg mb-2">
              Featured <span className="text-neon">Prompts</span>
            </h2>
            <p className="text-sm text-cyber-fg-soft font-mono tracking-wide">Hand-picked for maximum impact</p>
          </motion.div>
          <motion.div {...fadeUp(0.1)}>
            <Link to="/categories" className="cyber-btn-ghost cyber-chamfer-sm text-xs hidden md:flex">
              VIEW ALL<ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
        <motion.div {...staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : (featured ?? []).map((p) => (<motion.div key={p.id} {...staggerItem}><PromptCard prompt={p} /></motion.div>))}
        </motion.div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20">
        <motion.div {...fadeUp()} className="text-center mb-10">
          <h2 className="font-cyber font-bold text-2xl md:text-3xl uppercase tracking-widest text-cyber-fg mb-2">
            Browse by <span className="text-neon-secondary">Category</span>
          </h2>
          <p className="text-sm text-cyber-fg-soft font-mono tracking-wide">Explore {categories?.length ?? 8} specialized prompt domains</p>
        </motion.div>
        {catLoading ? <Loading label="Loading categories" /> : (
          <motion.div {...staggerContainer} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {(categories ?? []).map((cat) => (<motion.div key={cat.id} {...staggerItem}><CategoryCard category={cat} /></motion.div>))}
          </motion.div>
        )}
      </section>

      {/* Variable Engine */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20">
        <motion.div {...fadeUp()} className="cyber-card cyber-chamfer p-8 md:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 bg-cyber-accent/5 blur-[80px]" />
          <div className="absolute bottom-0 right-0 w-56 h-56 bg-cyber-secondary/5 blur-[80px]" />
          <div className="relative">
            <div className="cyber-chip cyber-chamfer-sm mb-5 mx-auto !border-cyber-tertiary/30 !text-cyber-tertiary">
              <Zap className="w-3.5 h-3.5" />VARIABLE_ENGINE
            </div>
            <h2 className="font-cyber font-bold text-xl md:text-2xl uppercase tracking-widest text-cyber-fg mb-4">
              Dynamic forms, auto-generated from your prompt
            </h2>
            <p className="text-sm text-cyber-fg-soft max-w-xl mx-auto mb-8 font-mono tracking-wide leading-relaxed">
              Drop in a prompt with <code className="bg-cyber-muted px-2 py-1 text-cyber-accent font-mono text-xs border border-cyber-border">{'{{variables}}'}</code> and PromptForge auto-detects them.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Auto Detection', 'Dynamic Forms', 'Live Preview', 'One-Click Copy'].map((feat) => (
                <span key={feat} className="cyber-chip cyber-chamfer-sm">
                  <Check className="w-3 h-3 text-cyber-accent" />{feat.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trending + Latest */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-10">
          <motion.div {...fadeUp()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-cyber font-bold text-lg uppercase tracking-widest text-cyber-fg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyber-danger" />TRENDING NOW
              </h2>
              <Link to="/trending" className="text-xs text-cyber-accent hover:underline font-mono uppercase tracking-wider">See all</Link>
            </div>
            <div className="space-y-4">{trendLoading ? <Loading label="Loading" /> : (trending ?? []).map((p) => <PromptCard key={p.id} prompt={p} />)}</div>
          </motion.div>
          <motion.div {...fadeUp(0.15)}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-cyber font-bold text-lg uppercase tracking-widest text-cyber-fg flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyber-accent" />LATEST PROMPTS
              </h2>
              <Link to="/latest" className="text-xs text-cyber-accent hover:underline font-mono uppercase tracking-wider">See all</Link>
            </div>
            <div className="space-y-4">{latestLoading ? <Loading label="Loading" /> : (latest ?? []).map((p) => <PromptCard key={p.id} prompt={p} />)}</div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <h2 className="font-cyber font-bold text-2xl md:text-3xl uppercase tracking-widest text-cyber-fg mb-2">
              User <span className="text-neon-tertiary">Feedback</span>
            </h2>
            <p className="text-sm text-cyber-fg-soft font-mono tracking-wide">Transmissions from the community</p>
          </motion.div>
          <motion.div {...staggerContainer} className="grid md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((t) => (
              <motion.div key={t.id} {...staggerItem} className="group cyber-card cyber-chamfer p-6 flex flex-col gap-4">
                <Quote className="w-6 h-6 text-cyber-accent/30 group-hover:text-cyber-accent/60 transition-colors" />
                <p className="text-sm text-cyber-fg leading-relaxed flex-1 font-mono">{t.content}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-cyber-border">
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt={t.name} className="w-10 h-10 object-cover cyber-chamfer-sm" />
                  ) : (
                    <div className="w-10 h-10 bg-cyber-accent/20 flex items-center justify-center text-cyber-accent font-cyber font-bold text-sm cyber-chamfer-sm">{t.name.charAt(0)}</div>
                  )}
                  <div>
                    <p className="text-sm font-cyber font-bold uppercase tracking-wider text-cyber-fg">{t.name}</p>
                    <p className="text-[10px] text-cyber-fg-soft font-mono uppercase tracking-wider">{t.role}{t.company ? ` // ${t.company}` : ''}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (<Star key={i} className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24">
        <motion.div {...fadeUp()} className="cyber-card cyber-chamfer p-8 md:p-16 text-center relative overflow-hidden animate-glow-pulse">
          <div className="absolute top-0 right-0 w-72 h-72 bg-cyber-accent/5 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyber-secondary/5 blur-[100px]" />
          <div className="relative">
            <h2 className="font-cyber font-bold text-2xl md:text-4xl uppercase tracking-widest text-cyber-fg mb-4">
              Ready to <span className="text-neon">forge</span> better prompts?
            </h2>
            <p className="text-sm text-cyber-fg-soft max-w-xl mx-auto mb-10 font-mono tracking-wide">
              Join thousands of teams using PromptForge to ship AI-powered products faster.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/categories" className="cyber-btn-solid cyber-chamfer-sm text-sm px-8 py-3">
                START BROWSING<ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/contact" className="cyber-btn-ghost cyber-chamfer-sm text-sm px-8 py-3">CONTACT SALES</Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
