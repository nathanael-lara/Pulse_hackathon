'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Square,
  Volume2,
  VolumeX,
  Stethoscope,
  Brain,
  User,
  AlertTriangle,
  Pill,
  ClipboardList,
  BookmarkPlus,
  Sparkles,
  Layers3,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MOCK_TRANSCRIPT_LINES } from '@/lib/mock-data';
import { translateDoctorStatement } from '@/lib/ai-service';
import type { TranscriptLine } from '@/lib/types';
import { cn } from '@/lib/utils';
import { RiskBadge } from '../RiskBadge';

const TAG_META = {
  diagnosis: { label: 'Diagnosis', icon: AlertTriangle, className: 'text-amber-300 bg-amber-400/10 border-amber-400/20' },
  medication: { label: 'Medication', icon: Pill, className: 'text-fuchsia-300 bg-fuchsia-400/10 border-fuchsia-400/20' },
  instruction: { label: 'Instructions', icon: ClipboardList, className: 'text-sky-300 bg-sky-400/10 border-sky-400/20' },
  risk: { label: 'Risk', icon: AlertTriangle, className: 'text-red-300 bg-red-400/10 border-red-400/20' },
  followup: { label: 'Follow-up', icon: BookmarkPlus, className: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20' },
} as const;

const QUICK_ACTIONS = ['Explain simply', 'Go deeper', 'Ask next question', 'Save'] as const;

function buildFallbackBullets(line: TranscriptLine, mode: 'simple' | 'deep' | 'next'): string[] {
  if (line.tags?.includes('medication')) {
    return mode === 'deep'
      ? [
          'This line introduces a medication change that affects heart rhythm control.',
          'Metoprolol slows the heart and lowers the stress placed on it during recovery.',
          'Taking it with food can make the dose easier to tolerate and more consistent.',
          'The care team will likely watch fatigue, dizziness, and exercise tolerance next.',
        ]
      : mode === 'next'
        ? [
            'Ask what side effects should trigger a call to the clinic.',
            'Ask whether this medicine changes Maria’s rehab heart-rate target.',
            'Ask how long Maria may need to stay on the medication.',
          ]
        : [
            'This is a heart medicine to help the rhythm stay steadier.',
            'It helps your heart work with less strain.',
            'Taking it every morning keeps the effect consistent.',
            'Your doctor will watch how you feel on it.',
          ];
  }

  if (line.tags?.includes('instruction') || line.tags?.includes('risk')) {
    return mode === 'deep'
      ? [
          'This is a safety boundary, not just general advice.',
          'The doctor is linking symptoms and exercise intensity to real escalation rules.',
          'A heart-rate limit and stop conditions reduce the chance of overexertion.',
          'This guidance should carry directly into rehab, alerts, and family support workflows.',
        ]
      : mode === 'next'
        ? [
            'Ask what counts as “too hard” during a walk.',
            'Ask which symptoms mean stop immediately versus slow down.',
            'Ask whether Maria should message the care team after a borderline episode.',
          ]
        : [
            'This sets a safe limit for exercise today.',
            'If chest tightness happens, stop right away.',
            'The goal is to protect your healing heart while you stay active.',
            'Your rehab plan should follow the same limit.',
          ];
  }

  if (line.tags?.includes('diagnosis')) {
    return mode === 'deep'
      ? [
          'The doctor is identifying a rhythm finding that is important but not presented as an emergency.',
          'Monitoring matters because rhythm changes can affect symptoms, medication choices, and rehab pacing.',
          'This finding becomes part of the patient’s longitudinal risk picture, not just a one-time note.',
          'The system should help Maria understand what changed and what the team will do next.',
        ]
      : mode === 'next'
        ? [
            'Ask what mild arrhythmia means for recovery over the next few weeks.',
            'Ask whether stress, caffeine, or poor sleep can make the rhythm worse.',
            'Ask what symptoms should be reported between visits.',
          ]
        : [
            'Your heart rhythm is slightly irregular.',
            'This is usually something to monitor rather than panic about.',
            'It may affect medications, follow-up testing, and rehab intensity.',
            'Your doctor is watching it closely so recovery stays safe.',
          ];
  }

  if (line.tags?.includes('followup')) {
    return [
      'This confirms the next checkpoint in the recovery plan.',
      'The repeat EKG helps the care team compare today against the next visit.',
      'Follow-up timing matters because medication changes need monitoring.',
      'Adding this to calendar keeps the recovery loop closed.',
    ];
  }

  return mode === 'next'
    ? [
        'Ask what the doctor wants Maria to focus on first.',
        'Ask what matters most before the next visit.',
        'Ask how to tell whether recovery is on track this week.',
      ]
    : [
        'This part of the visit should be easier to understand in plain language.',
        'The AI is translating the medical moment into patient-friendly guidance.',
        'Key details here can also drive rehab plans, alerts, and follow-up questions.',
      ];
}

function toBullets(text: string): string[] {
  return text
    .split(/\n|(?<=[.!?])\s+/)
    .map((part) => part.replace(/^[-•\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 4);
}

function DoctorPresence({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <div className="glass-card rounded-[2rem] p-5">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className={cn('h-28 w-28 rounded-[2rem] border border-primary/25 bg-gradient-to-br from-primary/25 via-primary/8 to-transparent flex items-center justify-center', isSpeaking && 'pulse-ring')}>
            <Stethoscope className="h-11 w-11 text-primary" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-[2rem] border border-primary/20"
            animate={isSpeaking ? { scale: [1, 1.06, 1], opacity: [0.35, 0.12, 0.35] } : { scale: 1, opacity: 0.15 }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        </div>
        <div className="text-lg font-semibold text-foreground">Dr. Okafor</div>
        <div className="mb-3 text-sm text-foreground/60">Cardiology · Live consult</div>
        <div className="flex items-center gap-2 text-xs editorial-kicker text-foreground/58">
          <span className={cn('h-2 w-2 rounded-full', isSpeaking ? 'bg-primary animate-pulse' : 'bg-border')} />
          {isSpeaking ? 'Speaking now' : 'Listening'}
        </div>
      </div>
    </div>
  );
}

export function LiveVisitView() {
  const {
    isRecording,
    setIsRecording,
    addTranscriptLine,
    clearTranscript,
    expandedLineId,
    setExpandedLine,
    visitElapsed,
    setVisitElapsed,
    doctorMuted,
    toggleDoctorMuted,
    riskLevel,
    addNotification,
  } = useAppStore();

  const [displayLines, setDisplayLines] = useState<TranscriptLine[]>([]);
  const [currentSpeakingIdx, setCurrentSpeakingIdx] = useState(-1);
  const [selectedLine, setSelectedLine] = useState<TranscriptLine | null>(null);
  const [explanationBullets, setExplanationBullets] = useState<string[]>([
    'Tap any transcript line to translate the clinical moment into patient-friendly language.',
    'Use quick actions to simplify, go deeper, ask the next question, or save the moment.',
  ]);
  const [explanationMode, setExplanationMode] = useState<'simple' | 'deep' | 'next'>('simple');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [savedMoments, setSavedMoments] = useState<string[]>([]);

  const transcriptRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lineTimerRefs = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const elapsedRef = useRef(0);
  const sessionRef = useRef(0);

  const clearScheduledWork = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (endTimerRef.current) {
      clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }
    lineTimerRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
    lineTimerRefs.current = [];
  }, []);

  const explainLine = useCallback(async (line: TranscriptLine, mode: 'simple' | 'deep' | 'next' = 'simple') => {
    setSelectedLine(line);
    setExpandedLine(line.id);
    setExplanationMode(mode);
    setLoadingExplanation(true);

    const fallback = buildFallbackBullets(line, mode);
    setExplanationBullets(fallback);

    if (line.speaker === 'doctor' && mode !== 'next') {
      try {
        const promptPrefix =
          mode === 'deep'
            ? 'Go deeper and explain the implications for recovery in bullet points.'
            : 'Explain simply in bullet points for a recovering cardiac patient.';
        const translated = await translateDoctorStatement(`${promptPrefix}\n\n${line.text}`);
        const bullets = toBullets(translated);
        if (bullets.length > 0) setExplanationBullets(bullets);
      } finally {
        setLoadingExplanation(false);
      }
      return;
    }

    setLoadingExplanation(false);
  }, [setExpandedLine]);

  const startVisit = useCallback(() => {
    clearScheduledWork();
    sessionRef.current += 1;
    const sessionId = sessionRef.current;

    setIsRecording(true);
    clearTranscript();
    setDisplayLines([]);
    setCurrentSpeakingIdx(-1);
    setSelectedLine(null);
    setExplanationBullets([
      'The AI panel will update as key moments arrive.',
      'Diagnosis, medication, and instruction tags can be tapped for fast translation.',
    ]);
    elapsedRef.current = 0;
    setVisitElapsed(0);

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setVisitElapsed(elapsedRef.current);
    }, 1000);

    MOCK_TRANSCRIPT_LINES.forEach((line, idx) => {
      const timeoutId = setTimeout(() => {
        if (sessionRef.current !== sessionId) return;
        setDisplayLines((prev) => [...prev, line]);
        setCurrentSpeakingIdx(idx);
        addTranscriptLine(line);
        if (!selectedLine && idx === 2) {
          void explainLine(line, 'simple');
        }
      }, line.timestamp * 1000 + 400);
      lineTimerRefs.current.push(timeoutId);
    });

    endTimerRef.current = setTimeout(() => {
      if (sessionRef.current !== sessionId) return;
      setIsRecording(false);
      setCurrentSpeakingIdx(-1);
      clearScheduledWork();
    }, (MOCK_TRANSCRIPT_LINES.at(-1)?.timestamp ?? 0) * 1000 + 2600);
  }, [addTranscriptLine, clearScheduledWork, clearTranscript, explainLine, selectedLine, setIsRecording, setVisitElapsed]);

  const stopVisit = useCallback(() => {
    sessionRef.current += 1;
    setIsRecording(false);
    setCurrentSpeakingIdx(-1);
    clearScheduledWork();
  }, [clearScheduledWork, setIsRecording]);

  const handleQuickAction = useCallback((action: typeof QUICK_ACTIONS[number]) => {
    if (!selectedLine) return;
    if (action === 'Save') {
      if (savedMoments.includes(selectedLine.id)) return;
      setSavedMoments((prev) => [...prev, selectedLine.id]);
      addNotification({
        id: `n-save-${Date.now()}`,
        title: 'Visit moment saved',
        body: `Saved a key ${selectedLine.tags?.[0] ?? 'visit'} moment for post-visit review.`,
        category: 'encouragement',
        channel: 'in-app',
        level: 'info',
        timestamp: new Date(),
        read: false,
      });
      return;
    }

    const mode = action === 'Explain simply' ? 'simple' : action === 'Go deeper' ? 'deep' : 'next';
    void explainLine(selectedLine, mode);
  }, [addNotification, explainLine, savedMoments, selectedLine]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [displayLines]);

  useEffect(() => {
    return () => {
      sessionRef.current += 1;
      clearScheduledWork();
    };
  }, [clearScheduledWork]);

  const elapsed = `${Math.floor(visitElapsed / 60)}:${String(visitElapsed % 60).padStart(2, '0')}`;
  const currentLine = displayLines[currentSpeakingIdx];

  return (
    <div className="p-6 h-full">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="editorial-kicker text-primary mb-2">Hero experience</div>
          <h1 className="text-3xl font-bold tracking-tight">Live Visit</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time subtitle capture, instant AI translation, and patient-safe clinical guidance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RiskBadge level={riskLevel} />
          {isRecording && (
            <div className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
              LIVE · {elapsed}
            </div>
          )}
        </div>
      </div>

      <div className="grid h-[calc(100%-5rem)] grid-cols-1 gap-5 xl:grid-cols-[260px_minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-4">
          <DoctorPresence isSpeaking={isRecording && currentLine?.speaker === 'doctor'} />

          <div className="glass-card rounded-[2rem] p-4">
            <div className="mb-3 text-sm font-medium">Visit controls</div>
            <div className="grid gap-2">
              {!isRecording ? (
                <button
                  onClick={startVisit}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Mic className="w-4 h-4" />
                  Start visit capture
                </button>
              ) : (
                <button
                  onClick={stopVisit}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/15 transition-colors"
                >
                  <Square className="w-4 h-4" />
                  Stop recording
                </button>
              )}

              <button
                onClick={toggleDoctorMuted}
                className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                {doctorMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {doctorMuted ? 'Doctor muted' : 'Doctor audio on'}
              </button>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-4">
            <div className="mb-2 text-sm font-medium">Saved moments</div>
            <div className="space-y-2">
              {savedMoments.length === 0 ? (
                <div className="text-sm text-foreground/68">Nothing saved yet. Use “Save” on important moments for follow-up.</div>
              ) : (
                savedMoments.map((id) => {
                  const line = displayLines.find((item) => item.id === id);
                  if (!line) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => void explainLine(line)}
                      className="w-full rounded-xl border border-border bg-white p-3 text-left text-sm text-foreground/72 shadow-sm transition-colors hover:bg-secondary/40"
                    >
                      {line.text}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="glass-card flex min-h-0 flex-col rounded-[2rem] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Live transcript</div>
              <div className="text-xs text-foreground/58">Subtitle-style stream. Tap any line to ask “What did he just say?”</div>
            </div>
            {displayLines.length > 0 && (
              <div className="editorial-kicker text-foreground/45">{displayLines.length} lines</div>
            )}
          </div>

          {displayLines.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-[1.5rem] border border-dashed border-border bg-secondary/35 text-center">
              <div>
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary/10">
                  <Mic className="h-7 w-7 text-primary/70" />
                </div>
                <div className="font-medium mb-1">Ready for a live conversation</div>
                <div className="max-w-sm text-sm text-foreground/62">
                  Start the visit to stream the transcript into the center column and translate key medical moments in real time.
                </div>
              </div>
            </div>
          ) : (
            <div ref={transcriptRef} className="flex-1 overflow-y-auto transcript-scroll pr-2">
              <div className="space-y-2">
                {displayLines.map((line) => {
                  const speakerTone =
                    line.speaker === 'doctor'
                      ? 'border-primary/18 bg-secondary/55'
                      : line.speaker === 'ai'
                        ? 'border-violet-200 bg-violet-50'
                        : 'border-border bg-white';
                  const isSelected = selectedLine?.id === line.id || expandedLineId === line.id;
                  return (
                    <motion.button
                      key={line.id}
                      layout
                      onClick={() => void explainLine(line)}
                      className={cn(
                        'w-full rounded-[1.35rem] border px-4 py-3 text-left transition-all',
                        speakerTone,
                        isSelected && 'ring-1 ring-primary/30 shadow-[0_8px_22px_rgba(143,113,184,0.1)]'
                      )}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <div className={cn(
                          'flex items-center gap-1.5 text-[11px] editorial-kicker',
                          line.speaker === 'doctor' ? 'text-primary' : line.speaker === 'ai' ? 'text-violet-500' : 'text-foreground/55'
                        )}>
                          {line.speaker === 'doctor' ? <Stethoscope className="w-3 h-3" /> : line.speaker === 'ai' ? <Brain className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {line.speaker === 'doctor' ? 'Doctor' : line.speaker === 'ai' ? 'AI' : 'Maria'}
                        </div>
                        <span className="ml-auto text-[11px] text-foreground/45">
                          {Math.floor(line.timestamp / 60)}:{String(line.timestamp % 60).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="text-lg leading-snug text-foreground md:text-xl">{line.text}</div>
                      {line.tags && line.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {line.tags.map((tag) => {
                            const meta = TAG_META[tag];
                            const Icon = meta.icon;
                            return (
                              <span key={`${line.id}-${tag}`} className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]', meta.className)}>
                                <Icon className="w-3 h-3" />
                                {meta.label}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </motion.button>
                  );
                })}

                {isRecording && (
                  <div className="flex items-center gap-2 px-2 py-3 text-xs text-foreground/58">
                    <div className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
                    <div className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
                    <div className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
                    Streaming transcript
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <div className="glass-card flex min-h-0 flex-1 flex-col rounded-[2rem] p-5">
            <div className="mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">AI explanation panel</span>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  disabled={!selectedLine}
                  onClick={() => handleQuickAction(action)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs transition-colors',
                    action === 'Save'
                      ? 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/15'
                      : 'border-border bg-white text-foreground/72 hover:text-foreground hover:bg-secondary/35',
                    !selectedLine && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {action}
                </button>
              ))}
            </div>

            <div className="mb-4 rounded-[1.5rem] border border-border bg-secondary/30 p-4">
              <div className="mb-2 flex items-center gap-2 text-[11px] editorial-kicker text-foreground/50">
                <Layers3 className="w-3 h-3" />
                {selectedLine ? 'Selected moment' : 'Waiting for a line'}
              </div>
              <div className="text-sm leading-relaxed text-foreground/82">
                {selectedLine ? selectedLine.text : 'Tap a transcript line to translate the visit into plain-language guidance.'}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto transcript-scroll pr-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedLine?.id ?? 'empty'}-${explanationMode}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-3"
                >
                  {loadingExplanation && (
                    <div className="text-xs text-primary flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Translating this moment for the patient…
                    </div>
                  )}

                  {explanationBullets.map((bullet) => (
                      <div key={bullet} className="flex gap-3 rounded-2xl border border-border bg-white p-3.5 shadow-sm">
                      <div className="pt-1 text-primary">•</div>
                      <p className="text-sm leading-relaxed text-foreground/76">{bullet}</p>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {selectedLine && (
              <div className="mt-4 rounded-[1.35rem] border border-primary/15 bg-secondary/45 p-3 text-xs text-foreground/66">
                <div className="mb-1 flex items-center gap-2 text-primary">
                  <ChevronRight className="w-3.5 h-3.5" />
                  Instant interaction
                </div>
                The explanation panel updates around the selected moment so the patient never has to parse the whole transcript at once.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
