import type {
  CareContact,
  CommunitySupportMember,
  DailyBrief,
  DocumentItem,
  MealLogEntry,
  Medication,
  OnboardingState,
  PatientProfile,
  PresetMeal,
  ProviderMatch,
  RecoverySetback,
  RecoveryWeek,
  SupportMessage,
  SymptomCheckIn,
  TransportOption,
  VisitSegment,
  WearableSession,
} from '@/lib/types';

const TODAY = new Date();

function isoAt(hour: number, minute = 0, dayOffset = 0) {
  const date = new Date(TODAY);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function daysAgo(days: number, hour = 9) {
  return isoAt(hour, 0, -days);
}

export const DEMO_PATIENT: PatientProfile = {
  id: 'patient-maria',
  fullName: 'Maria Santos',
  preferredName: 'Maria',
  age: 68,
  programWeek: 3,
  recoveryGoal: 'Walk 20 minutes with confidence and stay steady with medications.',
  diagnosisSummary: 'Recovering after a heart attack with mild rhythm changes that need watching.',
  nextVisitDate: isoAt(10, 30, 5),
  careTeamName: 'Dr. James Okafor',
};

export const DEFAULT_ONBOARDING: OnboardingState = {
  completed: false,
  preferredName: DEMO_PATIENT.preferredName,
  recoveryGoal: DEMO_PATIENT.recoveryGoal,
  comfortWithTech: 'gentle',
  reminderStyle: 'both',
  largeText: true,
  spokenReplies: true,
  caregiverUpdates: true,
  autoAlertCareTeam: true,
  shareLocationForAlerts: true,
  emergencyContactId: 'contact-ana',
  locationLabel: 'Upper West Side, Manhattan',
};

export const CARE_CONTACTS: CareContact[] = [
  {
    id: 'contact-carlos',
    name: 'Carlos Santos',
    role: 'family',
    relationship: 'Husband',
    phone: '+1 (555) 234-5678',
    availability: 'Usually available now',
    escalationLevel: ['support', 'urgent'],
  },
  {
    id: 'contact-ana',
    name: 'Ana Santos',
    role: 'family',
    relationship: 'Daughter',
    phone: '+1 (555) 344-4567',
    availability: 'Available after 5 PM',
    escalationLevel: ['watch', 'support', 'urgent'],
  },
  {
    id: 'contact-doctor',
    name: 'Dr. James Okafor',
    role: 'care-team',
    relationship: 'Cardiologist',
    phone: '+1 (555) 650-2244',
    availability: 'Weekdays 9 AM to 5 PM',
    escalationLevel: ['support', 'urgent'],
    videoLink: 'https://meet.jit.si/corvas-cardiology-demo',
    aiPromptHelp: [
      'I am more short of breath this week. Should I be seen sooner?',
      'Can we review my medication side effects?',
      'Do I need a closer rehab option because travel is hard right now?',
    ],
  },
  {
    id: 'contact-jill',
    name: 'Nurse Jill Moreno',
    role: 'care-team',
    relationship: 'Cardiac rehab nurse',
    phone: '+1 (555) 908-2201',
    availability: 'Weekdays 8 AM to 4 PM',
    escalationLevel: ['support', 'urgent'],
  },
  {
    id: 'contact-support',
    name: 'CorVas support line',
    role: 'support',
    relationship: 'Recovery help',
    phone: '+1 (555) 700-1212',
    availability: '24 hours',
    escalationLevel: ['watch', 'support', 'urgent'],
  },
];

export const COMMUNITY_SUPPORT_MEMBERS: CommunitySupportMember[] = [
  {
    id: 'community-anita',
    name: 'Anita R.',
    role: 'former-patient',
    area: 'Upper West Side',
    distanceMiles: 1.2,
    availability: 'Tue and Thu mornings',
    canDrive: true,
    note: 'Finished cardiac rehab last year and now helps with ride coordination.',
    phone: '+1 (555) 312-8891',
  },
  {
    id: 'community-james',
    name: 'James T.',
    role: 'volunteer-driver',
    area: 'Harlem',
    distanceMiles: 4.5,
    availability: 'Most weekdays after 1 PM',
    canDrive: true,
    note: 'Can take patients to rehab, cardiology visits, and pharmacy pickups.',
    phone: '+1 (555) 774-2210',
  },
  {
    id: 'community-linda',
    name: 'Linda P.',
    role: 'care-coach',
    area: 'Queens',
    distanceMiles: 9,
    availability: 'Video or phone support any evening',
    canDrive: false,
    note: 'Former patient who helps others prepare questions and stay encouraged.',
    phone: '+1 (555) 611-4438',
    videoLink: 'https://meet.jit.si/corvas-linda-support',
  },
];

export const PROVIDER_MATCHES: ProviderMatch[] = [
  {
    id: 'provider-okafor',
    name: 'Dr. James Okafor',
    specialty: 'Cardiology follow-up',
    distanceMiles: 11,
    etaMinutes: 38,
    offersVideo: true,
    whyItFits: 'Best match for rhythm follow-up because he already knows the case.',
    phone: '+1 (555) 650-2244',
    videoLink: 'https://meet.jit.si/corvas-cardiology-demo',
  },
  {
    id: 'provider-westside',
    name: 'West Side Cardiac Rehab',
    specialty: 'Cardiac rehab',
    distanceMiles: 4,
    etaMinutes: 16,
    offersVideo: true,
    whyItFits: 'Closer rehab option with lower travel burden and virtual coaching backup.',
    phone: '+1 (555) 814-3302',
    videoLink: 'https://meet.jit.si/corvas-rehab-demo',
  },
  {
    id: 'provider-hudson',
    name: 'Hudson Heart Network',
    specialty: 'Community cardiology',
    distanceMiles: 3.1,
    etaMinutes: 14,
    offersVideo: false,
    whyItFits: 'Best in-person match if distance is becoming the main barrier.',
    phone: '+1 (555) 908-6117',
  },
];

export const TRANSPORT_OPTIONS: TransportOption[] = [
  {
    id: 'transport-peer',
    name: 'Peer driver network',
    type: 'peer-driver',
    maxDistanceMiles: 15,
    bookingLead: 'Book 24 hours ahead',
    details: 'Matched with former cardiac patients or local volunteers who can drive to rehab and follow-up visits.',
    phone: '+1 (555) 730-1120',
  },
  {
    id: 'transport-van',
    name: 'Community care van',
    type: 'community-van',
    maxDistanceMiles: 35,
    bookingLead: 'Book 48 hours ahead',
    details: 'Wheelchair-friendly van for longer appointment trips when family is not available.',
    phone: '+1 (555) 730-1121',
  },
  {
    id: 'transport-rideshare',
    name: 'Hospital rideshare support',
    type: 'rideshare-support',
    maxDistanceMiles: 25,
    bookingLead: 'Same day if approved',
    details: 'Backup ride credit for essential visits when other options fall through.',
    phone: '+1 (555) 730-1122',
  },
  {
    id: 'transport-video',
    name: 'Video visit fallback',
    type: 'telehealth-fallback',
    maxDistanceMiles: 999,
    bookingLead: 'Same day',
    details: 'If distance or fatigue is the problem, convert appropriate follow-up visits to video.',
    phone: '+1 (555) 650-2244',
  },
];

export const MEDICATIONS: Medication[] = [
  {
    id: 'med-metoprolol',
    name: 'Metoprolol',
    dose: '25 mg',
    purpose: 'Helps keep your heart rate steady.',
    instructions: 'Take with breakfast. Sit up slowly if you feel lightheaded.',
    schedule: ['08:00'],
    refillDate: isoAt(9, 0, 12),
    doses: [
      { id: 'dose-met-yesterday', medicationId: 'med-metoprolol', scheduledAt: isoAt(8, 0, -1), status: 'taken', loggedAt: isoAt(8, 10, -1) },
      { id: 'dose-met-today', medicationId: 'med-metoprolol', scheduledAt: isoAt(8, 0), status: 'due' },
      { id: 'dose-met-tomorrow', medicationId: 'med-metoprolol', scheduledAt: isoAt(8, 0, 1), status: 'due' },
    ],
  },
  {
    id: 'med-aspirin',
    name: 'Aspirin',
    dose: '81 mg',
    purpose: 'Helps lower the chance of blood clots.',
    instructions: 'Take once each morning with food or water.',
    schedule: ['08:00'],
    refillDate: isoAt(9, 0, 18),
    doses: [
      { id: 'dose-asp-yesterday', medicationId: 'med-aspirin', scheduledAt: isoAt(8, 0, -1), status: 'taken', loggedAt: isoAt(8, 6, -1) },
      { id: 'dose-asp-today', medicationId: 'med-aspirin', scheduledAt: isoAt(8, 0), status: 'taken', loggedAt: isoAt(8, 7) },
      { id: 'dose-asp-tomorrow', medicationId: 'med-aspirin', scheduledAt: isoAt(8, 0, 1), status: 'due' },
    ],
  },
  {
    id: 'med-lisinopril',
    name: 'Lisinopril',
    dose: '10 mg',
    purpose: 'Helps your heart and blood pressure stay protected while you recover.',
    instructions: 'Take in the evening. Call the care team if dizziness keeps getting worse.',
    schedule: ['20:00'],
    refillDate: isoAt(9, 0, 25),
    doses: [
      { id: 'dose-lis-yesterday', medicationId: 'med-lisinopril', scheduledAt: isoAt(20, 0, -1), status: 'skipped', loggedAt: isoAt(21, 20, -1) },
      { id: 'dose-lis-today', medicationId: 'med-lisinopril', scheduledAt: isoAt(20, 0), status: 'due' },
      { id: 'dose-lis-tomorrow', medicationId: 'med-lisinopril', scheduledAt: isoAt(20, 0, 1), status: 'due' },
    ],
  },
];

export const RECOVERY_WEEKS: RecoveryWeek[] = [
  {
    week: 1,
    focus: 'Gentle movement and rest',
    milestone: 'Learn safe pacing',
    status: 'completed',
    sessions: [
      { id: 'w1-s1', week: 1, dayLabel: 'Mon', title: 'Breathing reset', description: 'Five minutes of slow breathing.', durationMinutes: 5, target: 'Calm your breathing', status: 'completed', completedAt: daysAgo(14, 8) },
      { id: 'w1-s2', week: 1, dayLabel: 'Wed', title: 'Short walk', description: 'A 10-minute indoor walk at an easy pace.', durationMinutes: 10, target: 'Stay below the talk-test limit', status: 'completed', completedAt: daysAgo(12, 11) },
      { id: 'w1-s3', week: 1, dayLabel: 'Fri', title: 'Stretch and recover', description: 'Open the chest and shoulders gently.', durationMinutes: 8, target: 'Reduce tightness', status: 'completed', completedAt: daysAgo(10, 15) },
    ],
  },
  {
    week: 2,
    focus: 'Consistency over intensity',
    milestone: 'Feel steadier day to day',
    status: 'completed',
    sessions: [
      { id: 'w2-s1', week: 2, dayLabel: 'Mon', title: 'Breathing reset', description: 'Slow inhale and exhale practice.', durationMinutes: 6, target: 'Start the day calmer', status: 'completed', completedAt: daysAgo(9, 8) },
      { id: 'w2-s2', week: 2, dayLabel: 'Wed', title: 'Guided walk', description: 'A 12-minute walk with easy pacing.', durationMinutes: 12, target: 'Stay comfortable enough to talk', status: 'completed', completedAt: daysAgo(7, 10) },
      { id: 'w2-s3', week: 2, dayLabel: 'Fri', title: 'Recovery stretch', description: 'Gentle stretch plus a short rest.', durationMinutes: 10, target: 'Loosen chest and shoulders', status: 'completed', completedAt: daysAgo(5, 16) },
    ],
  },
  {
    week: 3,
    focus: 'Build confidence and routine',
    milestone: 'Complete three steady movement days',
    status: 'current',
    sessions: [
      { id: 'w3-s1', week: 3, dayLabel: 'Mon', title: 'Morning walk', description: 'A 15-minute walk at a calm pace.', durationMinutes: 15, target: 'Keep breathing comfortable', status: 'completed', completedAt: daysAgo(2, 9) },
      { id: 'w3-s2', week: 3, dayLabel: 'Wed', title: 'Strengthen with stairs awareness', description: 'A 12-minute walk, pausing if stairs worsen breathlessness.', durationMinutes: 12, target: 'Notice how recovery feels', status: 'missed' },
      { id: 'w3-s3', week: 3, dayLabel: 'Today', title: 'Afternoon walk', description: 'A 20-minute walk with a relaxed pace and a short warm-up.', durationMinutes: 20, target: 'Stay under the effort limit from your doctor', status: 'today' },
      { id: 'w3-s4', week: 3, dayLabel: 'Sat', title: 'Evening stretch', description: 'Gentle stretch and breathing before bed.', durationMinutes: 10, target: 'Reduce tension', status: 'upcoming' },
    ],
  },
  ...Array.from({ length: 9 }, (_, index) => {
    const week = index + 4;
    return {
      week,
      focus: week < 7 ? 'Gradually add time' : week < 10 ? 'Return to confident routine' : 'Prepare for graduation',
      milestone: week < 7 ? 'Longer walks feel normal' : week < 10 ? 'Recovery feels more predictable' : 'Feel ready for long-term habits',
      status: 'upcoming' as const,
      sessions: [
        { id: `w${week}-s1`, week, dayLabel: 'Mon', title: 'Walk', description: 'A guided walk with steady pacing.', durationMinutes: 15 + week, target: 'Stay in your comfort zone', status: 'upcoming' as const },
        { id: `w${week}-s2`, week, dayLabel: 'Wed', title: 'Breathing and balance', description: 'Breathing and light mobility work.', durationMinutes: 8 + Math.floor(week / 2), target: 'Feel balanced and calm', status: 'upcoming' as const },
        { id: `w${week}-s3`, week, dayLabel: 'Fri', title: 'Recovery check-in', description: 'A short walk followed by a symptom review.', durationMinutes: 12 + week, target: 'Notice progress without rushing', status: 'upcoming' as const },
      ],
    };
  }),
];

export const INITIAL_SETBACKS: RecoverySetback[] = [
  {
    id: 'setback-1',
    createdAt: daysAgo(1, 18),
    reason: 'symptoms',
    note: 'Stopped early yesterday when breathlessness picked up on stairs.',
  },
];

export const INITIAL_CHECK_INS: SymptomCheckIn[] = [
  {
    id: 'check-in-1',
    createdAt: daysAgo(1, 19),
    breathlessness: 3,
    dizziness: 1,
    fatigue: 2,
    chestDiscomfort: 0,
    worry: 3,
    note: 'More winded on stairs than yesterday, but better after resting.',
  },
];

export const INITIAL_SUPPORT_MESSAGES: SupportMessage[] = [
  {
    id: 'message-1',
    sender: 'contact',
    contactId: 'contact-jill',
    body: 'Checking in after rehab. Keep the walk gentle today and message me if the breathlessness feels worse.',
    createdAt: daysAgo(1, 15),
  },
  {
    id: 'message-2',
    sender: 'patient',
    body: 'Thank you. I felt more winded on the stairs yesterday, so I slowed down.',
    createdAt: daysAgo(1, 17),
  },
  {
    id: 'message-3',
    sender: 'corvas',
    body: 'I saved that update for your recovery log and marked it for a gentle follow-up.',
    createdAt: daysAgo(1, 17),
  },
];

export const VISIT_SEGMENTS: VisitSegment[] = [
  {
    id: 'visit-1',
    speaker: 'doctor',
    title: 'Heart rhythm update',
    clinicalText: 'Your EKG shows a mild arrhythmia, which means your heart rhythm is a little irregular right now.',
    simpleText: 'Your heart rhythm is slightly uneven. Your doctor wants to keep watching it, but this note does not say it is an emergency.',
    followUpQuestions: [
      'What symptoms should make me call the clinic before my next visit?',
      'Does this change how hard I should exercise this week?',
    ],
    tags: ['rhythm', 'follow-up'],
  },
  {
    id: 'visit-2',
    speaker: 'doctor',
    title: 'Medication change',
    clinicalText: 'Please start metoprolol 25 milligrams every morning with food.',
    simpleText: 'Start this heart medicine in the morning with breakfast. Taking it the same way each day helps it work more smoothly.',
    followUpQuestions: [
      'What side effects are common in the first week?',
      'If I feel dizzy, should I message the care team?',
    ],
    tags: ['medication'],
  },
  {
    id: 'visit-3',
    speaker: 'doctor',
    title: 'Exercise safety',
    clinicalText: 'Keep your heart rate under 120 during exercise and stop if you feel chest tightness.',
    simpleText: 'Exercise should stay light enough that you can still talk. Stop right away if you feel tightness in your chest and get help.',
    followUpQuestions: [
      'How do I tell if I am pushing too hard?',
      'Should I send a message if I have to stop early?',
    ],
    tags: ['rehab', 'safety'],
  },
];

export const DOCUMENTS: DocumentItem[] = [
  {
    id: 'document-visit',
    title: 'Visit summary',
    source: 'visit-summary',
    createdAt: daysAgo(1, 12),
    plainSummary: 'Your doctor is watching a mild rhythm change, starting metoprolol, and keeping rehab gentle for now.',
    followUpQuestions: [
      'What should I focus on before my next visit?',
      'What symptoms would mean the plan needs to change sooner?',
    ],
  },
  {
    id: 'document-lab',
    title: 'Lab panel',
    source: 'lab',
    createdAt: daysAgo(1, 12),
    plainSummary: 'The lab work suggests recovery is moving forward, but heart-risk numbers still need attention over time.',
    followUpQuestions: [
      'Which lab number matters most for me this month?',
      'Does this change my food or medication plan?',
    ],
  },
  {
    id: 'document-prescription',
    title: 'Metoprolol prescription',
    source: 'prescription',
    createdAt: daysAgo(1, 12),
    plainSummary: 'This prescription starts a once-daily heart medicine to help steady your rhythm.',
    followUpQuestions: [
      'How long might I need this medicine?',
      'What should I do if I miss a dose?',
    ],
  },
];

export const INITIAL_CHAT: { id: string; role: 'assistant'; text: string; createdAt: string; mode: 'text' }[] = [
  {
    id: 'chat-welcome',
    role: 'assistant',
    text: 'I can explain visit notes, review today’s medications, help with symptoms, or draft a message to your care circle. You can type or tap the microphone.',
    createdAt: new Date().toISOString(),
    mode: 'text',
  },
];

export const DAILY_BRIEF: DailyBrief = {
  headline: 'Today looks manageable.',
  encouragement: 'You are not behind. One steady walk and one medication check can make today a good recovery day.',
  nextBestAction: 'Take your morning metoprolol with food, then aim for your 20-minute afternoon walk.',
};

export const PRESET_MEALS: PresetMeal[] = [
  {
    id: 'meal-oatmeal',
    name: 'Oatmeal with berries',
    sodiumMg: 70,
    caloriesEstimate: 280,
    description: 'Steel-cut oats with fresh blueberries and honey',
  },
  {
    id: 'meal-salmon',
    name: 'Grilled salmon with vegetables',
    sodiumMg: 200,
    caloriesEstimate: 420,
    description: 'Salmon fillet with roasted broccoli and sweet potato',
  },
  {
    id: 'meal-greek-salad',
    name: 'Greek salad',
    sodiumMg: 180,
    caloriesEstimate: 310,
    description: 'Mixed greens, tomatoes, cucumbers, olives, feta',
  },
  {
    id: 'meal-avocado-toast',
    name: 'Whole grain toast with avocado',
    sodiumMg: 150,
    caloriesEstimate: 350,
    description: 'Whole grain bread, mashed avocado, olive oil, lemon',
  },
  {
    id: 'meal-chicken-rice',
    name: 'Grilled chicken with brown rice',
    sodiumMg: 220,
    caloriesEstimate: 450,
    description: 'Skinless chicken breast, brown rice, steamed broccoli',
  },
  {
    id: 'meal-vegetable-soup',
    name: 'Low-sodium vegetable soup',
    sodiumMg: 120,
    caloriesEstimate: 220,
    description: 'Homemade soup with carrots, celery, tomatoes, beans',
  },
  {
    id: 'meal-pasta',
    name: 'Whole wheat pasta with olive oil',
    sodiumMg: 240,
    caloriesEstimate: 380,
    description: 'Whole wheat pasta, garlic, olive oil, spinach, tomatoes',
  },
  {
    id: 'meal-fish-tacos',
    name: 'Fish tacos (low sodium)',
    sodiumMg: 280,
    caloriesEstimate: 420,
    description: 'Grilled white fish, cabbage slaw, lime, whole grain tortilla',
  },
  {
    id: 'meal-yogurt-bowl',
    name: 'Greek yogurt with granola',
    sodiumMg: 85,
    caloriesEstimate: 320,
    description: 'Plain Greek yogurt, low-sodium granola, berries, nuts',
  },
  {
    id: 'meal-mediterranean-bowl',
    name: 'Mediterranean bowl',
    sodiumMg: 190,
    caloriesEstimate: 480,
    description: 'Quinoa, roasted veggies, chickpeas, tahini dressing',
  },
  {
    id: 'meal-egg-veggies',
    name: 'Egg white omelet with vegetables',
    sodiumMg: 140,
    caloriesEstimate: 240,
    description: 'Egg whites, spinach, mushrooms, bell peppers, olive oil',
  },
  {
    id: 'meal-turkey-wrap',
    name: 'Turkey wrap',
    sodiumMg: 260,
    caloriesEstimate: 380,
    description: 'Low-sodium turkey, whole grain wrap, lettuce, tomato, hummus',
  },
];

export const INITIAL_MEAL_LOGS: MealLogEntry[] = [
  {
    id: 'meal-log-1',
    createdAt: daysAgo(1, 8),
    mealType: 'breakfast',
    description: 'Oatmeal with berries',
    sodiumMg: 70,
    caloriesEstimate: 280,
    presetMealId: 'meal-oatmeal',
    notes: 'Felt good this morning',
  },
  {
    id: 'meal-log-2',
    createdAt: daysAgo(1, 12),
    mealType: 'lunch',
    description: 'Grilled chicken with brown rice',
    sodiumMg: 220,
    caloriesEstimate: 450,
    presetMealId: 'meal-chicken-rice',
    notes: '',
  },
  {
    id: 'meal-log-3',
    createdAt: daysAgo(1, 18),
    mealType: 'dinner',
    description: 'Salmon with vegetables',
    sodiumMg: 200,
    caloriesEstimate: 420,
    presetMealId: 'meal-salmon',
    notes: 'Had some bread on the side (extra sodium estimate)',
  },
];

export const MOCK_WEARABLE_SESSIONS: WearableSession[] = [
  {
    id: 'wearable-1',
    createdAt: daysAgo(6, 10),
    source: 'mock-apple-health',
    activityType: 'walk',
    durationMinutes: 15,
    avgHeartRate: 78,
    maxHeartRate: 92,
    steps: 3200,
    hrZone: 'zone2',
    exceededSafeThreshold: false,
    notes: 'Morning walk around the neighborhood',
  },
  {
    id: 'wearable-2',
    createdAt: daysAgo(5, 14),
    source: 'mock-apple-health',
    activityType: 'walk',
    durationMinutes: 20,
    avgHeartRate: 82,
    maxHeartRate: 98,
    steps: 4100,
    hrZone: 'zone2',
    exceededSafeThreshold: false,
    notes: 'Afternoon walk with Carlos',
  },
  {
    id: 'wearable-3',
    createdAt: daysAgo(4, 11),
    source: 'mock-apple-health',
    activityType: 'stretch',
    durationMinutes: 12,
    avgHeartRate: 65,
    maxHeartRate: 75,
    hrZone: 'zone1',
    exceededSafeThreshold: false,
    notes: 'Gentle stretching routine',
  },
  {
    id: 'wearable-4',
    createdAt: daysAgo(3, 10),
    source: 'mock-apple-health',
    activityType: 'walk',
    durationMinutes: 18,
    avgHeartRate: 79,
    maxHeartRate: 95,
    steps: 3800,
    hrZone: 'zone2',
    exceededSafeThreshold: false,
  },
  {
    id: 'wearable-5',
    createdAt: daysAgo(2, 15),
    source: 'mock-apple-health',
    activityType: 'walk',
    durationMinutes: 22,
    avgHeartRate: 85,
    maxHeartRate: 108,
    steps: 4500,
    hrZone: 'zone3',
    exceededSafeThreshold: false,
    notes: 'Felt strong today',
  },
  {
    id: 'wearable-6',
    createdAt: daysAgo(1, 11),
    source: 'mock-apple-health',
    activityType: 'walk',
    durationMinutes: 19,
    avgHeartRate: 80,
    maxHeartRate: 96,
    steps: 4000,
    hrZone: 'zone2',
    exceededSafeThreshold: false,
  },
  {
    id: 'wearable-7',
    createdAt: isoAt(10, 30),
    source: 'mock-apple-health',
    activityType: 'walk',
    durationMinutes: 16,
    avgHeartRate: 75,
    maxHeartRate: 89,
    steps: 3400,
    hrZone: 'zone2',
    exceededSafeThreshold: false,
    notes: 'This morning',
  },
];

export const INITIAL_WEARABLE_SESSIONS: WearableSession[] = MOCK_WEARABLE_SESSIONS;
