import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  Layers,
  Copy,
  Sparkles,
  BarChart3,
  Eye,
  Award,
} from 'lucide-react';
import { Loading, useAsync } from '../../components/Loading';
import { fetchPrompts } from '../../lib/services';
import type { Prompt } from '../../types';

export default function AdminAnalytics() {
  const { data: prompts, loading } = useAsync(() => fetchPrompts({ orderBy: 'popularity' }), []);

  if (loading || !prompts) return <Loading label="Loading analytics" />;

  const totalPrompts = prompts.length;
  const totalCopies = prompts.reduce((sum, p) => sum + p.popularity, 0);
  const avgPopularity = totalPrompts > 0 ? Math.round(totalCopies / totalPrompts) : 0;

  const topPrompts = [...prompts].sort((a, b) => b.popularity - a.popularity).slice(0, 5);
  const maxPopularity = topPrompts[0]?.popularity ?? 1;

  const catCounts = new Map<string, number>();
  const catNames = new Map<string, string>();
  const catSlugs = new Map<string, string>();
  prompts.forEach((p) => {
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
  prompts.forEach((p) => { if (p.difficulty in diffCounts) diffCounts[p.difficulty as keyof typeof diffCounts]++; });
  const diffTotal = totalPrompts || 1;
  const maxDiff = Math.max(...Object.values(diffCounts), 1);

  const tagCounts = new Map<string, number>();
  prompts.forEach((p) => p.tags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)));
  const topTags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxTagCount = topTags[0]?.[1] ?? 1;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-dark mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>
      <h1 className="text-h1 font-display font-bold flex items-center gap-3 mb-2">
        <BarChart3 className="w-8 h-8 text-brand-dark" /> Analytics
      </h1>
      <p className="text-ink-soft mb-10">Insights into prompt usage and library composition</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Layers, label: 'Total Prompts', value: totalPrompts, color: 'text-brand-dark' },
          { icon: Copy, label: 'Total Uses', value: totalCopies.toLocaleString(), color: 'text-success' },
          { icon: TrendingUp, label: 'Avg Popularity', value: avgPopularity.toLocaleString(), color: 'text-warning' },
          { icon: Sparkles, label: 'Categories', value: catData.length, color: 'text-danger' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-display font-bold">{stat.value}</p>
            <p className="text-caption text-ink-soft">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="glass rounded-3xl p-6">
          <h3 className="font-display font-semibold mb-6 flex items-center gap-2"><Award className="w-5 h-5 text-brand-dark" /> Top 5 Prompts by Usage</h3>
          <div className="space-y-4">
            {topPrompts.map((p: Prompt, i: number) => (
              <div key={p.id}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <Link to={`/prompt/${p.slug}`} className="font-medium hover:text-brand-dark transition-colors truncate max-w-[200px]">{i + 1}. {p.title}</Link>
                  <span className="text-ink-soft shrink-0 ml-2">{p.popularity.toLocaleString()}</span>
                </div>
                <div className="h-2.5 rounded-full bg-surface/60 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark transition-all duration-700" style={{ width: `${(p.popularity / maxPopularity) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h3 className="font-display font-semibold mb-6 flex items-center gap-2"><Layers className="w-5 h-5 text-brand-dark" /> Prompts per Category</h3>
          <div className="space-y-3">
            {catData.map((cat) => (
              <div key={cat.slug}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <Link to={`/category/${cat.slug}`} className="font-medium hover:text-brand-dark transition-colors">{cat.name}</Link>
                  <span className="text-ink-soft">{cat.count}</span>
                </div>
                <div className="h-2.5 rounded-full bg-surface/60 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-light to-brand transition-all duration-700" style={{ width: `${(cat.count / maxCatCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-6">
          <h3 className="font-display font-semibold mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-brand-dark" /> Difficulty Distribution</h3>
          <div className="flex items-end justify-around gap-4 h-48">
            {([
              { label: 'Beginner', count: diffCounts.Beginner, color: 'from-success to-success', text: 'text-success' },
              { label: 'Intermediate', count: diffCounts.Intermediate, color: 'from-warning to-warning', text: 'text-warning' },
              { label: 'Advanced', count: diffCounts.Advanced, color: 'from-danger to-danger', text: 'text-danger' },
            ] as const).map((d) => (
              <div key={d.label} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                <span className={`text-sm font-bold ${d.text}`}>{d.count}</span>
                <span className="text-caption text-ink-soft">{Math.round((d.count / diffTotal) * 100)}%</span>
                <div className={`w-full max-w-[80px] rounded-t-xl bg-gradient-to-t ${d.color} transition-all duration-700`} style={{ height: `${(d.count / maxDiff) * 100}%` }} />
                <span className="text-xs font-medium text-ink-soft">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h3 className="font-display font-semibold mb-6 flex items-center gap-2"><Eye className="w-5 h-5 text-brand-dark" /> Top Tags</h3>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => {
              const size = 0.85 + (count / maxTagCount) * 0.6;
              return (
                <span key={tag} className="chip bg-brand/10 text-brand-dark hover:bg-brand/20 transition-all cursor-default" style={{ fontSize: `${size}rem` }}>
                  {tag}<span className="text-caption text-ink-soft ml-1">{count}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
