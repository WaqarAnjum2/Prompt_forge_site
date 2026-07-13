import { Link } from 'react-router-dom';
import { Plus, Sparkles, Layers, TrendingUp, Copy, Award, BarChart3, Eye } from 'lucide-react';
import { Loading, useAsync } from '../components/Loading';
import { fetchPrompts } from '../lib/services';
import { motion } from 'framer-motion';
import type { Prompt } from '../types';

export default function Admin() {
  const { data: prompts, loading, error } = useAsync(() => fetchPrompts({ orderBy: 'popularity' }), []);

  if (loading) return <Loading label="Loading dashboard" />;

  const totalPrompts = (prompts ?? []).length;
  const totalCopies = (prompts ?? []).reduce((sum, p) => sum + p.popularity, 0);
  const avgPopularity = totalPrompts > 0 ? Math.round(totalCopies / totalPrompts) : 0;

  const topPrompts = [...(prompts ?? [])].sort((a, b) => b.popularity - a.popularity).slice(0, 5);
  const maxPopularity = topPrompts[0]?.popularity ?? 1;

  const catCounts = new Map<string, number>();
  const catNames = new Map<string, string>();
  const catSlugs = new Map<string, string>();
  (prompts ?? []).forEach((p) => {
    const key = p.category_id ?? 'uncategorized';
    catCounts.set(key, (catCounts.get(key) ?? 0) + 1);
    if (p.category) {
      catNames.set(key, (p.category as { name: string }).name);
      catSlugs.set(key, (p.category as { slug: string }).slug);
    }
  });
  const catData = Array.from(catCounts.entries())
    .map(([id, count]) => ({ name: catNames.get(id) ?? 'Uncategorized', count, slug: catSlugs.get(id) ?? '' }))
    .sort((a, b) => b.count - a.count);
  const maxCatCount = catData[0]?.count ?? 1;

  const diffCounts = { Beginner: 0, Intermediate: 0, Advanced: 0 };
  (prompts ?? []).forEach((p) => { if (p.difficulty in diffCounts) diffCounts[p.difficulty as keyof typeof diffCounts]++; });
  const diffTotal = totalPrompts || 1;
  const maxDiff = Math.max(...Object.values(diffCounts), 1);

  const tagCounts = new Map<string, number>();
  (prompts ?? []).forEach((p) => p.tags?.forEach((t: string) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)));
  const topTags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxTagCount = topTags[0]?.[1] ?? 1;

  const statsCards = [
    { icon: Sparkles, label: 'Total Prompts', value: totalPrompts, color: 'from-brand to-brand-dark', bg: 'from-brand/20 to-brand/5' },
    { icon: Layers, label: 'Categories', value: catData.length, color: 'from-emerald-400 to-emerald-600', bg: 'from-emerald-500/20 to-emerald-500/5' },
    { icon: Copy, label: 'Total Uses', value: totalCopies.toLocaleString(), color: 'from-amber-400 to-amber-600', bg: 'from-amber-500/20 to-amber-500/5' },
    { icon: TrendingUp, label: 'Avg Popularity', value: avgPopularity.toLocaleString(), color: 'from-rose-400 to-rose-600', bg: 'from-rose-500/20 to-rose-500/5' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Dashboard</h1>
          <p className="text-sm text-ink-soft mt-1">Stats, charts, and insights for your prompt library</p>
        </div>
        <Link
          to="/admin/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-brand to-brand-dark text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Prompt
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative bg-white/50 backdrop-blur rounded-2xl p-5 border border-white/40 hover:shadow-lg hover:shadow-brand/10 transition-all duration-300 group"
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-display font-bold text-ink">{stat.value}</p>
              <p className="text-xs text-ink-soft mt-0.5">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      {error ? (
        <div className="text-center py-16 text-danger text-sm">{error}</div>
      ) : (prompts ?? []).length === 0 ? (
        <div className="text-center py-20 bg-white/50 backdrop-blur rounded-2xl border border-white/40">
          <Sparkles className="w-12 h-12 text-ink-soft/40 mx-auto mb-4" />
          <p className="text-ink-soft text-sm mb-4">No prompts yet — stats and charts will appear here</p>
          <Link to="/admin/new" className="inline-flex items-center gap-1.5 text-sm text-brand-dark hover:underline font-medium">
            Create your first prompt
          </Link>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top 5 Prompts by Usage */}
            <div className="bg-white/50 backdrop-blur rounded-2xl p-6 border border-white/40">
              <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-dark" /> Top 5 Prompts by Usage
              </h3>
              <div className="space-y-4">
                {topPrompts.map((p: Prompt, i: number) => (
                  <div key={p.id}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <Link to={`/prompt/${p.slug}`} className="font-medium text-ink hover:text-brand-dark transition-colors truncate max-w-[240px]">
                        {i + 1}. {p.title}
                      </Link>
                      <span className="text-ink-soft shrink-0 ml-2">{p.popularity.toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/60 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark transition-all duration-700" style={{ width: `${(p.popularity / maxPopularity) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompts per Category */}
            <div className="bg-white/50 backdrop-blur rounded-2xl p-6 border border-white/40">
              <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-dark" /> Prompts per Category
              </h3>
              <div className="space-y-3">
                {catData.map((cat) => (
                  <div key={cat.slug}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <Link to={`/category/${cat.slug}`} className="font-medium text-ink hover:text-brand-dark transition-colors">{cat.name}</Link>
                      <span className="text-ink-soft">{cat.count}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/60 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-light to-brand transition-all duration-700" style={{ width: `${(cat.count / maxCatCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Difficulty Distribution */}
            <div className="bg-white/50 backdrop-blur rounded-2xl p-6 border border-white/40">
              <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-dark" /> Difficulty Distribution
              </h3>
              <div className="flex items-end justify-around gap-4 h-48">
                {([
                  { label: 'Beginner', count: diffCounts.Beginner, color: 'from-emerald-400 to-emerald-500', barColor: 'bg-gradient-to-t from-emerald-400 to-emerald-500', text: 'text-emerald-600' },
                  { label: 'Intermediate', count: diffCounts.Intermediate, color: 'from-amber-400 to-amber-500', barColor: 'bg-gradient-to-t from-amber-400 to-amber-500', text: 'text-amber-600' },
                  { label: 'Advanced', count: diffCounts.Advanced, color: 'from-rose-400 to-rose-500', barColor: 'bg-gradient-to-t from-rose-400 to-rose-500', text: 'text-rose-600' },
                ] as const).map((d) => (
                  <div key={d.label} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                    <span className={`text-sm font-bold ${d.text}`}>{d.count}</span>
                    <span className="text-xs text-ink-soft">{Math.round((d.count / diffTotal) * 100)}%</span>
                    <div className={`w-full max-w-[80px] rounded-t-xl ${d.barColor} transition-all duration-700`} style={{ height: `${(d.count / maxDiff) * 100}%` }} />
                    <span className="text-xs font-medium text-ink-soft">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Tags */}
            <div className="bg-white/50 backdrop-blur rounded-2xl p-6 border border-white/40">
              <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
                <Eye className="w-5 h-5 text-brand-dark" /> Top Tags
              </h3>
              {topTags.length === 0 ? (
                <p className="text-sm text-ink-soft text-center py-8">No tags yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topTags.map(([tag, count]) => {
                    const size = 0.85 + (count / maxTagCount) * 0.6;
                    return (
                      <span key={tag} className="chip bg-brand/10 text-brand-dark hover:bg-brand/20 transition-all cursor-default" style={{ fontSize: `${size}rem` }}>
                        {tag}<span className="text-xs text-ink-soft ml-1">{count}</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
