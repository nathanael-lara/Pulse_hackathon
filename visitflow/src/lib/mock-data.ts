import type {
  Visit, PatientProfile, HealthMetric, RehabDay,
  Alert, Message, Peer, Symptom, Contact, TranscriptLine
} from './types';

export const PATIENT: PatientProfile = {
  id: 'p-001',
  name: 'Maria Santos',
  age: 58,
  condition: 'Post-MI Cardiac Rehabilitation',
  rehabWeek: 3,
  rehabDay: 4,
  streakDays: 11,
  milestones: [
    'Completed first walk',
    'Hit 5,000 steps',
    'Week 1 complete',
    'Week 2 complete',
    '10-day streak',
  ],
  riskLevel: 'green',
  contacts: [
    {
      id: 'c-001',
      name: 'Carlos Santos',
      relation: 'Husband',
      phone: '+1 (555) 234-5678',
      email: 'carlos@example.com',
      notifyAt: ['red'],
    },
    {
      id: 'c-002',
      name: 'Dr. James Okafor',
      relation: 'Cardiologist',
      phone: '+1 (555) 987-6543',
      email: 'dr.okafor@cardiohealth.com',
      notifyAt: ['orange', 'red'],
    },
  ],
};

export const MOCK_TRANSCRIPT_LINES: TranscriptLine[] = [
  {
    id: 't-001',
    timestamp: 0,
    speaker: 'doctor',
    text: "Good morning Maria, how are you feeling today?",
    tags: [],
  },
  {
    id: 't-002',
    timestamp: 8,
    speaker: 'patient',
    text: "I've been having some shortness of breath when I climb the stairs.",
    tags: ['risk'],
  },
  {
    id: 't-003',
    timestamp: 18,
    speaker: 'doctor',
    text: "I see. Your EKG shows a mild arrhythmia — an irregular heart rhythm. This is something we need to monitor closely.",
    explanation: "An arrhythmia means your heart beats in an irregular pattern. Think of it like a drummer missing a beat occasionally. Mild arrhythmia is common after a heart event and can often be managed with medication.",
    tags: ['diagnosis', 'risk'],
  },
  {
    id: 't-004',
    timestamp: 34,
    speaker: 'ai',
    text: "Key finding: Mild arrhythmia detected on EKG. This will likely influence medication and rehab intensity.",
    tags: ['diagnosis'],
  },
  {
    id: 't-005',
    timestamp: 45,
    speaker: 'doctor',
    text: "I'm going to start you on metoprolol 25mg — a beta blocker — to help regulate your heart rate. Take it every morning with food.",
    explanation: "Metoprolol is a beta blocker, which works like a speed governor for your heart. It slows down the electrical signals, making your heart beat more regularly and reducing the workload. The 25mg dose is a standard starting point.",
    tags: ['medication', 'instruction'],
  },
  {
    id: 't-006',
    timestamp: 62,
    speaker: 'doctor',
    text: "Continue your cardiac rehab, but keep your heart rate under 120 beats per minute during exercise. If you feel chest tightness, stop immediately and call us.",
    explanation: "Your safe exercise heart rate zone is below 120 BPM. This protects your healing heart from overexertion. Chest tightness during exercise is a warning signal — it means your heart may not be getting enough oxygen.",
    tags: ['instruction', 'risk'],
  },
  {
    id: 't-007',
    timestamp: 80,
    speaker: 'doctor',
    text: "I want to see you back in two weeks. We'll repeat the EKG and adjust the metoprolol if needed.",
    tags: ['followup'],
  },
  {
    id: 't-008',
    timestamp: 90,
    speaker: 'ai',
    text: "Follow-up: EKG repeat in 14 days. Medication: Metoprolol 25mg daily. Exercise limit: HR < 120 BPM.",
    tags: ['followup', 'instruction'],
  },
];

export const CURRENT_VISIT: Visit = {
  id: 'v-001',
  date: '2026-03-29',
  doctor: 'Dr. James Okafor',
  specialty: 'Cardiology',
  duration: 20,
  transcript: MOCK_TRANSCRIPT_LINES,
  riskLevel: 'yellow',
  status: 'completed',
  summary: {
    diagnosis: ['Mild cardiac arrhythmia', 'Post-MI recovery, Week 3'],
    medications: [
      {
        name: 'Metoprolol',
        dose: '25mg',
        frequency: 'Once daily, morning with food',
        purpose: 'Regulate heart rate, reduce arrhythmia',
        sideEffects: ['Fatigue in first week', 'Mild dizziness when standing'],
      },
      {
        name: 'Aspirin',
        dose: '81mg',
        frequency: 'Once daily',
        purpose: 'Blood clot prevention',
        sideEffects: ['Stomach irritation if taken on empty stomach'],
      },
    ],
    instructions: [
      'Keep heart rate under 120 BPM during exercise',
      'Stop activity immediately if chest tightness occurs',
      'Take metoprolol every morning with food',
      'Weigh yourself daily — report gain >2 lbs in 24 hours',
    ],
    followUp: '2 weeks — April 12, 2026. EKG repeat + medication review.',
    keyPoints: [
      'Mild arrhythmia is common at this stage of recovery',
      'New medication (metoprolol) starts today',
      'Continue rehab with adjusted heart rate limits',
    ],
  },
};

export const HEALTH_METRICS: HealthMetric[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: new Date(Date.now() - (23 - i) * 3600000),
  heartRate: 62 + Math.round(Math.sin(i * 0.4) * 12 + Math.random() * 8),
  steps: Math.round(200 + i * 180 + Math.random() * 100),
  activity: i < 7 ? 'resting' : i < 14 ? 'light' : i < 20 ? 'moderate' : 'resting',
  bloodPressure: i % 4 === 0 ? { systolic: 118 + Math.round(Math.random() * 10), diastolic: 75 + Math.round(Math.random() * 8) } : undefined,
}));

export const TODAY_REHAB: RehabDay = {
  date: '2026-03-29',
  week: 3,
  day: 4,
  tasks: [
    {
      id: 'r-001',
      type: 'breathe',
      title: 'Morning Breathing',
      description: '5 minutes of diaphragmatic breathing to center your day',
      duration: 5,
      completed: true,
      completedAt: new Date('2026-03-29T07:30:00'),
    },
    {
      id: 'r-002',
      type: 'walk',
      title: 'Morning Walk',
      description: '15-minute gentle walk. Keep pace conversational — you should be able to talk.',
      duration: 15,
      targetHR: 110,
      completed: true,
      completedAt: new Date('2026-03-29T08:15:00'),
    },
    {
      id: 'r-003',
      type: 'walk',
      title: 'Afternoon Walk',
      description: '20-minute brisk walk. Focus on steady rhythm.',
      duration: 20,
      targetHR: 115,
      completed: false,
    },
    {
      id: 'r-004',
      type: 'stretch',
      title: 'Evening Stretch',
      description: 'Gentle shoulder and chest stretches to release tension',
      duration: 10,
      completed: false,
    },
  ],
  aiEncouragement: "You've completed 2 of 4 tasks today — your morning consistency is building real strength. The afternoon walk is when your heart adapts most. You've got this.",
};

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'a-001',
    timestamp: new Date('2026-03-27T14:22:00'),
    level: 'yellow',
    message: 'Heart rate elevated during rest — 98 BPM for 12 minutes.',
    source: 'hr',
    acknowledged: true,
  },
  {
    id: 'a-002',
    timestamp: new Date('2026-03-28T09:45:00'),
    level: 'green',
    message: 'Morning walk completed with optimal heart rate. Well within safe zone.',
    source: 'behavior',
    acknowledged: true,
  },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm-001',
    from: 'doctor',
    text: "Hi Maria, great to see your progress this week. Keep up the consistent walking — it's making a real difference.",
    timestamp: new Date('2026-03-27T16:30:00'),
  },
  {
    id: 'm-002',
    from: 'patient',
    text: "Thank you Doctor. I noticed my breathlessness is improving. Should I try the stairs today?",
    timestamp: new Date('2026-03-27T17:15:00'),
  },
  {
    id: 'm-003',
    from: 'ai',
    text: "Based on your visit notes, Dr. Okafor recommends avoiding stairs until your next check-in on April 12. Would you like me to draft a follow-up question about this?",
    timestamp: new Date('2026-03-27T17:15:00'),
    aiSuggested: true,
  },
  {
    id: 'm-004',
    from: 'doctor',
    text: "Good question — let's hold off on stairs for now. Once we see the EKG in two weeks, we can reassess. The improvement you're feeling is real and encouraging.",
    timestamp: new Date('2026-03-28T09:00:00'),
    linkedTo: { type: 'visit', id: 'v-001' },
  },
];

export const MOCK_PEERS: Peer[] = [
  {
    id: 'peer-001',
    name: 'Robert',
    weekInProgram: 6,
    milestone: 'Completed 5K walk',
    message: "Week 3 is where it clicked for me. Keep going — you'll feel it soon.",
  },
  {
    id: 'peer-002',
    name: 'Linda',
    weekInProgram: 8,
    milestone: 'Graduated Phase 2',
    message: "The morning breathing routine you're doing? I still do it. It changed everything.",
  },
  {
    id: 'peer-003',
    name: 'James',
    weekInProgram: 4,
    milestone: 'First outdoor walk',
    message: "One day at a time. I skipped a few days too. What matters is coming back.",
  },
];

export const MOCK_SYMPTOMS: Symptom[] = [
  {
    id: 's-001',
    name: 'Shortness of breath',
    severity: 2,
    duration: '3 days',
    since: '2026-03-26',
    notes: 'Mainly on stairs',
  },
  {
    id: 's-002',
    name: 'Mild fatigue',
    severity: 2,
    duration: '1 week',
    since: '2026-03-22',
    notes: 'Better in mornings',
  },
];

export const WEEK_PROGRESS = {
  week: 3,
  totalWeeks: 12,
  completedDays: 4,
  totalDaysThisWeek: 7,
  totalSteps: 18420,
  targetSteps: 21000,
  avgHR: 72,
  targetHR: 75,
  tasksCompleted: 14,
  totalTasks: 18,
};
