'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  Wind,
  Footprints,
  Zap,
  Heart,
  TrendingUp,
  Play,
  Pause,
  AlertTriangle,
  Trophy,
  Bell,
  Watch,
  History,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { evaluateCardioStress, generateEncouragement } from '@/lib/ai-service';
import type { RehabTask, CardioStressResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { REHAB_12_WEEK_PLAN, REHAB_HISTORY, WEEK_PROGRESS } from '@/lib/mock-data';

const TASK_ICONS = {
  walk: Footprints,
  breathe: Wind,
  stretch: Activity,
  rest: Heart,
};

function StressIndicator({ result }: { result: CardioStressResult }) {
  const colors = {
    optimal: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    elevated: 'border-amber-200 bg-amber-50 text-amber-700',
    high: 'border-orange-200 bg-orange-50 text-orange-700',
    critical: 'border-red-200 bg-red-50 text-red-700',
  };

  return (
    <div className={cn('rounded-[1.4rem] border p-4', colors[result.status])}>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">
            {result.status === 'critical'
              ? 'Stop now'
              : result.status === 'high'
                ? 'High stress'
                : result.status === 'elevated'
                  ? 'Ease back'
                  : 'Optimal zone'}
          </div>
          <div className="mt-1 text-xs opacity-80">Expected around {result.expectedHR} BPM</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{result.currentHR}</div>
          <div className="text-xs opacity-80">BPM</div>
        </div>
      </div>
      <p className="text-sm leading-relaxed">{result.recommendation}</p>
    </div>
  );
}

function TaskCard({
  task,
  onComplete,
  onStart,
  isActive,
}: {
  task: RehabTask;
  onComplete: () => void;
  onStart: () => void;
  isActive: boolean;
}) {
  const Icon = TASK_ICONS[task.type];
  const [encouragement, setEncouragement] = useState('');

  const handleComplete = async () => {
    onComplete();
    setEncouragement(generateEncouragement('win'));
    setTimeout(() => setEncouragement(''), 4500);
  };

  return (
    <div
      className={cn(
        'rounded-[1.5rem] border p-4 transition-all',
        task.completed
          ? 'border-emerald-200 bg-emerald-50'
          : isActive
            ? 'border-primary/20 bg-secondary/60 shadow-[0_8px_20px_rgba(143,113,184,0.1)]'
            : 'border-border bg-white'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl',
            task.completed ? 'bg-emerald-100' : isActive ? 'bg-primary/14' : 'bg-secondary'
          )}
        >
          {task.completed ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Icon className="h-5 w-5 text-primary" />}
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-foreground">{task.title}</div>
            <div className="text-xs text-foreground/55">{task.duration} min</div>
          </div>
          <p className="text-sm leading-relaxed text-foreground/72">{task.description}</p>
          {task.targetHR ? (
            <div className="mt-2 text-xs text-primary">Heart-rate ceiling: &lt; {task.targetHR} BPM</div>
          ) : null}

          {!task.completed ? (
            <div className="mt-3 flex gap-2">
              {!isActive ? (
                <button
                  onClick={onStart}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground transition-colors hover:bg-secondary/80"
                >
                  <Play className="h-3 w-3" />
                  Start
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Mark complete
                </button>
              )}
            </div>
          ) : null}

          {encouragement ? (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {encouragement}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function LiveStressEngine() {
  const { currentHR, setCurrentHR, addNotification } = useAppStore();
  const [isActive, setIsActive] = useState(false);
  const [stressResult, setStressResult] = useState<CardioStressResult | null>(null);

  const simulate = useCallback(() => {
    setIsActive(true);
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      const simulatedHR = tick < 5 ? 74 + tick * 8 : tick < 9 ? 112 + (tick - 5) * 4 : 100 - (tick - 9) * 3;
      setCurrentHR(simulatedHR);
      const result = evaluateCardioStress({
        currentHR: simulatedHR,
        restingHR: 65,
        maxHR: 155,
        activity: 'light',
        hrVariability: 12,
      });
      setStressResult(result);
      if (result.status === 'high' || result.status === 'critical') {
        addNotification({
          id: `n-rehab-${Date.now()}-${tick}`,
          title: 'Cardio stress feedback',
          body: result.recommendation,
          category: 'rehab',
          channel: 'in-app',
          level: result.status === 'critical' ? 'red' : 'orange',
          timestamp: new Date(),
          read: false,
        });
      }

      if (tick >= 12) {
        clearInterval(interval);
        setIsActive(false);
      }
    }, 850);
  }, [addNotification, setCurrentHR]);

  const simulateCritical = useCallback(() => {
    const result = evaluateCardioStress({
      currentHR: 146,
      restingHR: 65,
      maxHR: 155,
      activity: 'vigorous',
      hrVariability: 4,
    });
    setCurrentHR(146);
    setStressResult(result);
  }, [setCurrentHR]);

  return (
    <div className="glass-card rounded-[1.75rem] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-foreground">Cardio stress feedback</div>
          <div className="mt-1 text-xs text-foreground/58">Real-time pace coaching based on the physician&apos;s current rehab guardrails.</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{currentHR}</div>
          <div className="text-xs text-foreground/55">BPM</div>
        </div>
      </div>

      {stressResult ? (
        <StressIndicator result={stressResult} />
      ) : (
        <div className="rounded-[1.4rem] border border-border bg-secondary/35 p-4 text-sm text-foreground/72">
          Simulate a rehab session to see live guidance such as: “Your HR is high for this pace — slow down.”
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={simulate}
          disabled={isActive}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
        >
          {isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          Simulate walk
        </button>
        <button
          onClick={simulateCritical}
          className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 transition-colors hover:bg-red-100"
        >
          <AlertTriangle className="h-3 w-3" />
          Trigger alert
        </button>
      </div>
    </div>
  );
}

export function RehabView() {
  const { todayRehab, completeTask, setActiveTask, activeTaskId, patient, notifications } = useAppStore();
  const [selectedWeek, setSelectedWeek] = useState(todayRehab.week);

  const completedCount = todayRehab.tasks.filter((task) => task.completed).length;
  const totalCount = todayRehab.tasks.length;
  const pct = Math.round((completedCount / totalCount) * 100);
  const weekPlan = REHAB_12_WEEK_PLAN.find((plan) => plan.week === selectedWeek) ?? REHAB_12_WEEK_PLAN[0];

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <div className="editorial-kicker mb-2 text-primary">Rehab program</div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Doctor-Aligned Recovery</h1>
          <p className="mt-1 text-sm text-foreground/72">
            Interactive 12-week plan, wearable feedback, and clinician-facing backlog grounded in the current cardiac guidance.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-primary/12 bg-secondary px-3 py-1.5 text-xs text-primary">
          <Trophy className="h-3.5 w-3.5" />
          {patient.streakDays}-day streak
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-5">
          <div className="glass-card rounded-[1.75rem] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">Week {todayRehab.week} active program</div>
                <div className="mt-1 text-xs text-foreground/58">Today&apos;s tasks reflect the physician&apos;s current HR limit and symptom boundaries.</div>
              </div>
              <div className="text-sm font-semibold text-primary">{pct}% complete</div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7 }}
              />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                { label: 'Structured tasks', value: `${totalCount}`, icon: Activity },
                { label: 'Wearable sync', value: `${WEEK_PROGRESS.totalSteps.toLocaleString()} steps`, icon: Watch },
                { label: 'Push prompts', value: `${notifications.filter((n) => n.category === 'rehab').length} today`, icon: Bell },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl border border-border bg-white p-3 shadow-sm">
                    <div className="mb-1 flex items-center gap-2 text-xs text-foreground/58">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      {item.label}
                    </div>
                    <div className="text-sm font-medium text-foreground">{item.value}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {todayRehab.aiEncouragement ? (
            <div className="glass-card rounded-[1.75rem] p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/12">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm leading-relaxed text-foreground/72">{todayRehab.aiEncouragement}</p>
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            {todayRehab.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isActive={activeTaskId === task.id}
                onStart={() => setActiveTask(task.id)}
                onComplete={() => {
                  completeTask(task.id);
                  setActiveTask(null);
                }}
              />
            ))}
          </div>

          <div className="glass-card rounded-[1.75rem] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground">
                <CalendarRange className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">12-week rehab roadmap</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedWeek((week) => Math.max(1, week - 1))}
                  className="rounded-xl border border-border bg-white p-2 text-primary shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[86px] text-center text-sm font-semibold text-foreground">Week {selectedWeek}</span>
                <button
                  onClick={() => setSelectedWeek((week) => Math.min(12, week + 1))}
                  className="rounded-xl border border-border bg-white p-2 text-primary shadow-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-secondary/55 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-primary">{weekPlan.title}</div>
              <div className="mt-2 text-xl font-semibold text-foreground">{weekPlan.focus}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {weekPlan.physicianGuardrails.map((guardrail) => (
                  <span key={guardrail} className="rounded-full border border-border bg-white px-3 py-1 text-xs text-foreground/68">
                    {guardrail}
                  </span>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-foreground/52">Weekly steps</div>
                  <div className="mt-1 text-2xl font-semibold text-foreground">{weekPlan.targetSteps.toLocaleString()}</div>
                </div>
                <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-foreground/52">Planned minutes</div>
                  <div className="mt-1 text-2xl font-semibold text-foreground">{weekPlan.totalMinutes}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {weekPlan.sessions.map((session) => (
                <div key={session.id} className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{session.dayLabel} · {session.title}</div>
                      <div className="mt-1 text-sm text-foreground/68">{session.focus}</div>
                    </div>
                    <span className={cn(
                      'rounded-full px-3 py-1 text-xs',
                      session.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : session.status === 'today'
                          ? 'bg-primary/12 text-primary'
                          : 'bg-secondary text-foreground/68'
                    )}>
                      {session.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-foreground/58">
                    <span>{session.durationMinutes} min</span>
                    <span>Target HR &lt; {session.targetHR}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <LiveStressEngine />

          <div className="glass-card rounded-[1.75rem] p-5">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Weekly progression</span>
            </div>
            <div className="space-y-3">
              {[
                {
                  label: 'Steps',
                  current: WEEK_PROGRESS.totalSteps.toLocaleString(),
                  target: WEEK_PROGRESS.targetSteps.toLocaleString(),
                  pct: (WEEK_PROGRESS.totalSteps / WEEK_PROGRESS.targetSteps) * 100,
                  color: 'bg-primary',
                },
                {
                  label: 'Task adherence',
                  current: `${WEEK_PROGRESS.tasksCompleted}`,
                  target: `${WEEK_PROGRESS.totalTasks}`,
                  pct: (WEEK_PROGRESS.tasksCompleted / WEEK_PROGRESS.totalTasks) * 100,
                  color: 'bg-emerald-500',
                },
                {
                  label: 'Active days',
                  current: `${WEEK_PROGRESS.completedDays}`,
                  target: `${WEEK_PROGRESS.totalDaysThisWeek}`,
                  pct: (WEEK_PROGRESS.completedDays / WEEK_PROGRESS.totalDaysThisWeek) * 100,
                  color: 'bg-violet-400',
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex justify-between text-xs text-foreground/58">
                    <span>{item.label}</span>
                    <span>{item.current}/{item.target}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      className={cn('h-full rounded-full', item.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(item.pct, 100)}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[1.75rem] p-5">
            <div className="mb-4 flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Backlog history for clinician review</span>
            </div>
            <div className="space-y-2">
              {REHAB_HISTORY.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-border bg-white p-3 shadow-sm">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{new Date(entry.date).toLocaleDateString()}</span>
                    <span className={cn(entry.completed ? 'text-emerald-700' : 'text-orange-700')}>
                      {entry.completed ? 'Completed' : 'Interrupted'}
                    </span>
                  </div>
                  <div className="text-xs text-foreground/58">
                    {entry.minutes} min · {entry.steps.toLocaleString()} steps · avg {entry.avgHR} BPM · peak {entry.maxHR} BPM
                  </div>
                  {entry.notes ? <div className="mt-1 text-xs text-foreground/58">{entry.notes}</div> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
