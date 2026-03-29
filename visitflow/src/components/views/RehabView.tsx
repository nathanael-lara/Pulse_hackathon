'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, CheckCircle2, Circle, Wind, Footprints,
  Zap, Heart, TrendingUp, Play, Pause, ChevronRight,
  AlertTriangle, Trophy, Flame
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { evaluateCardioStress, generateEncouragement } from '@/lib/ai-service';
import type { RehabTask, CardioStressResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { WEEK_PROGRESS } from '@/lib/mock-data';

const TASK_ICONS = {
  walk: Footprints,
  breathe: Wind,
  stretch: Activity,
  rest: Heart,
};

function StressIndicator({ result }: { result: CardioStressResult }) {
  const colors = {
    optimal: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    elevated: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    critical: 'text-red-400 bg-red-400/10 border-red-500/30',
  };

  const labels = { optimal: 'Optimal', elevated: 'Slightly High', high: 'High', critical: 'Stop Now' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('rounded-2xl p-4 border', colors[result.status])}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Heart className={cn('w-4 h-4', result.status === 'critical' ? 'heartbeat text-red-400' : '')} />
          <span className="text-sm font-semibold">{labels[result.status]}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{result.currentHR}</div>
          <div className="text-xs opacity-60">BPM</div>
        </div>
      </div>
      <p className="text-sm leading-relaxed">{result.recommendation}</p>
      {result.shouldStop && (
        <div className="mt-2 flex items-center gap-2 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          Stop activity immediately
        </div>
      )}
      <div className="mt-2 flex items-center gap-2 text-xs opacity-60">
        <span>Target: {result.expectedHR} BPM</span>
        <span>·</span>
        <span>Current: {result.currentHR} BPM</span>
      </div>
    </motion.div>
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
    const msg = generateEncouragement('win');
    setEncouragement(msg);
    setTimeout(() => setEncouragement(''), 5000);
  };

  return (
    <motion.div
      layout
      className={cn(
        'rounded-2xl p-4 transition-all duration-200',
        task.completed
          ? 'glass opacity-60'
          : isActive
          ? 'glass-card border border-primary/30 glow-blue'
          : 'glass-card border border-border'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          task.completed ? 'bg-emerald-400/20' : isActive ? 'bg-primary/20' : 'bg-secondary'
        )}>
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Icon className={cn('w-5 h-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <span className={cn('font-medium text-sm', task.completed && 'line-through text-muted-foreground')}>
              {task.title}
            </span>
            <span className="text-xs text-muted-foreground">{task.duration} min</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{task.description}</p>
          {task.targetHR && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-primary/70">
              <Heart className="w-3 h-3" />
              Target HR: &lt;{task.targetHR} BPM
            </div>
          )}

          {!task.completed && (
            <div className="flex gap-2 mt-3">
              {!isActive ? (
                <button
                  onClick={onStart}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-colors"
                >
                  <Play className="w-3 h-3" />
                  Start
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400/20 text-emerald-400 text-xs font-medium hover:bg-emerald-400/30 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Mark Complete
                </button>
              )}
            </div>
          )}

          {task.completed && task.completedAt && (
            <div className="mt-1.5 text-xs text-emerald-400/60">
              ✓ {task.completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {encouragement && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-emerald-400/20 text-sm text-emerald-400 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 flex-shrink-0" />
            {encouragement}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LiveStressEngine() {
  const { currentHR, setCurrentHR } = useAppStore();
  const [isActive, setIsActive] = useState(false);
  const [stressResult, setStressResult] = useState<CardioStressResult | null>(null);

  const simulate = useCallback(() => {
    setIsActive(true);
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      // Simulate HR rising then dropping
      const simulatedHR = tick < 5
        ? 72 + tick * 8
        : tick < 10
        ? 112 - (tick - 5) * 6
        : 80 + Math.round(Math.random() * 10);

      setCurrentHR(simulatedHR);
      const result = evaluateCardioStress({
        currentHR: simulatedHR,
        restingHR: 65,
        maxHR: 155, // 220 - age 65
        activity: 'light',
        hrVariability: 12,
      });
      setStressResult(result);

      if (tick >= 15) {
        clearInterval(interval);
        setIsActive(false);
      }
    }, 800);
  }, [setCurrentHR]);

  const simulateCritical = useCallback(() => {
    const highHR = 145;
    setCurrentHR(highHR);
    const result = evaluateCardioStress({
      currentHR: highHR,
      restingHR: 65,
      maxHR: 155,
      activity: 'vigorous',
      hrVariability: 4,
    });
    setStressResult(result);
  }, [setCurrentHR]);

  return (
    <div className="glass-card rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Cardio Stress Engine</span>
        </div>
        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
          {currentHR}
          <span className="text-xs font-normal text-muted-foreground">BPM</span>
        </div>
      </div>

      {stressResult && <StressIndicator result={stressResult} />}

      <div className="flex gap-2 mt-4">
        <button
          onClick={simulate}
          disabled={isActive}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          Simulate Walk
        </button>
        <button
          onClick={simulateCritical}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Trigger Alert
        </button>
      </div>
    </div>
  );
}

export function RehabView() {
  const { todayRehab, completeTask, setActiveTask, activeTaskId, patient } = useAppStore();

  const completedCount = todayRehab.tasks.filter((t) => t.completed).length;
  const totalCount = todayRehab.tasks.length;
  const pct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Rehab Mode</h1>
          <p className="text-sm text-muted-foreground">Week {todayRehab.week} · Day {todayRehab.day} · {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-yellow-400/20 text-yellow-400 text-xs">
            <Flame className="w-3.5 h-3.5" />
            {patient.streakDays}-day streak
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Left: Tasks */}
        <div className="space-y-4">
          {/* Progress */}
          <div className="glass-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Today&apos;s Progress</span>
              <span className="text-sm text-primary font-bold">{completedCount}/{totalCount}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{pct}% complete</span>
              {completedCount === totalCount && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-emerald-400 flex items-center gap-1"
                >
                  <Trophy className="w-3 h-3" />
                  All done!
                </motion.span>
              )}
            </div>
          </div>

          {/* AI Encouragement */}
          {todayRehab.aiEncouragement && (
            <div className="glass-card rounded-2xl p-4 border border-primary/15 flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{todayRehab.aiEncouragement}</p>
            </div>
          )}

          {/* Tasks */}
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

          {/* Wall scenario */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-2xl p-4 border border-orange-400/15"
          >
            <div className="text-xs font-medium text-orange-400 mb-1 flex items-center gap-2">
              <Heart className="w-3.5 h-3.5" />
              Demo: Wall Scenario
            </div>
            <p className="text-sm text-muted-foreground">
              {generateEncouragement('wall')}
            </p>
          </motion.div>
        </div>

        {/* Right: Stress engine + weekly stats */}
        <div className="space-y-4">
          <LiveStressEngine />

          {/* Weekly stats */}
          <div className="glass-card rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Week {WEEK_PROGRESS.week} Progress</span>
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
                  label: 'Tasks',
                  current: String(WEEK_PROGRESS.tasksCompleted),
                  target: String(WEEK_PROGRESS.totalTasks),
                  pct: (WEEK_PROGRESS.tasksCompleted / WEEK_PROGRESS.totalTasks) * 100,
                  color: 'bg-emerald-400',
                },
                {
                  label: 'Days active',
                  current: String(WEEK_PROGRESS.completedDays),
                  target: String(WEEK_PROGRESS.totalDaysThisWeek),
                  pct: (WEEK_PROGRESS.completedDays / WEEK_PROGRESS.totalDaysThisWeek) * 100,
                  color: 'bg-purple-400',
                },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{s.label}</span>
                    <span>{s.current}/{s.target}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className={cn('h-full rounded-full', s.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(s.pct, 100)}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="glass-card rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold">Milestones</span>
            </div>
            <div className="space-y-1.5">
              {patient.milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-muted-foreground">{m}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-xs mt-2">
                <Circle className="w-3.5 h-3.5 text-border flex-shrink-0" />
                <span className="text-border">Complete Week 3</span>
                <ChevronRight className="w-3 h-3 text-border ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
