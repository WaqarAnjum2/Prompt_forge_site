import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkles, Copy, Check, Clock, Search, Layers, MessageSquare, Filter } from 'lucide-react';
import { fetchPromptOutputs, fetchCategories } from '../lib/services';
import type { Category } from '../types';

interface OutputWithPrompt {
  id: string;
  title: string;
  content: string;
  prompt_id: string | null;
  created_at: string;
  prompt: { title: string; slug: string; category: { name: string; slug: string } | null } | null;
}

export default function PromptOutputs() {
  const [searchParams] = useSearchParams();
  const promptIdParam = searchParams.get('prompt');

  const [outputs, setOutputs] = useState<OutputWithPrompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    fetchPromptOutputs({
      promptId: promptIdParam || undefined,
      categoryId: categorySlug || undefined,
      search: debounced || undefined,
    })
      .then((data) => setOutputs(data as OutputWithPrompt[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [promptIdParam, categorySlug, debounced]);

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 chip bg-brand/10 text-brand-dark mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Generated Outputs
        </div>
        <h1 className="text-h1 font-display font-bold mb-3">Prompt Outputs</h1>
        <p className="text-ink-soft max-w-xl mx-auto">
          Browse generated outputs from the community. Each output was created using one of our prompts.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
            placeholder="Search outputs…"
          />
        </div>
        <div className="relative">
          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none" />
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="input-field pl-9 pr-8 appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        {(search || categorySlug || promptIdParam) && (
          <button
            onClick={() => { setSearch(''); setCategorySlug(''); }}
            className="pill-btn-ghost text-sm"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : outputs.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-12 h-12 text-ink-soft/40 mx-auto mb-4" />
          <p className="text-ink-soft text-sm mb-2">No outputs found</p>
          <p className="text-xs text-ink-soft/60">
            {search || categorySlug ? 'Try different search terms or filters.' : 'Outputs appear here when users generate content using prompts.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {outputs.map((output) => (
            <div key={output.id} className="bg-white/50 backdrop-blur rounded-2xl border border-white/40 overflow-hidden">
              <div className="px-6 py-4 border-b border-brand/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{output.title || 'Untitled Output'}</p>
                    <div className="flex items-center gap-2 text-xs text-ink-soft">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(output.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      {output.prompt && (
                        <>
                          <span>·</span>
                          <Link to={`/prompt/${output.prompt.slug}`} className="hover:text-brand-dark transition-colors">
                            {output.prompt.title}
                          </Link>
                          {output.prompt.category && (
                            <>
                              <span>·</span>
                              <Link to={`/category/${output.prompt.category.slug}`} className="hover:text-brand-dark transition-colors">
                                {output.prompt.category.name}
                              </Link>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(output.content, output.id)}
                  className="p-2 rounded-lg hover:bg-brand/10 text-ink-soft hover:text-brand-dark transition-all shrink-0"
                  title="Copy output"
                >
                  {copiedId === output.id ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="px-6 py-4">
                <pre className="text-sm text-ink whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                  {output.content}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
