import { cn, PHASE_COLORS, SATISFACTION_COLORS } from '../../lib/utils';
export { cn } from '../../lib/utils';

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn('bg-white rounded-xl border border-slate-200', className)}
      style={{ boxShadow: 'var(--card-shadow)' }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('px-5 py-4 border-b border-slate-100', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-[13px] font-semibold text-slate-800 tracking-tight', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, className, ...props }) {
  return (
    <button
      disabled={loading || props.disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        {
          primary:     'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md',
          secondary:   'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
          ghost:       'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
          destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        }[variant],
        { sm: 'text-[12px] px-3 py-1.5', md: 'text-[13px] px-4 py-2', lg: 'text-[13px] px-5 py-2.5' }[size],
        className
      )}
      {...props}
    >
      {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}

// ── Badges ────────────────────────────────────────────────────────────────────
export function PhaseBadge({ phase }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium',
      PHASE_COLORS[phase] ?? 'bg-slate-100 text-slate-600'
    )}>
      {phase?.replace('_', ' ')}
    </span>
  );
}

export function SatisfactionBadge({ state }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium',
      SATISFACTION_COLORS[state] ?? 'bg-slate-100 text-slate-600'
    )}>
      {state}
    </span>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────
export function MetricCard({ label, value, sub, icon, accent }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 tabular-nums tracking-tight">{value}</p>
          {sub && <p className="mt-1 text-[11px] text-slate-400">{sub}</p>}
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg shrink-0 mt-0.5"
            style={{ background: accent ? `${accent}15` : 'var(--brand-light)', color: accent ?? 'var(--brand)' }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-2xl mb-4" style={{ background: 'var(--brand-light)' }}>
        <div style={{ color: 'var(--brand)' }}>{icon}</div>
      </div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {description && <p className="mt-1.5 text-[13px] text-slate-400 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ className }) {
  return (
    <div className={cn('w-5 h-5 border-2 border-t-transparent rounded-full animate-spin', className)}
      style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export function Toast({ type, title, message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isSuccess = type === 'success';

  return (
    <div className={cn(
      'flex items-start gap-3 p-3.5 rounded-xl border shadow-xl min-w-72 max-w-sm animate-fadeIn',
      isSuccess ? 'bg-white border-green-200' : 'bg-white border-red-200'
    )} style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
      {isSuccess
        ? <CheckCircle size={15} className="text-green-600 shrink-0 mt-0.5" />
        : <XCircle size={15} className="text-red-500 shrink-0 mt-0.5" />}
      <div className="flex-1">
        <p className="text-[13px] font-semibold text-slate-800">{title}</p>
        {message && <p className="text-[12px] text-slate-500 mt-0.5">{message}</p>}
      </div>
      <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 transition-colors">
        <X size={13} />
      </button>
    </div>
  );
}

export function Toaster({ toasts, dismiss }) {
  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
      {toasts.map(t => <Toast key={t.id} {...t} onDismiss={() => dismiss(t.id)} />)}
    </div>
  );
}
