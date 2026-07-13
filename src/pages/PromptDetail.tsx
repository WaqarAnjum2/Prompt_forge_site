import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
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
  ChevronRight,
  Share2,
  Sparkles,
  Zap,
  Image,
} from 'lucide-react';
import { Loading, useAsync } from '../components/Loading';
import { useToast } from '../components/Toast';
import PromptCard from '../components/PromptCard';
import ImageViewerModal from '../components/ImageViewerModal';
import { fetchPromptBySlug, fetchPrompts, fetchPromptMedia, incrementPopularity, trackEvent } from '../lib/services';
import { extractVariables, fillTemplate } from '../lib/variableEngine';

export default function PromptDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { data: prompt, loading, error } = useAsync(
    () => fetchPromptBySlug(slug!),
    [slug]
  );

  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [tracked, setTracked] = useState(false);
  const [images, setImages] = useState<{ id: string; url: string; fileName: string }[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!prompt) return;
    fetchPromptMedia(prompt.id).then((media) => {
      setImages(
        media
          .filter((m) => !m.is_output && m.download_url)
          .map((m) => ({ id: m.id, url: m.download_url!, fileName: m.file_name }))
      );
      setImagesLoaded(true);
    }).catch(() => setImagesLoaded(true));
  }, [prompt]);

  const variables = useMemo(
    () => (prompt ? extractVariables(prompt.content) : []),
    [prompt]
  );

  const filled = useMemo(
    () => (prompt ? fillTemplate(prompt.content, values) : ''),
    [prompt, values]
  );

  useEffect(() => {
    if (prompt && !tracked) {
      trackEvent(prompt.id, 'view');
      setTracked(true);
    }
  }, [prompt, tracked]);

  if (loading) return <Loading label="Loading prompt" />;
  if (error) return <div className="mx-auto max-w-4xl px-6 py-20 text-center text-danger">Error: {error}</div>;
  if (!prompt) return (
    <div className="mx-auto max-w-4xl px-6 py-20 text-center">
      <p className="text-ink-soft mb-4">Prompt not found.</p>
      <Link to="/" className="pill-btn-primary">Back to Home</Link>
    </div>
  );

  const handleCopy = async () => {
    navigator.clipboard.writeText(filled);
    setCopied(true);
    incrementPopularity(prompt.id);
    trackEvent(prompt.id, 'copy');
    toast('Prompt copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: prompt.title, url });
        return;
      } catch {
        // user cancelled
      }
    }
    navigator.clipboard.writeText(url);
    setShared(true);
    trackEvent(prompt.id, 'share');
    toast('Link copied to clipboard', 'success');
    setTimeout(() => setShared(false), 2500);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-ink-soft mb-8">
        <Link to="/" className="hover:text-brand-dark transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {prompt.category && (
          <>
            <Link to={`/category/${prompt.category.slug}`} className="hover:text-brand-dark transition-colors">
              {prompt.category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-ink font-medium truncate">{prompt.title}</span>
      </nav>

      <Link
        to={prompt.category ? `/category/${prompt.category.slug}` : '/categories'}
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-dark mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {prompt.category ? `All ${prompt.category.name} prompts` : 'All prompts'}
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {prompt.category && (
                <Link to={`/category/${prompt.category.slug}`} className="chip bg-brand/10 text-brand-dark hover:bg-brand/20">
                  {prompt.category.name}
                </Link>
              )}
              {prompt.trending && (
                <span className="chip bg-danger/10 text-danger">
                  <TrendingUp className="w-3 h-3" />
                  Trending
                </span>
              )}
              <span className="chip bg-bg-surface/60 text-ink-soft">{prompt.difficulty}</span>
            </div>
            <h1 className="text-h1 font-display font-bold mb-3">{prompt.title}</h1>
            <p className="text-lg text-ink-soft leading-relaxed">{prompt.description}</p>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-ink-soft">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {prompt.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {new Date(prompt.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {prompt.popularity.toLocaleString()} uses
            </span>
            {prompt.model_compatibility.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                {prompt.model_compatibility.join(', ')}
              </span>
            )}
          </div>

          {/* Variable Engine */}
          {variables.length > 0 && (
            <div className="glass-strong rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-brand-dark" />
                <h3 className="font-display font-semibold">Variable Engine</h3>
                <span className="chip bg-brand/10 text-brand-dark ml-auto">
                  {variables.length} variables detected
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {variables.map((v) => (
                  <div key={v.name}>
                    <label className="block text-sm font-medium text-ink mb-1.5">
                      {v.label}
                      <code className="text-caption text-ink-soft ml-1.5 font-mono">{`{{${v.name}}}`}</code>
                    </label>
                    <input
                      type="text"
                      value={values[v.name] ?? ''}
                      onChange={(e) => setValues({ ...values, [v.name]: e.target.value })}
                      placeholder={`Enter ${v.label.toLowerCase()}…`}
                      className="input-field"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-dark" />
                Prompt Preview
              </h3>
              <button
                onClick={handleCopy}
                className={`pill-btn text-sm ${copied ? 'bg-success text-white' : 'pill-btn-primary'}`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Prompt'}
              </button>
            </div>
            <div className="glass-strong rounded-3xl p-6">
              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-ink">
                {filled}
              </pre>
            </div>
          </div>

          {/* Tags */}
          {prompt.tags.length > 0 && (
            <div>
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-dark" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    className="chip bg-bg-surface/60 text-ink-soft hover:bg-brand/15 hover:text-brand-dark transition-all"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Image Output */}
          {imagesLoaded && images.length > 0 && (
            <div>
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Image className="w-5 h-5 text-brand-dark" />
                Output Images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.slice(0, 3).map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setViewerUrl(img.url)}
                    className="relative group rounded-2xl overflow-hidden border border-brand/10 hover:border-brand/30 transition-all aspect-[4/3]"
                  >
                    <img
                      src={img.url}
                      alt={img.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 rounded-full px-3 py-1 transition-opacity">
                        View Output
                      </span>
                    </div>
                  </button>
                ))}
                {images.length > 3 && (
                  <button
                    onClick={() => setViewerUrl(images[3]?.url ?? null)}
                    className="glass rounded-2xl flex items-center justify-center text-ink-soft hover:text-brand-dark transition-colors aspect-[4/3]"
                  >
                    <span className="text-sm font-medium">+{images.length - 3} more</span>
                  </button>
                )}
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 sticky top-24">
            <h3 className="font-display font-semibold mb-4">Quick Actions</h3>
            <button
              onClick={handleCopy}
              className={`pill-btn w-full mb-3 ${copied ? 'bg-success text-white' : 'pill-btn-primary'}`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied to clipboard!' : 'Copy this prompt'}
            </button>
            <button
              onClick={handleShare}
              className={`pill-btn w-full mb-3 ${shared ? 'bg-success text-white' : 'pill-btn-ghost'}`}
            >
              {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {shared ? 'Link copied!' : 'Share prompt'}
            </button>
            <div className="text-caption text-ink-soft text-center">
              {prompt.popularity.toLocaleString()} people have used this prompt
            </div>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {viewerUrl && (
        <ImageViewerModal
          url={viewerUrl}
          title={prompt.title}
          onClose={() => setViewerUrl(null)}
        />
      )}

      {/* Related Prompts */}
      <RelatedPrompts promptId={prompt.id} categoryId={prompt.category_id} />
    </div>
  );
}

function RelatedPrompts({ promptId, categoryId }: { promptId: string; categoryId: string | null }) {
  const { data: related, loading } = useAsync(
    () => (categoryId ? fetchPrompts({ categoryId, limit: 3, orderBy: 'popularity' }) : Promise.resolve([])),
    [categoryId, promptId]
  );

  if (loading || !related || related.length === 0) return null;

  const filtered = related.filter((p) => p.id !== promptId).slice(0, 3);
  if (filtered.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-h3 font-display font-bold mb-6">Related Prompts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <PromptCard key={p.id} prompt={p} />
        ))}
      </div>
    </div>
  );
}
