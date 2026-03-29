'use client';

import { motion } from 'framer-motion';
import { Pill, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CURRENT_VISIT } from '@/lib/mock-data';

export function MedicationsView() {
  const meds = CURRENT_VISIT.summary!.medications;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Medications</h1>
        <p className="text-sm text-muted-foreground">Current prescriptions from your care team</p>
      </div>
      <div className="space-y-4">
        {meds.map((med, i) => (
          <motion.div
            key={med.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5 border border-border"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-400/20 flex items-center justify-center flex-shrink-0">
                <Pill className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold">{med.name} <span className="text-muted-foreground font-normal">{med.dose}</span></div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <Clock className="w-3 h-3" />
                  {med.frequency}
                </div>
                <p className="text-sm text-muted-foreground">{med.purpose}</p>
                {med.sideEffects && (
                  <div className="mt-3 p-2.5 rounded-xl bg-yellow-400/5 border border-yellow-400/15">
                    <div className="flex items-center gap-1.5 text-xs text-yellow-400 mb-1">
                      <AlertTriangle className="w-3 h-3" />
                      Watch for
                    </div>
                    <p className="text-xs text-muted-foreground">{med.sideEffects.join('; ')}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
