'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Activity, Calendar, MessageSquare, FileText,
  Pill, Users, LayoutDashboard, Radio, Bell, Menu
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { RiskBadge } from './RiskBadge';
import { cn } from '@/lib/utils';
import { EditorialBackdrop } from './EditorialBackdrop';

const NAV_ITEMS = [
  { id: 'overview', label: 'My Health Record', icon: LayoutDashboard, tone: 'band' },
  { id: 'pre-visit', label: 'Pre-Visit Care', icon: Calendar, tone: 'band' },
  { id: 'live-visit', label: 'Live Visit', icon: Radio, tone: 'band' },
  { id: 'post-visit', label: 'Post-Visit', icon: FileText, tone: 'band' },
  { id: 'medications', label: 'Medications', icon: Pill, tone: 'band' },
  { id: 'rehab', label: 'Rehab Program', icon: Activity, tone: 'band' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, tone: 'soft' },
  { id: 'documents', label: 'Documents', icon: FileText, tone: 'soft' },
  { id: 'peers', label: 'Family & Support', icon: Users, tone: 'soft' },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const {
    activeView,
    setActiveView,
    riskLevel,
    patient,
    currentHR,
    currentSteps,
    notifications,
    markNotificationRead,
  } = useAppStore();

  const unread = notifications.filter((item) => !item.read);
  const topNotes = notifications.slice(0, 3);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <EditorialBackdrop className="opacity-70" intensity="subtle" />

      <div className="relative z-10 min-h-screen">
        <header className="border-b border-border/80 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-[1.75rem] font-semibold leading-none tracking-tight">
                  <span className="text-primary">Jinga</span>
                  <span className="text-muted-foreground">Life</span>
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
                  VisitFlow web record
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <div className="rounded-2xl border border-border bg-white px-4 py-2 text-sm text-muted-foreground shadow-sm">
                Built for older adults, family carers, and cardiac follow-up
              </div>
              <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white text-primary shadow-sm">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1480px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
          <aside className="space-y-5">
            <section className="glass-card rounded-[2rem] p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-white text-3xl font-semibold text-primary shadow-sm">
                  {patient.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-3xl font-medium tracking-tight text-foreground">
                    {patient.name}
                  </div>
                  <div className="mt-2 text-base text-muted-foreground">
                    Week {patient.rehabWeek} cardiac recovery
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <RiskBadge level={riskLevel} />
                    <span className="text-sm text-muted-foreground">{patient.streakDays}-day adherence streak</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: 'Medication', value: '2', sub: 'today', icon: Pill },
                  { label: 'Medical Issues', value: '3', sub: 'tracked', icon: Heart },
                  { label: 'Alerts', value: unread.length.toString(), sub: 'active', icon: Bell },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-[1.25rem] border border-border bg-secondary/45 px-3 py-4 text-center">
                      <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary/40 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.2em] text-primary">{item.label}</div>
                      <div className="mt-1 text-2xl font-semibold text-foreground">{item.value}</div>
                      <div className="text-sm text-muted-foreground">{item.sub}</div>
                    </div>
                  );
                })}
              </div>
            </section>

            <nav className="space-y-3">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={cn(
                      'w-full rounded-[1.6rem] px-5 py-4 text-left transition-all duration-200',
                      item.tone === 'band' ? 'jinga-band' : 'glass-card',
                      isActive ? 'scale-[1.01] shadow-[0_14px_30px_rgba(143,113,184,0.2)]' : 'opacity-92 hover:opacity-100'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full',
                        item.tone === 'band' ? 'bg-white/14 text-white' : 'bg-primary/12 text-primary'
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className={cn(
                          'text-xs uppercase tracking-[0.24em]',
                          item.tone === 'band' ? 'text-white/75' : 'text-primary'
                        )}>
                          Care module
                        </div>
                        <div className={cn(
                          'mt-1 text-xl font-medium tracking-tight',
                          item.tone === 'band' ? 'text-white' : 'text-foreground'
                        )}>
                          {item.label}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            <section className="glass-card rounded-[2rem] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-primary">Vitals</div>
                  <div className="mt-1 text-xl font-medium text-foreground">Today&apos;s snapshot</div>
                </div>
                <Heart className="h-5 w-5 text-primary" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[1.25rem] border border-border bg-white px-4 py-4">
                  <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Heart rate</div>
                  <div className="mt-2 text-4xl font-semibold text-foreground">{currentHR}</div>
                  <div className="text-sm text-primary">beats/min</div>
                </div>
                <div className="rounded-[1.25rem] border border-border bg-white px-4 py-4">
                  <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Steps</div>
                  <div className="mt-2 text-4xl font-semibold text-foreground">{currentSteps.toLocaleString()}</div>
                  <div className="text-sm text-primary">today</div>
                </div>
              </div>
            </section>

            <section className="glass-card rounded-[2rem] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-primary">Notifications</div>
                  <div className="mt-1 text-xl font-medium text-foreground">Family-safe alerts</div>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-sm text-primary">{unread.length} unread</span>
              </div>
              <div className="space-y-3">
                {topNotes.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => markNotificationRead(item.id)}
                    className="w-full rounded-[1.2rem] border border-border bg-white px-4 py-3 text-left shadow-sm transition hover:bg-secondary/35"
                  >
                    <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{item.category}</div>
                    <div className="mt-1 text-base text-foreground">{item.title}</div>
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <main className="relative min-w-0">
            <div className="pointer-events-none absolute inset-0 rounded-[2.25rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.36),rgba(255,255,255,0))]" />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="relative min-h-[calc(100vh-9rem)] overflow-hidden rounded-[2.25rem] border border-border/80 bg-white/55 p-4 backdrop-blur-sm sm:p-6"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
