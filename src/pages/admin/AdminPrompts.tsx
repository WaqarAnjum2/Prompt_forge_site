import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Copy,
  Image,
  Tag,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Loading } from '../../components/Loading';
import { useToast } from '../../components/Toast';
import { fetchPrompts, fetchCategories, deletePrompt } from '../../lib/services';
import type { Prompt, Category } from '../../types';

const ITEMS_PER_PAGE = 20;

interface PromptWithMedia extends Prompt {
  media?: { file_name: string; download_url: string | null; mime_type: string }[];
}

export default function AdminPrompts() {
  const { toast } = useToast();
  const [allPrompts, setAllPrompts] = useState<PromptWithMedia[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prompts, cats] = await Promise.all([
        fetchPrompts({ orderBy: 'created_at' }) as Promise<PromptWithMedia[]>,
        fetchCategories(),
      ]);
      setAllPrompts(prompts);
      setCategories(cats);
    } catch (err) {
      toast('Failed to load prompts', 'error');
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let result = allPrompts;
    if (search.trim()) {
      const s = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s) ||
          p.tags?.some((t) => t.toLowerCase().includes(s))
      );
    }
    if (catFilter) {
      result = result.filter((p) => {
        const cat = p.category as Category | undefined;
        return cat?.slug === catFilter || cat?.id === catFilter;
      });
    }
    return result;
  }, [allPrompts, search, catFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagePrompts = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [search, catFilter]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deletePrompt(id);
      setAllPrompts((prev) => prev.filter((p) => p.id !== id));
      setDeleteId(null);
      toast('Prompt deleted', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete', 'error');
    }
    setDeleting(false);
  };

  if (loading) return <Loading label="Loading prompts" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">All Prompts</h1>
          <p className="text-sm text-ink-soft mt-1">{filtered.length} prompt{filtered.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link
          to="/admin/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-brand to-brand-dark text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Prompt
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description, or tags..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/50 backdrop-blur rounded-xl border border-white/40 text-sm outline-none focus:border-brand/30 transition-colors"
          />
        </div>
        <div className="relative sm:w-48">
          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none" />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/50 backdrop-blur rounded-xl border border-white/40 text-sm outline-none focus:border-brand/30 appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Prompt Table */}
      {pagePrompts.length === 0 ? (
        <div className="text-center py-20 bg-white/50 backdrop-blur rounded-2xl border border-white/40">
          <Sparkles className="w-12 h-12 text-ink-soft/40 mx-auto mb-4" />
          <p className="text-ink-soft text-sm mb-4">
            {search || catFilter ? 'No prompts match your filters' : 'No prompts yet'}
          </p>
          {!search && !catFilter && (
            <Link to="/admin/new" className="inline-flex items-center gap-1.5 text-sm text-brand-dark hover:underline font-medium">
              Create your first prompt
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {pagePrompts.map((p) => {
            const cat = p.category as Category | undefined;
            const firstImage = p.media?.find((m) => m.download_url);
            return (
              <div
                key={p.id}
                className="bg-white/50 backdrop-blur rounded-2xl border border-white/40 p-4 hover:shadow-md hover:shadow-brand/5 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* Image Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-brand/10 flex items-center justify-center">
                    {firstImage ? (
                      <img
                        src={firstImage.download_url!}
                        alt={p.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Image className="w-6 h-6 text-brand-dark/40" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to={`/admin/prompts/${p.slug}`}
                          className="font-medium text-ink hover:text-brand-dark transition-colors"
                        >
                          {p.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {cat && (
                            <span className="chip bg-brand/10 text-brand-dark text-[11px] leading-none">
                              {cat.name}
                            </span>
                          )}
                          <span className={`chip text-[11px] leading-none ${
                            p.difficulty === 'Beginner' ? 'bg-success/10 text-success' :
                            p.difficulty === 'Intermediate' ? 'bg-warning/10 text-warning' :
                            'bg-danger/10 text-danger'
                          }`}>
                            {p.difficulty}
                          </span>
                          <span className="text-caption text-ink-soft flex items-center gap-1">
                            <Copy className="w-3 h-3" />
                            {p.popularity}
                          </span>
                        </div>
                        {p.description && (
                          <p className="text-sm text-ink-soft mt-1.5 line-clamp-1">{p.description}</p>
                        )}
                        {p.tags && p.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {p.tags.slice(0, 3).map((t) => (
                              <span key={t} className="inline-flex items-center gap-0.5 text-[11px] text-ink-soft/60">
                                <Tag className="w-2.5 h-2.5" />{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Link
                          to={`/admin/prompts/${p.slug}`}
                          className="p-2 rounded-lg hover:bg-brand/10 text-ink-soft hover:text-brand-dark transition-all"
                          title="View Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/edit/${p.id}`}
                          className="p-2 rounded-lg hover:bg-warning/10 text-ink-soft hover:text-warning transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-2 rounded-lg hover:bg-danger/10 text-ink-soft hover:text-danger transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-ink-soft">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-2 rounded-lg hover:bg-brand/10 text-ink-soft hover:text-brand-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (safePage <= 4) {
                pageNum = i + 1;
              } else if (safePage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = safePage - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                    pageNum === safePage
                      ? 'bg-gradient-to-br from-brand to-brand-dark text-white shadow-md'
                      : 'text-ink-soft hover:bg-brand/10 hover:text-brand-dark'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-2 rounded-lg hover:bg-brand/10 text-ink-soft hover:text-brand-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Delete Prompt</h3>
                <p className="text-sm text-ink-soft">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-ink-soft mb-6">
              Are you sure you want to delete this prompt? All associated data (media, outputs) will remain.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-ink-soft hover:bg-bg-surface/50 transition-all"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-danger hover:bg-danger/80 transition-all inline-flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
