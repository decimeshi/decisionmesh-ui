import { cn } from '../../lib/utils';

export default function Page({ title, subtitle, action, children, className }) {
  return (
    <div className={cn('space-y-5', className)}>
      {/* Page header */}
      {(title || action) && (
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && (
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
            )}
            {subtitle && (
              <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
}
