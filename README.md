# CorVas

CorVas is a senior-friendly cardiac recovery companion designed for people recovering after a heart event. It turns medications, rehab, visit explanations, symptom check-ins, and support coordination into one calm, mobile-first experience.

## Live App

- Live site: https://corvas.netlify.app

## What CorVas Does

- explains doctor language in plain English
- helps patients ask better questions before and after visits
- supports medication logging and adherence
- tracks a simple 12-week recovery plan
- captures symptom check-ins and risk signals
- helps patients contact family, care team, and community support
- coordinates logistics like rides, video follow-up, and nearby support
- escalates concerns with calm, action-oriented guidance

## Product Direction

This repository started as a hackathon project and has been pushed into a more production-leaning PWA experience for older adults.

The current app is:

- PWA-first
- mobile-first
- senior-friendly
- voice-forward
- persistent across sessions
- designed to feel reassuring instead of clinical or dashboard-heavy

## Key Flows

### Today

The daily home surface focuses on:

- the next best task
- medication status
- rehab progress
- symptom check-in
- pre-visit preparation when a visit is approaching
- urgent help when risk rises

### Ask CorVas

Patients can:

- ask general recovery questions
- review visit moments
- simplify clinical language
- review documents and follow-up questions
- use a controlled ask flow that stays easy to demo and easy to understand

### Recovery Plan

- week-by-week rehab structure
- milestone tracking
- setback logging
- encouraging progress language

### Medication Support

- mark doses as taken, skipped, or snoozed
- review adherence
- get gentle follow-up when recovery drifts

### Support

- text, call, or video follow-up with care contacts
- request transport and provider help
- connect with community support
- track support requests through pending and connected states
- use urgent escalation actions when needed

## Urgent Escalation

CorVas now automates urgent escalation inside the app flow.

That means it can:

- detect urgent symptom patterns
- create urgent alerts automatically
- show `Call 911 now` only for urgent states
- notify a saved caregiver if the patient opted in
- notify the care team with an urgent summary if the patient opted in
- include saved location context if the patient chose to share it

What it does not do:

- place a real 911 call automatically
- silently contact EMS in the background

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- Netlify deployment
- SwiftUI companion app in `VisitFlowiOS/`

## Repository Structure

```text
visitflow/          Main web app
```

## Local Development

### Web app

```bash
cd visitflow
npm install
npm run dev
```

Open `http://localhost:3000/app`.

### Production build

```bash
cd visitflow
npm run build
npm run start
```

## Environment

Copy the example env file:

```bash
cp .env.example .env
```

Then add any provider keys you want to use locally. Do not commit secrets.

## Current Status

What is real today:

- persistent local product state
- PWA installability
- onboarding and settings
- medication, recovery, symptom, support, and escalation flows
- support request states that move from pending to connected

What is still mocked or controlled:

- some AI reply behavior
- document extraction beyond basic text handling
- external messaging and care-system integrations
- real clinical backend and EHR connections

## Why This Repo Exists

Cardiac recovery often fails not because patients do not care, but because recovery is confusing, lonely, and hard to coordinate day to day.

CorVas is meant to reduce that burden by making the next step clear, translating medical language, and helping patients get support before recovery goes off track.
