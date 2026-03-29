'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Pill, ClipboardList, Brain, CheckSquare,
  ChevronDown, ChevronUp, AlertTriangle, Calendar, Play
} from 'lucide-react';
import type { Medication } from '@/lib/types';
import { CURRENT_VISIT, MOCK_TRANSCRIPT_LINES } from '@/lib/mock-data';
import { answerVisitQuestion } from '@/lib/ai-service';
import { cn } from '@/lib/utils';

function MedicationCard({ med }: { med: Medication }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-purple-400/20 flex items-center justify-center flex-shrink-0">
          <Pill className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">{med.name} <span className="font-normal text-muted-foreground">{med.dose}</span></div>
          <div className="text-xs text-muted-foreground">{med.frequency}</div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3.5 pb-3.5 space-y-2"
          >
            <div className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Purpose:</span> {med.purpose}</div>
            {med.sideEffects && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Watch for:</span> {med.sideEffects.join(', ')}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PostVisitView() {
  const summary = CURRENT_VISIT.summary!;
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState(summary.instructions.map((i) => ({ text: i, done: false })));

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    const ctx = MOCK_TRANSCRIPT_LINES.map((l) => `${l.speaker}: ${l.text}`).join('\n');
    const result = await answerVisitQuestion(question, ctx);
    setAnswer(result);
    setLoading(false);
  };

  const toggleCheck = (i: number) => {
    setChecklist((prev) => prev.map((c, idx) => idx === i ? { ...c, done: !c.done } : c));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Post-Visit Intelligence</h1>
        <p className="text-sm text-muted-foreground">March 29 · Dr. Okafor · Cardiology</p>
      </div>

      <div className="space-y-5">
        {/* Diagnoses */}
        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-sm">Diagnoses</span>
          </div>
          <div className="space-y-2">
            {summary.diagnosis.map((d, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 glass rounded-xl text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* Medications */}
        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Pill className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-sm">Medications</span>
          </div>
          <div className="space-y-2">
            {summary.medications.map((m) => (
              <MedicationCard key={m.name} med={m} />
            ))}
          </div>
        </div>

        {/* Instructions checklist */}
        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Follow-Up Instructions</span>
          </div>
          <div className="space-y-2">
            {checklist.map((item, i) => (
              <button
                key={i}
                onClick={() => toggleCheck(i)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-xl text-left text-sm transition-colors',
                  item.done ? 'opacity-50' : 'glass hover:bg-secondary/30'
                )}
              >
                <CheckSquare className={cn('w-4 h-4 mt-0.5 flex-shrink-0', item.done ? 'text-emerald-400' : 'text-muted-foreground')} />
                <span className={cn(item.done && 'line-through text-muted-foreground')}>{item.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Follow-up */}
        <div className="glass-card rounded-2xl p-5 border border-primary/15 flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-sm mb-1">Next Appointment</div>
            <div className="text-sm text-muted-foreground">{summary.followUp}</div>
          </div>
        </div>

        {/* Q&A */}
        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-sm">Ask About This Visit</span>
          </div>
          <div className="flex gap-2 mb-3">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
              placeholder="What is arrhythmia? What does metoprolol do?"
              className="flex-1 bg-secondary/30 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
            />
            <button
              onClick={askQuestion}
              disabled={!question.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-purple-400/20 text-purple-400 text-sm font-medium hover:bg-purple-400/30 transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
              ) : <Play className="w-3.5 h-3.5" />}
              Ask
            </button>
          </div>
          <AnimatePresence>
            {answer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3.5 rounded-xl bg-purple-400/5 border border-purple-400/15 text-sm text-muted-foreground leading-relaxed"
              >
                {answer}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replay link */}
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Full transcript available in</span>
            <button
              onClick={() => {/* navigate to live visit replay */}}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
            >
              Visit Replay <Play className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
