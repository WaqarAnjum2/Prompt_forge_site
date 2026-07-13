import { FileText } from 'lucide-react';

export default function Terms() {
  const sections = [
    { title: 'Acceptance of Terms', body: 'By accessing or using PromptForge, you agree to be bound by these Terms and Conditions. If you do not agree, you may not access or use the platform. These terms apply to all visitors, users, and others who access the service.' },
    { title: 'Description of Service', body: 'PromptForge provides a curated library of AI prompt templates with a variable engine for customization. We offer both free and enterprise tiers. Features may be added, modified, or removed with reasonable notice to users.' },
    { title: 'Account Registration', body: 'To access certain features, you must register for an account. You agree to provide accurate, current information and to update it as needed. You are responsible for safeguarding your password and for all activities under your account.' },
    { title: 'Acceptable Use', body: 'You agree not to: (a) use the service for unlawful purposes, (b) upload or share harmful, offensive, or infringing content, (c) attempt to access data you are not authorized to access, (d) interfere with the proper functioning of the service, or (e) reverse engineer or redistribute prompts without attribution.' },
    { title: 'Intellectual Property', body: 'The PromptForge platform, including its design, code, and branding, is owned by PromptForge Inc. Prompts contributed by users remain the property of their respective authors. By publishing a prompt, you grant PromptForge a non-exclusive license to display and distribute it on the platform.' },
    { title: 'Prompt Licensing', body: 'Free-tier prompts are licensed under Creative Commons Attribution 4.0 (CC BY 4.0). Enterprise prompts are licensed under a commercial license included with the enterprise plan. You may use, modify, and share free prompts with attribution to the original author.' },
    { title: 'Limitation of Liability', body: 'PromptForge is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from the use of the platform. Our total liability shall not exceed the amount paid in the preceding 12 months.' },
    { title: 'Termination', body: 'We may suspend or terminate your access for violations of these Terms. You may close your account at any time. Upon termination, your data will be deleted within 30 days unless required to be retained by law.' },
    { title: 'Governing Law', body: 'These Terms are governed by the laws of the State of California, USA. Any disputes shall be resolved in the courts of San Francisco County, California.' },
    { title: 'Changes to Terms', body: 'We may update these Terms at any time. Material changes will be communicated via email at least 30 days before taking effect. Continued use after the effective date constitutes acceptance of the revised Terms.' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 chip bg-brand/10 text-brand-dark mb-4">
          <FileText className="w-3.5 h-3.5" /> Legal agreement
        </div>
        <h1 className="text-h1 font-display font-bold mb-3">Terms & Conditions</h1>
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
