import { PublicLayout, PageHero } from '../components/Layout';
import { Mail, Send, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Opens the user's mail client pre-filled — no backend needed for a static contact form.
    const subject = encodeURIComponent(`Love's Aura — message from ${form.name || 'a visitor'}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name}${form.email ? ` (${form.email})` : ''}`);
    window.location.href = `mailto:officiallovesaura@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <PublicLayout>
      <PageHero eyebrow="Reach Out" title="Contact" subtitle="Share a thought, propose a collaboration, or simply say hello." />

      <section className="max-w-6xl mx-auto px-5 md:px-10 pb-24">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Info */}
          <div className="space-y-6">
            <div className="glass-card p-6 flex items-start gap-4">
              <span className="h-12 w-12 rounded-xl bg-aura-500/15 border border-aura-400/25 grid place-items-center text-aura-200">
                <Mail size={20} />
              </span>
              <div>
                <h3 className="font-display text-lg text-white">Email</h3>
                <a href="mailto:officiallovesaura@gmail.com" className="text-sm text-slate-300 hover:text-aura-200 transition break-all">
                  officiallovesaura@gmail.com
                </a>
              </div>
            </div>

            <div className="glass-card p-6 flex items-start gap-4">
              <span className="h-12 w-12 rounded-xl bg-neon-blue/15 border border-neon-blue/25 grid place-items-center text-neon-blue">
                <Clock size={20} />
              </span>
              <div>
                <h3 className="font-display text-lg text-white">Response time</h3>
                <p className="text-sm text-slate-300">Messages are read within 2–3 business days.</p>
              </div>
            </div>

            <div className="glass-card p-6 flex items-start gap-4">
              <span className="h-12 w-12 rounded-xl bg-neon-violet/15 border border-neon-violet/25 grid place-items-center text-neon-violet">
                <MapPin size={20} />
              </span>
              <div>
                <h3 className="font-display text-lg text-white">Studio</h3>
                <p className="text-sm text-slate-300">Created and curated from afar — a digital-first aura.</p>
              </div>
            </div>

            <div className="glass-card p-6">
              <p className="text-sm text-slate-400 leading-relaxed">
                Every piece on this platform is created and curated by{' '}
                <span className="text-aura-200">Published by Love Parekh</span>. For press, licensing,
                or collaborative projects, please use the form or email directly.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="glass-panel p-8">
            {sent ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-aura-500/15 border border-aura-400/25 grid place-items-center">
                  <Send size={24} className="text-neon-pink" />
                </div>
                <h3 className="font-display text-2xl text-white">Your message is on its way</h3>
                <p className="mt-2 text-sm text-slate-400">Your email app should have opened with the message pre-filled. If not, email officiallovesaura@gmail.com directly.</p>
                <button onClick={() => setSent(false)} className="aura-btn-ghost mt-6">Send another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="aura-label">Your name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="aura-input" placeholder="Your name" />
                </div>
                <div>
                  <label className="aura-label">Email</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="aura-input" placeholder="you@email.com" />
                </div>
                <div>
                  <label className="aura-label">Message</label>
                  <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="aura-input resize-none" placeholder="What would you like to share?" />
                </div>
                <button type="submit" className="aura-btn-primary w-full">
                  <Send size={15} /> Send message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
