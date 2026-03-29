# Cardiac Rehab Hackathon - Demo-Ready Idea Batch 2

This batch is shaped around the actual hackathon prompt, the rehab reference repo, and the voice transcripts:

- The product must be a deployed working demo
- It must show a believable AI interaction with Maria
- It needs a strong Week 8 engagement hook
- It should include a clear clinician escalation path
- It should solve emotional and logistical barriers, not just add more tracking

These ideas are intentionally more hackathon-ready than generic healthcare AI concepts.

---

## 1. CardioCompanion

### One-line pitch

An adaptive AI rehab companion that turns Maria's prescribed 12-week program into a daily conversation, confidence coach, and safety-aware progress guide.

### Why it fits the prompt

- Directly solves the "Voice of Care" requirement
- Easy to demo with the "win" and "wall" moments
- Can include a strong hook through streaks, reassurance, and personalized encouragement
- Fits the "AI supports the plan, not writes the plan" safety constraint

### Core idea

Maria does not need another dashboard. She needs a guide that feels like a calm cardiac rehab coach in her pocket.

The app uses a scripted care plan from the clinician and wraps it in:

- Daily check-ins
- Anxiety-aware coaching
- Missed-session recovery nudges
- Simple safety triage

### System design

#### Inputs

- Prescribed walk/exercise goals
- Daily symptom check-in
- Steps or Apple Health data
- Mood/confidence self-rating

#### AI layer

- Classifies patient state:
  - ready
  - hesitant
  - anxious
  - red-flag
- Chooses the right response style:
  - celebrate
  - reassure
  - simplify
  - escalate

#### Hook

- "Confidence streak" instead of just step streaks
- Maria earns momentum by completing tiny rehab actions:
  - walk
  - medication check
  - breathing exercise
  - reading one education card

#### Safety path

- If Maria reports chest pain, severe shortness of breath, dizziness, or palpitations:
  - stop activity
  - show emergency guidance
  - send alert summary to clinician dashboard

### Demo flow

1. Maria completes a walk and gets a supportive AI response
2. Maria skips a session because she feels anxious
3. AI reframes the setback, proposes a smaller next step, and keeps her engaged
4. A red-flag symptom triggers clinician escalation

### Why this could win

It is the cleanest match to the prompt and easiest to make feel emotionally real in a 3-minute demo.

---

## 2. Rehab Relay

### One-line pitch

A social accountability rehab system that connects Maria with a trusted support circle so recovery stops feeling lonely.

### Why it fits the prompt

- Delivers a strong engagement hook beyond generic gamification
- Solves the emotional isolation described in the repo and transcripts
- Gives judges a memorable feature they can immediately understand

### Core idea

Maria often avoids rehab because she is anxious and does not want to burden family. Rehab Relay gives her a lightweight support network:

- daughter
- friend
- nurse coach

Each person gets role-based prompts, not full medical control.

### System design

#### Patient side

- Daily rehab goal
- "I need encouragement" button
- Voice or text check-in

#### Support circle side

- AI-generated nudges for family:
  - "Maria finished her walk today. Send a quick celebration."
  - "Maria missed two sessions. Encourage her to do a 5-minute restart."

#### AI layer

- Summarizes Maria's status into low-burden updates
- Suggests the best outreach type:
  - encouragement
  - reminder
  - escalation

#### Hook

- Team progress meter
- Shared milestones
- "Don't break the circle" accountability mechanic

#### Safety path

- Concerning symptoms bypass family motivation flow and go directly to clinician escalation

### Demo flow

1. Maria finishes a rehab task
2. Her daughter gets a positive prompt to celebrate her
3. Maria misses two days and AI routes a gentle support check-in
4. A symptom escalation goes to the care team

### Why this could win

It turns rehab from a solo compliance task into a supported recovery relationship, which maps strongly to the "human connection is broken" prompt.

---

## 3. RouteLess Rehab

### One-line pitch

A logistics-aware rehab planner that redesigns Maria's week around her real life, making recovery feasible instead of idealized.

### Why it fits the prompt

- Targets the commute, time, and work barriers highlighted in the repo
- More differentiated than a generic chatbot
- Easy to position as "behavior change through friction removal"

### Core idea

Patients often drop out before motivation even matters because rehab does not fit their schedule. RouteLess Rehab creates a hybrid recovery plan that blends:

- home-based prescribed activities
- outpatient rehab appointments
- commute-aware scheduling
- confidence-building mini sessions on busy days

### System design

#### Inputs

- Work hours
- Distance to clinic
- Preferred walking windows
- Childcare/caregiving constraints
- Clinician-prescribed weekly targets

#### Optimization layer

- Finds low-friction rehab windows
- Recommends when to do:
  - supervised sessions
  - at-home walks
  - education moments
  - stress resets

#### AI layer

- Explains the plan in simple language
- Converts missed sessions into recovery plans, not failure messages

#### Hook

- "Recovery fit score" showing how well this week's plan matches real life
- Patients co-design the plan instead of receiving a rigid schedule

#### Safety path

- If symptoms worsen during home activity, AI pauses the plan and routes to clinician review

### Demo flow

1. Maria enters schedule and travel friction
2. App builds a realistic week plan
3. Maria misses one block and receives an alternative same-day mini plan
4. Clinician dashboard shows adherence and risk flags

### Why this could win

It addresses a core dropout reason with visible system design and practical utility, while still allowing a good AI demo.

---

## 4. Rehab Quest

### One-line pitch

A narrative rehab game that reframes cardiac recovery as a journey of rebuilding strength, confidence, and independence week by week.

### Why it fits the prompt

- Delivers the clearest "hook" requirement
- Memorable for judges
- Easier to build than a complex clinical intelligence system

### Core idea

Instead of a plain checklist, Maria progresses through a recovery story with small missions that map to real rehab behaviors.

Examples:

- Complete a walk to unlock the next chapter
- Finish a stress management exercise to restore "confidence"
- Watch a 30-second education card to unlock a support message

### System design

#### Experience layer

- Weekly chapters
- Micro-missions
- Visual progress map

#### AI layer

- Generates encouraging narration
- Adapts mission framing when Maria is discouraged
- Turns failures into "recovery reroutes" instead of penalties

#### Hook

- Story progression
- Unlockables
- Confidence meter
- Week 8 milestone celebration

#### Safety path

- Safety card always overrides the game if symptoms indicate danger

### Demo flow

1. Maria completes a mission after her walk
2. AI celebrates the win and advances her story
3. Maria hits an anxious day and the app converts the mission into a smaller step
4. Red-flag symptom exits the game flow and escalates to care team

### Why this could win

It gives the judges a concrete, emotionally resonant retention mechanic instead of vague "engagement."

---

## 5. CardioSignal Light

### One-line pitch

A low-friction daily recovery check that turns simple signals into a traffic-light recommendation for Maria and a red-flag dashboard for clinicians.

### Why it fits the prompt

- Strong blueprint potential
- Fast to prototype
- Clear clinician handoff story

### Core idea

Every morning, Maria completes a 30-second check-in:

- symptoms
- energy
- confidence
- steps from yesterday

The system classifies her day:

- Green: proceed with prescribed plan
- Yellow: modify and encourage
- Red: stop and escalate

### System design

#### Inputs

- Symptom form
- Wearable or phone activity data
- Anxiety rating
- Missed-session history

#### Decision layer

- Rule-based safety engine for non-negotiable symptoms
- AI-generated explanation in plain language

#### Hook

- Daily clarity reduces fear
- Maria feels guided, not abandoned

#### Safety path

- Red state generates an escalation summary for the care team

### Demo flow

1. Morning check-in
2. App returns green/yellow/red guidance
3. AI explains why
4. Dashboard shows what the clinician would see

### Why this could win

It is simple, believable, and clinically safer than overpromising deep diagnosis.

---

## 6. HabitBridge

### One-line pitch

A habit-stacking rehab platform that embeds recovery into the routines Maria already keeps instead of asking her to build a whole new life from scratch.

### Why it fits the prompt

- Targets the loss of motivation after the initial scare fades
- Gives a strong Week 8 retention mechanism
- Works well for older, non-technical patients

### Core idea

Instead of saying "do rehab," the app attaches small prescribed actions to existing anchors:

- after morning coffee
- after lunch
- after evening phone call with daughter

This lowers cognitive load and makes recovery automatic.

### System design

#### Behavior layer

- Detect existing routines
- Suggest tiny rehab pairings
- Track completion consistency

#### AI layer

- Generates personalized reframes:
  - "After coffee, take your 5-minute confidence walk"
  - "After your daughter's call, do tonight's breathing reset"

#### Hook

- "Recovery rhythm" score
- Visual habit chain
- Smart restart after missed days

#### Safety path

- Symptom reporting and hard-stop escalation remain separate from habit coaching

### Demo flow

1. Maria chooses daily routines
2. AI attaches rehab actions to those routines
3. Missed behavior triggers a low-pressure restart suggestion
4. Symptom concern triggers clinician escalation

### Why this could win

It is behaviorally smart, simple to explain, and grounded in why people actually fall off by Week 8.

---

## Best Bets

If you want the strongest mix of demo clarity and judging alignment, these are the best candidates:

1. CardioCompanion
2. Rehab Relay
3. RouteLess Rehab

If you want the most memorable hook for judges:

1. Rehab Quest
2. Rehab Relay
3. HabitBridge

If you want the safest and fastest to prototype:

1. CardioSignal Light
2. CardioCompanion
3. RouteLess Rehab

---

## Recommended Direction

The strongest overall concept is probably:

## CardioCompanion + Rehab Relay

That combo gives you:

- a believable AI conversation
- a strong emotional hook
- family/social support
- a clear clinician escalation path
- enough system design for a compelling architecture diagram

### Pitch line

"We built an AI cardiac rehab companion that supports Maria day to day, keeps her connected to a trusted support circle, and escalates to clinicians when recovery becomes unsafe."
