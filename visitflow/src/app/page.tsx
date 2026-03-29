'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  Heart,
  Mic,
  Pill,
  Shield,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { EditorialBackdrop } from '@/components/EditorialBackdrop';

const FEATURES = [
  {
    icon: Pill,
    title: 'Medication clarity',
    desc: 'Big schedules, simple reminders, and safer family escalation when doses are missed.',
  },
  {
    icon: Mic,
    title: 'Live visit understanding',
    desc: 'Hear the doctor, tap any line, and get an explanation in calm plain language.',
  },
  {
    icon: Activity,
    title: 'Rehab guidance',
    desc: 'Daily pacing, cardio stress feedback, and recovery progress that feels easy to follow.',
  },
  {
    icon: Users,
    title: 'Family-centered care',
    desc: 'Trusted support, care circle messaging, and community transport for follow-up visits.',
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <EditorialBackdrop intensity="hero" />

      <div className="relative z-10">
        <header className="border-b border-border/80 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-[1.8rem] font-semibold tracking-tight">
                  <span className="text-primary">CorVas</span>
                  <span className="text-muted-foreground">AI</span>
                </div>
                <div className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
                  Cardiac recovery companion
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/app"
                className="rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                Open health record
              </Link>
              <Link
                href="/app?view=live-visit"
                className="rounded-2xl border border-border bg-white px-5 py-3 text-sm font-medium text-primary shadow-sm transition hover:bg-secondary/40"
              >
                Go to live visit
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid items-start gap-8 xl:grid-cols-[1.08fr_0.92fr]">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-[2.4rem] p-8"
            >
              <div className="text-xs uppercase tracking-[0.28em] text-primary">Clarity for every age</div>
              <h1 className="mt-5 max-w-4xl text-6xl font-medium tracking-tight text-foreground md:text-7xl">
                A family health record
                <br />
                <span className="text-gradient">built for calmer care.</span>
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-relaxed text-muted-foreground">
                CorVas AI brings the JingaLife-style experience to cardiology follow-up:
                medications, visits, rehab, documents, and support all live in one
                warm, understandable place instead of a stressful dashboard.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/app"
                  className="rounded-2xl bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  Open the experience
                </Link>
                <Link
                  href="/app?view=overview"
                  className="rounded-2xl border border-border bg-white px-6 py-3.5 text-base font-medium text-primary shadow-sm transition hover:bg-secondary/35"
                >
                  See health record
                </Link>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  { value: '1 place', label: 'Visits, meds, rehab, and support' },
                  { value: 'Large type', label: 'Designed for older adults and carers' },
                  { value: 'Real-time', label: 'Live explanations during care visits' },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.5rem] border border-border bg-white px-5 py-5 shadow-sm">
                    <div className="text-3xl font-semibold text-primary">{item.value}</div>
                    <div className="mt-2 text-base text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 }}
              className="space-y-5"
            >
              <div className="glass-card rounded-[2.4rem] p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-primary">Preview</div>
                    <div className="mt-2 text-2xl font-medium text-foreground">How the app feels</div>
                  </div>
                  <Calendar className="h-5 w-5 text-primary" />
                </div>

                <div className="space-y-3">
                  {[
                    'My Health Record',
                    'Medications',
                    'Medical Conditions',
                    'Documents',
                    'Family & Friends',
                  ].map((label) => (
                    <div
                      key={label}
                      className="rounded-[1.5rem] bg-[linear-gradient(180deg,#9a7bc3,#8f71b8)] px-5 py-4 text-lg font-medium text-white shadow-[0_14px_28px_rgba(143,113,184,0.14)]"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-[2.4rem] p-6">
                <div className="text-xs uppercase tracking-[0.24em] text-primary">Example visit</div>
                <div className="mt-3 space-y-3">
                  <div className="rounded-[1.4rem] border border-border bg-white px-5 py-4 shadow-sm">
                    <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Doctor said</div>
                    <div className="mt-2 text-xl text-foreground">
                      You have mild arrhythmia, but it is stable and we will keep monitoring it.
                    </div>
                  </div>
                  <div className="rounded-[1.6rem] bg-secondary px-5 py-5">
                    <div className="text-sm uppercase tracking-[0.18em] text-primary">CorVas explains</div>
                    <div className="mt-3 space-y-2 text-lg text-foreground">
                      <div>• Your heart rhythm is a little irregular.</div>
                      <div>• It is not an emergency right now.</div>
                      <div>• Your care team wants to keep watching it during recovery.</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.06 }}
                  className="glass-card rounded-[2rem] p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/12 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-5 text-2xl font-medium tracking-tight text-foreground">{feature.title}</div>
                  <div className="mt-2 text-base leading-relaxed text-muted-foreground">{feature.desc}</div>
                </motion.div>
              );
            })}
          </section>

          <section className="mt-8 rounded-[2.4rem] bg-[linear-gradient(180deg,#9a7bc3,#8f71b8)] px-8 py-7 text-white shadow-[0_20px_40px_rgba(143,113,184,0.16)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-white/72">Healthcare at home</div>
                <div className="mt-3 max-w-3xl text-3xl font-medium tracking-tight">
                  Shift the experience away from the hospital feeling and toward calm, guided recovery at home.
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/app?view=medications"
                  className="rounded-2xl bg-white px-5 py-3 text-base font-medium text-primary shadow-sm"
                >
                  See medications
                </Link>
                <Link
                  href="/app?view=rehab"
                  className="rounded-2xl border border-white/25 px-5 py-3 text-base font-medium text-white"
                >
                  See rehab
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-border/80 bg-white/85 px-6 py-4 text-sm text-muted-foreground">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <span>CorVas AI for Pulse Hackathon 2026</span>
            <span className="hidden md:inline">JingaLife-inspired web adaptation for elder-friendly cardiac care</span>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Accessible by design</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
