# Website Design Prompt

**Role:** Act as a World-Class Senior Creative Technologist and Lead Frontend Engineer. 
**Objective:** Architect a high-fidelity, cinematic "1:1 Pixel Perfect" interactive editorial website for the "Stamped with Identity" research project.
**Aesthetic Identity:** "Modern Data Journalism" / "Premium Exhibition." The site should feel like a bridge between an interactive Bloomberg/NYT feature and a sleek, functional German industrial catalog.

## 1. CORE DESIGN SYSTEM (STRICT)

**Palette (German/American Contrast):** 
- **Industrial Silver/Grey (German Base):** `#D3D6DA`
- **Patriot Red (American Accent):** `#B31942`
- **Deep Navy (Contrast/Text):** `#0A3161`
- **Paper/Canvas (Background):** `#F7F7F7`

**Typography (Thematic Contrast):** 
- **Headings (German/Functional):** "Inter", "Roboto", or "Helvetica Neue" (Strict, geometric, tracking tight). 
- **Drama/Emphasis (American / Emotional):** "Playfair Display" or "Georgia" (Used for narrative, storytelling, and heritage). 
- **Data:** A clean Monospace font (e.g., "JetBrains Mono") for statistics and market share figures.

**Visual Texture:** 
Implement a global CSS Noise overlay (SVG turbulence at 0.03 opacity) to give an editorial, print-like feel. Use sharp borders and structural grids (`rounded-none` or subtle `rounded-sm`) to reflect engineering precision, contrasting with softer imagery for the emotional narratives.

## 2. COMPONENT ARCHITECTURE & BEHAVIOR

### A. NAVBAR (The Navigator)
A fixed, clean top-bar blurring the content behind it.
**Morphing Logic:** Transparent at the hero top. Transitions into a white/80 glassmorphic blur with Deep Navy text and a structural bottom border (1px solid Silver) upon scrolling. Includes links: The Tension, Market Data, Voices of Berlin, Future Outlook.

### B. HERO SECTION (The Transatlantic Divide)
**Visuals:** `100dvh` height. A dynamic split-screen or side-by-side typographic layout. 
**Layout:** Left side features "Made in Germany" in strict Sans-serif on Silver; Right side "Made in America" in elegant Serif on subtle Navy/Red.
**Typography:** Massive contrast. "Stamped with" (Functional) vs "Identity." (Narrative).
**Animation:** GSAP split-text reveal, with the two sides sliding together to form a unified center line as the user scrolls down.

### C. THE TENSION (Functional vs. Emotional Trust)
*Replace standard cards with contrasting interactive panels.*

- **Panel 1 (German Precision):** Hovering over this section reveals mechanical layouts, engineering schematics, and words like "Reliability" and "Excellence" typing out like a precise machine.
- **Panel 2 (American Emotion):** Hovering shifts the aesthetic to warmer tones, sweeping Americana imagery, and words like "Values" and "Nostalgia" fading in softly.
- **Interaction:** Scroll-triggered wipe effects that physically switch the aesthetic paradigm based on scroll position.

### D. MARKET DATA (The Chinese EV Disruption)
An interactive chart/data visualization section.
**Layout:** A dark-mode stark contrast section to emphasize the sudden impact of BYD and the EV market shift.
**Artifacts:** Implement "Market Shifters." Interactive bar-charts or timeline elements that grow dynamically as the user scrolls. As BYD overtakes VW/Tesla in the visualization, the UI briefly "glitches" or flashes red to emphasize the disruption affecting both traditional powerhouses.

### E. VOICES OF BERLIN (Primary Research Archive)
Horizontal scroll section (GSAP `xPercent`) featuring two main interview profiles.
- **Stacking Interaction:** Uses GSAP ScrollTrigger to pin the section and horizontally slide through the interviews (Brand Professional vs. Cross-Cultural Consumer).
- **Artifacts:** Large blockquotes in serif. When hovering over a quote, an audio-waveform animation plays or a background image of Berlin retail/street-level branding scales up (`scale-105`) with a slow pan.

### F. CONCLUSION & FOOTER (The Future of Labels)
- **Call to Thought:** Large typography stating: "When the product no longer leads, does the label survive?"
- **Footer:** Deep Navy background. Include an "About the Research / Methodology" modal trigger, an academic-style bibliography/reference link list, and a precise "Status: Globalized" pulsing indicator.

## 3. TECHNICAL REQUIREMENTS

- **Tech Stack:** React 19, Tailwind CSS, GSAP 3 (with ScrollTrigger), Lucide React.
- **Animation Lifecycle:** Use `gsap.context()` within `useEffect` for all animations to ensure clean mounting/unmounting.
- **Micro-Interactions:** Buttons must have a "magnetic" feel (subtle scale-up on hover) and utilize `overflow-hidden` with a sliding background layer for color transitions.
- **Code Quality:** No placeholders. Use real image URLs from Unsplash (e.g., Berlin streets, car manufacturing, Americana). Ensure the data visualization section feels like a high-end interactive research tool, not just static diagrams.

> **Execution Directive:** "Do not build a website; build an interactive thesis. Every scroll should feel like turning the page of a high-end editorial feature, every animation should support the argument of disruption. Eradicate all generic AI patterns."
