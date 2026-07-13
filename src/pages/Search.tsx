import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, ArrowLeft, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useAsync } from '../components/Loading';
import PromptCard from '../components/PromptCard';
import { fetchPrompts, fetchCategories } from '../lib/services';
import type { Category } from '../types';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';
  const difficultyParam = searchParams.get('difficulty') || '';
  const [input, setInput] = useState(q);
  const [catFilter, setCatFilter] = useState(categorySlug);
  const [diffFilter, setDiffFilter] = useState(difficultyParam);
  const [showFilters, setShowFilters] = useState(!!categorySlug || !!difficultyParam);

  const { data: categories } = useAsync(fetchCategories, []);

  const { data: prompts, loading, error } = useAsync(
    () => {
      const opts: Parameters<typeof fetchPrompts>[0] = {};
      if (q) opts.search = q;
      if (categorySlug) opts.categorySlug = categorySlug;
      if (difficultyParam) opts.difficulty = difficultyParam;
      return fetchPrompts(opts);
    },
    [q, categorySlug, difficultyParam]
  );

  useEffect(() => {
    setInput(q);
    setCatFilter(categorySlug);
    setDiffFilter(difficultyParam);
  }, [q, categorySlug, difficultyParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (input.trim()) params.q = input.trim();
    if (catFilter) params.category = catFilter;
    if (diffFilter) params.difficulty = diffFilter;
    setSearchParams(params);
  };

  const clearSearch = () => {
    setInput('');
    setCatFilter('');
    setDiffFilter('');
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-dark mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div className="mb-8 max-w-2xl">
        <h1 className="text-h1 font-display font-bold mb-6">Search Prompts</h1>
        <form onSubmit={handleSearch} className="glass-strong rounded-2xl p-2">
          <div className="flex items-center gap-2">
            <SearchIcon className="w-5 h-5 text-ink-soft ml-3 shrink-0" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search prompts by title, description, or tags..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-soft"
              autoFocus
            />
            {input && (
              <button type="button" onClick={clearSearch} className="p-1.5 rounded-full hover:bg-surface/50 text-ink-soft">
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-full transition-all ${showFilters ? 'bg-brand/15 text-brand-dark' : 'text-ink-soft hover:text-brand-dark'}`}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button type="submit" className="pill-btn-primary text-sm shrink-0">
              Search
            </button>
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-2 mt-3 px-2 pb-2">
              <div className="relative flex-1 min-w-[130px]">
                <select
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                  className="w-full bg-bg-surface/60 rounded-xl px-3 py-2 text-xs outline-none border border-brand/10 focus:border-brand/30 appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {(categories ?? []).map((c: Category) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
              </div>
              <div className="relative flex-1 min-w-[110px]">
                <select
                  value={diffFilter}
                  onChange={(e) => setDiffFilter(e.target.value)}
                  className="w-full bg-bg-surface/60 rounded-xl px-3 py-2 text-xs outline-none border border-brand/10 focus:border-brand/30 appearance-none cursor-pointer"
                >
                  <option value="">Any Difficulty</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
              </div>
            </div>
          )}
        </form>
      </div>

      {q && (
        <p className="text-sm text-ink-soft mb-6">
          {loading ? 'Searching...' : `Found ${(prompts ?? []).length} result${(prompts ?? []).length === 1 ? '' : 's'} for "${q}"`}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-3xl p-6 space-y-4">
              <div className="skeleton h-6 w-24 rounded-full" />
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
              <div className="flex gap-2 pt-2">
                <div className="skeleton h-6 w-16 rounded-full" />
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-danger">Error: {error}</div>
      ) : (prompts ?? []).length === 0 ? (
        <div className="text-center py-20">
          <SearchIcon className="w-12 h-12 text-ink-soft mx-auto mb-4" />
          <p className="text-ink-soft text-lg mb-2">
            {q ? `No prompts found for "${q}"` : 'Enter a search term to find prompts'}
          </p>
          <p className="text-sm text-ink-soft mb-6">
            Try different keywords or browse categories
          </p>
          <Link to="/categories" className="pill-btn-primary">Browse Categories</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(prompts ?? []).map((p) => <PromptCard key={p.id} prompt={p} />)}
        </div>
      )}
    </div>
  );
}
