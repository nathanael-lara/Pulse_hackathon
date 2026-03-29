import SwiftUI

private enum Palette {
    static let lavender = Color(red: 143/255, green: 113/255, blue: 184/255)
    static let lavenderDark = Color(red: 119/255, green: 84/255, blue: 162/255)
    static let appBackground = Color(red: 239/255, green: 239/255, blue: 239/255)
    static let cardBackground = Color.white
    static let softBackground = Color(red: 247/255, green: 243/255, blue: 251/255)
    static let line = Color(red: 230/255, green: 223/255, blue: 240/255)
    static let textPrimary = Color(red: 86/255, green: 82/255, blue: 95/255)
    static let textMuted = Color(red: 138/255, green: 132/255, blue: 150/255)
    static let accentGreen = Color(red: 156/255, green: 201/255, blue: 107/255)
    static let warning = Color(red: 200/255, green: 93/255, blue: 89/255)
}

struct ContentView: View {
    @State private var selectedTab: MobileTab = .record
    @State private var selectedLine: VisitLine = MockData.visitLines[0]
    @State private var selectedWeek: Int = 3
    @State private var tripPurpose: TripPurpose = .rehab
    @State private var zipCode: String = "10024"
    @State private var currentBullets: [String] = MockData.visitBullets[MockData.visitLines[0].id] ?? []
    @State private var visitStatusMessage: String = "Tap a transcript line to view grounded guidance from the physician's exact advice."
    @State private var savedMoments: Set<String> = []
    @State private var medications: [MedicationItem] = MockData.medications
    @State private var medicationBanner: String = "Medication reminders can be marked taken and saved to the calendar."
    @State private var supportStatus: String = "Support matches are ready for ZIP 10024."

    private var weekPlan: RehabWeekPlan {
        MockData.rehabPlans.first(where: { $0.id == selectedWeek }) ?? MockData.rehabPlans[2]
    }

    private var supportBullets: [String] {
        switch tripPurpose {
        case .rehab:
            return [
                "ZIP 10024 simulation: Weill Cornell Cardiac Rehab is about 2.3 miles away and roughly 13 minutes by car.",
                "Best transport fit: Anita R., a verified rehab graduate, supports rehab rides on Tuesday and Thursday mornings.",
                "Best provider match: West Side Cardiac Rehab Team because it fits the doctor's current HR limit under 120 BPM.",
                "This plan stays aligned with the physician's rehab and monitoring advice."
            ]
        case .cardiology:
            return [
                "ZIP 10024 simulation: Columbia HeartSource is about 2.9 miles away and roughly 16 minutes away.",
                "Best transport fit: Rafael M. supports cardiology follow-up rides on Monday and Wednesday afternoons.",
                "Best provider match: Dr. Leena Shah for rhythm monitoring and medication review.",
                "This plan follows the doctor's two-week follow-up and repeat EKG pathway."
            ]
        case .hospital:
            return [
                "ZIP 10024 simulation: Mount Sinai West is the closest urgent option at about 2.1 miles and 12 minutes away.",
                "Best transport fit: Community Care Van serves hospital trips on weekdays from 7am to 3pm.",
                "Hospital support is for escalation and should not replace calling emergency services for severe symptoms.",
                "This stays inside the physician's stated warning signs and current care path."
            ]
        }
    }

    private var filteredProviders: [ProviderMatch] {
        switch tripPurpose {
        case .rehab:
            return MockData.providerMatches.filter { $0.specialty.localizedCaseInsensitiveContains("rehab") || $0.name.localizedCaseInsensitiveContains("Rehab") }
        case .cardiology:
            return MockData.providerMatches.filter { $0.specialty.localizedCaseInsensitiveContains("Cardiology") }
        case .hospital:
            return []
        }
    }

    private var filteredStops: [CareStop] {
        MockData.careStops.filter { $0.purpose == tripPurpose }
    }

    private var filteredTransport: [TransportOption] {
        MockData.transportOptions.filter { $0.purpose == tripPurpose }
    }

    var body: some View {
        ZStack {
            Palette.appBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                header

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 16) {
                        switch selectedTab {
                        case .record:
                            recordView
                        case .visit:
                            visitView
                        case .medication:
                            medicationView
                        case .rehab:
                            rehabView
                        case .support:
                            supportView
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 16)
                    .padding(.bottom, 110)
                }

                bottomNav
            }
        }
    }

    private var header: some View {
        HStack {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(Palette.lavender.opacity(0.14))
                        .frame(width: 40, height: 40)
                    Image(systemName: "heart.fill")
                        .foregroundStyle(Palette.lavender)
                }

                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 0) {
                        Text("CorVas")
                            .font(.system(size: 28, weight: .semibold))
                            .foregroundStyle(Palette.lavenderDark)
                        Text(" AI")
                            .font(.system(size: 28, weight: .regular))
                            .foregroundStyle(Palette.textMuted)
                    }
                    Text("CARDIAC RECOVERY RECORD")
                        .font(.system(size: 11, weight: .semibold))
                        .tracking(2.8)
                        .foregroundStyle(Palette.textMuted)
                }
            }

            Spacer()

            Button {
                selectedTab = .support
            } label: {
                Image(systemName: "line.3.horizontal")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(Palette.lavender)
                    .frame(width: 44, height: 44)
                    .background(Color.white)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Palette.line, lineWidth: 1)
                    )
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 16)
        .padding(.top, 10)
        .padding(.bottom, 12)
        .background(Color.white)
        .overlay(alignment: .bottom) {
            Rectangle()
                .fill(Palette.line)
                .frame(height: 1)
        }
    }

    private var recordView: some View {
        VStack(spacing: 16) {
            card {
                VStack(spacing: 12) {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Palette.lavender.opacity(0.35), Color.white],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 88, height: 88)
                        .overlay {
                            Text("M")
                                .font(.system(size: 34, weight: .semibold))
                                .foregroundStyle(Palette.lavenderDark)
                        }
                        .overlay(
                            Circle().stroke(Palette.line, lineWidth: 4)
                        )

                    Text("Maria Santos")
                        .font(.system(size: 32, weight: .medium))
                        .foregroundStyle(Palette.textPrimary)

                    Text("Week 3 cardiac recovery")
                        .font(.system(size: 18, weight: .regular))
                        .foregroundStyle(Palette.textMuted)

                    HStack(spacing: 10) {
                        summaryBadge(icon: "pill.fill", title: "MEDICATION", count: "2", subtitle: "Today")
                        summaryBadge(icon: "stethoscope", title: "MEDICAL ISSUES", count: "3", subtitle: "Updated")
                        summaryBadge(icon: "bell.fill", title: "ALERTS", count: "1", subtitle: "Active")
                    }
                }
            }

            card {
                sectionLabel("MY HEALTH RECORD")

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    recordModule(icon: "pill.circle", title: "Medications", subtitle: "Schedules and reminders", destination: .medication)
                    recordModule(icon: "doc.text", title: "Documents", subtitle: "Visit summaries and labs", destination: .visit)
                    recordModule(icon: "cross.case.circle", title: "Medical Conditions", subtitle: "Screening and pre-visit checks", destination: .visit)
                    recordModule(icon: "person.2.circle", title: "Family & Support", subtitle: "Trusted circle and transport", destination: .support)
                }
            }

            card {
                sectionLabel("VITALS")

                VStack(alignment: .leading, spacing: 16) {
                    HStack(spacing: 8) {
                        Label("Heart Rate", systemImage: "heart")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(Palette.accentGreen)
                        Spacer()
                    }

                    VStack(spacing: 6) {
                        Text("74")
                            .font(.system(size: 76, weight: .semibold))
                            .foregroundStyle(Palette.textPrimary)
                        Text("BEATS / MIN.")
                            .font(.system(size: 16, weight: .semibold))
                            .tracking(2.5)
                            .foregroundStyle(Palette.lavenderDark)
                    }
                }
            }
        }
    }

    private var visitView: some View {
        VStack(spacing: 16) {
            purplePanel(title: "LIVE VISIT", subtitle: "Grounded explanations only from the physician's transcript", systemImage: "mic.fill")

            card {
                sectionLabel("TRANSCRIPT")

                VStack(spacing: 10) {
                    ForEach(MockData.visitLines) { line in
                        Button {
                            selectedLine = line
                            currentBullets = MockData.visitBullets[line.id] ?? []
                            visitStatusMessage = "Showing the physician-grounded explanation for this selected moment."
                        } label: {
                            VStack(alignment: .leading, spacing: 8) {
                                Text(line.speaker.uppercased())
                                    .font(.system(size: 13, weight: .semibold))
                                    .tracking(2)
                                    .foregroundStyle(Palette.textMuted)
                                Text(line.text)
                                    .font(.system(size: 20, weight: .regular))
                                    .foregroundStyle(Palette.textPrimary)
                                    .multilineTextAlignment(.leading)
                            }
                            .padding(16)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(selectedLine.id == line.id ? Palette.softBackground : Color.white)
                            .overlay(
                                RoundedRectangle(cornerRadius: 22)
                                    .stroke(selectedLine.id == line.id ? Palette.lavender : Palette.line, lineWidth: 1.2)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 22))
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            card {
                sectionLabel("WHAT DID HE JUST SAY?")

                VStack(spacing: 10) {
                    ForEach(currentBullets, id: \.self) { bullet in
                        HStack(alignment: .top, spacing: 12) {
                            Text("•")
                                .font(.system(size: 24, weight: .medium))
                                .foregroundStyle(Palette.lavender)
                            Text(bullet)
                                .font(.system(size: 20, weight: .regular))
                                .foregroundStyle(Palette.textPrimary)
                                .multilineTextAlignment(.leading)
                            Spacer(minLength: 0)
                        }
                        .padding(16)
                        .background(Color.white)
                        .overlay(
                            RoundedRectangle(cornerRadius: 22)
                                .stroke(Palette.line, lineWidth: 1)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 22))
                    }
                }

                Text(visitStatusMessage)
                    .font(.system(size: 16))
                    .foregroundStyle(Palette.textMuted)
                    .padding(.top, 14)

                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 2), spacing: 10) {
                    Button {
                        currentBullets = MockData.visitBullets[selectedLine.id] ?? []
                        visitStatusMessage = "Explaining simply using only the doctor's exact statement."
                    } label: {
                        actionButtonLabel("Explain simply", filled: true)
                    }
                    .buttonStyle(.plain)

                    Button {
                        currentBullets = (MockData.visitBullets[selectedLine.id] ?? []).map { "\($0) This matters for the current recovery plan and should be reviewed again at follow-up." }
                        visitStatusMessage = "Expanded detail still stays inside the physician's stated plan."
                    } label: {
                        actionButtonLabel("Go deeper")
                    }
                    .buttonStyle(.plain)

                    Button {
                        currentBullets = [
                            "Ask what symptoms should be reported before the next visit.",
                            "Ask whether the rehab pace should change if fatigue worsens.",
                            "Ask what the repeat EKG will confirm in two weeks."
                        ]
                        visitStatusMessage = "Generated next questions from the physician's existing advice only."
                    } label: {
                        actionButtonLabel("Ask next question")
                    }
                    .buttonStyle(.plain)

                    Button {
                        savedMoments.insert(selectedLine.id)
                        visitStatusMessage = "Saved this physician moment for post-visit review."
                    } label: {
                        actionButtonLabel(savedMoments.contains(selectedLine.id) ? "Saved" : "Save")
                    }
                    .buttonStyle(.plain)
                }
                .padding(.top, 14)
            }
        }
    }

    private var medicationView: some View {
        VStack(spacing: 16) {
            purplePanel(title: "MEDICATIONS", subtitle: "Large reminders and simple actions", systemImage: "pill.fill", addButton: true)

            ForEach(medications) { medication in
                card {
                    VStack(alignment: .leading, spacing: 18) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 8) {
                                Text(medication.name)
                                    .font(.system(size: 28, weight: .medium))
                                    .foregroundStyle(Palette.textPrimary)
                                Text(medication.dose)
                                    .font(.system(size: 18))
                                    .foregroundStyle(Palette.textMuted)
                            }
                            Spacer()
                            statusPill(medication.status)
                        }

                        HStack {
                            detailColumn(title: "REMINDER", value: medication.time)
                            Spacer()
                            detailColumn(title: "CURRENTLY TAKING", value: medication.status == "TAKEN" ? "Yes" : "No")
                        }

                        HStack(spacing: 10) {
                            Button {
                                updateMedication(id: medication.id, status: medication.status == "TAKEN" ? "MISSED" : "TAKEN")
                            } label: {
                                actionButtonLabel(medication.status == "TAKEN" ? "Mark missed" : "Mark taken", filled: true)
                            }
                            .buttonStyle(.plain)

                            Button {
                                medicationBanner = "\(medication.name) reminder was added to the calendar."
                            } label: {
                                actionButtonLabel("Add to calendar")
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }

            card {
                VStack(alignment: .leading, spacing: 10) {
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: "exclamationmark.shield.fill")
                            .foregroundStyle(Palette.warning)
                            .font(.system(size: 24))
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Medication status")
                                .font(.system(size: 22, weight: .medium))
                                .foregroundStyle(Palette.warning)
                            Text(medicationBanner)
                                .font(.system(size: 19))
                                .foregroundStyle(Palette.textPrimary)
                        }
                    }
                }
            }
        }
    }

    private var rehabView: some View {
        VStack(spacing: 16) {
            card {
                sectionLabel("12-WEEK REHAB PLAN")
                HStack {
                    Button {
                        selectedWeek = max(1, selectedWeek - 1)
                    } label: {
                        iconButtonLabel("chevron.left")
                    }
                    .buttonStyle(.plain)

                    Spacer()
                    Text("Week \(selectedWeek)")
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundStyle(Palette.textPrimary)
                    Spacer()

                    Button {
                        selectedWeek = min(12, selectedWeek + 1)
                    } label: {
                        iconButtonLabel("chevron.right")
                    }
                    .buttonStyle(.plain)
                }

                VStack(alignment: .leading, spacing: 10) {
                    Text(weekPlan.title)
                        .font(.system(size: 24, weight: .medium))
                        .foregroundStyle(Palette.textPrimary)
                    Text(weekPlan.focus)
                        .font(.system(size: 18))
                        .foregroundStyle(Palette.textMuted)
                }
                .padding(.top, 14)

                VStack(alignment: .leading, spacing: 8) {
                    ForEach(weekPlan.guardrails, id: \.self) { item in
                        HStack(alignment: .top, spacing: 10) {
                            Text("•").foregroundStyle(Palette.lavender)
                            Text(item)
                                .font(.system(size: 17))
                                .foregroundStyle(Palette.textPrimary)
                        }
                    }
                }
                .padding(.top, 8)

                VStack(spacing: 10) {
                    ForEach(weekPlan.sessions) { session in
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("\(session.day) · \(session.title)")
                                    .font(.system(size: 20, weight: .medium))
                                    .foregroundStyle(Palette.textPrimary)
                                Spacer()
                                statusCapsule(session.status)
                            }
                            Text(session.focus)
                                .font(.system(size: 18))
                                .foregroundStyle(Palette.textMuted)
                            Text("\(session.durationMinutes) min • target HR < \(session.targetHR)")
                                .font(.system(size: 16))
                                .foregroundStyle(Palette.lavenderDark)
                        }
                        .padding(16)
                        .background(Color.white)
                        .overlay(
                            RoundedRectangle(cornerRadius: 22)
                                .stroke(Palette.line, lineWidth: 1)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 22))
                    }
                }
                .padding(.top, 14)
            }

            purplePanel(
                title: "CARDIO STRESS FEEDBACK",
                subtitle: "Your heart rate is high for this pace. Slow down and rest for a moment.",
                systemImage: "heart.text.square.fill"
            )

            card {
                sectionLabel("BACKLOG HISTORY")
                VStack(spacing: 10) {
                    ForEach(MockData.rehabHistory) { entry in
                        Button {
                            supportStatus = "\(entry.day) history reviewed: \(entry.steps.formatted()) steps with avg HR \(entry.avgHR)."
                        } label: {
                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    Text(entry.day)
                                        .font(.system(size: 20, weight: .medium))
                                        .foregroundStyle(Palette.textPrimary)
                                    Spacer()
                                    Text(entry.status.uppercased())
                                        .font(.system(size: 13, weight: .semibold))
                                        .tracking(1.5)
                                        .foregroundStyle(Palette.textMuted)
                                }
                                Text("\(entry.steps.formatted()) steps • avg HR \(entry.avgHR)")
                                    .font(.system(size: 18))
                                    .foregroundStyle(Palette.textMuted)
                            }
                            .padding(16)
                            .background(Color.white)
                            .overlay(
                                RoundedRectangle(cornerRadius: 22)
                                    .stroke(Palette.line, lineWidth: 1)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 22))
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private var supportView: some View {
        VStack(spacing: 16) {
            card {
                sectionLabel("MATCHING")
                Text("Patients can be matched to a provider and a trusted transport option based on ZIP 10024 and the physician's current care plan.")
                    .font(.system(size: 19))
                    .foregroundStyle(Palette.textPrimary)

                VStack(alignment: .leading, spacing: 8) {
                    Text("ZIP CODE")
                        .font(.system(size: 13, weight: .semibold))
                        .tracking(2)
                        .foregroundStyle(Palette.textMuted)
                    TextField("ZIP code", text: $zipCode)
                        .font(.system(size: 18))
                        .padding(14)
                        .background(Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Palette.line, lineWidth: 1))
                }
                .padding(.top, 14)

                Picker("Support need", selection: $tripPurpose) {
                    ForEach(TripPurpose.allCases) { purpose in
                        Text(purpose.rawValue).tag(purpose)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.top, 12)

                Button {
                    supportStatus = "Generated a \(tripPurpose.rawValue.lowercased()) support plan for ZIP \(zipCode)."
                } label: {
                    actionButtonLabel("Generate match", filled: true)
                }
                .buttonStyle(.plain)
                .padding(.top, 14)
            }

            card {
                sectionLabel("AI SUPPORT PLAN")
                ForEach(supportBullets, id: \.self) { bullet in
                    HStack(alignment: .top, spacing: 12) {
                        Text("•")
                            .font(.system(size: 24, weight: .medium))
                            .foregroundStyle(Palette.lavender)
                        Text(bullet)
                            .font(.system(size: 19))
                            .foregroundStyle(Palette.textPrimary)
                        Spacer()
                    }
                    .padding(.vertical, 4)
                }

                Text(supportStatus)
                    .font(.system(size: 16))
                    .foregroundStyle(Palette.textMuted)
                    .padding(.top, 12)
            }

            if !filteredProviders.isEmpty {
                card {
                    sectionLabel("PROVIDER MATCHES")
                    VStack(spacing: 10) {
                        ForEach(filteredProviders) { provider in
                            Button {
                                supportStatus = "Matched to \(provider.name) for \(provider.specialty.lowercased())."
                            } label: {
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack {
                                        Text(provider.name)
                                            .font(.system(size: 21, weight: .medium))
                                            .foregroundStyle(Palette.textPrimary)
                                        Spacer()
                                        Text("\(provider.distanceMiles, specifier: "%.1f") mi")
                                            .font(.system(size: 15, weight: .semibold))
                                            .foregroundStyle(Palette.lavenderDark)
                                    }
                                    Text(provider.specialty)
                                        .font(.system(size: 16, weight: .semibold))
                                        .foregroundStyle(Palette.lavender)
                                    Text(provider.matchReason)
                                        .font(.system(size: 18))
                                        .foregroundStyle(Palette.textMuted)
                                    Text("\(provider.etaMinutes) min away • \(provider.address)")
                                        .font(.system(size: 15))
                                        .foregroundStyle(Palette.textMuted)
                                }
                                .padding(16)
                                .background(Color.white)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 22)
                                        .stroke(Palette.line, lineWidth: 1)
                                )
                                .clipShape(RoundedRectangle(cornerRadius: 22))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }

            card {
                sectionLabel("COMMUNITY TRANSPORT")
                VStack(spacing: 10) {
                    ForEach(filteredTransport) { option in
                        Button {
                            supportStatus = "Requested \(option.name) for \(tripPurpose.rawValue.lowercased())."
                        } label: {
                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    Text(option.name)
                                        .font(.system(size: 21, weight: .medium))
                                        .foregroundStyle(Palette.textPrimary)
                                    Spacer()
                                    Text(option.trustLabel)
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundStyle(Palette.lavenderDark)
                                }
                                Text(option.role)
                                    .font(.system(size: 18))
                                    .foregroundStyle(Palette.textMuted)
                                Text("\(option.distanceMiles, specifier: "%.1f") mi • \(option.availability) • \(option.seats) seats")
                                    .font(.system(size: 15))
                                    .foregroundStyle(Palette.textMuted)
                            }
                            .padding(16)
                            .background(Color.white)
                            .overlay(
                                RoundedRectangle(cornerRadius: 22)
                                    .stroke(Palette.line, lineWidth: 1)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 22))
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            card {
                sectionLabel("NEARBY CARE DISCOVERY")
                VStack(spacing: 10) {
                    ForEach(filteredStops) { stop in
                        Button {
                            supportStatus = "Opened nearby care option: \(stop.name)."
                        } label: {
                            VStack(alignment: .leading, spacing: 8) {
                                Text(stop.name)
                                    .font(.system(size: 21, weight: .medium))
                                    .foregroundStyle(Palette.textPrimary)
                                Text(stop.kind)
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundStyle(Palette.lavender)
                                Text("\(stop.distanceMiles, specifier: "%.1f") miles • \(stop.etaMinutes) min away")
                                    .font(.system(size: 16))
                                    .foregroundStyle(Palette.textMuted)
                                Text(stop.address)
                                    .font(.system(size: 15))
                                    .foregroundStyle(Palette.textMuted)
                            }
                            .padding(16)
                            .background(Color.white)
                            .overlay(
                                RoundedRectangle(cornerRadius: 22)
                                    .stroke(Palette.line, lineWidth: 1)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 22))
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private var bottomNav: some View {
        HStack(spacing: 6) {
            ForEach(MobileTab.allCases) { tab in
                Button {
                    selectedTab = tab
                } label: {
                    VStack(spacing: 6) {
                        Image(systemName: iconName(for: tab))
                            .font(.system(size: 20, weight: .medium))
                        Text(tab.rawValue)
                            .font(.system(size: 11, weight: .medium))
                    }
                    .foregroundStyle(selectedTab == tab ? Palette.lavender : Palette.textMuted)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(selectedTab == tab ? Palette.softBackground : Color.clear)
                    .clipShape(RoundedRectangle(cornerRadius: 18))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 10)
        .padding(.top, 8)
        .padding(.bottom, 12)
        .background(Color.white)
        .overlay(alignment: .top) {
            Rectangle()
                .fill(Palette.line)
                .frame(height: 1)
        }
    }

    private func updateMedication(id: String, status: String) {
        medications = medications.map { item in
            guard item.id == id else { return item }
            return MedicationItem(id: item.id, name: item.name, dose: item.dose, time: item.time, status: status)
        }
        if let medication = medications.first(where: { $0.id == id }) {
            medicationBanner = status == "TAKEN"
                ? "\(medication.name) has been marked taken."
                : "\(medication.name) has been marked missed. Family follow-up may be needed if this repeats."
        }
    }

    private func iconName(for tab: MobileTab) -> String {
        switch tab {
        case .record: return "heart.text.square"
        case .visit: return "waveform.badge.magnifyingglass"
        case .medication: return "pill"
        case .rehab: return "figure.walk"
        case .support: return "person.2"
        }
    }

    private func card<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 0, content: content)
            .padding(16)
            .background(Palette.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 28))
            .overlay(
                RoundedRectangle(cornerRadius: 28)
                    .stroke(Palette.line, lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.04), radius: 12, x: 0, y: 6)
    }

    private func sectionLabel(_ title: String) -> some View {
        Text(title)
            .font(.system(size: 13, weight: .semibold))
            .tracking(3.0)
            .foregroundStyle(Palette.lavender)
            .padding(.bottom, 12)
    }

    private func purplePanel(title: String, subtitle: String, systemImage: String, addButton: Bool = false) -> some View {
        HStack(alignment: .top, spacing: 14) {
            ZStack {
                Circle()
                    .fill(Color.white.opacity(0.12))
                    .frame(width: 54, height: 54)
                Image(systemName: systemImage)
                    .font(.system(size: 24, weight: .medium))
                    .foregroundStyle(.white)
            }

            VStack(alignment: .leading, spacing: 8) {
                Text(title)
                    .font(.system(size: 15, weight: .semibold))
                    .tracking(2.8)
                    .foregroundStyle(Color.white.opacity(0.92))
                Text(subtitle)
                    .font(.system(size: 20))
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.leading)
            }

            Spacer()

            if addButton {
                Text("ACTIVE")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Palette.lavender)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 12)
                    .background(Color.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Palette.lavender)
        .clipShape(RoundedRectangle(cornerRadius: 28))
        .shadow(color: Palette.lavender.opacity(0.2), radius: 16, x: 0, y: 10)
    }

    private func actionButtonLabel(_ title: String, filled: Bool = false) -> some View {
        Text(title)
            .font(.system(size: 18, weight: .medium))
            .foregroundStyle(filled ? Color.white : Palette.lavenderDark)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(filled ? Palette.lavender : Palette.softBackground)
            .overlay(
                RoundedRectangle(cornerRadius: 18)
                    .stroke(filled ? Palette.lavender : Palette.line, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 18))
    }

    private func iconButtonLabel(_ symbol: String) -> some View {
        Image(systemName: symbol)
            .foregroundStyle(Palette.lavenderDark)
            .frame(width: 38, height: 38)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Palette.line, lineWidth: 1))
    }

    private func detailColumn(title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 13, weight: .semibold))
                .tracking(2)
                .foregroundStyle(Palette.textMuted)
            Text(value)
                .font(.system(size: 20))
                .foregroundStyle(Palette.textPrimary)
        }
    }

    private func summaryBadge(icon: String, title: String, count: String, subtitle: String) -> some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .stroke(Palette.lavender, lineWidth: 2)
                    .frame(width: 50, height: 50)
                Image(systemName: icon)
                    .foregroundStyle(Palette.lavender)
                    .font(.system(size: 22))
            }
            Text(title)
                .font(.system(size: 11, weight: .semibold))
                .tracking(1.8)
                .foregroundStyle(Palette.lavender)
                .multilineTextAlignment(.center)
            Text(count)
                .font(.system(size: 22, weight: .semibold))
                .foregroundStyle(Palette.textPrimary)
            Text(subtitle)
                .font(.system(size: 14))
                .foregroundStyle(Palette.textMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
    }

    private func recordModule(icon: String, title: String, subtitle: String, destination: MobileTab) -> some View {
        Button {
            selectedTab = destination
        } label: {
            VStack(alignment: .leading, spacing: 10) {
                ZStack {
                    Circle()
                        .fill(Color.white)
                        .frame(width: 52, height: 52)
                    Circle()
                        .stroke(Palette.line, lineWidth: 1)
                        .frame(width: 52, height: 52)
                    Image(systemName: icon)
                        .font(.system(size: 24))
                        .foregroundStyle(Palette.lavender)
                }

                Text("HEALTH RECORD")
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(Palette.lavender)

                Text(title)
                    .font(.system(size: 25, weight: .medium))
                    .foregroundStyle(Palette.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)

                Text(subtitle)
                    .font(.system(size: 18))
                    .foregroundStyle(Palette.textMuted)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .frame(maxWidth: .infinity, minHeight: 210, alignment: .topLeading)
            .padding(18)
            .background(Palette.softBackground)
            .clipShape(RoundedRectangle(cornerRadius: 24))
            .overlay(
                RoundedRectangle(cornerRadius: 24)
                    .stroke(Palette.line, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    private func statusPill(_ status: String) -> some View {
        Text(status)
            .font(.system(size: 14, weight: .semibold))
            .foregroundStyle(status == "TAKEN" ? Color(red: 44/255, green: 159/255, blue: 110/255) : Palette.warning)
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(status == "TAKEN" ? Color(red: 231/255, green: 245/255, blue: 238/255) : Color(red: 253/255, green: 236/255, blue: 235/255))
            .clipShape(Capsule())
    }

    private func statusCapsule(_ status: String) -> some View {
        Text(status.uppercased())
            .font(.system(size: 12, weight: .semibold))
            .foregroundStyle(status == "completed" ? Palette.accentGreen : status == "today" ? Palette.lavenderDark : Palette.textMuted)
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            .background(status == "completed" ? Palette.accentGreen.opacity(0.15) : status == "today" ? Palette.lavender.opacity(0.12) : Palette.softBackground)
            .clipShape(Capsule())
    }
}
