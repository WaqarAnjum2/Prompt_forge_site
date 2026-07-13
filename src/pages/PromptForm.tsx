import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Plus, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useAsync } from '../components/Loading';
import { useToast } from '../components/Toast';
import { useAuth } from '../lib/auth';
import {
  fetchCategories,
  fetchPromptById,
  fetchPromptMedia,
  createPrompt,
  updatePrompt,
} from '../lib/services';
import { extractVariables } from '../lib/variableEngine';
import ImageUpload from '../components/ImageUpload';
import type { Prompt, PromptMedia } from '../types';

interface PromptInput extends Partial<Prompt> {
  admin_id?: string;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function PromptForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEdit = !!id;

  const { data: categories } = useAsync(fetchCategories, []);
  const { data: existing } = useAsync(
    () => (id ? fetchPromptById(id) : Promise.resolve(null)),
    [id]
  );

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    category_id: '',
    tags: [] as string[],
    author: 'PromptForge Team',
    model_compatibility: [] as string[],
    use_case: '',
    difficulty: 'Beginner',
    trending: false,
    featured: false,
  });
  const [media, setMedia] = useState<PromptMedia[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: existingMedia } = useAsync(
    () => (id ? fetchPromptMedia(id) : Promise.resolve([])),
    [id]
  );

  useEffect(() => {
    if (existingMedia) setMedia(existingMedia);
  }, [existingMedia]);

  useEffect(() => {
    if (existing && isEdit) {
      setForm({
        title: existing.title,
        slug: existing.slug,
        description: existing.description ?? '',
        content: existing.content,
        category_id: existing.category_id ?? '',
        tags: existing.tags ?? [],
        author: existing.author,
        model_compatibility: existing.model_compatibility ?? [],
        use_case: existing.use_case ?? '',
        difficulty: existing.difficulty,
        trending: existing.trending,
        featured: existing.featured,
      });
    }
  }, [existing, isEdit]);

  const detectedVars = extractVariables(form.content);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    const trimmed = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      content: form.content.trim(),
    };
    if (!trimmed.title) newErrors.title = 'Title is required';
    else if (trimmed.title.length < 3) newErrors.title = 'Title must be at least 3 characters';
    else if (trimmed.title.length > 200) newErrors.title = 'Title must be under 200 characters';

    if (!trimmed.content) newErrors.content = 'Prompt body is required';
    else if (trimmed.content.length < 20) newErrors.content = 'Prompt body must be at least 20 characters';

    if (trimmed.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(trimmed.slug)) {
      newErrors.slug = 'Slug must be lowercase alphanumeric with hyphens only';
    }
    if (form.author.trim().length > 100) newErrors.author = 'Author name must be under 100 characters';
    if (form.tags.length > 20) newErrors.tags = 'Maximum 20 tags allowed';
    if (form.model_compatibility.length > 20) newErrors.model_compatibility = 'Maximum 20 models allowed';
    if (form.use_case && form.use_case.length > 300) newErrors.use_case = 'Use case must be under 300 characters';
    if (form.description && form.description.length > 500) newErrors.description = 'Description must be under 500 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast('Please fix the errors in the form.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: PromptInput = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        description: form.description?.trim() || null,
        content: form.content.trim(),
        category_id: form.category_id || null,
        tags: form.tags,
        author: form.author.trim(),
        model_compatibility: form.model_compatibility,
        use_case: form.use_case?.trim() || null,
        difficulty: form.difficulty,
        trending: form.trending,
        featured: form.featured,
        admin_id: user?.id,
      };
      if (isEdit && id) {
        await updatePrompt(id, payload);
        toast('Prompt updated successfully', 'success');
      } else {
        await createPrompt(payload);
        toast('Prompt created successfully', 'success');
      }
      navigate('/admin');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm({ ...form, tags: [...form.tags, t] });
    }
    setTagInput('');
  };

  const addModel = () => {
    const m = modelInput.trim();
    if (m && !form.model_compatibility.includes(m)) {
      setForm({ ...form, model_compatibility: [...form.model_compatibility, m] });
    }
    setModelInput('');
  };

  const InputError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-1.5 mt-1.5 text-danger text-xs font-medium animate-fade-in">
        <AlertCircle className="w-3.5 h-3.5" />
        {error}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 md:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-dark mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <h1 className="text-h1 font-display font-bold flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-brand-dark" />
            {isEdit ? 'Edit Prompt' : 'New Prompt'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 glass-strong rounded-3xl p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-display font-semibold border-b border-brand/10 pb-3">Core Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) });
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              className={`input-field ${errors.title ? 'border-danger focus:ring-danger/30' : ''}`}
              placeholder="SEO Blog Post Generator"
            />
            <InputError error={errors.title} />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => {
                setForm({ ...form, slug: slugify(e.target.value) });
                if (errors.slug) setErrors({ ...errors, slug: '' });
              }}
              className={`input-field font-mono ${errors.slug ? 'border-danger focus:ring-danger/30' : ''}`}
              placeholder="seo-blog-post-generator"
            />
            <InputError error={errors.slug} />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Description *</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              className={`input-field resize-none ${errors.description ? 'border-danger focus:ring-danger/30' : ''}`}
              placeholder="Generate SEO-optimized blog posts with keyword targeting and meta descriptions."
            />
            <InputError error={errors.description} />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Prompt Body *
              <span className="text-caption text-ink-soft ml-2">
                Use {'{{variables}}'} for dynamic content
              </span>
            </label>
            <textarea
              rows={12}
              value={form.content}
              onChange={(e) => {
                setForm({ ...form, content: e.target.value });
                if (errors.content) setErrors({ ...errors, content: '' });
              }}
              className={`input-field font-mono text-xs resize-none ${errors.content ? 'border-danger focus:ring-danger/30' : ''}`}
              placeholder="You are a marketing expert. Write a Facebook ad for {{BusinessName}} targeting {{TargetAudience}}…"
            />
            <InputError error={errors.content} />
            {detectedVars.length > 0 && (
              <div className="mt-3 p-3 glass rounded-xl flex flex-col gap-2">
                <span className="text-caption text-ink-soft font-medium uppercase tracking-wider">Detected Variables:</span>
                <div className="flex flex-wrap gap-2">
                  {detectedVars.map((v) => (
                    <span key={v.name} className="chip bg-brand/10 text-brand-dark">
                      {`{{${v.name}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-brand/10">
            <label className="block text-sm font-medium text-ink mb-3 flex items-center gap-1.5">
              <ImageIcon className="w-5 h-5 text-brand-dark" />
              Images / Outputs
            </label>
            {id ? (
              <ImageUpload promptId={id} media={media} onMediaChange={setMedia} />
            ) : (
              <div className="glass rounded-2xl p-6 text-center">
                <p className="text-sm text-ink-soft font-medium">Save the prompt first to enable image uploads.</p>
              </div>
            )}
          </div>
        </div>

        {/* Side Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-strong rounded-3xl p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-display font-semibold border-b border-brand/10 pb-3">Metadata</h2>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="input-field"
              >
                <option value="">Uncategorized</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-ink mb-1.5">Author</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => {
                    setForm({ ...form, author: e.target.value });
                    if (errors.author) setErrors({ ...errors, author: '' });
                  }}
                  className={`input-field ${errors.author ? 'border-danger focus:ring-danger/30' : ''}`}
                />
                <InputError error={errors.author} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-ink mb-1.5">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="input-field"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Use Case</label>
              <input
                type="text"
                value={form.use_case}
                onChange={(e) => {
                  setForm({ ...form, use_case: e.target.value });
                  if (errors.use_case) setErrors({ ...errors, use_case: '' });
                }}
                className={`input-field ${errors.use_case ? 'border-danger focus:ring-danger/30' : ''}`}
                placeholder="Marketing teams running ad campaigns"
              />
              <InputError error={errors.use_case} />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  className="input-field"
                  placeholder="Add a tag…"
                />
                <button type="button" onClick={addTag} className="pill-btn-ghost text-sm shrink-0 px-3">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <InputError error={errors.tags} />
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="chip bg-brand/10 text-brand-dark">
                    {tag}
                    <button type="button" onClick={() => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Model Compatibility</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addModel(); } }}
                  className="input-field"
                  placeholder="Add a model…"
                />
                <button type="button" onClick={addModel} className="pill-btn-ghost text-sm shrink-0 px-3">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <InputError error={errors.model_compatibility} />
              <div className="flex flex-wrap gap-2">
                {form.model_compatibility.map((m) => (
                  <span key={m} className="chip bg-brand/10 text-brand-dark">
                    {m}
                    <button type="button" onClick={() => setForm({ ...form, model_compatibility: form.model_compatibility.filter((x) => x !== m) })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-brand/10 flex flex-col gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={form.trending}
                    onChange={(e) => setForm({ ...form, trending: e.target.checked })}
                    className="w-5 h-5 rounded-md border-brand/20 accent-brand focus:ring-brand/30 transition-all cursor-pointer peer"
                  />
                </div>
                <span className="text-sm font-medium text-ink group-hover:text-brand-dark transition-colors">Mark as Trending</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-5 h-5 rounded-md border-brand/20 accent-brand focus:ring-brand/30 transition-all cursor-pointer peer"
                  />
                </div>
                <span className="text-sm font-medium text-ink group-hover:text-brand-dark transition-colors">Mark as Featured</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={saving} className="pill-btn-primary flex-1 shadow-xl hover:shadow-brand/50">
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : isEdit ? 'Update Prompt' : 'Create Prompt'}
            </button>
            <Link to="/admin" className="pill-btn-ghost text-center">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
