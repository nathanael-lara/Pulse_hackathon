'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Sparkles, AlertTriangle, Pill } from 'lucide-react';
import { MEDICAL_DOCUMENTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export function DocumentsView() {
  const [selectedDocId, setSelectedDocId] = useState(MEDICAL_DOCUMENTS[1]?.id ?? MEDICAL_DOCUMENTS[0]?.id);
  const selectedDoc = MEDICAL_DOCUMENTS.find((doc) => doc.id === selectedDocId) ?? MEDICAL_DOCUMENTS[0];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-7">
        <div className="editorial-kicker text-primary mb-2">Clinical records</div>
        <h1 className="text-3xl font-bold tracking-tight">Documents + AI Extraction</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Simulated medical records, prescriptions, and labs with key values, abnormalities, and plain-language explanations.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-3">
          {MEDICAL_DOCUMENTS.map((doc, i) => (
            <motion.button
              key={doc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedDocId(doc.id)}
              className={cn(
                'w-full text-left rounded-[1.4rem] border p-4 transition-colors',
                selectedDocId === doc.id ? 'glass-card border-primary/20 bg-secondary/45' : 'glass-card border-border hover:bg-secondary/35'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-primary/12 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{doc.name}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-foreground/55">
                    <span className="rounded-full border border-border bg-white px-2 py-0.5">{doc.type}</span>
                    <Calendar className="w-3 h-3" />
                    {new Date(doc.date).toLocaleDateString()}
                  </div>
                  <div className="mt-2 text-sm text-foreground/68">{doc.summary}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="glass-card rounded-[1.75rem] p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-foreground">{selectedDoc.name}</div>
              <div className="text-sm text-foreground/68 mt-1">{selectedDoc.summary}</div>
            </div>
            <div className="rounded-full border border-border bg-white px-3 py-1 text-xs text-foreground/55">
              {selectedDoc.size}
            </div>
          </div>

          <div className="mb-4 rounded-[1.4rem] border border-primary/15 bg-secondary/45 p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">AI summary</span>
            </div>
            <p className="text-sm text-foreground/74 leading-relaxed">
              {selectedDoc.type === 'Lab'
                ? 'The lab pattern suggests recovery is moving in the right direction, but cardiovascular risk markers are still not where they need to be.'
                : selectedDoc.type === 'Prescription'
                  ? 'This prescription changes daily recovery behavior, so adherence and side-effect monitoring are both important.'
                  : 'This document contains the key decisions that should guide rehab, follow-up, and patient understanding after the visit.'}
            </p>
          </div>

          {selectedDoc.keyValues ? (
            <div className="space-y-3">
              {selectedDoc.keyValues.map((item) => (
                <div key={item.label} className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="text-sm font-semibold text-foreground">{item.label}</div>
                    <div className={cn(
                      'rounded-full px-2.5 py-1 text-xs border',
                      item.abnormal
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    )}>
                      {item.value}
                    </div>
                  </div>
                  <div className="text-sm text-foreground/72 leading-relaxed flex gap-2">
                    {item.abnormal ? <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" /> : <Pill className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />}
                    <span>{item.explanation}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.25rem] border border-border bg-white p-4 text-sm text-foreground/68 shadow-sm">
              AI extracted the main guidance from this document and surfaced the parts most relevant to Maria’s recovery journey.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
