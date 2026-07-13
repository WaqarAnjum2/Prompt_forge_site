import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  Tag,
  TrendingUp,
  Eye,
  User,
  Clock,
  Cpu,
  Sparkles,
  Zap,
  Image,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Loading } from '../../components/Loading';
import { useToast } from '../../components/Toast';
import ImageViewerModal from '../../components/ImageViewerModal';
import { fetchPromptBySlug, fetchPromptMedia, deletePrompt, incrementPopularity, trackEvent } from '../../lib/services';
import { extractVariables, fillTemplate } from '../../lib/variableEngine';
import type { PromptMedia } from '../../types';

export default function AdminPromptDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [media, setMedia] = useState<PromptMedia[]>([]);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tracked, setTracked] = useState(false);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const p = await fetchPromptBySlug(slug);
      if (!p) { setError('Prompt not found'); return; }
      setPrompt(p);
      if (p.id) {
        fetchPromptMedia(p.id).then(setMedia).catch(() => {});
      }
    } catch (err) {
      setError('Failed to load prompt');
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (prompt && !tracked) {
      trackEvent(prompt.id, 'view');
      setTracked(true);
    }
  }, [prompt, tracked]);

  const variables = useMemo(
    () => (prompt ? extractVariables(prompt.content) : []),
    [prompt]
  );

  const filled = useMemo(
    () => (prompt ? fillTemplate(prompt.content, values) : ''),
    [prompt, values]
  );

  const firstImage = media.find((m) => !m.is_output && m.download_url);
  const allImages = media.filter((m) => !m.is_output && m.download_url);

  const handleCopy = () => {
    navigator.clipboard.writeText(filled);
    setCopied(true);
    if (prompt) incrementPopularity(prompt.id);
    toast('Prompt copied', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDelete = async () => {
    if (!prompt) return;
    setDeleting(true);
    try {
      await deletePrompt(prompt.id);
      toast('Prompt deleted', 'success');
      navigate('/admin/prompts');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete', 'error');
    }
    setDeleting(false);
  };

  if (loading) return <Loading label="Loading prompt" />;
  if (error) return (
    <div className="text-center py-20">
      <p className="text-danger mb-4">{error}</p>
      <Link to="/admin/prompts" className="pill-btn-primary text-sm">Back to Prompts</Link>
    </div>
  );
  if (!prompt) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/admin/prompts" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-dark transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Prompts
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/edit/${prompt.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-warning/10 text-warning hover:bg-warning/20 transition-all"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </Link>
          <button
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-danger/10 text-danger hover:bg-danger/20 transition-all"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Image Hero */}
      {firstImage && (
        <button
          onClick={() => setViewerUrl(firstImage.download_url!)}
          className="w-full rounded-3xl overflow-hidden border border-brand/10 group relative"
        >
          <img
            src={firstImage.download_url!}
            alt={prompt.title}
            className="w-full h-64 md:h-80 object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-6">
            <span className="text-white text-sm font-medium bg-black/40 rounded-full px-3 py-1">Click to view full size</span>
          </div>
        </button>
      )}

      {/* Title & Meta */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {prompt.category && (
            <Link to={`/category/${prompt.category.slug}`} className="chip bg-brand/10 text-brand-dark hover:bg-brand/20">
              {prompt.category.name}
            </Link>
          )}
          {prompt.trending && (
            <span className="chip bg-danger/10 text-danger">
              <TrendingUp className="w-3 h-3" /> Trending
            </span>
          )}
          <span className={`chip ${
            prompt.difficulty === 'Beginner' ? 'bg-success/10 text-success' :
            prompt.difficulty === 'Intermediate' ? 'bg-warning/10 text-warning' :
            'bg-danger/10 text-danger'
          }`}>{prompt.difficulty}</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-ink mb-2">{prompt.title}</h1>
        <p className="text-ink-soft">{prompt.description}</p>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-4 text-sm text-ink-soft">
        <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{prompt.author}</span>
        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{new Date(prompt.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{prompt.popularity.toLocaleString()} uses</span>
        {prompt.model_compatibility?.length > 0 && (
          <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4" />{prompt.model_compatibility.join(', ')}</span>
        )}
      </div>

      {/* Variable Engine */}
      {variables.length > 0 && (
        <div className="glass-strong rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-brand-dark" />
            <h3 className="font-display font-semibold">Variable Engine</h3>
            <span className="chip bg-brand/10 text-brand-dark ml-auto">{variables.length} variables</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {variables.map((v) => (
              <div key={v.name}>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  {v.label} <code className="text-caption text-ink-soft ml-1.5 font-mono">{`{{${v.name}}}`}</code>
                </label>
                <input type="text" value={values[v.name] ?? ''} onChange={(e) => setValues({ ...values, [v.name]: e.target.value })} placeholder={`Enter ${v.label.toLowerCase()}…`} className="input-field" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompt Preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-dark" /> Prompt Preview
          </h3>
          <button onClick={handleCopy} className={`pill-btn text-sm ${copied ? 'bg-success text-white' : 'pill-btn-primary'}`}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="glass-strong rounded-3xl p-6">
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-ink">{filled}</pre>
        </div>
      </div>

      {/* Output Images */}
      {allImages.length > 1 && (
        <div>
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
            <Image className="w-5 h-5 text-brand-dark" /> Output Images ({allImages.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {allImages.map((img) => (
              <button key={img.id} onClick={() => setViewerUrl(img.download_url!)} className="relative group rounded-2xl overflow-hidden border border-brand/10 hover:border-brand/30 transition-all aspect-[4/3]">
                <img src={img.download_url!} alt={img.file_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 rounded-full px-3 py-1 transition-opacity">View</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {prompt.tags?.length > 0 && (
        <div>
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
            <Tag className="w-5 h-5 text-brand-dark" /> Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {prompt.tags.map((tag: string) => (
              <span key={tag} className="chip bg-bg-surface/60 text-ink-soft"><Tag className="w-2.5 h-2.5" />{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Use Case */}
      {prompt.use_case && (
        <div className="glass rounded-3xl p-6">
          <h3 className="font-display font-semibold mb-2">Use Case</h3>
          <p className="text-sm text-ink-soft leading-relaxed">{prompt.use_case}</p>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewerUrl && (
        <ImageViewerModal url={viewerUrl} title={prompt.title} onClose={() => setViewerUrl(null)} />
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Delete Prompt</h3>
                <p className="text-sm text-ink-soft">This cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-ink-soft mb-6">Permanently delete "{prompt.title}"?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-ink-soft hover:bg-bg-surface/50 transition-all" disabled={deleting}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-danger hover:bg-danger/80 transition-all inline-flex items-center gap-2">
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
