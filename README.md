# Unimath

A personal math-training web app to prepare for the UFRGS entrance exam (CC/EC).
Inspired by the Soromath method: **active practice, immediate feedback, short daily
sessions, visible progress**. It generates fresh questions on the fly, corrects you
instantly, tracks your progress locally, and only unlocks the next topic once you've
"fixed" the current one.

Built with **React + Vite**, plain CSS Modules, and `localStorage` — no backend, works
offline once loaded. The UI ships in **Portuguese or English** (switchable in Ajustes)
with **nine colour themes**; the code and comments are in English.

## Running it

```bash
npm install     # once
npm run dev     # start the dev server (http://localhost:5173)
npm run build   # production build into dist/
npm run check   # run the pure-logic self-check (no browser needed)
```


## How the app is organised

The golden rule to understand any React app: **the UI is a function of state**. Change
the state → React re-renders the screen. Everything below is either *state*, *logic that
produces new state*, or *components that draw the current state*.

```
index.html            The single HTML page. React mounts into <div id="root">.
src/
  main.jsx            Entry point: mounts <App> wrapped in <StoreProvider>.
  App.jsx             Which screen is showing. "Routing" is just a piece of state.
  index.css           Theme tokens (CSS variables), dark mode, reset, base styles.

  data/
    topics.js         The learning track: topics, their levels, prerequisite order and
                      section group. Plain data — adding a topic starts here.
    exams.js          The ENEM/UFRGS question bank for the Provas mode. Also plain
                      data — how to catalogue a paper is in EXAMS.md.

  lib/                Pure logic. No React, no browser. Testable on its own.
    math.js           randInt, gcd, fraction reduction, number formatting.
    generators.js     Builds a random question (prompt, answer, steps, tips).
    strategies.js     The "Dica": mental-math shortcuts chosen from the numbers.
    checkAnswer.js    Decides if what you typed is right; formats the correct answer.
    mastery.js        The progression rules ("só avança quando fixou") + exam rule.
    ranks.js          The rank ladder: 20 steps, Iniciante I → Sábio VI, and the
                      rank-match rule + which questions a match draws.
    papers.js         Filtering, drawing and localizing questions from exams.js.
    i18n.js           UI text in PT/EN; makeT(lang) + localizeTopic(topic, lang).
    selfcheck.mjs     ~117k assertions over the above. Run with `npm run check`.

  store/              The app's memory.
    useLocalStorage.js  useState that also saves to localStorage (survives reloads).
    useScrollMemory.js  Remembers each screen's scroll offset and restores it.
    StoreProvider.jsx   The single source of truth: all saved data + the actions that
                        change it, shared to every screen via React Context.

  components/         Small reusable UI pieces (Button, ProgressBar, TopicCard,
                      RankBadge, SessionSizePicker, PageHeader, ...).
  screens/            One file per screen: Home, Session, Summary, Progress, Settings,
                      plus Onboarding (the first-run tour), Help ("Como funciona"),
                      More (the hub for the side features), Rank, Papers and PaperRun.
```

## The three ideas that make it tick

**1. Questions are generated, not stored.** `lib/generators.js` has one function per
topic. Each returns `{ prompt, answer, kind, steps, tips }` built from random numbers, so
you get infinite practice and can never memorise an answer key. `difficulty level` picks the
sub-level (e.g. Division: exact → with remainder → long → decimals). The **step-by-step
solution** (`steps`) is built from those same numbers, so the explanation always matches
the exact question. Each question also gets a **"Dica"** (`tips`) — a mental-math shortcut
chosen from its specific numbers (÷5 → the ×2÷10 trick, 15% → the 10%+5% block method, a
fraction with a common factor → cross-cancel); these live in `lib/strategies.js`. Steps
show when "Explicações passo a passo" is on and the Dica when "Dica (estratégia)" is on —
two independent toggles in Ajustes.

**2. All saved data lives in one place.** `StoreProvider` holds `settings`, `progress`
(per topic), `sessions`, `exams`, `papers` (ENEM/UFRGS rounds), `rank` and `pending`
(the one paused session). Screens read it with the `useStore()` hook and
change it only through actions like `commitSession()` — so the "how do I save this?"
question always has one answer. Each slice is persisted with `useLocalStorage`.

**3. Progression is a pure rule.** After a session, `mastery.js` folds each answer into
the topic's rolling window of the last 10 answers. Hit 80% and the level is "fixed" →
you move up; fix the last level → the topic is mastered → the next topic unlocks. The
"prova da sexta" applies the 8+/10 up, 5–7 stay, <5 down rule to the same level counter.

## React concepts, and where to see each one

- **Components & props** — everywhere; start with `components/Button.jsx`.
- **State (`useState`)** — `App.jsx` (current screen), `screens/Session.jsx` (the whole
  question loop).
- **Effects (`useEffect`)** — `store/useLocalStorage.js` (save on change),
  `screens/Session.jsx` (the countdown timer, autofocus).
- **Layout effects (`useLayoutEffect`)** — `store/useScrollMemory.js`: restoring a
  screen's scroll offset has to happen *before* the browser paints, or the user sees
  the wrong position for a frame.
- **Refs (`useRef`)** — `screens/Session.jsx` (focus the input; read latest results
  inside the timer without re-creating it).
- **Context** — `store/StoreProvider.jsx` + the `useStore()` hook: share data without
  passing props through every layer.
- **Derived state** — `screens/Home.jsx` computes stats from `progress` on each render
  instead of storing them (one less thing that can go stale).
- **Keys & remounting** — `App.jsx` gives `<Session>` a `key` so switching topic starts
  it fresh.

## Changing the look — where to edit what

Almost all styling is driven by a small set of **design tokens** (CSS variables) plus one
`*.module.css` file per component. You rarely need to hunt.

| I want to change… | Edit this |
|---|---|
| Accent colour, background, text, success/error colours | `src/index.css` → the `:root { --accent, --bg, --text, --success, --error … }` block |
| **The font** (whole app) | `src/index.css` → `--font` (see "Fonts & text size" below) |
| Text size | `src/index.css` → base `font-size` on `body`; per-element sizes are in `rem` inside each `.module.css` |
| Corner roundness, touch-target size, content width | `src/index.css` → `--radius`, `--tap`, `--maxw` |
| High-contrast palette | `src/index.css` → the `:root[data-contrast='high']` block |
| A topic's symbol, colour or section | `src/data/topics.js` → `glyph`, `color`, `group` per topic (group labels in `src/lib/i18n.js`) |
| The bottom-nav icons | `src/components/Icon.jsx` (SVG paths on a 24×24 grid) |
| App name (`<h1>`) | `src/screens/Home.jsx` |
| Tagline & all UI wording (PT/EN) | `src/lib/i18n.js` |
| Colour themes | `src/index.css` → the `:root[data-theme='…']` blocks; the list in `src/screens/Settings.jsx` → `THEMES` |
| Session-length options (question counts / minutes) | `src/components/SessionSizePicker.jsx` → `COUNT_OPTIONS`, `TIME_OPTIONS` (used by both Ajustes and the tour) |
| The steps of the first-run tour | `src/screens/Onboarding.jsx` → `STEPS` (+ its `ob_*` strings in `i18n.js`) |
| The sections of "Como funciona" | `src/screens/Help.jsx` → `SECTIONS` (+ its `help_*` strings) |
| The rank tiers, their sizes and colours | `src/lib/ranks.js` → `RANK_TIERS` (names in `i18n.js` as `rank_<key>`) |
| The rank-match rule (8+/5–7/<5) | `src/lib/ranks.js` → `MATCH_UP`, `MATCH_DOWN`, `MATCH_QUESTIONS` |
| Exam-paper set sizes | `src/lib/papers.js` → `PAPER_SET_OPTIONS` |
| The question size, steps box, or "Dica" callout look | `src/screens/Session.module.css` → `.prompt`, `.steps`, `.tip` |
| The wording of the steps | `src/lib/generators.js` → the `steps: [...]` arrays |
| The strategy / mental-math "Dica" tips | `src/lib/strategies.js` (one function per topic/level) |
| Button styles (primary / ghost / danger / big) | `src/components/Button.module.css` |

**Tip:** with `npm run dev` running, save any of these files and the browser updates
instantly (hot reload). Change `--accent` in `index.css` from `#7aa2f7` to, say,
`#8bd5a0` and watch every button, link and active tab shift at once — that's the payoff
of using variables instead of repeating colours everywhere.

### Fonts & text size

**Whole-app font** — change the single `--font` line in `src/index.css`:

```css
--font: 'Inter', system-ui, sans-serif;
```

Everything inherits it: `body` sets `font-family: var(--font)`, and every element
inherits from `body`.

**Using a web font** (e.g. Google Fonts) — a real Vite build can load external fonts.
Pick one of these, then set `--font` to the family name:

```html
<!-- in index.html, inside <head> -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
```
```css
/* …or at the very top of src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
```

**A separate font just for headings** — add a second token and apply it where you want:

```css
:root { --font-display: 'Poppins', var(--font); }
/* then in e.g. Home.module.css */
.title { font-family: var(--font-display); }
```

**Text size** — the base is `font-size: 16px` on `body` (kept ≥16px so mobile browsers
don't zoom the page when you focus the answer box). Every other size is in `rem`
(relative to that base), so raising the base scales the whole app proportionally. To
resize just one thing, edit its `rem` value in that component's `.module.css` — e.g. the
question text is `.prompt { font-size: 1.9rem }` in `Session.module.css`.

## What's intentionally NOT here yet

- A Node backend + accounts + cloud sync — only worth it for multi-device. Everything is
  still local-only via `localStorage` (works offline; nothing leaves the browser).

_(The original "Portuguese-only" and "no theme toggle" caveats are gone — both shipped;
see "What's new since the first version".)_

Adding an **exam paper** to the Provas mode is pure data entry: one object in
`src/data/exams.js`. Every field, the conventions and the checklist are in
[EXAMS.md](EXAMS.md), and `npm run check` validates the whole bank.

Adding a **new topic** is the good first exercise, and it's still just data + one
generator + its tips — three files:

1. `data/topics.js` — a topic object: `id`, `name`, `glyph`, `color`, `levels`,
   `prerequisite`, `group`, and an `en` block for the English name/levels.
2. `lib/generators.js` — a `topicId(level, lang)` function returning
   `{ prompt, answer, kind, steps, tips }`, registered in the `GENERATORS` map.
3. `lib/strategies.js` — the mental-math `tips` for each level.

Then `npm run check` validates every level × language automatically. Nothing else needs
to change — Home, Progress, the coloured badge and both languages all follow from the data.

## What's new since the first version

The app has grown since the original README described it. The notable changes:

- **Four more topics (nine total).** Added **Adição, Subtração, Multiplicação** and
  **Potências e raízes** alongside the original Divisão, Frações, Porcentagem, Equação and
  Funções. The learning track (the prerequisite chain) now runs:
  Adição → Subtração → Multiplicação → Divisão → Frações → Porcentagem → Equação →
  Funções → Potências.
- **Topics are grouped on Home and Progress.** Instead of one long scroll of nine cards,
  topics are bucketed into **Fundamentos** and **Avançado** and laid out as a responsive
  two-column grid, so you can reach any level without scrolling. Grouping is data-driven —
  each topic carries a `group` field.
- **Bilingual UI (Portuguese / English)** via `lib/i18n.js`, with a language switch in
  Ajustes. Prompts, steps and tips are generated in the chosen language too.
- **Nine colour themes**, plus animation and high-contrast toggles, under Ajustes ›
  Aparência.
- **Bigger self-check.** `npm run check` now runs ~117k assertions (up from ~11k),
  including independent arithmetic verification of every generated +, −, ×, ÷, ^ and √
  question, the whole rank ladder, the exam bank's integrity and PT/EN key parity.

## What came out of the field test

A round of real use produced six changes. The first two are fixes to the core loop; the
rest are deliberately **side features** — the app's focus is still the daily track.

- **Scroll position is remembered per screen.** The bug: "routing" is a piece of state,
  not a page load, so going Início → sessão → Início re-rendered Home while the window
  kept whatever offset the previous screen left behind — on mobile you lost your place in
  the track. `store/useScrollMemory.js` records each screen's offset from the click
  handler (the last moment the outgoing screen is still on screen) and restores it in a
  layout effect, before the browser paints. New screens start at the top; tapping the tab
  you're already on jumps to the top.
- **A first-run tour** (`screens/Onboarding.jsx`). Seven steps explaining the track,
  what "fixar" means, the two session shapes, the prova da sexta and the extra modes —
  and the last step embeds the session-size control, because testers were training
  without ever setting the time or the number of questions. It shows only on a genuinely
  first entry (a user with saved progress gets the app, not a "Bem-vindo") and can be
  replayed from Mais or Ajustes.
- **Pause and resume a session** ("estudo espaçado"). Leaving a practice session now
  offers *Pausar e sair*: the topic, level, answers so far and the clock are snapshotted
  to `unimath.pending`, and Home shows a "Sessão pausada" card to continue where you
  stopped. The snapshot is rewritten after every answer, so even closing the tab keeps
  it. One paused session at a time; exams and rank matches can't be paused, since they're
  assessments. The old `window.confirm` on leaving became a three-way pause sheet.
- **"Como funciona"** (`screens/Help.jsx`). The page that explains the Prova da Sexta and
  the whole flow of the app, reachable from the "?" on Home, from Ajustes and from Mais.
  Native `<details>` sections, so it collapses with no JavaScript.
- **Provas ENEM/UFRGS** (`screens/Papers.jsx` + `PaperRun.jsx`). A multiple-choice mode
  fed by `data/exams.js`, with filters by board, topic and length, and a worked solution
  after each question. It logs its rounds but deliberately never touches your levels —
  the track is fundamentals practice, this is exam practice. Cataloguing papers is
  documented in [EXAMS.md](EXAMS.md); the bank ships with 24 seed questions written in
  the style of each board and labelled as such.
- **Ranks** (`screens/Rank.jsx`, `lib/ranks.js`). The app's only gamification: 20 steps
  from **Iniciante I** to **Sábio VI**, through Aprendiz, Calculista and Mestre. The only
  way to move is a *teste de pareamento* — 10 mixed questions, no feedback until the end,
  8+ climbs / 5–7 stays / under 5 drops. A match draws from the **whole** track ladder,
  not just what you've unlocked, which is what stops anyone reaching Sábio on additions.
- **A fourth tab, "Mais"**, holding the side features and the help page, so Home stays
  about training today.
