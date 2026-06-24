import { AdminHeader } from './ui';
import { MediaUpload } from './MediaUpload';
import { Upload, Check } from 'lucide-react';
import { useState } from 'react';

export function UploadsManager() {
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);

  return (
    <div>
      <AdminHeader title="Media Upload" subtitle="Upload any file type — no restrictions. Video, audio, images, documents, archives." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload size={18} className="text-aura-200" />
            <h3 className="font-display text-lg text-white">Upload</h3>
          </div>
          <MediaUpload onUploaded={(url, _path) => { setLastUrl(url); setLastName(url.split('/').pop() || 'file'); }} />
        </div>
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h4 className="text-xs uppercase tracking-widest text-aura-200/70 mb-3">Accepted file types</h4>
            <ul className="text-sm text-slate-300 space-y-1.5">
              <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Video — mp4, webm, mov, avi, mkv</li>
              <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Audio — mp3, wav, ogg, m4a, flac</li>
              <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Images — jpg, png, webp, gif, svg</li>
              <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Documents — pdf, docx, txt, md</li>
              <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Archives — zip, tar, gz, rar</li>
              <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Anything else — truly unrestricted</li>
            </ul>
          </div>

          {lastUrl && (
            <div className="glass-card p-5">
              <h4 className="text-xs uppercase tracking-widest text-aura-200/70 mb-3">Last uploaded</h4>
              <a href={lastUrl} target="_blank" rel="noreferrer" className="text-sm text-aura-200 hover:text-white break-all">{lastName}</a>
              <p className="mt-2 text-xs text-slate-500">Copy this URL into a media item&rsquo;s &ldquo;direct file URL&rdquo; field to attach it.</p>
            </div>
          )}

          <div className="glass-card p-5">
            <p className="text-xs uppercase tracking-widest text-aura-200/70 mb-2">Attribution</p>
            <p className="font-display text-base text-white">Published by Love Parekh</p>
          </div>
        </div>
      </div>
    </div>
  );
}
