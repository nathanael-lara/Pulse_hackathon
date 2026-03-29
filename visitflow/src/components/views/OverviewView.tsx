'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  FileText,
  Heart,
  Pill,
  ShieldAlert,
  Stethoscope,
  Users,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { CURRENT_VISIT } from '@/lib/mock-data';

const RECORD_MODULES = [
  {
    id: 'medications',
    label: 'Medications',
    subtitle: 'Schedules, reminders, and adherence',
    icon: Pill,
  },
  {
    id: 'documents',
    label: 'Documents',
    subtitle: 'Visit summaries, labs, and prescriptions',
    icon: FileText,
  },
  {
    id: 'pre-visit',
    label: 'Medical Conditions',
    subtitle: 'Symptoms, screening, and pre-visit checks',
    icon: Stethoscope,
  },
  {
    id: 'peers',
    label: 'Family & Friends',
    subtitle: 'Trusted care circle and support rides',
    icon: Users,
  },
];

function RecordModuleCard({
  label,
  subtitle,
  icon: Icon,
  onOpen,
}: {
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="jinga-soft-panel group relative w-full rounded-[1.9rem] px-5 py-5 text-left transition hover:translate-y-[-1px] hover:shadow-[0_10px_24px_rgba(143,113,184,0.12)] sm:px-6"
    >
      <div className="flex flex-col items-start gap-4 pr-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/16 bg-white/80">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.24em] text-primary/80">Health record</div>
          <div className="mt-2 text-[1.9rem] font-medium leading-[1.02] tracking-tight text-foreground sm:text-[2rem]">
            {label}
          </div>
          <div className="mt-3 max-w-[22rem] text-[1.02rem] leading-6 text-foreground/78 sm:text-[1.06rem]">
            {subtitle}
          </div>
        </div>
      </div>
      <ArrowRight className="absolute right-5 top-5 h-5 w-5 text-primary/70 transition group-hover:translate-x-0.5 sm:right-6" />
    </button>
  );
}

export function OverviewView() {
  const { patient, currentHR, currentSteps, setActiveView, medicationReminders, notifications } = useAppStore();
  const missedMeds = medicationReminders.filter((reminder) => reminder.missed).length;
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <div className="mx-auto max-w-6xl p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]"
      >
        <section className="glass-card rounded-[2.2rem] p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 via-primary/12 to-white text-5xl font-semibold text-primary shadow-sm">
              {patient.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs uppercase tracking-[0.26em] text-primary">My health record</div>
              <h1 className="mt-3 text-5xl font-medium tracking-tight text-foreground">{patient.name}</h1>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                One clear place for visit guidance, medications, rehab plans, documents,
                and family support so recovery never feels confusing.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveView('live-visit')}
                  className="rounded-2xl bg-primary px-5 py-3 text-base font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  Open live visit
                </button>
                <button
                  onClick={() => setActiveView('post-visit')}
                  className="rounded-2xl border border-border bg-white px-5 py-3 text-base font-medium text-primary shadow-sm transition hover:bg-secondary/50"
                >
                  View last summary
                </button>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            {RECORD_MODULES.map((module) => (
              <RecordModuleCard
                key={module.id}
                {...module}
                onOpen={() => setActiveView(module.id)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="glass-card rounded-[2.2rem] p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-primary">Vitals</div>
                <div className="mt-2 text-2xl font-medium text-foreground">Today&apos;s heart view</div>
              </div>
              <Heart className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-5 rounded-[1.7rem] border border-border bg-white px-6 py-8 text-center shadow-sm">
              <div className="text-sm uppercase tracking-[0.2em] text-[#9cc96b]">Heart rate</div>
              <div className="mt-4 text-8xl font-semibold leading-none text-foreground">{currentHR}</div>
              <div className="mt-2 text-base font-medium tracking-[0.18em] text-primary">BEATS / MIN.</div>
              <div className="mt-6 h-20 rounded-[1.4rem] bg-[linear-gradient(180deg,#fff,#faf6fd)]">
                <svg viewBox="0 0 100 30" className="h-full w-full px-4 py-3 text-primary">
                  <path
                    d="M0 18 C 15 19, 24 16, 36 16 C 51 16, 55 21, 69 19 C 79 18, 88 13, 100 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[2.2rem] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-primary">Care status</div>
                <div className="mt-2 text-2xl font-medium text-foreground">What needs attention</div>
              </div>
              <button
                onClick={() => setActiveView('messages')}
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-primary shadow-sm"
              >
                Contact team
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {[
                {
                  label: 'Medication reminders',
                  value: missedMeds ? `${missedMeds} missed today` : 'On track',
                  icon: Pill,
                },
                {
                  label: 'Unread alerts',
                  value: unread ? `${unread} new notifications` : 'All clear',
                  icon: ShieldAlert,
                },
                {
                  label: 'Steps today',
                  value: `${currentSteps.toLocaleString()} completed`,
                  icon: Heart,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-4 rounded-[1.4rem] border border-border bg-white px-4 py-4 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/12 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{item.label}</div>
                      <div className="mt-1 text-lg text-foreground">{item.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]"
      >
        <section className="glass-card rounded-[2.2rem] p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-primary">Appointments</div>
              <div className="mt-2 text-2xl font-medium text-foreground">Next medical appointments</div>
            </div>
            <Calendar className="h-5 w-5 text-primary" />
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-[1.5rem] border border-border bg-white px-5 py-4 shadow-sm">
              <div className="text-sm uppercase tracking-[0.18em] text-primary">Cardiology follow-up</div>
              <div className="mt-2 text-2xl font-medium text-foreground">April 12, 10:30 AM</div>
              <div className="mt-1 text-base text-muted-foreground">Review rhythm, medication tolerance, and rehab pacing.</div>
            </div>
            <button
              onClick={() => setActiveView('post-visit')}
              className="rounded-2xl border border-border bg-secondary/60 px-5 py-3 text-base font-medium text-primary transition hover:bg-secondary"
            >
              Open visit summary
            </button>
          </div>
        </section>

        <section className="glass-card rounded-[2.2rem] p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-primary">Latest visit</div>
              <div className="mt-2 text-2xl font-medium text-foreground">Plain-language recap</div>
            </div>
            <button
              onClick={() => setActiveView('live-visit')}
              className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-primary shadow-sm"
            >
              Replay conversation
            </button>
          </div>

          <div className="mt-5 rounded-[1.7rem] bg-[linear-gradient(180deg,#9a7bc3,#8f71b8)] px-6 py-5 text-white shadow-[0_18px_32px_rgba(143,113,184,0.16)]">
            <div className="text-sm uppercase tracking-[0.2em] text-white/76">Doctor guidance</div>
            <div className="mt-3 space-y-3">
              {CURRENT_VISIT.summary?.keyPoints.map((point) => (
                <div key={point} className="flex items-start gap-3 text-lg">
                  <span className="mt-1 text-xl leading-none">•</span>
                  <span className="text-white/95">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
