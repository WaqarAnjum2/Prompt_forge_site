import { useState, useEffect } from 'react';
import {
  Settings,
  Github,
  Search,
  Shield,
  Globe,
  Save,
  Key,
  Eye,
  EyeOff,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Loading } from '../../components/Loading';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../lib/auth';
import { fetchSettings, upsertSetting } from '../../lib/services';
import { supabase } from '../../lib/supabase';

type Tab = 'general' | 'github' | 'seo' | 'security';

interface GeneralSettings { siteName: string; tagline: string; description: string; supportEmail: string }
interface GithubSettings { repoUrl: string; apiKey: string; autoSync: boolean; webhookSecret: string }
interface SeoSettings { metaTitle: string; metaDescription: string; ogImage: string; twitterHandle: string; robotsIndex: boolean }
interface SecuritySettings { changePassword: boolean }

const defaultGeneral: GeneralSettings = { siteName: 'PromptForge', tagline: 'Enterprise Prompt Library', description: '', supportEmail: 'hello@promptforge.io' };
const defaultGithub: GithubSettings = { repoUrl: '', apiKey: '', autoSync: false, webhookSecret: '' };
const defaultSeo: SeoSettings = { metaTitle: 'PromptForge — Enterprise Prompt Library', metaDescription: '', ogImage: '', twitterHandle: '@promptforge', robotsIndex: true };
const defaultSecurity: SecuritySettings = { changePassword: true };

export default function AdminSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const [general, setGeneral] = useState<GeneralSettings>(defaultGeneral);
  const [github, setGithub] = useState<GithubSettings>(defaultGithub);
  const [seo, setSeo] = useState<SeoSettings>(defaultSeo);
  const [, setSecurity] = useState<SecuritySettings>(defaultSecurity);
  const [showGithubKey, setShowGithubKey] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);

  const [pwNewPassword, setPwNewPassword] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwChanging, setPwChanging] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then((settings) => {
        if (settings.general) setGeneral({ ...defaultGeneral, ...(settings.general as GeneralSettings) });
        if (settings.github) setGithub({ ...defaultGithub, ...(settings.github as GithubSettings) });
        if (settings.seo) setSeo({ ...defaultSeo, ...(settings.seo as SeoSettings) });
        if (settings.security) setSecurity({ ...defaultSecurity, ...(settings.security as SecuritySettings) });
      })
      .catch(() => toast('Failed to load settings', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const doSave = async (key: string, value: unknown) => {
    setSaving(key);
    try {
      await upsertSetting(key, value, user?.id);
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
      toast(`${key.charAt(0).toUpperCase() + key.slice(1)} settings saved`, 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save', 'error');
    } finally {
      setSaving(null);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwNewPassword.length < 8) { toast('Password must be at least 8 characters', 'error'); return; }
    if (pwNewPassword !== pwConfirm) { toast('Passwords do not match', 'error'); return; }
    setPwChanging(true);
    const { error } = await supabase.auth.updateUser({ password: pwNewPassword });
    setPwChanging(false);
    if (error) { toast(error.message, 'error'); return; }
    toast('Password updated successfully', 'success');
    setPwNewPassword('');
    setPwConfirm('');
  };

  if (loading) return <Loading label="Loading settings" />;

  const tabs: { id: Tab; label: string; icon: typeof Settings }[] = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'github', label: 'GitHub', icon: Github },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const btnClass = (t: Tab) =>
    `pill-btn text-sm whitespace-nowrap ${tab === t ? 'bg-brand text-white shadow-md shadow-brand/20' : 'glass text-ink-soft hover:text-ink'}`;

  const SaveButton = ({ sectionKey, data }: { sectionKey: string; data: unknown }) => (
    <button onClick={() => doSave(sectionKey, data)} disabled={saving === sectionKey} className="pill-btn-primary">
      {saving === sectionKey ? <RefreshCw className="w-4 h-4 animate-spin" /> : savedKey === sectionKey ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
      {saving === sectionKey ? 'Saving…' : savedKey === sectionKey ? 'Saved' : 'Save Changes'}
    </button>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-3">
          <Settings className="w-6 h-6 text-brand-dark" /> Settings
        </h1>
        <p className="text-sm text-ink-soft mt-1">Configure your PromptForge instance</p>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={btnClass(t.id)}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      <div className="bg-white/50 backdrop-blur rounded-2xl border border-white/40 p-6 lg:p-8">
        {tab === 'general' && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-display font-semibold flex items-center gap-2 mb-4"><Globe className="w-5 h-5 text-brand-dark" /> General Settings</h3>
            <div><label className="block text-sm font-medium text-ink mb-1.5">Site Name</label><input type="text" value={general.siteName} onChange={(e) => setGeneral({ ...general, siteName: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-ink mb-1.5">Tagline</label><input type="text" value={general.tagline} onChange={(e) => setGeneral({ ...general, tagline: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-ink mb-1.5">Description</label><textarea rows={3} value={general.description} onChange={(e) => setGeneral({ ...general, description: e.target.value })} className="input-field resize-none" /></div>
            <div><label className="block text-sm font-medium text-ink mb-1.5">Support Email</label><input type="email" value={general.supportEmail} onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })} className="input-field" /></div>
            <SaveButton sectionKey="general" data={general} />
          </div>
        )}

        {tab === 'github' && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-display font-semibold flex items-center gap-2 mb-4"><Github className="w-5 h-5 text-brand-dark" /> GitHub Integration</h3>
            <p className="text-sm text-ink-soft mb-2">Configure the GitHub repository for storing prompt images and outputs.</p>
            <div><label className="block text-sm font-medium text-ink mb-1.5">Repository (owner/repo)</label>
              <input type="text" value={github.repoUrl} onChange={(e) => setGithub({ ...github, repoUrl: e.target.value })} className="input-field font-mono" placeholder="myself20771/promptforge-assets" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">API Token</label>
              <div className="relative">
                <input type={showGithubKey ? 'text' : 'password'} value={github.apiKey} onChange={(e) => setGithub({ ...github, apiKey: e.target.value })} className="input-field pr-10 font-mono" placeholder="ghp_••••••••••••••••" />
                <button type="button" onClick={() => setShowGithubKey(!showGithubKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft">{showGithubKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Webhook Secret</label>
              <div className="relative">
                <input type={showWebhook ? 'text' : 'password'} value={github.webhookSecret} onChange={(e) => setGithub({ ...github, webhookSecret: e.target.value })} className="input-field pr-10 font-mono" placeholder="••••••••••••" />
                <button type="button" onClick={() => setShowWebhook(!showWebhook)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft">{showWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={github.autoSync} onChange={(e) => setGithub({ ...github, autoSync: e.target.checked })} className="w-4 h-4 rounded accent-brand" />
              <span className="text-sm font-medium">Auto-sync prompts from repository</span>
            </label>
            <SaveButton sectionKey="github" data={github} />
          </div>
        )}

        {tab === 'seo' && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-display font-semibold flex items-center gap-2 mb-4"><Search className="w-5 h-5 text-brand-dark" /> SEO Settings</h3>
            <div><label className="block text-sm font-medium text-ink mb-1.5">Meta Title</label><input type="text" value={seo.metaTitle} onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })} className="input-field" /><p className="text-caption text-ink-soft mt-1">{seo.metaTitle.length}/60</p></div>
            <div><label className="block text-sm font-medium text-ink mb-1.5">Meta Description</label><textarea rows={2} value={seo.metaDescription} onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })} className="input-field resize-none" /><p className="text-caption text-ink-soft mt-1">{seo.metaDescription.length}/160</p></div>
            <div><label className="block text-sm font-medium text-ink mb-1.5">OG Image URL</label><input type="text" value={seo.ogImage} onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-ink mb-1.5">Twitter Handle</label><input type="text" value={seo.twitterHandle} onChange={(e) => setSeo({ ...seo, twitterHandle: e.target.value })} className="input-field" /></div>
            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={seo.robotsIndex} onChange={(e) => setSeo({ ...seo, robotsIndex: e.target.checked })} className="w-4 h-4 rounded accent-brand" /><span className="text-sm font-medium">Allow search engines to index</span></label>
            <SaveButton sectionKey="seo" data={seo} />
          </div>
        )}

        {tab === 'security' && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-display font-semibold flex items-center gap-2 mb-4"><Shield className="w-5 h-5 text-brand-dark" /> Security Settings</h3>
            <div className="bg-white/40 rounded-xl p-5 border border-brand/10">
              <h4 className="font-medium text-sm flex items-center gap-2 mb-4"><Key className="w-4 h-4 text-brand-dark" /> Change Password</h4>
              <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
                <div><label className="block text-xs font-medium text-ink-soft mb-1">New Password</label><input type="password" required minLength={8} value={pwNewPassword} onChange={(e) => setPwNewPassword(e.target.value)} className="input-field" placeholder="Min 8 characters" /></div>
                <div><label className="block text-xs font-medium text-ink-soft mb-1">Confirm</label><input type="password" required minLength={8} value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} className="input-field" placeholder="Re-enter new password" /></div>
                <button type="submit" disabled={pwChanging} className="pill-btn-primary text-sm">
                  {pwChanging ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
