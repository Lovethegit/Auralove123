import { PublicLayout } from '../components/Layout';
import { navigate } from '../lib/router';
import { Compass } from 'lucide-react';

export function NotFoundPage() {
  return (
    <PublicLayout>
      <section className="min-h-[70vh] grid place-items-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-6 h-24 w-24 rounded-full border border-white/10 grid place-items-center bg-aura-500/5">
            <Compass size={36} className="text-aura-200" />
          </div>
          <h1 className="font-display text-6xl aura-gradient-text">404</h1>
          <p className="mt-3 text-slate-300">This page drifted beyond the aura.</p>
          <button onClick={() => navigate('/')} className="aura-btn-primary mt-8">Return home</button>
        </div>
      </section>
    </PublicLayout>
  );
}
