import { Shield } from 'lucide-react';

export default function Privacy() {
  const sections = [
    { title: 'Information We Collect', body: 'We collect information you provide directly to us, such as your name, email address, and company when you create an account or contact us. We also automatically collect usage data, including prompts viewed, copied, and search queries, to improve our service.' },
    { title: 'How We Use Your Information', body: 'We use your information to provide and maintain the PromptForge platform, communicate with you about updates and security alerts, analyze usage patterns to improve prompt recommendations, and detect and prevent fraud or abuse.' },
    { title: 'Data Storage and Security', body: 'Your data is stored using Supabase infrastructure with row-level security policies. We use industry-standard encryption (TLS 1.3 in transit, AES-256 at rest). Access is restricted to authorized personnel with multi-factor authentication.' },
    { title: 'Cookies and Tracking', body: 'We use essential cookies for authentication and session management. We do not use third-party advertising cookies. Analytics cookies are optional and can be disabled in your account settings.' },
    { title: 'Data Retention', body: 'We retain account data for as long as your account is active. Prompt usage data is retained for 90 days. You may request deletion of your data at any time, and we will process the request within 30 days.' },
    { title: 'Your Rights', body: 'You have the right to access, correct, export, or delete your personal data. To exercise these rights, contact privacy@promptforge.io. EU users have additional rights under GDPR including data portability and the right to be forgotten.' },
    { title: 'Third-Party Services', body: 'We integrate with Supabase for data storage and authentication. These providers process data under GDPR-compliant Data Processing Agreements. We do not sell or share your data with any third parties for advertising purposes.' },
    { title: 'Changes to This Policy', body: 'We may update this policy from time to time. We will notify you of material changes via email at least 30 days before they take effect. The effective date below indicates the last revision.' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 chip bg-brand/10 text-brand-dark mb-4">
          <Shield className="w-3.5 h-3.5" /> Your privacy matters
        </div>
        <h1 className="text-h1 font-display font-bold mb-3">Privacy Policy</h1>
        <p className="text-ink-soft">Last updated: January 2026</p>
      </div>
      <div className="glass-strong rounded-3xl p-8 md:p-10 space-y-8">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display font-bold text-lg mb-2">{i + 1}. {s.title}</h2>
            <p className="text-ink-soft leading-relaxed text-sm">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
