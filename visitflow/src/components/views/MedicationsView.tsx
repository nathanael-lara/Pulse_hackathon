'use client';

import { motion } from 'framer-motion';
import { Pill, Clock, AlertTriangle, Calendar, Bell, ShieldAlert } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { CURRENT_VISIT } from '@/lib/mock-data';
import { cn, downloadCalendarEvent } from '@/lib/utils';

export function MedicationsView() {
  const meds = CURRENT_VISIT.summary!.medications;
  const {
    medicationReminders,
    markMedicationTaken,
    markMedicationMissed,
    addNotification,
  } = useAppStore();

  const missedCount = medicationReminders.filter((item) => item.missed).length;

  const addDoseToCalendar = (medName: string, time: string) => {
    downloadCalendarEvent({
      title: `${medName} reminder`,
      description: `Take ${medName} on schedule as directed by the care team.`,
      start: `2026-03-30T${time}:00Z`,
      end: `2026-03-30T${time}:10Z`,
    });
    addNotification({
      id: `n-med-calendar-${medName}-${time}`,
      title: 'Medication reminder added',
      body: `${medName} reminder is now on the calendar.`,
      category: 'medication',
      channel: 'in-app',
      level: 'info',
      timestamp: new Date(),
      read: false,
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <div className="editorial-kicker text-primary mb-2">Medication system</div>
          <h1 className="text-3xl font-bold tracking-tight">Medication Adherence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule, reminders, adherence tracking, and escalation when recovery slips.
          </p>
        </div>
        <div className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-foreground/68 shadow-sm">
          {medicationReminders.filter((item) => item.taken).length}/{medicationReminders.length} doses logged today
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          {meds.map((med, i) => {
            const reminders = medicationReminders.filter((item) => item.medicationName === med.name);
            return (
              <motion.div
                key={med.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-[1.75rem] p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/12">
                    <Pill className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="text-lg font-semibold text-foreground">
                        {med.name} <span className="font-normal text-foreground/60">{med.dose}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                          {med.adherenceRate ?? 100}% adherence
                        </span>
                      </div>
                    </div>
                    <div className="mb-3 flex items-center gap-1.5 text-xs text-foreground/58">
                      <Clock className="h-3 w-3" />
                      {med.frequency}
                    </div>
                    <p className="mb-4 text-sm text-foreground/72">{med.purpose}</p>

                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <div className="space-y-2">
                        {reminders.map((reminder) => (
                          <div key={reminder.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-3 shadow-sm">
                            <div>
                              <div className="text-sm font-medium text-foreground">{new Date(reminder.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              <div className="text-xs text-foreground/58">
                                {reminder.taken ? 'Logged on time' : reminder.missed ? 'Dose missed' : 'Awaiting confirmation'}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => markMedicationTaken(reminder.id)}
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 transition-colors hover:bg-emerald-100"
                              >
                                Taken
                              </button>
                              <button
                                onClick={() => markMedicationMissed(reminder.id)}
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 transition-colors hover:bg-red-100"
                              >
                                Missed
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => addDoseToCalendar(med.name, med.scheduleTimes?.[0] ?? '08:00')}
                        className="flex h-fit items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary transition-colors hover:bg-primary/15"
                      >
                        <Calendar className="w-4 h-4" />
                        Add to calendar
                      </button>
                    </div>

                    {med.sideEffects && (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                        <div className="mb-1 flex items-center gap-1.5 text-xs text-amber-700">
                          <AlertTriangle className="h-3 w-3" />
                          Watch for
                        </div>
                        <p className="text-xs text-foreground/68">{med.sideEffects.join('; ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-[1.75rem] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Reminder system</span>
            </div>
            <div className="space-y-3 text-sm text-foreground/72">
              <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
                <div className="font-medium text-foreground mb-1">Notification sync</div>
                In-app reminders, push prompts, and optional SMS escalation all draw from the same dose schedule.
              </div>
              <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
                <div className="font-medium text-foreground mb-1">Repeated miss logic</div>
                First miss notifies Maria. Repeated misses trigger family follow-up and care-team awareness.
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[1.75rem] p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <span className="text-sm font-semibold text-foreground">Escalation preview</span>
            </div>

            <div className={cn(
              'rounded-2xl p-4 border text-sm',
              missedCount >= 2
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-border bg-white text-foreground/72'
            )}>
              {missedCount >= 2 ? (
                <>
                  <div className="mb-2 flex items-center gap-2 font-semibold text-red-700">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Family contact notification
                  </div>
                  <p className="leading-relaxed text-red-700">Maria missed 2 doses today. Please check on her.</p>
                </>
              ) : (
                <>
                  <div className="font-semibold mb-2 text-foreground">No active escalation</div>
                  <p>Once repeated misses are detected, this panel shifts into outreach mode and supports family notification.</p>
                </>
              )}
            </div>

            <div className="mt-4 grid gap-2">
              {medicationReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between rounded-xl border border-border bg-secondary/60 px-3 py-2.5 text-xs">
                  <span className="text-foreground/78">{reminder.medicationName} · {new Date(reminder.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={cn(
                    reminder.taken ? 'text-emerald-700' : reminder.missed ? 'text-red-700' : 'text-foreground/50'
                  )}>
                    {reminder.taken ? 'Taken' : reminder.missed ? 'Missed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
