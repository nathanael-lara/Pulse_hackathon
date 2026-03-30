'use client';

import { useMemo, useState } from 'react';
import { Activity, Apple, ArrowRight, Calendar, CheckCircle2, HeartPulse, Loader, Mic, Phone, Pill, Plus, Trash2, TriangleAlert } from 'lucide-react';
import { MetricTile, PrimaryButton, ScreenTitle, SectionCard, SecondaryButton, SegmentedTabs, SmallAction, StatusBadge } from '@/components/app/ui';
import { getMedicationSummary, getRecoverySummary, getTodaysCheckIn, getMotivationalMessage } from '@/lib/corvas-logic';
import { buildPatientContextPackage } from '@/lib/context-builder';
import { useAppStore } from '@/lib/store';
import type { MealLogEntry, PreVisitPrepQuestion } from '@/lib/types';

function RatingRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-base font-semibold text-slate-900">{label}</span>
        <span className="text-sm text-slate-600">{value}/4</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[0, 1, 2, 3, 4].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`min-h-12 rounded-[18px] border text-base font-semibold ${
              option === value
                ? 'border-[var(--color-teal-deep)] bg-[var(--color-panel-highlight)] text-slate-950'
                : 'border-[var(--color-panel-border)] bg-white text-slate-600'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TodayScreen() {
  const {
    patient,
    dailyBrief,
    medications,
    recoveryWeeks,
    symptomCheckIns,
    setbacks,
    escalations,
    contacts,
    preVisitPrep,
    mealLogs,
    sodiumBudgetMg,
    onboarding,
    visitSegments,
    documents,
    chatHistory,
    addSymptomCheckIn,
    markDoseStatus,
    setActiveTab,
    setPreVisitPrep,
    markPrepQuestionAnswered,
    addMealLog,
    removeMealLog,
  } = useAppStore();

  const [prepLoading, setPrepLoading] = useState(false);
  const [prepExpanded, setPrepExpanded] = useState(false);
  const [dietFormOpen, setDietFormOpen] = useState(false);
  const [dietForm, setDietForm] = useState<{
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    description: string;
    sodiumMg: number;
  }>({
    mealType: 'lunch',
    description: '',
    sodiumMg: 200,
  });
  const [dietSuggestionsLoading, setDietSuggestionsLoading] = useState(false);
  const [dietSuggestions, setDietSuggestions] = useState<
    Array<{ name: string; sodiumMg: number; caloriesEstimate: number; description: string; why: string }>
  >([]);
  const [todayDetail, setTodayDetail] = useState<'checkin' | 'meals'>('checkin');
  const [checkInSaved, setCheckInSaved] = useState<string | null>(null);
  const [mealNotice, setMealNotice] = useState<string | null>(null);

  const medicationSummary = useMemo(() => getMedicationSummary(medications), [medications]);
  const recoverySummary = useMemo(() => getRecoverySummary(recoveryWeeks), [recoveryWeeks]);
  const todaysCheckIn = getTodaysCheckIn(symptomCheckIns);
  const topEscalation = escalations[0];
  const nextDose = medicationSummary.doses.find((dose) => dose.status !== 'taken');
  const [form, setForm] = useState({
    breathlessness: todaysCheckIn?.breathlessness ?? 1,
    dizziness: todaysCheckIn?.dizziness ?? 0,
    chestDiscomfort: todaysCheckIn?.chestDiscomfort ?? 0,
    worry: todaysCheckIn?.worry ?? 1,
    note: todaysCheckIn?.note ?? '',
  });

  // Calculate days until visit
  const now = new Date();
  const visitDate = new Date(patient.nextVisitDate);
  const hasVisitDate = Number.isFinite(visitDate.getTime());
  const daysUntilVisit = hasVisitDate
    ? Math.ceil((visitDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const preVisitStage: 'light' | 'full' | 'priority' | 'primary' | null =
    daysUntilVisit === 0
      ? 'primary'
      : daysUntilVisit !== null && daysUntilVisit >= 1 && daysUntilVisit <= 3
        ? 'priority'
        : daysUntilVisit !== null && daysUntilVisit >= 4 && daysUntilVisit <= 7
          ? 'full'
          : daysUntilVisit !== null && daysUntilVisit >= 8 && daysUntilVisit <= 14
            ? 'light'
            : !hasVisitDate && preVisitPrep
              ? 'full'
              : null;
  const preVisitProgressCount = preVisitPrep ? preVisitPrep.questions.filter((q) => q.answered).length : 0;

  // Diet tracking helpers
  const today = new Date();
  const todaysMeals = mealLogs.filter(
    (meal) =>
      new Date(meal.createdAt).toDateString() === today.toDateString()
  );
  const todaysSodium = todaysMeals.reduce((sum, meal) => sum + meal.sodiumMg, 0);
  const sodiumRemaining = Math.max(0, sodiumBudgetMg - todaysSodium);
  const sodiumPercentage = (todaysSodium / sodiumBudgetMg) * 100;

  function getSodiumColor(): 'text-emerald-600' | 'text-amber-600' | 'text-red-600' {
    if (todaysSodium < 1000) return 'text-emerald-600';
    if (todaysSodium < 1400) return 'text-amber-600';
    return 'text-red-600';
  }

  async function getDietSuggestions() {
    setDietSuggestionsLoading(true);
    try {
      const context = buildPatientContextPackage({
        patient,
        onboarding,
        medications,
        recoveryWeeks,
        symptomCheckIns,
        setbacks,
        visitSegments,
        documents,
        chatHistory,
      });

      const response = await fetch('/api/diet-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: dietForm.mealType,
          recentMeals: mealLogs.slice(0, 5),
          sodiumBudgetRemaining: sodiumRemaining,
        }),
      });

      if (!response.ok) throw new Error('Failed to get suggestions');

      const data = (await response.json()) as {
        suggestions: Array<{ name: string; sodiumMg: number; caloriesEstimate: number; description: string; why: string }>;
      };
      setDietSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error getting diet suggestions:', error);
    } finally {
      setDietSuggestionsLoading(false);
    }
  }

  // Generate pre-visit prep questions
  async function generatePrepQuestions() {
    setPrepLoading(true);
    try {
      const context = buildPatientContextPackage({
        patient,
        onboarding,
        medications,
        recoveryWeeks,
        symptomCheckIns,
        setbacks,
        visitSegments,
        documents,
        chatHistory,
      });

      const response = await fetch('/api/pre-visit-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientContext: context }),
      });

      if (!response.ok) throw new Error('Failed to generate questions');

      const data = (await response.json()) as { questions: PreVisitPrepQuestion[] };
      setPreVisitPrep({
        id: `prep-${Date.now()}`,
        visitDate: patient.nextVisitDate,
        generatedAt: new Date().toISOString(),
        questions: data.questions,
      });
      setPrepExpanded(true);
    } catch (error) {
      console.error('Error generating prep questions:', error);
    } finally {
      setPrepLoading(false);
    }
  }

  function saveCheckIn() {
    addSymptomCheckIn({
      breathlessness: form.breathlessness,
      dizziness: form.dizziness,
      fatigue: Math.max(form.worry - 1, 0),
      chestDiscomfort: form.chestDiscomfort,
      worry: form.worry,
      note: form.note,
    });
    setCheckInSaved('Today’s check-in was saved. CorVas will use it to guide the next steps.');
  }

  function getVisitTimingCopy() {
    if (daysUntilVisit === null) {
      return 'Your next visit plan';
    }

    if (daysUntilVisit > 1) {
      return `Your next visit is in ${daysUntilVisit} days.`;
    }

    if (daysUntilVisit === 1) {
      return 'Your next visit is tomorrow.';
    }

    if (daysUntilVisit === 0) {
      return 'Your next visit is today.';
    }

    return 'Keep your visit questions ready.';
  }

  function renderPreVisitCard(stage: 'light' | 'full' | 'priority' | 'primary') {
    if (stage === 'light') {
      return (
        <SectionCard>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--color-panel-highlight)] text-[var(--color-teal-deep)]">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal-deep)]">
                  Pre-visit reminder
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{getVisitTimingCopy()}</h2>
                <p className="mt-2 text-base leading-7 text-slate-700">
                  It is a little early for full prep, but this is a good time to start collecting questions as they come up.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <PrimaryButton
                onClick={preVisitPrep ? () => setPrepExpanded((current) => !current) : generatePrepQuestions}
                disabled={prepLoading}
              >
                {preVisitPrep ? 'Open my question list' : prepLoading ? 'Preparing...' : 'Start my question list'}
              </PrimaryButton>
              <SecondaryButton onClick={() => setActiveTab('ask')}>
                Ask about this visit
              </SecondaryButton>
            </div>
          </div>
        </SectionCard>
      );
    }

    const isPrimary = stage === 'primary';
    const isPriority = stage === 'priority';

    return (
      <SectionCard tone="highlight" className="overflow-hidden">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white text-[var(--color-teal-deep)]">
              <Calendar className="h-7 w-7" />
            </div>
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal-deep)]">
                {isPrimary ? 'Today’s visit' : 'Pre-visit plan'}
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                {isPrimary ? 'Keep your questions ready for today.' : getVisitTimingCopy()}
              </h2>
              <p className="mt-2 text-base leading-7 text-slate-700">
                {isPrimary
                  ? 'This is the main thing to focus on today. Keep your top questions easy to reach before the visit starts.'
                  : isPriority
                    ? 'Your visit is close now, so this plan moves near the top. Let’s make sure your most important questions are ready.'
                    : 'This is the right week to get your questions ready so the visit feels calmer and more useful.'}
              </p>
              <div className="mt-4 rounded-[22px] bg-white/90 p-4 text-base leading-7 text-slate-800">
                <strong>Visit time:</strong>{' '}
                {hasVisitDate ? (
                  <>
                    {new Date(patient.nextVisitDate).toLocaleDateString([], { month: 'long', day: 'numeric' })} at{' '}
                    {new Date(patient.nextVisitDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} with {patient.careTeamName}.
                  </>
                ) : (
                  <>Visit details will appear here when the next appointment is set.</>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[24px] bg-white/88 px-5 py-4 text-left lg:min-w-56">
            <p className="text-sm text-slate-600">Question progress</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
              {preVisitProgressCount}/{preVisitPrep?.questions.length ?? 0}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {preVisitPrep ? 'Questions saved for your visit.' : 'No question list started yet.'}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {preVisitPrep ? (
            <>
              <PrimaryButton onClick={() => setPrepExpanded((current) => !current)}>
                {prepExpanded ? 'Hide my questions' : 'Open my questions'}
              </PrimaryButton>
              <SecondaryButton onClick={() => setActiveTab('ask')}>
                Ask CorVas about this visit
              </SecondaryButton>
            </>
          ) : (
            <>
              <PrimaryButton
                onClick={generatePrepQuestions}
                disabled={prepLoading}
                className="inline-flex items-center gap-2"
              >
                {prepLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Generating questions...
                  </>
                ) : (
                  <>Prepare my visit questions</>
                )}
              </PrimaryButton>
              <SecondaryButton onClick={() => setActiveTab('ask')}>
                Ask CorVas what to ask
              </SecondaryButton>
            </>
          )}
        </div>

        {preVisitPrep && !prepExpanded ? (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {preVisitPrep.questions
              .filter((question) => !question.answered)
              .slice(0, 2)
              .map((question) => (
                <div key={question.id} className="rounded-[20px] border border-white/70 bg-white/92 p-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => markPrepQuestionAnswered(question.id, '')}
                      className="mt-1 flex-shrink-0"
                    >
                      <div className="h-6 w-6 rounded-full border-2 border-slate-300" />
                    </button>
                    <div className="flex-1">
                      <p className="text-base font-semibold text-slate-950">{question.question}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {question.priority === 'high' ? 'High priority' : question.priority === 'medium' ? 'Helpful to ask' : 'Optional'} · {question.category}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : null}

        {prepExpanded && preVisitPrep ? (
          <div className="mt-5 space-y-3 border-t border-[var(--color-panel-border)] pt-5">
            {preVisitPrep.questions.map((question) => (
              <div key={question.id} className="rounded-[20px] border border-[var(--color-panel-border)] bg-white p-4">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => markPrepQuestionAnswered(question.id, '')}
                    className="mt-1 flex-shrink-0"
                  >
                    {question.answered ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-slate-300" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-950">{question.question}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Priority: {question.priority === 'high' ? 'high' : question.priority === 'medium' ? 'medium' : 'low'} · {question.category}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </SectionCard>
    );
  }

  return (
    <div className="space-y-6">
      <ScreenTitle
        eyebrow="Today"
        title={`Good morning, ${patient.preferredName}.`}
        description="Here is what matters most right now. We will keep it simple."
        action={<StatusBadge tier={topEscalation ? topEscalation.tier : 'steady'} />}
      />

      {(preVisitStage === 'priority' || preVisitStage === 'primary') ? renderPreVisitCard(preVisitStage) : null}

      <SectionCard tone="highlight" className="overflow-hidden">
        <div className="relative space-y-4">
          <div className="absolute inset-y-0 right-0 hidden w-48 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.7),transparent_68%)] lg:block" />
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-teal-deep)]">
            Daily focus
          </p>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-slate-950">
            {dailyBrief.headline}
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-slate-700">
            {dailyBrief.encouragement}
          </p>
          <div className="rounded-[22px] bg-white/85 p-4 text-base leading-7 text-slate-800">
            <strong>Next best action:</strong> {dailyBrief.nextBestAction}
          </div>

          {/* Motivational nudge if needed */}
          {getMotivationalMessage({ checkIns: symptomCheckIns, medications, weekNumber: patient.programWeek }) && (
            <div className="rounded-[20px] border-l-4 border-amber-500 bg-amber-50 p-4">
              <p className="text-base leading-7 text-amber-950">
                💛 {getMotivationalMessage({ checkIns: symptomCheckIns, medications, weekNumber: patient.programWeek })}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <PrimaryButton onClick={() => setActiveTab('ask')} className="inline-flex items-center justify-center gap-2">
              <Mic className="h-5 w-5" />
              Ask CorVas by voice
            </PrimaryButton>
            <SecondaryButton onClick={() => setActiveTab('recovery')} className="inline-flex items-center justify-center gap-2">
              See my recovery plan
              <ArrowRight className="h-5 w-5" />
            </SecondaryButton>
          </div>
        </div>
      </SectionCard>

      {(preVisitStage === 'light' || preVisitStage === 'full') ? renderPreVisitCard(preVisitStage) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile
          label="Medication"
          value={`${medicationSummary.taken}/${medicationSummary.doses.length}`}
          note={medicationSummary.due ? `${medicationSummary.due} dose still needs a check.` : 'Everything due so far is logged.'}
        />
        <MetricTile
          label="Recovery"
          value={`${recoverySummary.progress}%`}
          note={`${recoverySummary.completed} of ${recoverySummary.total} sessions complete in week ${recoverySummary.currentWeek.week}.`}
        />
        <MetricTile
          label="Next visit"
          value={new Date(patient.nextVisitDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          note={`Visit with ${patient.careTeamName} at ${new Date(patient.nextVisitDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`}
        />
      </div>

      {topEscalation ? (
        <SectionCard tone={topEscalation.tier === 'urgent' ? 'urgent' : 'soft'}>
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-full bg-white text-amber-700">
              <TriangleAlert className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-950">{topEscalation.title}</h3>
              <p className="mt-2 text-base leading-7 text-slate-700">{topEscalation.message}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton onClick={() => setActiveTab('support')}>{topEscalation.actionLabel}</PrimaryButton>
                {topEscalation.tier === 'urgent' ? (
                  <a
                    href="tel:911"
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-amber-200 bg-white px-5 py-3 text-base font-semibold text-slate-900"
                  >
                    Call 911 now
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal-deep)]">
              Today&apos;s plan
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              What to do next
            </h3>
            <p className="mt-2 text-base leading-7 text-slate-700">
              Your medication and rehab plan are here together so you do not have to hunt for the next step.
            </p>
          </div>
          <Activity className="h-6 w-6 text-[var(--color-teal-deep)]" />
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <div className="rounded-[24px] border border-[var(--color-panel-border)] bg-[var(--color-panel-soft)] p-5">
            <div className="flex items-center gap-3">
              <Pill className="h-6 w-6 text-[var(--color-teal-deep)]" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Medication due now</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">
                  {nextDose ? `${nextDose.medication.name} ${nextDose.medication.dose}` : 'Nothing due right now'}
                </p>
              </div>
            </div>

            {nextDose ? (
              <>
                <p className="mt-4 text-base leading-7 text-slate-700">
                  Scheduled for {new Date(nextDose.scheduledAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}. {nextDose.medication.instructions}
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <PrimaryButton onClick={() => markDoseStatus(nextDose.id, 'taken')}>I took it</PrimaryButton>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SecondaryButton onClick={() => markDoseStatus(nextDose.id, 'snoozed')}>
                      Remind me later
                    </SecondaryButton>
                    <SecondaryButton onClick={() => markDoseStatus(nextDose.id, 'skipped')}>
                      I skipped it
                    </SecondaryButton>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-4 text-base leading-7 text-emerald-900">
                Your scheduled medicines for right now are logged. Nice work staying steady.
              </p>
            )}
          </div>

          <div className="rounded-[24px] border border-[var(--color-panel-border)] bg-white p-5">
            <div className="flex items-center gap-3">
              <HeartPulse className="h-6 w-6 text-[var(--color-teal-deep)]" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Recovery next step</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">
                  {recoverySummary.todaySession ? recoverySummary.todaySession.title : 'No rehab session due right now'}
                </p>
              </div>
            </div>

            {recoverySummary.todaySession ? (
              <>
                <p className="mt-4 text-base leading-7 text-slate-700">{recoverySummary.todaySession.description}</p>
                <div className="mt-4 rounded-[20px] bg-[var(--color-panel-soft)] p-4 text-base text-slate-700">
                  {recoverySummary.todaySession.durationMinutes} minutes. Goal: {recoverySummary.todaySession.target}.
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  <PrimaryButton onClick={() => setActiveTab('recovery')}>Open today&apos;s session</PrimaryButton>
                  <SecondaryButton onClick={() => setTodayDetail('checkin')}>Do a symptom check-in first</SecondaryButton>
                </div>
              </>
            ) : (
              <>
                <p className="mt-4 text-base leading-7 text-slate-700">
                  No rehab session is due right now. A quick check-in is the best next step.
                </p>
                <div className="mt-4">
                  <PrimaryButton onClick={() => setTodayDetail('checkin')}>Open check-in</PrimaryButton>
                </div>
              </>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal-deep)]">
              Daily support
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              Check in or log meals
            </h3>
            <p className="mt-2 text-base leading-7 text-slate-700">
              One place for the daily details CorVas uses to keep recovery on track.
            </p>
          </div>
          {todayDetail === 'checkin' ? (
            <HeartPulse className="h-6 w-6 text-[var(--color-teal-deep)]" />
          ) : (
            <Apple className="h-6 w-6 text-[var(--color-teal-deep)]" />
          )}
        </div>

        <SegmentedTabs
          value={todayDetail}
          onChange={setTodayDetail}
          options={[
            { value: 'checkin', label: 'Symptom check-in' },
            { value: 'meals', label: 'Meals and sodium' },
          ]}
          className="mt-5 sm:grid-cols-2"
        />

        {todayDetail === 'checkin' ? (
          <>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <RatingRow label="Shortness of breath" value={form.breathlessness} onChange={(value) => setForm((current) => ({ ...current, breathlessness: value }))} />
              <RatingRow label="Dizziness" value={form.dizziness} onChange={(value) => setForm((current) => ({ ...current, dizziness: value }))} />
              <RatingRow label="Chest discomfort" value={form.chestDiscomfort} onChange={(value) => setForm((current) => ({ ...current, chestDiscomfort: value }))} />
              <RatingRow label="Worry level" value={form.worry} onChange={(value) => setForm((current) => ({ ...current, worry: value }))} />
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-base font-semibold text-slate-900">Anything you want to note?</span>
              <textarea
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                className="min-h-28 w-full rounded-[22px] border border-[var(--color-panel-border)] px-4 py-4 text-lg text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--color-teal-deep)]"
                placeholder="For example: stairs felt harder today."
              />
            </label>

            {checkInSaved ? (
              <div className="mt-4 rounded-[18px] bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                {checkInSaved}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton onClick={saveCheckIn}>
                Save today&apos;s check-in
              </PrimaryButton>
              <SecondaryButton onClick={() => setActiveTab('support')}>
                I would like help
              </SecondaryButton>
            </div>
          </>
        ) : (
          <div className="mt-5 space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-base font-semibold text-slate-900">Sodium today</span>
                <span className={`text-lg font-semibold ${getSodiumColor()}`}>
                  {todaysSodium} / {sodiumBudgetMg} mg
                </span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full transition-all ${
                    sodiumPercentage < 66
                      ? 'bg-emerald-500'
                      : sodiumPercentage < 93
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(sodiumPercentage, 100)}%` }}
                />
              </div>
              <p className={`mt-2 text-sm ${sodiumRemaining > 0 ? 'text-slate-600' : 'font-semibold text-red-600'}`}>
                {sodiumRemaining > 0
                  ? `${sodiumRemaining}mg remaining for healthy choices.`
                  : 'Daily sodium target reached. Stick to very low-sodium options.'}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-base font-semibold text-slate-900">Quick-log a meal</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setDietForm({ ...dietForm, mealType: type });
                      setDietFormOpen(true);
                    }}
                    className="min-h-11 rounded-[18px] border border-[var(--color-panel-border)] bg-white px-3 py-2 text-sm font-semibold capitalize text-slate-800 transition hover:bg-slate-50"
                  >
                    <Plus className="mr-1 inline h-4 w-4" />
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {dietFormOpen ? (
              <div className="space-y-3 rounded-[20px] border border-[var(--color-panel-border)] bg-[var(--color-panel-soft)] p-4">
                <input
                  type="text"
                  placeholder="Meal description"
                  value={dietForm.description}
                  onChange={(e) => setDietForm({ ...dietForm, description: e.target.value })}
                  className="w-full rounded-[16px] border border-[var(--color-panel-border)] px-3 py-2 text-base text-slate-900 outline-none focus:border-[var(--color-teal-deep)]"
                />
                <div className="flex items-center gap-3">
                  <label className="text-base font-semibold text-slate-900">Sodium:</label>
                  <input
                    type="number"
                    min="0"
                    max="3000"
                    value={dietForm.sodiumMg}
                    onChange={(e) => setDietForm({ ...dietForm, sodiumMg: parseInt(e.target.value) || 0 })}
                    className="w-24 rounded-[16px] border border-[var(--color-panel-border)] px-3 py-2 text-base text-slate-900 outline-none focus:border-[var(--color-teal-deep)]"
                  />
                  <span className="text-sm text-slate-600">mg</span>
                </div>
                <div className="flex gap-2">
                  <PrimaryButton
                    onClick={() => {
                      if (dietForm.description.trim()) {
                        addMealLog({
                          mealType: dietForm.mealType,
                          description: dietForm.description,
                          sodiumMg: dietForm.sodiumMg,
                        });
                        setMealNotice('Meal logged for today.');
                        setDietForm({ mealType: 'lunch', description: '', sodiumMg: 200 });
                        setDietFormOpen(false);
                      }
                    }}
                    className="flex-1 text-sm"
                  >
                    Log meal
                  </PrimaryButton>
                  <SecondaryButton
                    onClick={() => setDietFormOpen(false)}
                    className="flex-1 text-sm"
                  >
                    Cancel
                  </SecondaryButton>
                </div>
              </div>
            ) : null}

            <PrimaryButton
              onClick={getDietSuggestions}
              disabled={dietSuggestionsLoading}
              className="inline-flex w-full items-center justify-center gap-2"
            >
              {dietSuggestionsLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Getting suggestions...
                </>
              ) : (
                <>Get meal suggestions for {dietForm.mealType}</>
              )}
            </PrimaryButton>

            {dietSuggestions.length > 0 ? (
              <div className="space-y-2 rounded-[20px] border border-[var(--color-teal-deep)] bg-[var(--color-panel-highlight)] p-4">
                <p className="text-base font-semibold text-slate-950">Suggested meals</p>
                {dietSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      addMealLog({
                        mealType: dietForm.mealType,
                        description: suggestion.description,
                        sodiumMg: suggestion.sodiumMg,
                      });
                      setMealNotice(`${suggestion.name} added to today’s meals.`);
                      setDietSuggestions([]);
                    }}
                    className="w-full rounded-[16px] border border-[var(--color-panel-border)] bg-white p-3 text-left text-sm transition hover:bg-slate-50"
                  >
                    <p className="font-semibold text-slate-900">{suggestion.name}</p>
                    <p className="text-xs text-slate-600">{suggestion.sodiumMg}mg sodium • {suggestion.why}</p>
                  </button>
                ))}
              </div>
            ) : null}

            {mealNotice ? (
              <div className="rounded-[18px] bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                {mealNotice}
              </div>
            ) : null}

            {todaysMeals.length > 0 ? (
              <div className="space-y-2 pt-2">
                <p className="text-base font-semibold text-slate-900">Today&apos;s meals ({todaysMeals.length})</p>
                {todaysMeals.map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between rounded-[16px] border border-[var(--color-panel-border)] bg-white p-3">
                    <div>
                      <p className="font-semibold capitalize text-slate-900">{meal.mealType}</p>
                      <p className="text-sm text-slate-600">{meal.description}</p>
                      <p className="text-xs text-slate-500">{meal.sodiumMg}mg sodium</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeMealLog(meal.id);
                        setMealNotice('Meal removed from today.');
                      }}
                      className="flex-shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2">
        <SmallAction icon={Phone} label="Call support now" onClick={() => setActiveTab('support')} />
        <SmallAction icon={Mic} label="Ask CorVas what to do next" onClick={() => setActiveTab('ask')} />
      </div>
    </div>
  );
}
