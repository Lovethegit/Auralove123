import { type ReactNode, useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

export function AdminHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h1 className="font-display text-3xl text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: 'draft' | 'published' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        status === 'published'
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
      {status}
    </span>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label className="aura-label">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center p-6 bg-ink-950/80 backdrop-blur-xl">
      <div className="glass-panel p-6 w-full max-w-md">
        <div className="flex items-start gap-3">
          <span className="h-10 w-10 shrink-0 rounded-full bg-red-500/10 border border-red-500/30 grid place-items-center text-red-300">
            <AlertCircle size={18} />
          </span>
          <div>
            <h3 className="font-display text-lg text-white">{title}</h3>
            <p className="mt-1 text-sm text-slate-400">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="aura-btn-ghost">Cancel</button>
          <button
            onClick={onConfirm}
            className="aura-btn bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-[0_0_24px_-6px_rgba(239,68,68,0.6)]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

type Toast = { id: number; type: 'success' | 'error'; message: string };
let toastCounter = 0;
const listeners = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

export function toast(message: string, type: 'success' | 'error' = 'success') {
  const id = ++toastCounter;
  toasts = [...toasts, { id, type, message }];
  listeners.forEach((l) => l(toasts));
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((l) => l(toasts));
  }, 3800);
}

export function ToastViewport() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);
  return (
    <div className="fixed top-6 right-6 z-[200] space-y-2 pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className={`glass-panel px-4 py-3 flex items-center gap-3 animate-fade-up min-w-[260px] ${
            t.type === 'success' ? 'border-emerald-500/30' : 'border-red-500/30'
          }`}
        >
          {t.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400" />
          ) : (
            <AlertCircle size={18} className="text-red-400" />
          )}
          <p className="text-sm text-slate-200 flex-1">{t.message}</p>
        </div>
      ))}
    </div>
  );
}

export function ActionButton({
  children,
  onClick,
  variant = 'primary',
  loading,
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const cls =
    variant === 'primary'
      ? 'aura-btn-primary'
      : variant === 'danger'
      ? 'aura-btn bg-gradient-to-r from-red-500 to-red-600 text-white'
      : 'aura-btn-ghost';
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${cls} disabled:opacity-60`}>
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

export function EmptyAdmin({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto mb-4 h-16 w-16 rounded-full border border-white/10 grid place-items-center bg-white/[0.02]">
        <X size={20} className="text-slate-500" />
      </div>
      <h3 className="font-display text-xl text-white">{title}</h3>
      {hint && <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto">{hint}</p>}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="grid place-items-center py-20">
      <Loader2 size={28} className="animate-spin text-aura-300" />
      {label && <p className="mt-4 text-sm text-slate-400">{label}</p>}
    </div>
  );
}
