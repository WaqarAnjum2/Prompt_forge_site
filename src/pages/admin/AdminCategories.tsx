import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Layers,
  Save,
  X,
} from 'lucide-react';
import { Loading, useAsync } from '../../components/Loading';
import { useToast } from '../../components/Toast';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../lib/services';
import type { Category } from '../../types';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminCategories() {
  const { data: categories, loading, error, refetch } = useAsync(fetchCategories, []);
  const { toast } = useToast();
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: 'Sparkles', color: 'brand', display_order: 0 });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', icon: 'Sparkles', color: 'brand', display_order: 0 });
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? '', icon: cat.icon, color: cat.color, display_order: cat.display_order });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description?.trim() || null,
        icon: form.icon,
        color: form.color,
        display_order: form.display_order,
      };
      if (editing) {
        await updateCategory(editing.id, payload);
        toast('Category updated successfully', 'success');
      } else {
        await createCategory(payload);
        toast('Category created successfully', 'success');
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      toast('Category deleted', 'success');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete', 'error');
    }
  };

  if (loading) return <Loading label="Loading categories" />;
  if (error) return <div className="text-center py-20 text-danger">Error: {error}</div>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-dark mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <h1 className="text-h1 font-display font-bold flex items-center gap-3">
            <Layers className="w-8 h-8 text-brand-dark" /> Manage Categories
          </h1>
          <p className="text-ink-soft mt-2">Create, edit, and organize prompt categories</p>
        </div>
        <button onClick={openNew} className="pill-btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand/10 text-left text-ink-soft">
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Slug</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Icon</th>
              <th className="px-6 py-4 font-medium">Order</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(categories ?? []).map((cat) => (
              <tr key={cat.id} className="border-b border-brand/5 hover:bg-surface/30 transition-colors">
                <td className="px-6 py-4 font-medium">{cat.name}</td>
                <td className="px-6 py-4 text-ink-soft font-mono">{cat.slug}</td>
                <td className="px-6 py-4 text-ink-soft hidden md:table-cell">{cat.icon}</td>
                <td className="px-6 py-4 text-ink-soft">{cat.display_order}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-brand/15 text-ink-soft hover:text-brand-dark transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(cat)} className="p-2 rounded-lg hover:bg-danger/15 text-ink-soft hover:text-danger transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-3xl p-8 max-w-lg w-full mx-6 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-bold">{editing ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-surface/50"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} className="input-field font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Icon (Lucide name)</label>
                  <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field" placeholder="Sparkles" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Display Order</label>
                  <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} className="input-field" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="pill-btn-primary flex-1"><Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="pill-btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteTarget(null)}>
          <div className="glass-strong rounded-3xl p-8 max-w-sm w-full mx-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-danger/15 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-danger" /></div>
            <h3 className="text-lg font-display font-bold text-center mb-2">Delete "{deleteTarget.name}"?</h3>
            <p className="text-sm text-ink-soft text-center mb-6">Prompts in this category will be uncategorized. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="pill-btn-ghost flex-1 text-sm">Cancel</button>
              <button onClick={handleDelete} className="pill-btn flex-1 text-sm bg-danger text-white hover:bg-danger/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
