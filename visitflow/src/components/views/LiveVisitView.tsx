'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Volume2, VolumeX, Square,
  ChevronDown, ChevronUp, Stethoscope, Brain, User,
  AlertTriangle, Pill, ClipboardList, BookmarkPlus, RotateCcw
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MOCK_TRANSCRIPT_LINES } from '@/lib/mock-data';
import { translateDoctorStatement } from '@/lib/ai-service';
import type { TranscriptLine } from '@/lib/types';
import { cn } from '@/lib/utils';
import { RiskBadge } from '../RiskBadge';

const TAG_ICONS = {
  diagnosis: Stethoscope,
  medication: Pill,
  instruction: ClipboardList,
  risk: AlertTriangle,
  followup: BookmarkPlus,
};

const TAG_COLORS = {
  diagnosis: 'text-blue-400 bg-blue-400/10',
  medication: 'text-purple-400 bg-purple-400/10',
  instruction: 'text-primary bg-primary/10',
  risk: 'text-red-400 bg-red-400/10',
  followup: 'text-yellow-400 bg-yellow-400/10',
};

const DOCTOR_WAVE_BARS = [
  { key: 1, peak: 14, duration: 0.5, delay: 0.08 },
  { key: 2, peak: 18, duration: 0.62, delay: 0.16 },
  { key: 3, peak: 12, duration: 0.46, delay: 0.24 },
  { key: 4, peak: 20, duration: 0.58, delay: 0.32 },
  { key: 5, peak: 16, duration: 0.52, delay: 0.4 },
] as const;

function TranscriptLineItem({
  line,
  isExpanded,
  onToggle,
  onAsk,
}: {
  line: TranscriptLine;
  isExpanded: boolean;
  onToggle: () => void;
  onAsk: (text: string) => void;
}) {
  const [aiExplanation, setAiExplanation] = useState(line.explanation ?? '');
  const [loading, setLoading] = useState(false);

  const handleExpand = useCallback(async () => {
    onToggle();
    if (!aiExplanation && line.speaker === 'doctor') {
      setLoading(true);
      const result = await translateDoctorStatement(line.text);
      setAiExplanation(result);
      setLoading(false);
    }
  }, [aiExplanation, line, onToggle]);

  const speakerConfig = {
    doctor: { label: 'Dr. Okafor', color: 'text-primary', icon: Stethoscope },
    patient: { label: 'You', color: 'text-muted-foreground', icon: User },
    ai: { label: 'AI', color: 'text-purple-400', icon: Brain },
  };
  const cfg = speakerConfig[line.speaker];
  const SpeakerIcon = cfg.icon;

  return (
    <motion.div
      layout
      className={cn(
        'transcript-line group relative rounded-xl p-3 cursor-pointer transition-colors',
        line.speaker === 'doctor' ? 'hover:bg-primary/5' :
        line.speaker === 'ai' ? 'hover:bg-purple-400/5 border border-purple-400/10' :
        'hover:bg-secondary/40',
        isExpanded && 'bg-secondary/30'
      )}
      onClick={handleExpand}
    >
      <div className="flex items-start gap-2.5">
        <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
          line.speaker === 'doctor' ? 'bg-primary/20' :
          line.speaker === 'ai' ? 'bg-purple-400/20' : 'bg-secondary'
        )}>
          <SpeakerIcon className={cn('w-3 h-3', cfg.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs font-medium', cfg.color)}>{cfg.label}</span>
            {line.tags && line.tags.length > 0 && (
              <div className="flex gap-1">
                {line.tags.map((tag) => {
                  const TagIcon = TAG_ICONS[tag];
                  return (
                    <span key={tag} className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded text-xs', TAG_COLORS[tag])}>
                      <TagIcon className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}
            <span className="ml-auto text-xs text-muted-foreground/50">
              {Math.floor(line.timestamp / 60)}:{String(line.timestamp % 60).padStart(2, '0')}
            </span>
          </div>
          <p className="text-sm leading-relaxed">{line.text}</p>

          {/* Expanded AI explanation */}
          <AnimatePresence>
            {isExpanded && line.speaker !== 'ai' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-border/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">AI Translation</span>
                </div>
                {loading ? (
                  <div className="flex gap-1.5 py-1">
                    <div className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <div className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <div className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400" />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">{aiExplanation}</p>
                )}
                <div className="flex gap-2 mt-3">
                  {['Explain simpler', 'Go deeper', 'Ask doctor'].map((action) => (
                    <button
                      key={action}
                      onClick={(e) => { e.stopPropagation(); onAsk(action + ': ' + line.text); }}
                      className="text-xs px-2.5 py-1 rounded-lg glass border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </div>
    </motion.div>
  );
}

function DoctorAvatar({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Avatar ring */}
      <div className={cn(
        'relative w-24 h-24 rounded-full',
        isSpeaking && 'pulse-ring'
      )}>
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center">
          <Stethoscope className="w-10 h-10 text-primary" />
        </div>
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/40"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
      <div className="mt-2 text-center">
        <div className="text-sm font-medium">Dr. Okafor</div>
        <div className="text-xs text-muted-foreground">Cardiology</div>
      </div>
      {isSpeaking && (
        <div className="mt-1.5 flex gap-1">
          {DOCTOR_WAVE_BARS.map((bar) => (
            <motion.div
              key={bar.key}
              className="w-0.5 bg-primary rounded-full"
              animate={{ height: [4, bar.peak, 4] }}
              transition={{ duration: bar.duration, repeat: Infinity, delay: bar.delay }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AIQuestionPanel({
  question,
  answer,
  loading,
  onSubmit,
  onClose,
}: {
  question: string;
  answer: string;
  loading: boolean;
  onSubmit: (q: string) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState(question);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass-card rounded-2xl p-4 border border-primary/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-medium">Ask about this visit</span>
        <button onClick={onClose} className="ml-auto text-muted-foreground hover:text-foreground">×</button>
      </div>
      {answer && (
        <div className="mb-3 p-3 rounded-xl bg-purple-400/5 border border-purple-400/10 text-sm text-muted-foreground">
          {loading ? (
            <div className="flex gap-1.5">
              <div className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400" />
              <div className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400" />
              <div className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400" />
            </div>
          ) : answer}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit(input)}
          placeholder="What did the doctor mean by..."
          className="flex-1 bg-secondary/30 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
        />
        <button
          onClick={() => onSubmit(input)}
          className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Ask
        </button>
      </div>
    </motion.div>
  );
}

export function LiveVisitView() {
  const {
    isRecording, setIsRecording,
    addTranscriptLine, clearTranscript,
    expandedLineId, setExpandedLine,
    visitElapsed, setVisitElapsed,
    doctorMuted, toggleDoctorMuted,
    riskLevel,
  } = useAppStore();

  const [displayLines, setDisplayLines] = useState<TranscriptLine[]>([]);
  const [currentSpeakingIdx, setCurrentSpeakingIdx] = useState(-1);
  const [showQuestion, setShowQuestion] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [answerLoading, setAnswerLoading] = useState(false);
  const [mode, setMode] = useState<'live' | 'replay'>('live');
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

  const startVisit = useCallback(() => {
    clearScheduledWork();
    sessionRef.current += 1;
    const sessionId = sessionRef.current;

    setIsRecording(true);
    setDisplayLines([]);
    setCurrentSpeakingIdx(-1);
    clearTranscript();
    setExpandedLine(null);
    elapsedRef.current = 0;
    setVisitElapsed(0);

    // Timer
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setVisitElapsed(elapsedRef.current);
    }, 1000);

    // Stream transcript lines
    MOCK_TRANSCRIPT_LINES.forEach((line, idx) => {
      const delay = line.timestamp * 1000 + 500;
      const timeoutId = setTimeout(() => {
        if (sessionRef.current !== sessionId) return;
        const tLine = line as TranscriptLine;
        setDisplayLines((prev) => [...prev, tLine]);
        setCurrentSpeakingIdx(idx);
        addTranscriptLine(tLine);
      }, delay);
      lineTimerRefs.current.push(timeoutId);
    });

    // End
    const lastDelay = (MOCK_TRANSCRIPT_LINES[MOCK_TRANSCRIPT_LINES.length - 1]?.timestamp ?? 0) * 1000 + 3000;
    endTimerRef.current = setTimeout(() => {
      if (sessionRef.current !== sessionId) return;
      setIsRecording(false);
      setCurrentSpeakingIdx(-1);
      clearScheduledWork();
    }, lastDelay);
  }, [addTranscriptLine, clearScheduledWork, clearTranscript, setExpandedLine, setIsRecording, setVisitElapsed]);

  const stopVisit = useCallback(() => {
    sessionRef.current += 1;
    setIsRecording(false);
    setCurrentSpeakingIdx(-1);
    clearScheduledWork();
  }, [clearScheduledWork, setIsRecording]);

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

  const handleAsk = useCallback(async (q: string) => {
    setQuestionText(q);
    setShowQuestion(true);
    setAnswerLoading(true);
    setAiAnswer('');
    const { answerVisitQuestion } = await import('@/lib/ai-service');
    const ctx = displayLines.map((l) => `${l.speaker}: ${l.text}`).join('\n');
    const result = await answerVisitQuestion(q, ctx);
    setAiAnswer(result);
    setAnswerLoading(false);
  }, [displayLines]);

  const elapsed = `${Math.floor(visitElapsed / 60)}:${String(visitElapsed % 60).padStart(2, '0')}`;
  const currentLine = displayLines[currentSpeakingIdx];

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Live Visit</h1>
          <p className="text-sm text-muted-foreground">Dr. Okafor · Cardiology · {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <RiskBadge level={riskLevel} />
          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              LIVE · {elapsed}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[280px_1fr] gap-6 min-h-0">
        {/* Left: Doctor panel */}
        <div className="flex flex-col gap-4">
          {/* Doctor avatar */}
          <div className="glass-card rounded-2xl p-5 flex flex-col items-center gap-4">
            <DoctorAvatar isSpeaking={isRecording && currentLine?.speaker === 'doctor'} />

            {/* Controls */}
            <div className="w-full flex gap-2">
              <button
                onClick={toggleDoctorMuted}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors',
                  doctorMuted ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'glass border border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {doctorMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                {doctorMuted ? 'Muted' : 'Doctor'}
              </button>
              <button
                onClick={() => handleAsk('What did the doctor just say?')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium glass border border-primary/20 text-primary hover:bg-primary/10 transition-colors"
              >
                <Brain className="w-3.5 h-3.5" />
                Explain
              </button>
            </div>
          </div>

          {/* Live subtitle */}
          <AnimatePresence mode="wait">
            {isRecording && currentLine && (
              <motion.div
                key={currentLine.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                  {currentLine.speaker === 'ai' ? (
                    <><Brain className="w-3 h-3 text-purple-400" /><span className="text-purple-400">AI</span></>
                  ) : currentLine.speaker === 'doctor' ? (
                    <><Stethoscope className="w-3 h-3 text-primary" /><span className="text-primary">Doctor</span></>
                  ) : (
                    <><User className="w-3 h-3" />You</>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{currentLine.text}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Start/stop */}
          <div className="flex flex-col gap-2">
            {!isRecording ? (
              <button
                onClick={startVisit}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all pulse-ring"
              >
                <Mic className="w-4 h-4" />
                Start Visit Recording
              </button>
            ) : (
              <button
                onClick={stopVisit}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/20 font-medium text-sm hover:bg-red-500/30 transition-colors"
              >
                <Square className="w-4 h-4" />
                Stop Recording
              </button>
            )}
            {displayLines.length > 0 && !isRecording && (
              <button
                onClick={() => setMode(mode === 'live' ? 'replay' : 'live')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {mode === 'replay' ? 'Exit Replay' : 'Replay Visit'}
              </button>
            )}
          </div>

          {/* Question panel */}
          <AnimatePresence>
            {showQuestion && (
              <AIQuestionPanel
                question={questionText}
                answer={aiAnswer}
                loading={answerLoading}
                onSubmit={handleAsk}
                onClose={() => setShowQuestion(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Right: Transcript */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Transcript</span>
              {displayLines.length > 0 && (
                <span className="text-xs text-muted-foreground">{displayLines.length} lines</span>
              )}
            </div>
            <button
              onClick={() => setShowQuestion(true)}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Brain className="w-3.5 h-3.5" />
              Ask a question
            </button>
          </div>

          {displayLines.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center glass-card rounded-2xl p-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mic className="w-8 h-8 text-primary/50" />
              </div>
              <div className="font-medium mb-2">Ready to capture your visit</div>
              <div className="text-sm text-muted-foreground max-w-xs">
                Press &quot;Start Visit Recording&quot; to begin live transcription with AI explanations
              </div>
            </div>
          ) : (
            <div
              ref={transcriptRef}
              className="flex-1 overflow-y-auto transcript-scroll space-y-1 pr-1"
            >
              {displayLines.map((line) => (
                <TranscriptLineItem
                  key={line.id}
                  line={line}
                  isExpanded={expandedLineId === line.id}
                  onToggle={() => setExpandedLine(expandedLineId === line.id ? null : line.id)}
                  onAsk={handleAsk}
                />
              ))}
              {isRecording && (
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                  <div className="flex gap-1">
                    <div className="typing-dot w-1 h-1 rounded-full bg-primary" />
                    <div className="typing-dot w-1 h-1 rounded-full bg-primary" />
                    <div className="typing-dot w-1 h-1 rounded-full bg-primary" />
                  </div>
                  Transcribing...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
