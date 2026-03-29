'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ClipboardList, Brain, AlertTriangle, Plus, X, ChevronRight } from 'lucide-react';
import { MOCK_SYMPTOMS } from '@/lib/mock-data';
import type { Symptom } from '@/lib/types';
import { cn } from '@/lib/utils';

const SUGGESTED_QUESTIONS = [
  'Is it safe to increase my walking pace?',
  'What does my arrhythmia mean for long-term recovery?',
  'Should I avoid caffeine while on metoprolol?',
  'How do I know if my heart rate is too high during exercise?',
  'When can I return to normal activities?',
];

const RISK_FLAGS = [
  { flag: 'Shortness of breath on exertion', level: 'yellow' as const },
  { flag: 'New arrhythmia medication (metoprolol)', level: 'yellow' as const },
  { flag: 'Fatigue lasting > 1 week', level: 'yellow' as const },
];

export function PreVisitView() {
  const [symptoms, setSymptoms] = useState<Symptom[]>(MOCK_SYMPTOMS);
  const [questions, setQuestions] = useState<string[]>(['How is my heart rhythm improving?']);
  const [newQ, setNewQ] = useState('');
  const [briefGenerated, setBriefGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const addQuestion = (q: string) => {
    if (!q.trim() || questions.includes(q)) return;
    setQuestions((prev) => [...prev, q]);
    setNewQ('');
  };

  const removeQuestion = (q: string) => setQuestions((prev) => prev.filter((x) => x !== q));

  const generateBrief = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1800));
    setBriefGenerated(true);
    setGenerating(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Pre-Visit Intelligence</h1>
        <p className="text-sm text-muted-foreground">Prepare for your April 12 appointment with Dr. Okafor</p>
      </div>

      <div className="space-y-5">
        {/* Symptom tracker */}
        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Current Symptoms</span>
          </div>
          <div className="space-y-3">
            {symptoms.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 glass rounded-xl">
                <div className="flex-1">
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Since {new Date(s.since).toLocaleDateString()} · {s.duration}
                    {s.notes && ` · ${s.notes}`}
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-2 h-4 rounded-sm',
                        i < s.severity
                          ? s.severity >= 4 ? 'bg-red-400' : s.severity >= 3 ? 'bg-yellow-400' : 'bg-primary'
                          : 'bg-secondary'
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk flags */}
        <div className="glass-card rounded-2xl p-5 border border-yellow-400/15">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-sm">Risk Flags to Discuss</span>
          </div>
          <div className="space-y-2">
            {RISK_FLAGS.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className={cn('w-2 h-2 rounded-full',
                  r.level === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'
                )} />
                <span className="text-muted-foreground">{r.flag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Questions for Dr. Okafor</span>
          </div>

          <div className="space-y-2 mb-4">
            {questions.map((q) => (
              <div key={q} className="flex items-center gap-2 p-2.5 glass rounded-xl text-sm">
                <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="flex-1">{q}</span>
                <button onClick={() => removeQuestion(q)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Suggested */}
          <div className="mb-4">
            <div className="text-xs text-muted-foreground mb-2">AI-suggested questions:</div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.filter((q) => !questions.includes(q)).map((q) => (
                <button
                  key={q}
                  onClick={() => addQuestion(q)}
                  className="text-xs px-2.5 py-1 rounded-lg glass border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {q.length > 45 ? q.slice(0, 45) + '…' : q}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              value={newQ}
              onChange={(e) => setNewQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addQuestion(newQ)}
              placeholder="Add your own question..."
              className="flex-1 bg-secondary/30 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
            />
            <button
              onClick={() => addQuestion(newQ)}
              className="px-3 py-2 rounded-xl bg-primary/15 text-primary text-sm hover:bg-primary/25 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Generate brief */}
        <button
          onClick={generateBrief}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Generating Visit Brief...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              Generate Visit Brief
            </>
          )}
        </button>

        <AnimatePresence>
          {briefGenerated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-5 border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Visit Brief — April 12, 2026</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p><strong className="text-foreground">Patient:</strong> Maria Santos, 58F, Post-MI Week 3</p>
                <p><strong className="text-foreground">Since last visit:</strong> 11-day rehab streak, mild fatigue, shortness of breath on exertion (improving).</p>
                <p><strong className="text-foreground">Medications:</strong> Metoprolol 25mg (new), Aspirin 81mg — both taken as prescribed.</p>
                <p><strong className="text-foreground">Key questions:</strong> {questions.slice(0, 3).join(' · ')}</p>
                <p><strong className="text-foreground">Watch:</strong> Arrhythmia progression, medication tolerance, EKG repeat.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
