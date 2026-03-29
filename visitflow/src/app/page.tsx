'use client';

import { motion } from 'framer-motion';
import { Heart, ArrowRight, Activity, Shield, Mic, Users } from 'lucide-react';
import Link from 'next/link';

const FEATURES = [
  {
    icon: Mic,
    title: 'Living Consultation',
    desc: 'Your visit — streamed, translated, and explained in real time.',
  },
  {
    icon: Activity,
    title: 'Cardiac Rehab Engine',
    desc: 'Daily plans powered by your heart rate and recovery data.',
  },
  {
    icon: Shield,
    title: 'Real-Time Risk Engine',
    desc: 'Continuous monitoring with intelligent escalation.',
  },
  {
    icon: Users,
    title: 'Family + Care Network',
    desc: 'Your trusted circle stays connected to your recovery.',
  },
];

const ARCH_ROW1 = ['Wearables + Audio', '→', 'Backend', '→', 'Fast Risk Engine', '→', 'UI + Alerts'];
const ARCH_ROW2 = ['Visit Data', '→', 'ML Layer', '→', 'Personalization', '→', 'Rehab Plan'];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-red-500/5 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary heartbeat" />
          </div>
          <span className="font-semibold tracking-tight">VisitFlow AI</span>
        </div>
        <Link
          href="/app"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Open App
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/20 text-xs text-primary mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Real-Time Cardiac Intelligence
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-none">
            Your Heart Visit,{' '}
            <span className="text-gradient">Finally</span>
            <br />
            Understood
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            VisitFlow AI transforms your cardiology visits into living experiences —
            streaming, explaining, and connecting every moment to your recovery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all pulse-ring"
            >
              <Heart className="w-5 h-5" />
              Start Your Journey
            </Link>
            <Link
              href="/app?view=live-visit"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl glass border border-border text-sm font-medium hover:bg-secondary/50 transition-colors"
            >
              <Mic className="w-4 h-4 text-primary" />
              Watch Live Visit Demo
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-xl w-full"
        >
          {[
            { value: '73%', label: 'Patients drop off rehab' },
            { value: '2.4×', label: 'Better outcomes with AI support' },
            { value: '24/7', label: 'Continuous monitoring' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-gradient mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground leading-tight">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-24 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl w-full"
        >
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="glass-card rounded-2xl p-5 text-left flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold mb-1">{f.title}</div>
                  <div className="text-sm text-muted-foreground">{f.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Architecture */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="mt-16 glass-card rounded-2xl p-6 max-w-3xl w-full text-left"
        >
          <div className="text-xs font-medium text-primary mb-4 uppercase tracking-wider">System Architecture</div>
          {[ARCH_ROW1, ARCH_ROW2].map((row, ri) => (
            <div key={ri} className="flex items-center gap-2 flex-wrap mb-3 last:mb-0">
              {row.map((s, i) => (
                <span
                  key={i}
                  className={s === '→' ? 'text-primary/40 text-sm' : 'px-2.5 py-1 glass rounded-lg text-xs text-muted-foreground'}
                >
                  {s}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      <footer className="relative z-10 border-t border-border/50 px-8 py-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>VisitFlow AI — Pulse Hackathon 2026</span>
        <span>Next.js · TypeScript · Claude AI</span>
      </footer>
    </div>
  );
}
