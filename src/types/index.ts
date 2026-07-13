export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  display_order: number;
  created_at: string;
  updated_at?: string;
}

export interface Prompt {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  category_id: string | null;
  tags: string[];
  author: string;
  model_compatibility: string[];
  use_case: string | null;
  difficulty: string;
  popularity: number;
  trending: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  status?: 'draft' | 'published' | 'archived';
  deleted_at?: string | null;
  view_count?: number;
  copy_count?: number;
  favorite_count?: number;
  share_count?: number;
  trending_score?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number;
  avatar_url: string | null;
  created_at: string;
}

export interface PromptVariable {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'number';
  options?: string[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}

export interface AnalyticsEvent {
  id: string;
  prompt_id: string | null;
  event_type: 'view' | 'copy' | 'favorite' | 'share' | 'search' | 'generation' | 'click';
  created_at: string;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  referrer?: string;
  duration_ms?: number;
}

export interface SeoMetadata {
  id: string;
  prompt_id: string;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_card: string | null;
  canonical_url: string | null;
  json_ld: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  email?: string;
  created_at: string;
}

export interface PromptMedia {
  id: string;
  prompt_id: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  github_sha: string;
  download_url: string | null;
  html_url: string | null;
  is_output: boolean;
  created_at: string;
}

export interface PromptOutput {
  id: string;
  prompt_id: string | null;
  title: string;
  content: string;
  media_ids: string[];
  session_id: string | null;
  created_at: string;
}

export interface AuthState {
  user: import('@supabase/supabase-js').User | null;
  session: import('@supabase/supabase-js').Session | null;
  loading: boolean;
  isAdmin: boolean;
}
