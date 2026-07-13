import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Layers } from 'lucide-react';
import { Loading, useAsync, SkeletonCard } from '../components/Loading';
import PromptCard from '../components/PromptCard';
import { fetchCategoryBySlug, fetchPrompts } from '../lib/services';

export default function CategoryView() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, loading: catLoading, error: catError } = useAsync(
    () => fetchCategoryBySlug(slug!),
    [slug]
  );
  const { data: prompts, loading: promptsLoading } = useAsync(
    () => (slug ? fetchPrompts({ categorySlug: slug }) : Promise.resolve([])),
    [slug]
  );

  if (catLoading) return <Loading label="Loading category" />;
  if (catError) return <div className="mx-auto max-w-4xl px-6 py-20 text-center text-danger">Error: {catError}</div>;
  if (!category) return (
    <div className="mx-auto max-w-4xl px-6 py-20 text-center">
      <Layers className="w-12 h-12 text-ink-soft mx-auto mb-4" />
      <p className="text-ink-soft text-lg mb-4">Category not found</p>
      <Link to="/categories" className="pill-btn-primary">All Categories</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link to="/categories" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-dark mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> All Categories
      </Link>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 chip bg-brand/15 text-brand-dark mb-4">
          <Layers className="w-3.5 h-3.5" />
          {category.name}
        </div>
        <h1 className="text-h1 font-display font-bold mb-3">{category.name} Prompts</h1>
        {category.description && (
          <p className="text-lg text-ink-soft max-w-xl">{category.description}</p>
        )}
      </div>

      {promptsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (prompts ?? []).length === 0 ? (
        <div className="text-center py-20">
          <Layers className="w-12 h-12 text-ink-soft mx-auto mb-4" />
          <p className="text-ink-soft text-lg">No prompts in this category yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(prompts ?? []).map((p) => <PromptCard key={p.id} prompt={p} />)}
        </div>
      )}
    </div>
  );
}
