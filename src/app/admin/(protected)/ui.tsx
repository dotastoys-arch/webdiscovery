import { ReactNode } from 'react';
import { Icon } from './icons';

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-neutral-200/80 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-3">
      <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
      {action}
    </div>
  );
}

const tints: Record<string, string> = {
  indigo: 'bg-indigo-50 text-indigo-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  sky: 'bg-sky-50 text-sky-600',
  violet: 'bg-violet-50 text-violet-600',
};

export function StatCard({
  label,
  value,
  icon,
  tint = 'indigo',
  trend,
  hint,
}: {
  label: string;
  value: ReactNode;
  icon?: string;
  tint?: keyof typeof tints;
  trend?: { value: string; up?: boolean };
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tints[tint]}`}>
          {icon && <Icon path={icon} />}
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}
          >
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold text-neutral-900 tracking-tight">{value}</div>
      <div className="text-sm text-neutral-500 mt-0.5">{label}</div>
      {hint && <div className="text-xs text-neutral-400 mt-1">{hint}</div>}
    </Card>
  );
}

const statusColors: Record<string, string> = {
  new: 'bg-neutral-100 text-neutral-600',
  queued: 'bg-sky-50 text-sky-700',
  contacted: 'bg-sky-50 text-sky-700',
  sent_preview: 'bg-indigo-50 text-indigo-700',
  opened: 'bg-violet-50 text-violet-700',
  followed_up: 'bg-amber-50 text-amber-700',
  replied: 'bg-amber-50 text-amber-700',
  interested: 'bg-amber-50 text-amber-700',
  site_generated: 'bg-indigo-50 text-indigo-700',
  won: 'bg-emerald-50 text-emerald-700',
  paid: 'bg-emerald-50 text-emerald-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  lost: 'bg-red-50 text-red-700',
  cancelled: 'bg-red-50 text-red-700',
  unsubscribed: 'bg-red-50 text-red-700',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = statusColors[status] ?? 'bg-neutral-100 text-neutral-600';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
      {children}
    </div>
  );
}

export function Table({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50/70 text-left text-xs uppercase tracking-wide text-neutral-400">
            <tr>{head}</tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">{children}</tbody>
        </table>
      </div>
    </Card>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return <th className="px-5 py-3 font-medium whitespace-nowrap">{children}</th>;
}

export function Td({ children }: { children: ReactNode }) {
  return <td className="px-5 py-3 whitespace-nowrap text-neutral-700">{children}</td>;
}
