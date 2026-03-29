'use client';

import { motion } from 'framer-motion';
import { Heart, Activity, Calendar, ArrowRight, Zap, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { WEEK_PROGRESS, CURRENT_VISIT } from '@/lib/mock-data';
import { RiskBadge } from '../RiskBadge';
import { cn } from '@/lib/utils';

function HeartRateSparkline({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const h = 40;
  const w = 120;
  const step = w / (values.length - 1);

  const points = values.map((v, i) =>
    `${i * step},${h - ((v - min) / range) * h}`
  ).join(' ');

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
    </svg>
  );
}

export function OverviewView() {
  const { patient, riskLevel, currentHR, currentSteps, metrics, setActiveView, todayRehab } = useAppStore();

  const hrValues = metrics.slice(-12).map((m) => m.heartRate);
  const completedTasks = todayRehab.tasks.filter((t) => t.completed).length;
  const totalTasks = todayRehab.tasks.length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Good morning, {patient.name.split(' ')[0]}.</h1>
            <p className="text-muted-foreground mt-1">Week {patient.rehabWeek}, Day {patient.rehabDay} · You&apos;re on a {patient.streakDays}-day streak.</p>
          </div>
          <RiskBadge level={riskLevel} />
        </div>
      </motion.div>

      {/* Primary metric cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Heart Rate',
            value: currentHR,
            unit: 'BPM',
            icon: Heart,
            color: 'text-red-400',
            bg: 'bg-red-400/10',
            sub: 'Resting',
            chart: true,
          },
          {
            label: 'Steps Today',
            value: currentSteps.toLocaleString(),
            unit: '',
            icon: Activity,
            color: 'text-primary',
            bg: 'bg-primary/10',
            sub: `of ${(WEEK_PROGRESS.targetSteps / 7).toLocaleString()} goal`,
          },
          {
            label: 'Rehab Tasks',
            value: `${completedTasks}/${totalTasks}`,
            unit: '',
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            sub: 'Today',
          },
          {
            label: 'Next Visit',
            value: 'Apr 12',
            unit: '',
            icon: Calendar,
            color: 'text-yellow-400',
            bg: 'bg-yellow-400/10',
            sub: '14 days away',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-4 border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', card.bg)}>
                  <Icon className={cn('w-3.5 h-3.5', card.color)} />
                </div>
              </div>
              {card.chart ? (
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <div className="text-xs text-muted-foreground">{card.sub}</div>
                  </div>
                  <div className="opacity-60">
                    <HeartRateSparkline values={hrValues} />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="text-xs text-muted-foreground">{card.sub}</div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Today's rehab snapshot */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-5 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Today&apos;s Rehab</span>
              </div>
              <button
                onClick={() => setActiveView('rehab')}
                className="text-xs text-primary flex items-center gap-1 hover:gap-2 transition-all"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {todayRehab.tasks.map((task) => (
                <div key={task.id} className={cn(
                  'flex items-center gap-3 p-2.5 rounded-xl text-sm',
                  task.completed ? 'opacity-50' : 'glass'
                )}>
                  <div className={cn('w-5 h-5 rounded-full border flex items-center justify-center',
                    task.completed ? 'border-emerald-400 bg-emerald-400/20' : 'border-border'
                  )}>
                    {task.completed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <span className={cn(task.completed && 'line-through text-muted-foreground')}>{task.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{task.duration}m</span>
                </div>
              ))}
            </div>
            <div className="mt-4 h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Last visit summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-5 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Last Visit · Mar 29</span>
              </div>
              <button
                onClick={() => setActiveView('post-visit')}
                className="text-xs text-primary flex items-center gap-1 hover:gap-2 transition-all"
              >
                Full recap <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {CURRENT_VISIT.summary?.keyPoints.map((pt, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-2 flex-shrink-0" />
                  {pt}
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI encouragement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-2xl p-4 border border-primary/15 flex gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {todayRehab.aiEncouragement}
            </p>
          </motion.div>
        </div>

        {/* Right: Quick actions + week progress */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="glass-card rounded-2xl p-4 border border-border">
            <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Quick Actions</div>
            <div className="space-y-2">
              {[
                { label: 'Start Live Visit', view: 'live-visit', icon: '●', color: 'text-red-400', urgent: true },
                { label: 'Today\'s Rehab', view: 'rehab', icon: '◆', color: 'text-primary' },
                { label: 'Message Dr. Okafor', view: 'messages', icon: '▷', color: 'text-yellow-400' },
                { label: 'Pre-Visit Prep', view: 'pre-visit', icon: '◎', color: 'text-purple-400' },
              ].map((action) => (
                <button
                  key={action.view}
                  onClick={() => setActiveView(action.view)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors',
                    action.urgent ? 'glass-card border border-primary/20 hover:bg-primary/5' : 'hover:bg-secondary/50'
                  )}
                >
                  <span className={cn('text-xs', action.color)}>{action.icon}</span>
                  {action.label}
                  <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Week progress */}
          <div className="glass-card rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Week {WEEK_PROGRESS.week} of {WEEK_PROGRESS.totalWeeks}</span>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Overall progress</span>
                <span>{WEEK_PROGRESS.week}/{WEEK_PROGRESS.totalWeeks} weeks</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(WEEK_PROGRESS.week / WEEK_PROGRESS.totalWeeks) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-7 rounded-lg flex items-center justify-center text-xs font-medium',
                    i < WEEK_PROGRESS.completedDays
                      ? 'bg-primary/20 text-primary'
                      : i === WEEK_PROGRESS.completedDays
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground/30'
                  )}
                >
                  {['M','T','W','T','F','S','S'][i]}
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="glass-card rounded-2xl p-4 border border-yellow-400/15">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold">Risk Status</span>
              <RiskBadge level={riskLevel} />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mild arrhythmia noted at last visit. Continue monitoring. Contact care team if you experience chest tightness or palpitations.
            </p>
            <button
              onClick={() => setActiveView('messages')}
              className="mt-3 text-xs text-primary flex items-center gap-1"
            >
              Contact care team <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
