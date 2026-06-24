import { useState } from 'react';
import { STORAGE_BUCKET } from '../../lib/supabase';
import { adminApi } from '../../lib/adminApi';
import { Upload, File as FileIcon, CheckCircle2, X, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from './ui';

// Accepts ALL file types without restriction (per requirements).
export function MediaUpload({
  onUploaded,
  compact,
}: {
  onUploaded: (url: string, path: string) => void;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<{ name: string; url: string } | null>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setPct(0);
    setLastError(null);

    // Try uploading via the Supabase anon client. If the storage bucket does not allow anon
    // inserts (RLS), the upload will fail with an RLS error — in that case, we fall back to
    // creating a data URL so the admin can still attach a playable file. This keeps the
    // component functional regardless of RLS state.
    try {
      const { path, publicUrl } = await adminApi.fileUpload(file);
      setLastFile({ name: file.name, url: publicUrl });
      setPct(100);
      onUploaded(publicUrl, path);
    } catch {
      // Fallback: convert small files to data URLs (best-effort).
      setPct(50);
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Could not read file.'));
          reader.readAsDataURL(file);
        });
        // Data URLs work for native playback; store path as a synthetic identifier.
        if (dataUrl.length < 9_000_000) {
          setLastFile({ name: file.name, url: dataUrl });
          setPct(100);
          onUploaded(dataUrl, `inline:${file.name}`);
          toast('File attached inline (storage unavailable in this environment).');
        } else {
          throw new Error('File too large to attach inline and storage upload failed.');
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setLastError(`Upload failed: ${msg}. You can still paste a direct URL below.`);
        toast(msg, 'error');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  return (
    <div className={compact ? '' : 'space-y-4'}>
      <label
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`block cursor-pointer ${compact ? 'p-5' : 'p-10'} text-center border border-dashed border-white/15 rounded-xl hover:border-aura-400/50 hover:bg-aura-500/[0.04] transition group`}
      >
        <input type="file" className="hidden" onChange={handleSelect} value="" />
        <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-aura-500/10 border border-aura-400/20 grid place-items-center text-aura-200 group-hover:scale-110 transition">
          {busy ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
        </div>
        <p className="text-sm text-slate-200 font-medium">
          {busy ? 'Uploading…' : 'Drop a file or click to upload'}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          All file types accepted — video, audio, images, documents, anything.
        </p>
        {busy && (
          <div className="mt-4 mx-auto max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-aura-400 to-neon-blue transition-all" style={{ width: `${pct}%` }} />
          </div>
        )}
      </label>

      {lastFile && !lastError && (
        <div className="glass-card p-4 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <FileIcon size={16} className="text-aura-200" />
          <span className="text-sm text-slate-200 truncate flex-1">{lastFile.name}</span>
          <button onClick={() => setLastFile(null)} className="text-slate-400 hover:text-white"><X size={14} /></button>
        </div>
      )}

      {lastError && (
        <div className="glass-card p-4 flex items-start gap-3 border-red-500/30">
          <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300 flex-1">{lastError}</p>
        </div>
      )}

      {!compact && (
        <p className="text-xs text-slate-500">
          Uploaded files are stored in the <code className="text-aura-200">{STORAGE_BUCKET}</code> bucket
          and assigned a public URL. They will be attributed as <span className="text-slate-300">Published by Love Parekh</span>.
        </p>
      )}
    </div>
  );
}
