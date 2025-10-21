'use client';

import clsx from 'clsx';

export default function SummaryCard({ title, value, subtitle, highlight }) {
  return (
    <div
      className={clsx(
        'glass-card relative overflow-hidden rounded-3xl p-6 shadow-glass transition hover:-translate-y-1 hover:shadow-xl',
        highlight && 'border border-red-100'
      )}
    >
      <div className="absolute -top-8 right-0 h-28 w-28 rounded-full bg-orange-100/70" />
      <div className="relative space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">{title}</p>
          <p className={clsx('text-4xl font-bold', highlight ? 'text-red-500' : 'text-gray-900')}>{value}</p>
        </div>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}
