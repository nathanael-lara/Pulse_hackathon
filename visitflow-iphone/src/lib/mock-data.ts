import type { MedicationItem, RehabSession, VisitLine } from './types';

export const VISIT_LINES: VisitLine[] = [
  {
    id: 'v1',
    speaker: 'doctor',
    text: 'You have mild arrhythmia, so we will keep a close eye on your rhythm during recovery.',
    tag: 'diagnosis',
  },
  {
    id: 'v2',
    speaker: 'ai',
    text: 'Your heart rhythm is slightly irregular, but your team is monitoring it carefully.',
  },
  {
    id: 'v3',
    speaker: 'doctor',
    text: 'Start metoprolol 25 milligrams each morning with food.',
    tag: 'medication',
  },
  {
    id: 'v4',
    speaker: 'doctor',
    text: 'Keep your heart rate below 120 during rehab. If you feel chest tightness, stop right away.',
    tag: 'instruction',
  },
];

export const VISIT_BULLETS: Record<string, string[]> = {
  v1: [
    'Your heart rhythm is slightly irregular',
    'This is usually not dangerous, but it needs monitoring',
    'Your doctor will watch how it changes during recovery',
    'This can affect your rehab pace and follow-up plan',
  ],
  v3: [
    'This medicine helps steady your heart rhythm',
    'Taking it with food may make it easier to tolerate',
    'The goal is to reduce strain on your heart',
    'Your care team will watch for dizziness or fatigue',
  ],
  v4: [
    'Your rehab has a clear safety limit today',
    'If your heart rate climbs too high, slow down',
    'Chest tightness means stop immediately',
    'This helps you recover without overexerting your heart',
  ],
};

export const MEDICATIONS: MedicationItem[] = [
  { id: 'm1', name: 'Metoprolol', dose: '25mg', time: '8:00 AM', status: 'missed' },
  { id: 'm2', name: 'Aspirin', dose: '81mg', time: '8:00 AM', status: 'taken' },
];

export const REHAB_HISTORY: RehabSession[] = [
  { day: 'Mon', status: 'done', steps: 3810, avgHR: 102 },
  { day: 'Tue', status: 'missed', steps: 1420, avgHR: 80 },
  { day: 'Wed', status: 'done', steps: 4120, avgHR: 108 },
  { day: 'Thu', status: 'partial', steps: 2980, avgHR: 114 },
];
