'use client';

import { motion } from 'framer-motion';
import { FileText, Download, Calendar } from 'lucide-react';

const DOCS = [
  { name: 'Visit Summary — March 29, 2026', type: 'Visit', date: '2026-03-29', size: '124 KB' },
  { name: 'EKG Results — March 29, 2026', type: 'Diagnostic', date: '2026-03-29', size: '2.1 MB' },
  { name: 'Cardiac Rehab Plan — Week 3', type: 'Rehab', date: '2026-03-22', size: '88 KB' },
  { name: 'Discharge Instructions', type: 'Clinical', date: '2026-03-08', size: '156 KB' },
  { name: 'FHIR Patient Record', type: 'Record', date: '2026-03-29', size: '340 KB' },
];

export function DocumentsView() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Documents</h1>
        <p className="text-sm text-muted-foreground">Your clinical records and visit materials</p>
      </div>
      <div className="space-y-2">
        {DOCS.map((doc, i) => (
          <motion.div
            key={doc.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card rounded-xl p-4 border border-border flex items-center gap-4 hover:bg-secondary/20 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{doc.name}</div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                <span className="px-1.5 py-0.5 glass rounded text-xs">{doc.type}</span>
                <Calendar className="w-3 h-3" />
                {new Date(doc.date).toLocaleDateString()}
                <span className="ml-1">{doc.size}</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
