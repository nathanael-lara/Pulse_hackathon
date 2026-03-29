import type {
  Visit, PatientProfile, HealthMetric, RehabDay,
  Alert, Message, Peer, Symptom, TranscriptLine,
  MedicationReminder, NotificationItem, RehabHistoryEntry,
  MedicalDocument, CareLocation, TransportMatch, ProviderMatch,
  CommunityTransportScenario, RehabWeekPlan
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
        id: 'med-001',
        name: 'Metoprolol',
        dose: '25mg',
        frequency: 'Once daily, morning with food',
        purpose: 'Regulate heart rate, reduce arrhythmia',
        sideEffects: ['Fatigue in first week', 'Mild dizziness when standing'],
        scheduleTimes: ['08:00'],
        adherenceRate: 86,
        nextDoseAt: '2026-03-30T08:00:00',
        missedDoses: 2,
      },
      {
        id: 'med-002',
        name: 'Aspirin',
        dose: '81mg',
        frequency: 'Once daily',
        purpose: 'Blood clot prevention',
        sideEffects: ['Stomach irritation if taken on empty stomach'],
        scheduleTimes: ['08:00'],
        adherenceRate: 97,
        nextDoseAt: '2026-03-30T08:00:00',
        missedDoses: 0,
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
  {
    id: 'm-005',
    from: 'patient',
    text: 'I left a voice note because I felt more winded after my walk this afternoon.',
    timestamp: new Date('2026-03-29T14:10:00'),
    linkedTo: { type: 'rehab', id: 'r-003' },
    voiceNote: {
      durationSec: 18,
      transcript: 'I felt okay at first, but halfway through the walk I got short of breath and slowed down.',
    },
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
    location: 'Upper Manhattan',
    canDrive: false,
    trustLabel: 'Recovery companion',
  },
  {
    id: 'peer-004',
    name: 'Anita',
    weekInProgram: 11,
    milestone: 'Helps others get to rehab',
    message: 'If transportation is the barrier, let the network help. Recovery should not depend on a car.',
    location: 'Washington Heights',
    canDrive: true,
    trustLabel: 'Trusted ride volunteer',
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

export const MEDICATION_REMINDERS: MedicationReminder[] = [
  {
    id: 'mr-001',
    medicationId: 'med-001',
    medicationName: 'Metoprolol',
    scheduledFor: '2026-03-29T08:00:00',
    taken: false,
    missed: true,
  },
  {
    id: 'mr-002',
    medicationId: 'med-001',
    medicationName: 'Metoprolol',
    scheduledFor: '2026-03-29T20:00:00',
    taken: false,
    missed: true,
  },
  {
    id: 'mr-003',
    medicationId: 'med-002',
    medicationName: 'Aspirin',
    scheduledFor: '2026-03-29T08:00:00',
    taken: true,
    missed: false,
  },
];

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-001',
    title: 'Rehab reminder',
    body: 'Afternoon walk is due in 20 minutes. Keep your heart rate below 120 BPM.',
    channel: 'push',
    category: 'rehab',
    level: 'info',
    timestamp: new Date('2026-03-29T13:40:00'),
    read: false,
  },
  {
    id: 'n-002',
    title: 'Medication missed twice',
    body: 'Maria missed 2 doses today. Please check on her.',
    channel: 'sms',
    category: 'medication',
    level: 'orange',
    timestamp: new Date('2026-03-29T20:10:00'),
    read: false,
  },
  {
    id: 'n-003',
    title: '11-day recovery streak',
    body: 'Maria has stayed engaged for 11 straight days. One gentle walk today keeps the cardiology plan moving forward.',
    channel: 'in-app',
    category: 'encouragement',
    level: 'info',
    timestamp: new Date('2026-03-29T09:00:00'),
    read: true,
  },
];

export const REHAB_HISTORY: RehabHistoryEntry[] = [
  { id: 'rh-001', date: '2026-03-23', completed: true, minutes: 22, steps: 3520, avgHR: 102, maxHR: 116, notes: 'Strong energy' },
  { id: 'rh-002', date: '2026-03-24', completed: false, minutes: 0, steps: 1480, avgHR: 76, maxHR: 88, notes: 'Skipped due to fatigue' },
  { id: 'rh-003', date: '2026-03-25', completed: true, minutes: 18, steps: 2980, avgHR: 98, maxHR: 112, notes: 'Breathing improved' },
  { id: 'rh-004', date: '2026-03-26', completed: true, minutes: 25, steps: 4110, avgHR: 108, maxHR: 119 },
  { id: 'rh-005', date: '2026-03-27', completed: false, minutes: 8, steps: 2100, avgHR: 112, maxHR: 128, notes: 'Stopped early after tightness concern' },
  { id: 'rh-006', date: '2026-03-28', completed: true, minutes: 20, steps: 3890, avgHR: 101, maxHR: 118 },
  { id: 'rh-007', date: '2026-03-29', completed: false, minutes: 15, steps: 4820, avgHR: 109, maxHR: 124, notes: 'Afternoon walk pending' },
];

export const MEDICAL_DOCUMENTS: MedicalDocument[] = [
  {
    id: 'doc-001',
    name: 'Visit Summary — March 29, 2026',
    type: 'Visit',
    date: '2026-03-29',
    size: '124 KB',
    summary: 'Follow-up visit confirms mild arrhythmia, medication start, and adjusted rehab intensity.',
  },
  {
    id: 'doc-002',
    name: 'Lab Panel — March 29, 2026',
    type: 'Lab',
    date: '2026-03-29',
    size: '64 KB',
    summary: 'Cholesterol still elevated, electrolytes stable, BNP mildly improved.',
    keyValues: [
      { label: 'LDL', value: '132 mg/dL', abnormal: true, explanation: 'Still above target for post-MI recovery, so risk-factor management remains important.' },
      { label: 'Potassium', value: '4.3 mmol/L', explanation: 'Within a safe range for heart rhythm stability.' },
      { label: 'BNP', value: '168 pg/mL', abnormal: true, explanation: 'Still elevated but lower than last visit, suggesting gradual improvement.' },
    ],
  },
  {
    id: 'doc-003',
    name: 'Prescription — Metoprolol',
    type: 'Prescription',
    date: '2026-03-29',
    size: '22 KB',
    summary: 'Start metoprolol 25mg daily with food. Monitor dizziness and fatigue.',
    keyValues: [
      { label: 'Dose', value: '25mg once daily', explanation: 'Standard starter dose to help regulate heart rhythm.' },
      { label: 'Take with', value: 'Food', explanation: 'Food may reduce stomach upset and improve consistency.' },
    ],
  },
  {
    id: 'doc-004',
    name: 'EKG Results — March 29, 2026',
    type: 'Diagnostic',
    date: '2026-03-29',
    size: '2.1 MB',
    summary: 'Mild irregular rhythm remains present without acute ischemic change.',
    keyValues: [
      { label: 'Rhythm', value: 'Mild arrhythmia', abnormal: true, explanation: 'The rhythm is slightly irregular and should be monitored.' },
      { label: 'Ischemic change', value: 'None acute', explanation: 'No clear sign of an active heart attack pattern on this tracing.' },
    ],
  },
];

export const CARE_LOCATIONS: CareLocation[] = [
  { id: 'loc-001', name: 'Weill Cornell Cardiac Rehab', kind: 'rehab-center', distanceMiles: 2.3, etaMinutes: 13, address: '425 E 61st St, New York, NY 10065', zipCode: '10024', acceptsNewPatients: true, summary: 'Structured outpatient rehab with post-MI pacing support.' },
  { id: 'loc-002', name: 'Columbia HeartSource', kind: 'cardiologist', distanceMiles: 2.9, etaMinutes: 16, address: '51 W 51st St, New York, NY 10019', zipCode: '10024', acceptsNewPatients: true, summary: 'Cardiology follow-up clinic with rhythm monitoring expertise.' },
  { id: 'loc-003', name: 'Mount Sinai West', kind: 'hospital', distanceMiles: 2.1, etaMinutes: 12, address: '1000 10th Ave, New York, NY 10019', zipCode: '10024', acceptsNewPatients: true, summary: 'Closest major hospital for urgent cardiac evaluation.' },
  { id: 'loc-004', name: 'NewYork-Presbyterian Ambulatory Care', kind: 'cardiologist', distanceMiles: 3.2, etaMinutes: 17, address: '177 Fort Washington Ave, New York, NY 10032', zipCode: '10024', acceptsNewPatients: false, summary: 'Existing physician network option for follow-up if referred.' },
];

export const TRANSPORT_MATCHES: TransportMatch[] = [
  { id: 'tm-001', driverName: 'Anita R.', role: 'peer', distanceMiles: 0.8, availability: 'Tue / Thu mornings', trustLabel: 'Verified rehab graduate', seats: 2, zipCode: '10024', pickupArea: 'Upper West Side', supports: ['rehab', 'cardiology'] },
  { id: 'tm-002', driverName: 'Community Care Van', role: 'volunteer', distanceMiles: 1.3, availability: 'Weekdays 7am–3pm', trustLabel: 'Hospital partner service', seats: 4, zipCode: '10024', pickupArea: 'Upper West Side', supports: ['rehab', 'hospital', 'cardiology'] },
  { id: 'tm-003', driverName: 'Rafael M.', role: 'peer', distanceMiles: 1.7, availability: 'Mon / Wed afternoons', trustLabel: 'Family-approved volunteer', seats: 1, zipCode: '10024', pickupArea: 'Upper West Side', supports: ['rehab'] },
];

export const PROVIDER_MATCHES: ProviderMatch[] = [
  {
    id: 'pm-001',
    name: 'Dr. Leena Shah',
    specialty: 'Cardiology follow-up',
    distanceMiles: 1.9,
    etaMinutes: 11,
    address: '525 E 68th St, New York, NY 10065',
    matchReason: 'Strong rhythm-monitoring fit for mild arrhythmia and medication review.',
    acceptingPatients: true,
  },
  {
    id: 'pm-002',
    name: 'West Side Cardiac Rehab Team',
    specialty: 'Cardiac rehab provider',
    distanceMiles: 2.3,
    etaMinutes: 13,
    address: '425 E 61st St, New York, NY 10065',
    matchReason: 'Best fit for the physician’s current rehab guardrails and HR limit under 120 BPM.',
    acceptingPatients: true,
  },
  {
    id: 'pm-003',
    name: 'Dr. Maya Thompson',
    specialty: 'Internal medicine + care coordination',
    distanceMiles: 0.9,
    etaMinutes: 7,
    address: '170 W 74th St, New York, NY 10023',
    matchReason: 'Closest continuity option for medication adherence and family support planning.',
    acceptingPatients: true,
  },
];

export const GOOGLE_MAPS_SIM_10024: CommunityTransportScenario[] = [
  {
    zipCode: '10024',
    placeName: 'Patient home',
    address: 'Columbus Ave & W 82nd St, New York, NY 10024',
    kind: 'home',
    etaMinutes: 0,
    distanceMiles: 0,
    source: 'google-maps-sim',
  },
  {
    zipCode: '10024',
    placeName: 'Mount Sinai West',
    address: '1000 10th Ave, New York, NY 10019',
    kind: 'hospital',
    etaMinutes: 12,
    distanceMiles: 2.1,
    source: 'google-maps-sim',
  },
  {
    zipCode: '10024',
    placeName: 'Weill Cornell Cardiac Rehab',
    address: '425 E 61st St, New York, NY 10065',
    kind: 'rehab-center',
    etaMinutes: 13,
    distanceMiles: 2.3,
    source: 'google-maps-sim',
  },
  {
    zipCode: '10024',
    placeName: 'Columbia HeartSource',
    address: '51 W 51st St, New York, NY 10019',
    kind: 'cardiologist',
    etaMinutes: 16,
    distanceMiles: 2.9,
    source: 'google-maps-sim',
  },
];

export const REHAB_12_WEEK_PLAN: RehabWeekPlan[] = [
  {
    week: 1,
    title: 'Foundation and safety',
    focus: 'Build confidence with breathing and short walks while respecting symptom limits.',
    physicianGuardrails: ['Keep heart rate under 110 BPM', 'Stop with chest tightness or dizziness'],
    targetSteps: 12000,
    totalMinutes: 80,
    sessions: [
      { id: 'w1-1', dayLabel: 'Mon', title: 'Breathing reset', focus: 'Diaphragmatic breathing', durationMinutes: 8, targetHR: 95, status: 'completed' },
      { id: 'w1-2', dayLabel: 'Tue', title: 'Short walk', focus: '10-minute flat walk', durationMinutes: 10, targetHR: 105, status: 'completed' },
      { id: 'w1-3', dayLabel: 'Thu', title: 'Stretch and recover', focus: 'Gentle upper-body mobility', durationMinutes: 12, targetHR: 98, status: 'completed' },
    ],
  },
  {
    week: 2,
    title: 'Consistency',
    focus: 'Repeat low-intensity sessions to establish routine and reduce fear of activity.',
    physicianGuardrails: ['Keep pace conversational', 'Log fatigue after each walk'],
    targetSteps: 15000,
    totalMinutes: 95,
    sessions: [
      { id: 'w2-1', dayLabel: 'Mon', title: 'Morning walk', focus: '12-minute walk', durationMinutes: 12, targetHR: 108, status: 'completed' },
      { id: 'w2-2', dayLabel: 'Wed', title: 'Breath + posture', focus: 'Breathing and posture reset', durationMinutes: 10, targetHR: 98, status: 'completed' },
      { id: 'w2-3', dayLabel: 'Fri', title: 'Recovery walk', focus: '14-minute walk', durationMinutes: 14, targetHR: 110, status: 'completed' },
    ],
  },
  {
    week: 3,
    title: 'Rhythm-aware pacing',
    focus: 'Progress gently while mild arrhythmia and new metoprolol are being monitored.',
    physicianGuardrails: ['Keep heart rate under 120 BPM', 'Stop immediately with chest tightness'],
    targetSteps: 21000,
    totalMinutes: 115,
    sessions: [
      { id: 'w3-1', dayLabel: 'Mon', title: 'Morning breathing', focus: '5-minute breathing routine', durationMinutes: 5, targetHR: 96, status: 'completed' },
      { id: 'w3-2', dayLabel: 'Tue', title: 'Morning walk', focus: '15-minute walk', durationMinutes: 15, targetHR: 110, status: 'completed' },
      { id: 'w3-3', dayLabel: 'Thu', title: 'Afternoon walk', focus: '20-minute walk with HR checks', durationMinutes: 20, targetHR: 115, status: 'today' },
      { id: 'w3-4', dayLabel: 'Sat', title: 'Evening stretch', focus: 'Chest and shoulder release', durationMinutes: 10, targetHR: 98, status: 'upcoming' },
    ],
  },
  {
    week: 4,
    title: 'Longer recovery walks',
    focus: 'Increase total walking time while keeping strict symptom awareness.',
    physicianGuardrails: ['Continue HR cap under 120 BPM', 'Report worsening breathlessness'],
    targetSteps: 23500,
    totalMinutes: 130,
    sessions: [
      { id: 'w4-1', dayLabel: 'Mon', title: 'Guided walk', focus: '22-minute steady walk', durationMinutes: 22, targetHR: 116, status: 'upcoming' },
      { id: 'w4-2', dayLabel: 'Wed', title: 'Breathing reset', focus: '8-minute recovery breathing', durationMinutes: 8, targetHR: 98, status: 'upcoming' },
      { id: 'w4-3', dayLabel: 'Fri', title: 'Light endurance', focus: '18-minute walk + stretch', durationMinutes: 18, targetHR: 118, status: 'upcoming' },
    ],
  },
  {
    week: 5,
    title: 'Endurance building',
    focus: 'Extend activity duration and reinforce medication adherence.',
    physicianGuardrails: ['Take metoprolol before morning activity', 'Avoid abrupt pace changes'],
    targetSteps: 25000,
    totalMinutes: 145,
    sessions: [
      { id: 'w5-1', dayLabel: 'Mon', title: 'Endurance walk', focus: '25-minute walk', durationMinutes: 25, targetHR: 118, status: 'upcoming' },
      { id: 'w5-2', dayLabel: 'Thu', title: 'Mobility session', focus: 'Shoulder, chest, calf mobility', durationMinutes: 12, targetHR: 100, status: 'upcoming' },
    ],
  },
  {
    week: 6,
    title: 'Confidence in routine',
    focus: 'Practice a repeatable week with rehab, reminders, and symptom logging.',
    physicianGuardrails: ['Continue symptom journal', 'Reassess if dizziness increases'],
    targetSteps: 27000,
    totalMinutes: 155,
    sessions: [
      { id: 'w6-1', dayLabel: 'Tue', title: 'Structured walk', focus: '25-minute walk with split pacing', durationMinutes: 25, targetHR: 119, status: 'upcoming' },
      { id: 'w6-2', dayLabel: 'Fri', title: 'Breathing and balance', focus: 'Recovery breathing and safe balance work', durationMinutes: 15, targetHR: 102, status: 'upcoming' },
    ],
  },
  {
    week: 7,
    title: 'Moderate progression',
    focus: 'Add controlled pace changes only if symptoms remain stable.',
    physicianGuardrails: ['No exertion above physician-set pace', 'Pause immediately with palpitations'],
    targetSteps: 29000,
    totalMinutes: 165,
    sessions: [
      { id: 'w7-1', dayLabel: 'Mon', title: 'Interval walk', focus: '3 gentle pace changes', durationMinutes: 28, targetHR: 120, status: 'upcoming' },
      { id: 'w7-2', dayLabel: 'Thu', title: 'Stretch flow', focus: 'Gentle flexibility circuit', durationMinutes: 15, targetHR: 102, status: 'upcoming' },
    ],
  },
  {
    week: 8,
    title: 'Community reintegration',
    focus: 'Prepare for longer neighborhood walks and independent scheduling.',
    physicianGuardrails: ['Carry contact plan during walks', 'Use family check-ins for longer outings'],
    targetSteps: 32000,
    totalMinutes: 175,
    sessions: [
      { id: 'w8-1', dayLabel: 'Tue', title: 'Neighborhood walk', focus: '30-minute outdoor walk', durationMinutes: 30, targetHR: 120, status: 'upcoming' },
      { id: 'w8-2', dayLabel: 'Sat', title: 'Recovery routine', focus: 'Breathing + mobility', durationMinutes: 16, targetHR: 104, status: 'upcoming' },
    ],
  },
  {
    week: 9,
    title: 'Steadier independence',
    focus: 'Reinforce self-management while staying aligned with physician advice.',
    physicianGuardrails: ['Check HR twice during exercise', 'Keep follow-up calendar current'],
    targetSteps: 34000,
    totalMinutes: 185,
    sessions: [
      { id: 'w9-1', dayLabel: 'Mon', title: 'Steady-state walk', focus: '32-minute walk', durationMinutes: 32, targetHR: 120, status: 'upcoming' },
      { id: 'w9-2', dayLabel: 'Fri', title: 'Stretch recovery', focus: 'Full-body mobility', durationMinutes: 18, targetHR: 104, status: 'upcoming' },
    ],
  },
  {
    week: 10,
    title: 'Resilience',
    focus: 'Improve recovery after activity and sharpen symptom recognition.',
    physicianGuardrails: ['Cool down gradually', 'Escalate if chest symptoms recur'],
    targetSteps: 36000,
    totalMinutes: 195,
    sessions: [
      { id: 'w10-1', dayLabel: 'Wed', title: 'Long walk', focus: '34-minute walk with cool down', durationMinutes: 34, targetHR: 120, status: 'upcoming' },
      { id: 'w10-2', dayLabel: 'Sat', title: 'Breathing reset', focus: 'Stress recovery breathing', durationMinutes: 10, targetHR: 98, status: 'upcoming' },
    ],
  },
  {
    week: 11,
    title: 'Maintenance transition',
    focus: 'Prepare for maintenance rehab with simple repeatable habits.',
    physicianGuardrails: ['Stay within known safe zone', 'Continue medication consistency'],
    targetSteps: 38000,
    totalMinutes: 205,
    sessions: [
      { id: 'w11-1', dayLabel: 'Tue', title: 'Routine walk', focus: '35-minute walk', durationMinutes: 35, targetHR: 120, status: 'upcoming' },
      { id: 'w11-2', dayLabel: 'Thu', title: 'Flexibility session', focus: 'Mobility and posture', durationMinutes: 18, targetHR: 104, status: 'upcoming' },
    ],
  },
  {
    week: 12,
    title: 'Graduation planning',
    focus: 'Consolidate progress into a sustainable long-term routine.',
    physicianGuardrails: ['Review maintenance plan with cardiology', 'Carry forward the same warning signs'],
    targetSteps: 40000,
    totalMinutes: 215,
    sessions: [
      { id: 'w12-1', dayLabel: 'Mon', title: 'Graduation walk', focus: '35-minute confidence walk', durationMinutes: 35, targetHR: 120, status: 'upcoming' },
      { id: 'w12-2', dayLabel: 'Fri', title: 'Maintenance setup', focus: 'Breathing, stretching, future plan', durationMinutes: 20, targetHR: 102, status: 'upcoming' },
    ],
  },
];
