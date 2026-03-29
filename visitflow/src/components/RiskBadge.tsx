'use client';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/lib/types';

const RISK_CONFIG = {
  green: {
    label: 'Stable',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    glow: 'shadow-emerald-400/20',
  },
  yellow: {
    label: 'Monitor',
    dot: 'bg-yellow-400',
    text: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    glow: 'shadow-yellow-400/20',
  },
  orange: {
    label: 'Elevated',
    dot: 'bg-orange-400',
    text: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    glow: 'shadow-orange-400/20',
  },
  red: {
    label: 'Escalate',
    dot: 'bg-red-400',
    text: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-500/30',
    glow: 'shadow-red-400/30',
  },
};

interface RiskBadgeProps {
  level: RiskLevel;
  compact?: boolean;
  pulse?: boolean;
}

export function RiskBadge({ level, compact, pulse }: RiskBadgeProps) {
  const cfg = RISK_CONFIG[level];

  if (compact) {
    return (
      <div className={cn('w-2 h-2 rounded-full', cfg.dot, pulse && 'animate-pulse')} />
    );
  }

  return (
    <div className={cn(
      'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
      cfg.bg, cfg.border, cfg.text
    )}>
      <div className={cn('w-1.5 h-1.5 rounded-full', cfg.dot, (level === 'red' || level === 'orange') && 'animate-pulse')} />
      {cfg.label}
    </div>
  );
}
