import { useState } from 'react';
import { Mail, MessageSquare, Send, MapPin, Phone } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', company: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    toast('Message sent! We will get back to you within 24 hours.', 'success');
    setForm({ name: '', email: '', company: '', subject: '', message: '' });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 chip bg-brand/10 text-brand-dark mb-4">
          <MessageSquare className="w-3.5 h-3.5" />
          Get in touch
        </div>
        <h1 className="text-h1 font-display font-bold mb-3">Contact Us</h1>
        <p className="text-ink-soft max-w-xl mx-auto">
          Questions, feedback, or enterprise inquiries — our team is here to help.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-8 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Email *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="jane@company.com" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Company</label>
              <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input-field" placeholder="Acme Inc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Subject *</label>
              <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field" placeholder="Enterprise license inquiry" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Message *</label>
            <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field resize-none" placeholder="Tell us how we can help…" />
          </div>
          <button type="submit" disabled={sending} className="pill-btn-primary w-full">
            {sending ? 'Sending…' : (<><Send className="w-4 h-4" /> Send Message</>)}
          </button>
        </form>

        <div className="space-y-5">
          <div className="glass rounded-3xl p-6">
            <h3 className="font-display font-semibold mb-4">Contact Info</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-brand-dark" />
                </div>
                <div><p className="font-medium">Email</p><p className="text-ink-soft">hello@promptforge.io</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-brand-dark" />
                </div>
                <div><p className="font-medium">Phone</p><p className="text-ink-soft">+1 (555) 010-2024</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-brand-dark" />
                </div>
                <div><p className="font-medium">Office</p><p className="text-ink-soft">548 Market St, San Francisco, CA 94104</p></div>
              </div>
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <h3 className="font-display font-semibold mb-2">Response Time</h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              We typically respond within 24 hours during business days. Enterprise customers receive priority support with a 4-hour SLA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
