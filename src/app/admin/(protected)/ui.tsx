import { ReactNode } from 'react';

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {hint && <div className="text-xs text-neutral-400 mt-1">{hint}</div>}
    </div>
  );
}

const statusColors: Record<string, string> = {
  new: 'bg-neutral-100 text-neutral-700',
  queued: 'bg-blue-100 text-blue-700',
  contacted: 'bg-blue-100 text-blue-700',
  opened: 'bg-indigo-100 text-indigo-700',
  replied: 'bg-amber-100 text-amber-700',
  interested: 'bg-amber-100 text-amber-700',
  won: 'bg-green-100 text-green-700',
  paid: 'bg-green-100 text-green-700',
  delivered: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
  unsubscribed: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = statusColors[status] ?? 'bg-neutral-100 text-neutral-700';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
      {children}
    </div>
  );
}

export function Table({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-left text-neutral-500">
          <tr>{head}</tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-2.5 font-medium whitespace-nowrap">{children}</th>;
}

export function Td({ children }: { children: ReactNode }) {
  return <td className="px-4 py-2.5 whitespace-nowrap">{children}</td>;
}
