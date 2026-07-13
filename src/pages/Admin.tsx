import { Link } from 'react-router-dom';
import { Plus, Sparkles, Layers, TrendingUp, Copy, Award, BarChart3, Eye } from 'lucide-react';
import { Loading, useAsync } from '../components/Loading';
import { fetchPrompts } from '../lib/services';
import { motion } from 'framer-motion';
import type { Prompt } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#14b8a6', '#06b6d4'];
const DIFF_COLORS = ['#10b981', '#f59e0b', '#f43f5e']; // Beginner, Intermediate, Advanced

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-xl border border-white/40">
        {label && <p className="text-sm font-semibold text-ink mb-1 max-w-[200px] truncate">{label}</p>}
        <p className="text-xs font-medium text-brand-dark">
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function Admin() {
  const { data: prompts, loading, error } = useAsync(() => fetchPrompts({ orderBy: 'popularity' }), []);

  if (loading) return <Loading label="Loading dashboard" />;

  const totalPrompts = (prompts ?? []).length;
  const totalCopies = (prompts ?? []).reduce((sum, p) => sum + p.popularity, 0);
  const avgPopularity = totalPrompts > 0 ? Math.round(totalCopies / totalPrompts) : 0;

  const topPrompts = [...(prompts ?? [])].sort((a, b) => b.popularity - a.popularity).slice(0, 5).map(p => ({
    name: p.title,
    Usage: p.popularity,
    slug: p.slug
  }));

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
    .map(([id, count]) => ({ name: catNames.get(id) ?? 'Uncategorized', Prompts: count, slug: catSlugs.get(id) ?? '' }))
    .sort((a, b) => b.Prompts - a.Prompts);

  const diffCounts = { Beginner: 0, Intermediate: 0, Advanced: 0 };
  (prompts ?? []).forEach((p) => { if (p.difficulty in diffCounts) diffCounts[p.difficulty as keyof typeof diffCounts]++; });
  const diffData = [
    { name: 'Beginner', value: diffCounts.Beginner },
    { name: 'Intermediate', value: diffCounts.Intermediate },
    { name: 'Advanced', value: diffCounts.Advanced }
  ].filter(d => d.value > 0);

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
            <div className="bg-white/50 backdrop-blur rounded-2xl p-6 border border-white/40 flex flex-col h-[400px]">
              <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-dark" /> Top 5 Prompts by Usage
              </h3>
              <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topPrompts} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }} />
                    <Bar dataKey="Usage" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Prompts per Category */}
            <div className="bg-white/50 backdrop-blur rounded-2xl p-6 border border-white/40 flex flex-col h-[400px]">
              <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-dark" /> Prompts per Category
              </h3>
              <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={catData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }} />
                    <Bar dataKey="Prompts" radius={[4, 4, 0, 0]} barSize={32}>
                      {catData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Difficulty Distribution */}
            <div className="bg-white/50 backdrop-blur rounded-2xl p-6 border border-white/40 flex flex-col h-[400px]">
              <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-dark" /> Difficulty Distribution
              </h3>
              <div className="flex-1 min-h-0 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={diffData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {diffData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DIFF_COLORS[index % DIFF_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {diffData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm text-ink-soft">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DIFF_COLORS[i % DIFF_COLORS.length] }} />
                      {d.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Tags */}
            <div className="bg-white/50 backdrop-blur rounded-2xl p-6 border border-white/40 h-[400px]">
              <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
                <Eye className="w-5 h-5 text-brand-dark" /> Top Tags
              </h3>
              {topTags.length === 0 ? (
                <p className="text-sm text-ink-soft text-center py-8">No tags yet</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {topTags.map(([tag, count]) => {
                    const size = 0.85 + (count / maxTagCount) * 0.8;
                    return (
                      <span key={tag} className="chip bg-brand/10 text-brand-dark hover:bg-brand/20 transition-all cursor-default shadow-sm border border-brand/10" style={{ fontSize: `${size}rem` }}>
                        {tag}<span className="text-xs text-brand-dark/70 ml-1 font-mono">{count}</span>
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
