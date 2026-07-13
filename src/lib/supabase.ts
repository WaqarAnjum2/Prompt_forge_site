import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function isServiceRoleKey(key: string): boolean {
  try {
    const payload = key.split('.')[1];
    if (!payload) return false;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.role === 'service_role';
  } catch {
    return false;
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '%c[PromptForge] Missing Supabase credentials!\n' +
    '%cCreate a .env file in the project root with:\n' +
    '  VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=your-anon-key\n\n' +
    'Auth and data features will not work until these are set.',
    'color: #EF4444; font-weight: bold; font-size: 14px;',
    'color: #F59E0B; font-size: 12px;'
  );
}

if (isServiceRoleKey(supabaseAnonKey)) {
  console.error(
    '%c[PromptForge] SECURITY RISK: Service role key detected in frontend!\n' +
    '%cYou are using a Supabase service_role key in the browser. This bypasses all RLS policies\n' +
    'and exposes your entire database to anyone who inspects the frontend code.\n\n' +
    'Use your anon/public key instead (found in Supabase Dashboard > Settings > API).\n' +
    'The anon key has `"role":"anon"` in its payload, while the service key has `"role":"service_role"`.\n\n' +
    'The app will continue, but DO NOT deploy this configuration.',
    'color: #EF4444; font-weight: bold; font-size: 16px;',
    'color: #EF4444; font-size: 13px;'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-app-name': 'promptforge',
    },
  },
});
