'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  Pill,
  Bell,
  ShieldAlert,
  Brain,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { CURRENT_VISIT, MOCK_TRANSCRIPT_LINES } from '@/lib/mock-data';
import { answerVisitQuestion, detectEscalation } from '@/lib/ai-service';
import { cn, downloadCalendarEvent } from '@/lib/utils';

function SectionCard({
  title,
  icon: Icon,
  children,
  tone = 'default',
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  tone?: 'default' | 'primary';
}) {
  return (
    <section className={cn(
      'glass-card rounded-[1.75rem] border p-5',
      tone === 'primary' ? 'border-primary/20' : 'border-border'
    )}>
      <div className="mb-4 flex items-center gap-2">
        <Icon className={cn('w-4 h-4', tone === 'primary' ? 'text-primary' : 'text-foreground/55')} />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function PostVisitView() {
  const summary = CURRENT_VISIT.summary!;
  const { medicationReminders, addNotification, setActiveView } = useAppStore();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const missedDoseCount = medicationReminders.filter((item) => item.missed).length;
  const escalation = useMemo(
    () =>
      detectEscalation({
        symptoms: missedDoseCount >= 2 ? ['medication nonadherence'] : [],
        heartRate: 96,
        alertHistory: missedDoseCount,
      }),
    [missedDoseCount]
  );

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    const ctx = MOCK_TRANSCRIPT_LINES.map((line) => `${line.speaker}: ${line.text}`).join('\n');
    const result = await answerVisitQuestion(question, ctx);
    setAnswer(result);
    setLoading(false);
  };

  const addFollowUpToCalendar = () => {
    downloadCalendarEvent({
      title: 'Cardiology follow-up',
      description: 'Repeat EKG and medication review with Dr. Okafor.',
      start: '2026-04-12T14:00:00Z',
      end: '2026-04-12T14:45:00Z',
      location: 'Hudson Heart Institute',
    });
    addNotification({
      id: `n-calendar-${Date.now()}`,
      title: 'Follow-up added to calendar',
      body: 'April 12 follow-up is now saved as a reminder.',
      category: 'medication',
      channel: 'in-app',
      level: 'info',
      timestamp: new Date(),
      read: false,
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <div className="editorial-kicker text-primary mb-2">After the visit</div>
          <h1 className="text-3xl font-bold tracking-tight">Post-Visit Care Plan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Structured summary, medication follow-through, and escalation if recovery slips.
          </p>
        </div>
        <button
          onClick={addFollowUpToCalendar}
          className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Add to calendar
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <SectionCard title="Summary" icon={FileText} tone="primary">
            <div className="space-y-3 text-sm text-foreground/72 leading-relaxed">
              <p><strong className="text-foreground">Visit outcome:</strong> Mild arrhythmia remains present, rehab continues, and medication support has started.</p>
              <p><strong className="text-foreground">Clinical focus:</strong> keep exertion inside the safe zone, monitor symptom changes, and reassess rhythm at follow-up.</p>
              <p><strong className="text-foreground">Patient takeaway:</strong> recovery is progressing, but the rhythm and medication response still need active monitoring.</p>
            </div>
          </SectionCard>

          <div className="grid gap-5 md:grid-cols-2">
            <SectionCard title="Diagnosis" icon={ShieldAlert}>
              <div className="space-y-2">
                {summary.diagnosis.map((item) => (
                  <div key={item} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-foreground/72">
                    <div className="font-medium text-foreground mb-1">{item}</div>
                    <div>
                      {item.includes('arrhythmia')
                        ? 'Slight rhythm irregularity needs monitoring, medication follow-through, and repeat EKG.'
                        : 'This frames the broader recovery stage and keeps rehab recommendations aligned to healing progress.'}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Follow-up" icon={Calendar}>
              <div className="rounded-xl border border-primary/15 bg-secondary/50 p-4">
                <div className="text-lg font-semibold mb-1 text-foreground">April 12, 2026</div>
                <div className="text-sm text-foreground/68 mb-3">{summary.followUp}</div>
                <div className="space-y-2 text-sm text-foreground/68">
                  <div>• Repeat EKG</div>
                  <div>• Medication tolerance check</div>
                  <div>• Rehab intensity review</div>
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Instructions" icon={ClipboardList}>
            <div className="space-y-2">
              {summary.instructions.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-border bg-white p-3 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-foreground/72">{item}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Ask about this visit" icon={Brain}>
            <div className="flex gap-2 mb-3">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
                placeholder="What does mild arrhythmia mean? What should I watch for this week?"
                className="flex-1 rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/40"
              />
              <button
                onClick={askQuestion}
                disabled={!question.trim() || loading}
                className="rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground border border-border hover:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                Ask
              </button>
            </div>
            <AnimatePresence>
              {answer && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-primary/15 bg-secondary/45 p-4 text-sm text-foreground/72 leading-relaxed"
                >
                  {answer}
                </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="Medications" icon={Pill} tone="primary">
            <div className="space-y-3">
              {summary.medications.map((med) => (
                <div key={med.name} className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="text-base font-semibold text-foreground">{med.name} <span className="text-foreground/60 font-normal">{med.dose}</span></div>
                      <div className="text-sm text-foreground/68 mt-1">{med.purpose}</div>
                    </div>
                    <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary border border-primary/20">
                      {med.frequency}
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2 text-sm text-foreground/68">
                    <div className="rounded-xl border border-border bg-secondary/45 p-3">
                      <div className="editorial-kicker text-foreground/45 mb-1">Schedule</div>
                      {(med.scheduleTimes ?? ['08:00']).map((time) => (
                        <div key={time}>{time}</div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-border bg-secondary/45 p-3">
                      <div className="editorial-kicker text-foreground/45 mb-1">Adherence</div>
                      <div>{med.adherenceRate ?? 100}% on time</div>
                      <div className="mt-1 text-xs">{med.missedDoses ?? 0} missed doses this week</div>
                    </div>
                  </div>
                  {med.sideEffects && (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-foreground/72">
                      <strong className="text-foreground">Watch for:</strong> {med.sideEffects.join('; ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Medication reminders + adherence" icon={Bell}>
            <div className="space-y-3">
              {medicationReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-white p-3 shadow-sm">
                  <div>
                    <div className="text-sm font-medium text-foreground">{reminder.medicationName}</div>
                    <div className="text-xs text-foreground/55">{new Date(reminder.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className={cn(
                    'rounded-full px-2.5 py-1 text-xs border',
                    reminder.taken
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : reminder.missed
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-border bg-secondary/50 text-foreground/50'
                  )}>
                    {reminder.taken ? 'Taken' : reminder.missed ? 'Missed' : 'Pending'}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Escalation path
              </div>
              <div className="space-y-2 text-sm text-foreground/74">
                <div>1. Missed dose triggers an in-app reminder.</div>
                <div>2. Repeated misses trigger family follow-up.</div>
                <div className="text-red-700">
                  Example: “Maria missed 2 doses today. Please check on her.”
                </div>
              </div>
            </div>
            {missedDoseCount >= 2 && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <strong>Active escalation:</strong> {escalation.level === 'orange' || escalation.level === 'yellow'
                  ? 'Repeated misses would notify the family contact and care team summary.'
                  : 'Care team escalation ready.'}
              </div>
            )}
          </SectionCard>

          <button
            onClick={() => setActiveView('medications')}
            className="w-full rounded-[1.5rem] border border-border bg-white px-4 py-4 text-left hover:bg-secondary/35 transition-colors flex items-center justify-between shadow-sm"
          >
            <div>
              <div className="text-sm font-semibold text-foreground">Open medication workspace</div>
              <div className="text-xs text-foreground/55 mt-1">Manage reminders, adherence, and calendar-based dose follow-up</div>
            </div>
            <ArrowRight className="w-4 h-4 text-foreground/45" />
          </button>
        </div>
      </div>
    </div>
  );
}
