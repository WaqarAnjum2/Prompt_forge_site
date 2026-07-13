import { supabase } from './supabase';
import type { Category, Prompt, Testimonial, AnalyticsEvent, PromptMedia, PromptOutput } from '../types';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchPrompts(opts?: {
  categorySlug?: string;
  categoryId?: string;
  featured?: boolean;
  trending?: boolean;
  search?: string;
  limit?: number;
  orderBy?: 'popularity' | 'created_at';
  tag?: string;
  difficulty?: string;
}): Promise<Prompt[]> {
  let query = supabase.from('prompts').select('*, category:categories(*), media:prompt_media!prompt_id(file_name, download_url, mime_type)');

  if (opts?.categorySlug) {
    query = query.eq('category.slug', opts.categorySlug);
  } else if (opts?.categoryId) {
    query = query.eq('category_id', opts.categoryId);
  }

  if (opts?.featured) query = query.eq('featured', true);
  if (opts?.trending) query = query.eq('trending', true);
  if (opts?.tag) query = query.contains('tags', [opts.tag]);
  if (opts?.difficulty) query = query.eq('difficulty', opts.difficulty);

  if (opts?.search) {
    const s = opts.search.trim();
    query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%,tags.cs.{${s}}`);
  }

  const order = opts?.orderBy ?? 'popularity';
  query = query.order(order, { ascending: false });

  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchPromptBySlug(slug: string): Promise<Prompt | null> {
  const { data, error } = await supabase
    .from('prompts')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchPromptById(id: string): Promise<Prompt | null> {
  const { data, error } = await supabase
    .from('prompts')
    .select('*, category:categories(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function trackEvent(promptId: string, eventType: 'view' | 'copy' | 'share'): Promise<void> {
  await supabase.from('analytics_events').insert({ prompt_id: promptId, event_type: eventType });
}

export async function incrementPopularity(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_popularity', { prompt_id: id });
  if (error) {
    const { data } = await supabase.from('prompts').select('popularity').eq('id', id).maybeSingle();
    if (data) {
      await supabase.from('prompts').update({ popularity: data.popularity + 1 }).eq('id', id);
    }
  }
}

export async function fetchStats(): Promise<{
  promptCount: number;
  categoryCount: number;
  totalCopies: number;
}> {
  const [countRes, sumRes, categoriesRes] = await Promise.all([
    supabase.from('prompts').select('*', { count: 'exact', head: true }),
    supabase.from('prompts').select('popularity'),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
  ]);

  return {
    promptCount: countRes.count ?? 0,
    totalCopies: (sumRes.data ?? []).reduce((sum, p) => sum + p.popularity, 0),
    categoryCount: categoriesRes.count ?? 0,
  };
}

export async function fetchAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(input: { name: string; slug: string; description?: string | null; icon?: string; color?: string; display_order?: number }): Promise<Category> {
  const error = validateCategoryInput(input);
  if (error) throw new Error(error);
  const { data, error: dbError } = await supabase.from('categories').insert(input).select().single();
  if (dbError) {
    if (dbError.code === '23505') throw new Error('A category with this slug already exists');
    throw dbError;
  }
  return data;
}

export async function updateCategory(id: string, input: { name?: string; slug?: string; description?: string | null; icon?: string; color?: string; display_order?: number }): Promise<Category> {
  if (input.name || input.slug) {
    const err = validateCategoryInput({ name: input.name ?? '', slug: input.slug });
    if (err) throw new Error(err);
  }
  const { data, error: dbError } = await supabase
    .from('categories')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (dbError) {
    if (dbError.code === 'PGRST116') throw new Error('Category not found or permission denied');
    if (dbError.code === '23505') throw new Error('A category with this slug already exists');
    throw dbError;
  }
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) {
    if (error.code === 'PGRST116') throw new Error('Category not found or permission denied');
    throw error;
  }
}

function validateSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

function validatePromptInput(prompt: Partial<Prompt>): string | null {
  if (!prompt.title?.trim() || prompt.title.trim().length < 3) return 'Title must be at least 3 characters';
  if (prompt.title.trim().length > 200) return 'Title must be under 200 characters';
  if (!prompt.content?.trim() || prompt.content.trim().length < 20) return 'Prompt body must be at least 20 characters';
  if (prompt.slug && !validateSlug(prompt.slug)) return 'Invalid slug format';
  if (prompt.author && prompt.author.trim().length > 100) return 'Author must be under 100 characters';
  if (prompt.tags && prompt.tags.length > 20) return 'Maximum 20 tags allowed';
  if (prompt.model_compatibility && prompt.model_compatibility.length > 20) return 'Maximum 20 models allowed';
  if (prompt.use_case && prompt.use_case.length > 300) return 'Use case must be under 300 characters';
  if (prompt.description && prompt.description.length > 500) return 'Description must be under 500 characters';
  if (prompt.difficulty && !['Beginner', 'Intermediate', 'Advanced'].includes(prompt.difficulty)) {
    return 'Difficulty must be Beginner, Intermediate, or Advanced';
  }
  return null;
}

function validateCategoryInput(input: { name: string; slug?: string }): string | null {
  if (!input.name?.trim() || input.name.trim().length < 2) return 'Category name must be at least 2 characters';
  if (input.name.trim().length > 100) return 'Category name must be under 100 characters';
  if (input.slug && !validateSlug(input.slug)) return 'Invalid slug format';
  return null;
}

export async function createPrompt(prompt: Partial<Prompt>): Promise<Prompt> {
  const validationError = validatePromptInput(prompt);
  if (validationError) throw new Error(validationError);
  const { data, error } = await supabase.from('prompts').insert(prompt).select().single();
  if (error) {
    if (error.code === '23505') throw new Error('A prompt with this slug already exists');
    if (error.code === '23503') throw new Error('Referenced category does not exist');
    throw error;
  }
  return data;
}

export async function updatePrompt(id: string, updates: Partial<Prompt>): Promise<Prompt> {
  const validationError = validatePromptInput(updates);
  if (validationError) throw new Error(validationError);
  const { data, error } = await supabase
    .from('prompts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') throw new Error('Prompt not found or permission denied');
    if (error.code === '23505') throw new Error('A prompt with this slug already exists');
    throw error;
  }
  return data;
}

export async function deletePrompt(id: string): Promise<void> {
  const { error } = await supabase.from('prompts').delete().eq('id', id);
  if (error) {
    if (error.code === 'PGRST116') throw new Error('Prompt not found or permission denied');
    throw error;
  }
}

// ─── Prompt Media ──────────────────────────────────────────────

export async function fetchPromptMedia(promptId: string): Promise<PromptMedia[]> {
  const { data, error } = await supabase
    .from('prompt_media')
    .select('*')
    .eq('prompt_id', promptId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createPromptMedia(record: {
  prompt_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  github_sha: string;
  download_url: string;
  is_output?: boolean;
}): Promise<PromptMedia> {
  const { data, error } = await supabase.from('prompt_media').insert(record).select().single();
  if (error) throw error;
  return data;
}

export async function deletePromptMedia(id: string): Promise<void> {
  const { error } = await supabase.from('prompt_media').delete().eq('id', id);
  if (error) throw error;
}

// ─── Prompt Outputs ────────────────────────────────────────────

export async function fetchPromptOutputs(opts?: {
  promptId?: string;
  categoryId?: string;
  search?: string;
  limit?: number;
}): Promise<(PromptOutput & { prompt?: { title: string; slug: string; category?: { name: string; slug: string } } | null })[]> {
  let query = supabase
    .from('prompt_outputs')
    .select('*, prompt:prompts!prompt_id(title, slug, category:categories!category_id(name, slug))')
    .order('created_at', { ascending: false });

  if (opts?.promptId) query = query.eq('prompt_id', opts.promptId);
  if (opts?.categoryId) query = query.eq('prompt.category.slug', opts.categoryId);
  if (opts?.search) {
    const s = opts.search.trim();
    query = query.or(`title.ilike.%${s}%,content.ilike.%${s}%`);
  }
  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createPromptOutput(record: {
  prompt_id?: string | null;
  title?: string;
  content: string;
  media_ids?: string[];
  session_id?: string;
}): Promise<PromptOutput> {
  const { data, error } = await supabase.from('prompt_outputs').insert({
    prompt_id: record.prompt_id ?? null,
    title: record.title ?? '',
    content: record.content,
    media_ids: record.media_ids ?? [],
    session_id: record.session_id ?? null,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function deletePromptOutput(id: string): Promise<void> {
  const { error } = await supabase.from('prompt_outputs').delete().eq('id', id);
  if (error) throw error;
}

// ─── Settings ──────────────────────────────────────────────────

export async function fetchSettings(): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.from('settings').select('key, value');
  if (error) throw error;
  const result: Record<string, unknown> = {};
  (data ?? []).forEach((row: { key: string; value: unknown }) => {
    result[row.key] = row.value;
  });
  return result;
}

export async function fetchSetting(key: string): Promise<unknown> {
  const { data, error } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();
  if (error) throw error;
  return data?.value ?? null;
}

export async function upsertSetting(key: string, value: unknown, adminId?: string): Promise<void> {
  const { error } = await supabase.from('settings').upsert(
    { key, value, updated_by: adminId ?? null, updated_at: new Date().toISOString() },
    { onConflict: 'key' }
  );
  if (error) throw error;
}

export async function deleteSetting(key: string): Promise<void> {
  const { error } = await supabase.from('settings').delete().eq('key', key);
  if (error) throw error;
}
