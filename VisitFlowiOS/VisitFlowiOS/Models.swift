import Foundation

enum MobileTab: String, CaseIterable, Identifiable {
    case record = "Record"
    case visit = "Visit"
    case medication = "Medication"
    case rehab = "Rehab"
    case support = "Support"

    var id: String { rawValue }
}

enum TripPurpose: String, CaseIterable, Identifiable {
    case rehab = "Cardiac rehab visit"
    case cardiology = "Cardiology follow-up"
    case hospital = "Urgent hospital check"

    var id: String { rawValue }
}

struct VisitLine: Identifiable {
    let id: String
    let speaker: String
    let text: String
    let isDoctorAdvice: Bool
}

struct MedicationItem: Identifiable {
    let id: String
    let name: String
    let dose: String
    let time: String
    let status: String
}

struct RehabHistoryItem: Identifiable {
    let id: String
    let day: String
    let steps: Int
    let avgHR: Int
    let status: String
}

struct RehabPlanSession: Identifiable {
    let id: String
    let day: String
    let title: String
    let focus: String
    let durationMinutes: Int
    let targetHR: Int
    let status: String
}

struct RehabWeekPlan: Identifiable {
    let id: Int
    let title: String
    let focus: String
    let guardrails: [String]
    let sessions: [RehabPlanSession]
}

struct ProviderMatch: Identifiable {
    let id: String
    let name: String
    let specialty: String
    let distanceMiles: Double
    let etaMinutes: Int
    let address: String
    let matchReason: String
}

struct TransportOption: Identifiable {
    let id: String
    let name: String
    let role: String
    let distanceMiles: Double
    let availability: String
    let trustLabel: String
    let seats: Int
    let purpose: TripPurpose
}

struct CareStop: Identifiable {
    let id: String
    let name: String
    let kind: String
    let distanceMiles: Double
    let etaMinutes: Int
    let address: String
    let purpose: TripPurpose
}

enum MockData {
    static let visitLines: [VisitLine] = [
        VisitLine(id: "v1", speaker: "Doctor", text: "Your EKG shows a mild arrhythmia, so we will keep monitoring your rhythm during recovery.", isDoctorAdvice: true),
        VisitLine(id: "v2", speaker: "Doctor", text: "Start metoprolol 25 milligrams each morning with food.", isDoctorAdvice: true),
        VisitLine(id: "v3", speaker: "Doctor", text: "Keep your heart rate below 120 during rehab and stop right away if you feel chest tightness.", isDoctorAdvice: true),
        VisitLine(id: "v4", speaker: "Doctor", text: "I want to see you back in two weeks for a repeat EKG and medication review.", isDoctorAdvice: true)
    ]

    static let visitBullets: [String: [String]] = [
        "v1": [
            "Your heart rhythm is slightly irregular.",
            "Your doctor wants to monitor it during recovery.",
            "This line does not say it is an emergency right now."
        ],
        "v2": [
            "You are starting metoprolol 25 mg.",
            "Take it every morning with food.",
            "The doctor said it is meant to help regulate your heart rate."
        ],
        "v3": [
            "Keep your rehab heart rate under 120 beats per minute.",
            "Chest tightness means stop right away.",
            "These are safety limits for your current recovery plan."
        ],
        "v4": [
            "Your next visit is in two weeks.",
            "The doctor plans to repeat the EKG.",
            "Medication may be adjusted after that review."
        ]
    ]

    static let medications: [MedicationItem] = [
        MedicationItem(id: "m1", name: "Metoprolol", dose: "25mg", time: "8:00 AM", status: "MISSED"),
        MedicationItem(id: "m2", name: "Aspirin", dose: "81mg", time: "8:00 AM", status: "TAKEN")
    ]

    static let rehabHistory: [RehabHistoryItem] = [
        RehabHistoryItem(id: "r1", day: "Mon", steps: 3810, avgHR: 102, status: "done"),
        RehabHistoryItem(id: "r2", day: "Tue", steps: 1420, avgHR: 80, status: "missed"),
        RehabHistoryItem(id: "r3", day: "Wed", steps: 4120, avgHR: 108, status: "done"),
        RehabHistoryItem(id: "r4", day: "Thu", steps: 2980, avgHR: 114, status: "partial")
    ]

    static let rehabPlans: [RehabWeekPlan] = [
        RehabWeekPlan(
            id: 1,
            title: "Foundation and safety",
            focus: "Start gentle breathing and short walks while learning symptoms and limits.",
            guardrails: ["Keep HR under 110 BPM", "Stop with chest tightness or dizziness"],
            sessions: [
                RehabPlanSession(id: "w1-1", day: "Mon", title: "Breathing reset", focus: "Diaphragmatic breathing", durationMinutes: 8, targetHR: 95, status: "completed"),
                RehabPlanSession(id: "w1-2", day: "Thu", title: "Short walk", focus: "10-minute flat walk", durationMinutes: 10, targetHR: 105, status: "completed")
            ]
        ),
        RehabWeekPlan(
            id: 2,
            title: "Consistency",
            focus: "Repeat low-intensity activity to build routine and confidence.",
            guardrails: ["Keep pace conversational", "Log fatigue after each walk"],
            sessions: [
                RehabPlanSession(id: "w2-1", day: "Mon", title: "Morning walk", focus: "12-minute walk", durationMinutes: 12, targetHR: 108, status: "completed"),
                RehabPlanSession(id: "w2-2", day: "Fri", title: "Recovery walk", focus: "14-minute walk", durationMinutes: 14, targetHR: 110, status: "completed")
            ]
        ),
        RehabWeekPlan(
            id: 3,
            title: "Rhythm-aware pacing",
            focus: "Progress carefully while mild arrhythmia and new medication are being monitored.",
            guardrails: ["Keep HR under 120 BPM", "Stop immediately with chest tightness"],
            sessions: [
                RehabPlanSession(id: "w3-1", day: "Mon", title: "Morning breathing", focus: "5-minute breathing routine", durationMinutes: 5, targetHR: 96, status: "completed"),
                RehabPlanSession(id: "w3-2", day: "Tue", title: "Morning walk", focus: "15-minute walk", durationMinutes: 15, targetHR: 110, status: "completed"),
                RehabPlanSession(id: "w3-3", day: "Thu", title: "Afternoon walk", focus: "20-minute walk with HR checks", durationMinutes: 20, targetHR: 115, status: "today"),
                RehabPlanSession(id: "w3-4", day: "Sat", title: "Evening stretch", focus: "Chest and shoulder release", durationMinutes: 10, targetHR: 98, status: "upcoming")
            ]
        ),
        RehabWeekPlan(
            id: 4,
            title: "Longer recovery walks",
            focus: "Extend walking time while staying inside the physician's safe zone.",
            guardrails: ["Continue HR cap under 120 BPM", "Report worsening breathlessness"],
            sessions: [
                RehabPlanSession(id: "w4-1", day: "Mon", title: "Guided walk", focus: "22-minute steady walk", durationMinutes: 22, targetHR: 116, status: "upcoming"),
                RehabPlanSession(id: "w4-2", day: "Fri", title: "Light endurance", focus: "18-minute walk plus stretch", durationMinutes: 18, targetHR: 118, status: "upcoming")
            ]
        ),
        RehabWeekPlan(
            id: 5,
            title: "Endurance building",
            focus: "Increase total walking time and maintain medication consistency.",
            guardrails: ["Take metoprolol before morning activity", "Avoid abrupt pace changes"],
            sessions: [
                RehabPlanSession(id: "w5-1", day: "Tue", title: "Endurance walk", focus: "25-minute walk", durationMinutes: 25, targetHR: 118, status: "upcoming")
            ]
        ),
        RehabWeekPlan(
            id: 6,
            title: "Confidence in routine",
            focus: "Practice a repeatable week with rehab, reminders, and symptom logging.",
            guardrails: ["Continue symptom journal", "Reassess if dizziness increases"],
            sessions: [
                RehabPlanSession(id: "w6-1", day: "Wed", title: "Structured walk", focus: "25-minute walk with split pacing", durationMinutes: 25, targetHR: 119, status: "upcoming")
            ]
        ),
        RehabWeekPlan(
            id: 7,
            title: "Moderate progression",
            focus: "Add controlled pace changes only if symptoms remain stable.",
            guardrails: ["No exertion above physician-set pace", "Pause with palpitations"],
            sessions: [
                RehabPlanSession(id: "w7-1", day: "Mon", title: "Interval walk", focus: "3 gentle pace changes", durationMinutes: 28, targetHR: 120, status: "upcoming")
            ]
        ),
        RehabWeekPlan(
            id: 8,
            title: "Community reintegration",
            focus: "Prepare for longer neighborhood walks and independent scheduling.",
            guardrails: ["Carry contact plan during walks", "Use family check-ins for longer outings"],
            sessions: [
                RehabPlanSession(id: "w8-1", day: "Tue", title: "Neighborhood walk", focus: "30-minute outdoor walk", durationMinutes: 30, targetHR: 120, status: "upcoming")
            ]
        ),
        RehabWeekPlan(
            id: 9,
            title: "Steadier independence",
            focus: "Reinforce self-management while staying aligned with physician advice.",
            guardrails: ["Check HR twice during exercise", "Keep follow-up calendar current"],
            sessions: [
                RehabPlanSession(id: "w9-1", day: "Thu", title: "Steady-state walk", focus: "32-minute walk", durationMinutes: 32, targetHR: 120, status: "upcoming")
            ]
        ),
        RehabWeekPlan(
            id: 10,
            title: "Resilience",
            focus: "Improve recovery after activity and sharpen symptom recognition.",
            guardrails: ["Cool down gradually", "Escalate if chest symptoms recur"],
            sessions: [
                RehabPlanSession(id: "w10-1", day: "Mon", title: "Long walk", focus: "34-minute walk with cool down", durationMinutes: 34, targetHR: 120, status: "upcoming")
            ]
        ),
        RehabWeekPlan(
            id: 11,
            title: "Maintenance transition",
            focus: "Prepare for long-term maintenance rehab habits.",
            guardrails: ["Stay within known safe zone", "Continue medication consistency"],
            sessions: [
                RehabPlanSession(id: "w11-1", day: "Wed", title: "Routine walk", focus: "35-minute walk", durationMinutes: 35, targetHR: 120, status: "upcoming")
            ]
        ),
        RehabWeekPlan(
            id: 12,
            title: "Graduation planning",
            focus: "Turn recovery progress into a sustainable routine after the formal program.",
            guardrails: ["Review maintenance plan with cardiology", "Carry forward the same warning signs"],
            sessions: [
                RehabPlanSession(id: "w12-1", day: "Fri", title: "Graduation walk", focus: "35-minute confidence walk", durationMinutes: 35, targetHR: 120, status: "upcoming")
            ]
        )
    ]

    static let providerMatches: [ProviderMatch] = [
        ProviderMatch(id: "p1", name: "Dr. Leena Shah", specialty: "Cardiology follow-up", distanceMiles: 1.9, etaMinutes: 11, address: "525 E 68th St, New York, NY 10065", matchReason: "Strong rhythm-monitoring fit for mild arrhythmia and medication review."),
        ProviderMatch(id: "p2", name: "West Side Cardiac Rehab Team", specialty: "Cardiac rehab provider", distanceMiles: 2.3, etaMinutes: 13, address: "425 E 61st St, New York, NY 10065", matchReason: "Best fit for the physician's rehab guardrails and HR limit under 120 BPM."),
        ProviderMatch(id: "p3", name: "Dr. Maya Thompson", specialty: "Care coordination", distanceMiles: 0.9, etaMinutes: 7, address: "170 W 74th St, New York, NY 10023", matchReason: "Closest continuity option for medication adherence and family support planning.")
    ]

    static let transportOptions: [TransportOption] = [
        TransportOption(id: "t1", name: "Anita R.", role: "Peer transport support", distanceMiles: 0.8, availability: "Tue / Thu mornings", trustLabel: "Verified rehab graduate", seats: 2, purpose: .rehab),
        TransportOption(id: "t2", name: "Community Care Van", role: "Community transport partner", distanceMiles: 1.3, availability: "Weekdays 7am–3pm", trustLabel: "Hospital partner service", seats: 4, purpose: .hospital),
        TransportOption(id: "t3", name: "Rafael M.", role: "Peer transport support", distanceMiles: 1.7, availability: "Mon / Wed afternoons", trustLabel: "Family-approved volunteer", seats: 1, purpose: .cardiology)
    ]

    static let careStops: [CareStop] = [
        CareStop(id: "c1", name: "Mount Sinai West", kind: "Hospital", distanceMiles: 2.1, etaMinutes: 12, address: "1000 10th Ave, New York, NY 10019", purpose: .hospital),
        CareStop(id: "c2", name: "Weill Cornell Cardiac Rehab", kind: "Rehab Center", distanceMiles: 2.3, etaMinutes: 13, address: "425 E 61st St, New York, NY 10065", purpose: .rehab),
        CareStop(id: "c3", name: "Columbia HeartSource", kind: "Cardiologist", distanceMiles: 2.9, etaMinutes: 16, address: "51 W 51st St, New York, NY 10019", purpose: .cardiology)
    ]
}
