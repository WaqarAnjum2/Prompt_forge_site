import { Link } from 'react-router-dom';
import { Award, ArrowLeft } from 'lucide-react';
import { Loading, useAsync } from '../components/Loading';
import PromptCard from '../components/PromptCard';
import { fetchPrompts } from '../lib/services';

export default function Popular() {
  const { data: prompts, loading, error } = useAsync(
    () => fetchPrompts({ orderBy: 'popularity' }),
    []
  );

  if (loading) return <Loading label="Loading popular prompts" />;
  if (error) return <div className="mx-auto max-w-4xl px-6 py-20 text-center text-danger">Error: {error}</div>;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-dark mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 chip bg-warning/10 text-warning mb-4">
          <Award className="w-3.5 h-3.5" />
          Popular
        </div>
        <h1 className="text-h1 font-display font-bold mb-3">Most Popular Prompts</h1>
        <p className="text-lg text-ink-soft">Top-rated prompts by the community</p>
      </div>

      {(prompts ?? []).length === 0 ? (
        <div className="text-center py-20">
          <Award className="w-12 h-12 text-ink-soft mx-auto mb-4" />
          <p className="text-ink-soft text-lg">No prompts yet</p>
          <Link to="/" className="pill-btn-primary mt-4 inline-flex">Browse Library</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(prompts ?? []).map((p) => <PromptCard key={p.id} prompt={p} />)}
        </div>
      )}
    </div>
  );
}
