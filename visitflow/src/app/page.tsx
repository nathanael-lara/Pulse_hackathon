'use client';

import Link from 'next/link';
import { Heart, MessageCircleMore, Pill, Route, ShieldCheck } from 'lucide-react';

const FEATURES = [
  {
    title: 'Today stays clear',
    description: 'One main daily screen instead of a crowded dashboard.',
    icon: Heart,
  },
  {
    title: 'Ask by voice',
    description: 'Speak naturally when reading or tapping feels harder.',
    icon: MessageCircleMore,
  },
  {
    title: 'Medication support',
    description: 'Big reminders, real dose logging, and calm follow-up when doses are missed.',
    icon: Pill,
  },
  {
    title: 'Recovery guidance',
    description: 'A simple 12-week plan with setbacks, milestones, and gentle escalation.',
    icon: Route,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff9ef,transparent_34%),linear-gradient(180deg,#f6fbfb,#edf4f3)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-[32px] border border-white/75 bg-white/92 px-5 py-5 shadow-[0_28px_80px_rgba(15,23,42,0.08)] sm:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--color-panel-highlight)] text-[var(--color-teal-deep)]">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-semibold tracking-tight text-slate-950">CorVas</p>
                  <p className="text-sm text-slate-600">Cardiac recovery companion</p>
                </div>
              </div>
              <h1 className="mt-8 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                A calmer recovery app for older adults after a heart event.
              </h1>
              <p className="mt-5 max-w-2xl text-xl leading-9 text-slate-700">
                CorVas turns medications, visit notes, rehab, and support into one warm, installable app that feels easier to trust and easier to use.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/app"
                  className="inline-flex min-h-14 items-center justify-center rounded-full bg-[var(--color-teal-deep)] px-6 text-lg font-semibold text-white"
                >
                  Open the app
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] bg-[linear-gradient(180deg,#eef8f6,#ffffff)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] lg:w-[27rem]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal-deep)]">
                Built for reassurance
              </p>
              <div className="mt-4 rounded-[24px] bg-white p-5">
                <p className="text-xl font-semibold text-slate-950">What matters today?</p>
                <p className="mt-3 text-base leading-7 text-slate-700">
                  Take morning metoprolol with breakfast. Then aim for your gentle 20-minute walk. If breathlessness feels worse, use the support screen and we’ll help.
                </p>
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-[24px] bg-[var(--color-panel-highlight)] p-5">
                <ShieldCheck className="mt-1 h-6 w-6 text-[var(--color-teal-deep)]" />
                <p className="text-base leading-7 text-slate-700">
                  Large text, voice-first help, offline basics, onboarding, and persistent local state are all built in.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-[28px] border border-white/75 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--color-panel-soft)] text-[var(--color-teal-deep)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-slate-950">{feature.title}</h2>
                <p className="mt-3 text-base leading-7 text-slate-700">{feature.description}</p>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
