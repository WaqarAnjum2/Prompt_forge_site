import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { Loading, useAsync } from '../components/Loading';
import CategoryCard from '../components/CategoryCard';
import { fetchCategories } from '../lib/services';

export default function Categories() {
  const { data: categories, loading, error } = useAsync(fetchCategories, []);

  if (loading) return <Loading label="Loading categories" />;
  if (error) return <div className="mx-auto max-w-4xl px-6 py-20 text-center text-danger">Error: {error}</div>;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 chip bg-brand/15 text-brand-dark mb-4">
          <Layers className="w-3.5 h-3.5" />
          Categories
        </div>
        <h1 className="text-h1 font-display font-bold mb-3">Browse by Category</h1>
        <p className="text-lg text-ink-soft max-w-xl mx-auto">
          Explore {(categories ?? []).length} specialized prompt domains curated for every use case
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(categories ?? []).map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>

      {(categories ?? []).length === 0 && (
        <div className="text-center py-20">
          <Layers className="w-12 h-12 text-ink-soft mx-auto mb-4" />
          <p className="text-ink-soft text-lg">No categories yet</p>
          <Link to="/" className="pill-btn-primary mt-4 inline-flex">Back to Home</Link>
        </div>
      )}
    </div>
  );
}
