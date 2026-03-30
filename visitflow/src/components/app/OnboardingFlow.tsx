'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Mic, Bell, Users, CheckCircle2, ShieldPlus, Type, Sparkles } from 'lucide-react';
import { PrimaryButton, SecondaryButton, ToggleRow } from '@/components/app/ui';
import { useAppStore } from '@/lib/store';

const STEPS = [
  {
    title: 'Welcome to CorVas',
    description: 'A calm recovery companion for the weeks after a heart event.',
    icon: Heart,
  },
  {
    title: 'What CorVas can help with',
    description: 'One place for medications, rehab, visit explanations, and asking for help.',
    icon: Sparkles,
  },
  {
    title: 'Voice can be your easiest path',
    description: 'You can tap the microphone and ask questions in plain language anytime.',
    icon: Mic,
  },
  {
    title: 'Let’s tailor your recovery plan',
    description: 'A few choices will make reminders and guidance feel easier to follow.',
    icon: ShieldPlus,
  },
  {
    title: 'Medication support',
    description: 'We can keep reminders gentle, spoken, or both.',
    icon: Bell,
  },
  {
    title: 'Care-circle support',
    description: 'Choose whether CorVas should suggest updates to family or trusted helpers.',
    icon: Users,
  },
  {
    title: 'Reading comfort',
    description: 'We can keep text large and responses spoken back when that feels easier.',
    icon: Type,
  },
  {
    title: 'You are ready',
    description: 'We will keep the app simple on the surface and help when recovery feels hard.',
    icon: CheckCircle2,
  },
] as const;

export function OnboardingFlow() {
  const { onboarding, updateOnboarding, completeOnboarding } = useAppStore();
  const [step, setStep] = useState(0);

  const progress = useMemo(
    () => Math.round(((step + 1) / STEPS.length) * 100),
    [step]
  );

  const isLastStep = step === STEPS.length - 1;
  const StepIcon = STEPS[step].icon;

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,#fff7eb,transparent_35%),linear-gradient(180deg,#f7fbfb,#f0f5f4)] px-4 py-6">
      <div className="mx-auto max-w-xl rounded-[36px] border border-white/75 bg-white/92 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-teal-deep)]">
              Setup
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Step {step + 1} of {STEPS.length}
            </p>
          </div>
          <div className="rounded-full bg-[var(--color-panel-soft)] px-4 py-2 text-sm font-semibold text-[var(--color-teal-deep)]">
            {progress}% done
          </div>
        </div>

        <div className="mt-5 h-2 rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-teal-deep),var(--color-gold))] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mt-6"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--color-panel-soft)] text-[var(--color-teal-deep)]">
              <StepIcon className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
              {STEPS[step].title}
            </h1>
            <p className="mt-3 text-lg leading-8 text-slate-700">
              {STEPS[step].description}
            </p>

            <div className="mt-8 space-y-4">
              {step === 0 && (
                <>
                  <label className="block">
                    <span className="mb-2 block text-base font-semibold text-slate-900">What should we call you?</span>
                    <input
                      value={onboarding.preferredName}
                      onChange={(event) => updateOnboarding({ preferredName: event.target.value })}
                      className="h-14 w-full rounded-[20px] border border-[var(--color-panel-border)] px-4 text-lg text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-[var(--color-teal-deep)]"
                      placeholder="Preferred name"
                    />
                  </label>
                  <div className="rounded-[24px] bg-[var(--color-panel-soft)] p-4 text-base leading-7 text-slate-700">
                    CorVas is here to explain what matters, keep today simple, and help you reach out before recovery starts to drift.
                  </div>
                </>
              )}

              {step === 1 && (
                <div className="grid gap-3">
                  {[
                    'Explain doctor language in plain English',
                    'Keep medicine and rehab tasks easy to follow',
                    'Notice when recovery may need more support',
                  ].map((item) => (
                    <div key={item} className="rounded-[22px] border border-[var(--color-panel-border)] bg-white px-4 py-4 text-base text-slate-800">
                      {item}
                    </div>
                  ))}
                </div>
              )}

              {step === 2 && (
                <>
                  <div className="rounded-[24px] bg-[var(--color-panel-highlight)] p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal-deep)]">
                      Try saying
                    </p>
                    <div className="mt-3 space-y-3 text-lg leading-8 text-slate-900">
                      <p>&ldquo;What did my doctor mean?&rdquo;</p>
                      <p>&ldquo;Did I take my medicine today?&rdquo;</p>
                      <p>&ldquo;I feel more short of breath today.&rdquo;</p>
                    </div>
                  </div>
                  <ToggleRow
                    label="Speak replies out loud"
                    description="Helpful if reading feels tiring."
                    checked={onboarding.spokenReplies}
                    onChange={(value) => updateOnboarding({ spokenReplies: value })}
                  />
                </>
              )}

              {step === 3 && (
                <>
                  <label className="block">
                    <span className="mb-2 block text-base font-semibold text-slate-900">Recovery goal</span>
                    <textarea
                      value={onboarding.recoveryGoal}
                      onChange={(event) => updateOnboarding({ recoveryGoal: event.target.value })}
                      className="min-h-28 w-full rounded-[20px] border border-[var(--color-panel-border)] px-4 py-4 text-lg text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--color-teal-deep)]"
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ['gentle', 'Keep things extra simple'],
                      ['standard', 'I am okay with a little more detail'],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateOnboarding({ comfortWithTech: value as 'gentle' | 'standard' })}
                        className={`rounded-[22px] border px-4 py-4 text-left text-base ${
                          onboarding.comfortWithTech === value
                            ? 'border-[var(--color-teal-deep)] bg-[var(--color-panel-highlight)] text-slate-900'
                            : 'border-[var(--color-panel-border)] bg-white text-slate-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 4 && (
                <div className="grid gap-3">
                  {[
                    ['both', 'Gentle reminders and spoken nudges'],
                    ['spoken', 'Spoken reminders only'],
                    ['gentle', 'Gentle reminders only'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateOnboarding({ reminderStyle: value as 'gentle' | 'spoken' | 'both' })}
                      className={`rounded-[22px] border px-4 py-4 text-left text-base ${
                        onboarding.reminderStyle === value
                          ? 'border-[var(--color-teal-deep)] bg-[var(--color-panel-highlight)] text-slate-900'
                          : 'border-[var(--color-panel-border)] bg-white text-slate-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {step === 5 && (
                <ToggleRow
                  label="Suggest updates to family or trusted helpers"
                  description="CorVas will gently suggest sharing an update if recovery gets off track."
                  checked={onboarding.caregiverUpdates}
                  onChange={(value) => updateOnboarding({ caregiverUpdates: value })}
                />
              )}

              {step === 6 && (
                <>
                  <ToggleRow
                    label="Use larger text"
                    description="Recommended for easier reading."
                    checked={onboarding.largeText}
                    onChange={(value) => updateOnboarding({ largeText: value })}
                  />
                  <ToggleRow
                    label="Speak helpful replies"
                    description="CorVas can read back answers and reminders."
                    checked={onboarding.spokenReplies}
                    onChange={(value) => updateOnboarding({ spokenReplies: value })}
                  />
                </>
              )}

              {step === 7 && (
                <div className="rounded-[24px] bg-[var(--color-panel-highlight)] p-5">
                  <p className="text-xl font-semibold text-slate-950">
                    {onboarding.preferredName || 'Friend'}, you are ready to start.
                  </p>
                  <p className="mt-3 text-lg leading-8 text-slate-700">
                    CorVas will keep today clear, speak plainly, and help you ask for support before things feel overwhelming.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <SecondaryButton onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
            Back
          </SecondaryButton>
          <div className="flex flex-col gap-3 sm:flex-row">
            {!isLastStep ? (
              <SecondaryButton onClick={() => setStep(STEPS.length - 1)}>
                Skip to finish
              </SecondaryButton>
            ) : null}
            <PrimaryButton
              onClick={() => {
                if (isLastStep) {
                  completeOnboarding();
                  return;
                }
                setStep((current) => Math.min(STEPS.length - 1, current + 1));
              }}
            >
              {isLastStep ? 'Start using CorVas' : 'Continue'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

