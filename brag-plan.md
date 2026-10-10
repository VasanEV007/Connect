# brag-plan.md

## Project
CampusConnect — A dark-themed React+TypeScript+Tailwind v4 campus collaboration platform for Amrita Vishwa Vidyapeetham.

## One sentence
CampusConnect is the all-in-one campus app that discovers events, prevents schedule clashes, coordinates carpools, and generates verified On-Duty certificates — all with a sleek dark UI and Amrita-grade access control.

## Who it's for & what it does for them
**For students:** Find opportunities without schedule conflicts, get rideshare matches, and collect official OD certificates instantly.  
**For faculty:** Review applications, manage attendance, and dispatch certificates with one click.  
**Result:** No more missed events, no schedule overlaps, and paperwork done in seconds.

## What sets it apart
- Dark Haveloc-inspired aesthetic with green accent (`#22c55e`) that feels distinct from typical landing-page SaaS
- Client-side only — zero backend, zero SSO, works entirely offline with localStorage persistence
- Role-based persona switching lets students and faculty see the app in each other's shoes without authentication
- Clash detector that’s smart enough to avoid false positives across exam periods, labs, and recurring sessions

## Most impressive claim
> "Switch between student and faculty views instantly — no SSO required."

## Visual hook
The sticky navbar with capsule-pills navigation, immediately transitioning into the EventFeed’s dual search (category dropdown + text input) with live filter pills, then a badge flashing "Open For Joining" over a capacity bar that fills as users join — all on the black `#000000` background with the signature green glow.

## Tone
`default` — punchy, playful, clean. 4–5 scenes; soft transitions. Fits the project’s dark elegance without trying too hard.

## One-line share caption
> CampusConnect: Discover events, dodge cliques, and get your OD certificate — all in one app.

---

## Scene-by-scene storyboard (total ~20s)

| Scene | Duration | Visual | Audio |
|-------|----------|--------|-------|
| **1 — Hook** | 3s | Navbar slides in from top — institutional top rail ("Amrita Vishwa Vidyapeetham • Ettimadai Campus, Coimbatore"), capsule-pills tabs animate active state. Green accent `#22c55e` glows on interaction. | Synth bass hit on frame 1, subtle riser through 3s |
| **2 — Reveal** | 3s | Tab swipe: EventFeed activates. Dual search bar appears — category dropdown opens, typed text " hackathon " triggers green search button glow. Results grid shifts from table to cards view via smooth toggle. | Soft chime on search, gentle page-turn transition on view-mode toggle |
| **3 — Highlight 1** | 4s | Quick cut to a card with "Open For Joining" badge pulsing green. User clicks "Join" → confetti explosion (campus-appropriate, subtle gold/green sparks). Capacity bar animates from 20% → 70% in real time. | Bright pluck + quick confetti "whoosh" |
| **4 — Highlight 2** | 4s | Switch to CalendarModule view — two timetable blocks hover, clash detector triggers: blocks turn red, a toast appears "Schedule clash detected — 2 courses overlap." User clicks "Resolve" → clash auto-resolved, blocks turn green. | Low rumble → resolving "clunk" |
| **5 — Highlight 3** | 4s | ODSlipModal slides open from right — verified certificate shows student name, dept, event, cryptographic hash `OD-AMR-2026-CB-VERIFIED`. Print button fades in. `@media print` styles switch on — all non-print elements fade off, white-on-black slip ready. | Soft pad swell, subtle typewriter click on hash appearing |
| **6 — Punchline/Outro** | 2s | Navbar returns, green pill "Faculty" selected → persona switches. Quick montage: carpool fare split, group chat modal opens, roll-number parser deconstructs `CB.EN.U4ARE24001` into labeled fields. Final frame freezes on the navbar with tagline: "Your campus. Your rules." | Final synth chord, tail rings out under |

**Total:** 22s

## Creative notes
- **Reuse real UI:** Every component — Navbar, Badge, Button, EventFeed cards, CalendarModule clash visuals, ODSlipModal — is rendered from the actual project code via the Vite dev server. No flat screenshots.
- **Color fidelity:** `--color-primary: #22c55e` is the anchor; all other tokens (`--color-surface`, `--color-text-main`, etc.) derive from the `index.css` tokens.
- **Typography:** `--font-sans: 'Inter'` for body, `--font-heading: 'Outfit'` for scene titles (if any), `--font-mono: 'JetBrains Mono'` for roll-number parser output.
- **Stagger over crossfade:** Scene 3 → 4 uses a dip-to-black through the surface-bg `#0a0d14` rather than a crossfade, avoiding muddy double-exposure.
- **Readable text:** Any on-screen copy (badges, toast messages, hash values) stays fully visible for at least 0.3s per word from when the whole line lands on screen.
- **Every frame postable:** Frozen frames feature the green accent, dark background, and clear copy — no muffled or transitional text.

## Sound design strategy
One blended track, not "effects on top of music":
- **Base:** 120 BPM minor-key synth loop in A minor, warm sub-bass, 8-bar loop
- **Effects blended in same key:** 
  - Scene 1: short synth "hit" on the downbeat
  - Scene 2: riser that becomes the loop's tail
  - Scene 3: bright pluck on the "join" action, confetti whoosh pitched to the loop's key
  - Scene 4: low rumble + resolving "clunk" when clash resolves
  - Scene 5: gentle pad swell on modal open, typewriter click filtered to sit 12dB below the loop
- **Mix:** All elements side-chained subtly to the loop's kick frequency so nothing spikes; repeated little sounds (button clicks, toggles) stay in the background loop, never dominate.

## Output files
- `brag-output-YYYY-MM-DD-HHmmss/brag.mp4` — 1920×1080, 30fps, ~22s
- `brag-output-YYYY-MM-DD-HHmmss/brag.jpg` — poster frame (frame 0 of video)
- `brag-output-YYYY-MM-DD-HHmmss/share-copy.txt` — one-line caption
- `brag-output-YYYY-MM-DD-HHmmss/work/` — all intermediate frames, scripts, stems, downloads