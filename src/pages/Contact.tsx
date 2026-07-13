import { Mail, MessageSquare, MapPin, Phone } from 'lucide-react';

export default function Contact() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 cyber-chip cyber-chamfer-sm mb-4">
          <MessageSquare className="w-3.5 h-3.5" />
          GET IN TOUCH
        </div>
        <h1 className="text-4xl md:text-5xl font-cyber font-black mb-4 uppercase tracking-widest text-cyber-fg">
          Contact <span className="text-neon">Us</span>
        </h1>
        <p className="text-sm text-cyber-fg-soft max-w-xl mx-auto font-mono tracking-wide">
          Questions, feedback, or enterprise inquiries — our team is here to help.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="cyber-card cyber-chamfer p-8 space-y-6">
          <h3 className="font-cyber font-bold text-sm uppercase tracking-wider text-cyber-fg border-b border-cyber-border pb-3">Contact Info</h3>
          <div className="space-y-6 text-sm">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 border border-cyber-accent/30 flex items-center justify-center shrink-0 cyber-chamfer group-hover:border-cyber-accent group-hover:shadow-[0_0_10px_#00ff8840] transition-all">
                <Mail className="w-5 h-5 text-cyber-accent" />
              </div>
              <div>
                <p className="font-cyber font-bold text-xs uppercase tracking-wider text-cyber-fg-soft">Email</p>
                <p className="text-sm font-mono text-cyber-fg">hello@promptforge.io</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 border border-cyber-accent/30 flex items-center justify-center shrink-0 cyber-chamfer group-hover:border-cyber-accent group-hover:shadow-[0_0_10px_#00ff8840] transition-all">
                <Phone className="w-5 h-5 text-cyber-accent" />
              </div>
              <div>
                <p className="font-cyber font-bold text-xs uppercase tracking-wider text-cyber-fg-soft">Phone</p>
                <p className="text-sm font-mono text-cyber-fg">+1 (555) 010-2024</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 border border-cyber-accent/30 flex items-center justify-center shrink-0 cyber-chamfer group-hover:border-cyber-accent group-hover:shadow-[0_0_10px_#00ff8840] transition-all">
                <MapPin className="w-5 h-5 text-cyber-accent" />
              </div>
              <div>
                <p className="font-cyber font-bold text-xs uppercase tracking-wider text-cyber-fg-soft">Office</p>
                <p className="text-sm font-mono text-cyber-fg">548 Market St, San Francisco, CA 94104</p>
              </div>
            </div>
          </div>
        </div>

        <div className="cyber-card cyber-chamfer p-8 flex flex-col justify-center">
          <h3 className="font-cyber font-bold text-sm uppercase tracking-wider text-cyber-fg border-b border-cyber-border pb-3 mb-4">Response Time</h3>
          <p className="text-sm text-cyber-fg-soft leading-relaxed font-mono">
            We typically respond within 24 hours during business days. Enterprise customers receive priority support with a 4-hour SLA.
          </p>
        </div>
      </div>
    </div>
  );
}
