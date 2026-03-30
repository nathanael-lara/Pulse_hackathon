'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { AppTab, RiskTier } from '@/lib/types';

export function ScreenTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-teal-deep)]">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function SectionCard({
  children,
  className,
  tone = 'default',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'soft' | 'highlight' | 'urgent';
}) {
  return (
    <section
      className={cn(
        'rounded-[28px] border p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]',
        tone === 'default' && 'border-white/70 bg-white/92',
        tone === 'soft' && 'border-[var(--color-panel-border)] bg-[var(--color-panel-soft)]',
        tone === 'highlight' && 'border-[var(--color-teal-border)] bg-[var(--color-panel-highlight)]',
        tone === 'urgent' && 'border-amber-200 bg-amber-50',
        className
      )}
    >
      {children}
    </section>
  );
}

export function SegmentedTabs<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-2 rounded-[20px] bg-[var(--color-panel-soft)] p-2', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'min-h-11 rounded-[16px] px-3 text-sm font-semibold transition',
            value === option.value
              ? 'bg-white text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.06)]'
              : 'text-slate-600 hover:bg-white/70'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function PrimaryButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'min-h-12 rounded-full bg-[var(--color-teal-deep)] px-5 py-3 text-base font-semibold text-white transition hover:bg-[var(--color-teal)] disabled:cursor-not-allowed disabled:opacity-55',
        className
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'min-h-12 rounded-full border border-[var(--color-panel-border)] bg-white px-5 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-55',
        className
      )}
    >
      {children}
    </button>
  );
}

export function StatusBadge({ tier }: { tier: RiskTier }) {
  const copy = {
    steady: 'On track',
    watch: 'Keep an eye on this',
    support: 'Support suggested',
    urgent: 'Urgent support',
  };

  return (
    <span
      className={cn(
        'inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold',
        tier === 'steady' && 'bg-emerald-100 text-emerald-800',
        tier === 'watch' && 'bg-amber-100 text-amber-800',
        tier === 'support' && 'bg-orange-100 text-orange-900',
        tier === 'urgent' && 'bg-rose-100 text-rose-900'
      )}
    >
      {copy[tier]}
    </span>
  );
}

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={cn('h-3 overflow-hidden rounded-full bg-slate-200', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-teal-deep),var(--color-gold))]"
      />
    </div>
  );
}

export function MetricTile({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[22px] border border-[var(--color-panel-border)] bg-white px-4 py-4">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{note}</p>
    </div>
  );
}

export function SmallAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 items-center gap-3 rounded-[20px] border border-[var(--color-panel-border)] bg-white px-4 text-left text-base font-medium text-slate-800 transition hover:bg-slate-50"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-panel-soft)] text-[var(--color-teal-deep)]">
        <Icon className="h-5 w-5" />
      </span>
      <span>{label}</span>
    </button>
  );
}

export function BottomNavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-[22px] px-2 py-2 text-sm font-medium transition',
        active
          ? 'bg-[var(--color-teal-deep)] text-white shadow-[0_10px_30px_rgba(16,122,122,0.22)]'
          : 'text-slate-600 hover:bg-white'
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
}

export function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-[22px] border border-[var(--color-panel-border)] bg-white px-4 py-4">
      <span>
        <span className="block text-base font-semibold text-slate-900">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-600">{description}</span>
      </span>
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-8 w-14 rounded-full transition',
          checked ? 'bg-[var(--color-teal-deep)]' : 'bg-slate-300'
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-6 w-6 rounded-full bg-white transition',
            checked ? 'left-7' : 'left-1'
          )}
        />
      </button>
    </label>
  );
}

export function tabLabel(tab: AppTab) {
  return {
    today: 'Today',
    ask: 'Ask',
    recovery: 'Recovery',
    medications: 'Meds',
    support: 'Support',
  }[tab];
}
