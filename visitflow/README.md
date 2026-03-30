# CorVas PWA

This `visitflow/` app is now a production-leaning Progressive Web App for older adults recovering after a cardiac event.

## What It Includes

- senior-friendly mobile-first UI
- calm onboarding with large-text and spoken-reply preferences
- installable PWA shell with manifest, service worker, and offline fallback
- voice-first Ask CorVas flow with text fallback and intent routing
- persistent medication logging with taken, skipped, and snooze states
- 12-week recovery plan with milestones and setback logging
- symptom check-ins with gentle, support, and urgent escalation tiers
- care-circle messaging and quick support actions
- visit explanation and document simplification flows

## Local Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, then use `/app` for the app shell.

## Verification

```bash
npm run lint
npm run build
```

## Demo Notes

- onboarding is shown on first launch and persists locally
- product state is saved in local storage
- document upload works for pasted text and text files
- PDF extraction is still a future integration point

