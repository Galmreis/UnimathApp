# Unimath — Concepts Guide (personal notes)

> A from-scratch explanation of **every idea** used in this project, tied to the actual
> code. Read it top to bottom once to get the mental model, then use it as a reference.
> This file is for learning; it is **not** part of the app and nothing imports it. Delete
> or `.gitignore` it whenever you like.

Each section answers three questions: **what** the concept is, **why** it's here, and
**where** to see it in this repo.

---

## Table of contents

0. [The one mental model: UI = f(state)](#0-the-one-mental-model-ui--fstate)
1. [The toolchain — what each tool actually does](#1-the-toolchain)
2. [How the app boots — a trace from HTML to pixels](#2-how-the-app-boots)
3. [React fundamentals, seen in this codebase](#3-react-fundamentals)
4. [The store — one source of truth](#4-the-store)
5. [Persistence — `useLocalStorage`](#5-persistence)
6. [The pure-logic core (no React)](#6-the-pure-logic-core)
7. [Internationalization — `i18n.js`](#7-internationalization)
8. [Styling & theming](#8-styling--theming)
9. [Accessibility & mobile touches](#9-accessibility--mobile-touches)
10. [End-to-end: one answer, start to finish](#10-end-to-end)
11. [How our recent changes fit](#11-how-our-recent-changes-fit)
12. [Glossary](#12-glossary)

---

## 0. The one mental model: UI = f(state)

If you remember one thing, remember this: **the screen is a pure function of the data.**

- **State** = the data that can change (which screen you're on, what you typed, your
  progress).
- **Rendering** = React calling your components to turn that state into a description of
  the UI.
- When state changes, React **re-runs** the affected components and updates only the DOM
  bits that actually differ.

You never write "find the element and change its text." You change the *state*, and the UI
follows. Every file in `src/` is one of three things:

1. **State** — values that persist or change (`store/`, `useState` inside screens).
2. **Logic that produces new state** — pure functions (`lib/`).
3. **Components that draw the current state** — (`components/`, `screens/`).

Hold that lens and the whole codebase organizes itself.

---

## 1. The toolchain

### Node.js & npm
- **Node** runs JavaScript outside the browser. We use it for the dev server, the build,
  and the `npm run check` self-test.
- **npm** installs dependencies (listed in `package.json`) into `node_modules/` and runs
  the `scripts`. Ours:
  ```json
  "scripts": {
    "dev": "vite",            // hot-reloading dev server
    "build": "vite build",    // optimized production bundle into dist/
    "preview": "vite preview",// serve the built dist/ to sanity-check it
    "check": "node src/lib/selfcheck.mjs"  // run the pure-logic assertions
  }
  ```
- `"type": "module"` means files use ES-module `import`/`export` (not the older
  `require`).

### Vite
The build tool and dev server. Two jobs:
- **Dev**: serves your source instantly and does **HMR** (Hot Module Replacement) — save a
  file and the browser patches itself in place, keeping app state. That "change `--accent`
  and everything recolors live" magic is HMR.
- **Build**: bundles + minifies everything into static files in `dist/` that any web host
  can serve.

Our whole config is:
```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
```
The React plugin adds two things: JSX compilation and React Fast Refresh (HMR that
preserves component state). CSS Modules and ES modules are built into Vite — no config.

### React & ReactDOM
- **`react`** is the library for describing UI as components and managing state/effects
  (the hooks: `useState`, `useEffect`, …).
- **`react-dom`** is the piece that actually renders those components into the browser DOM
  (`createRoot(...).render(...)`). React itself is renderer-agnostic; `react-dom` is the
  web renderer.

### JSX
JSX is HTML-looking syntax inside JavaScript. It is **not** HTML and not magic — the React
plugin compiles it to plain function calls. This:
```jsx
<Button full onClick={quit}>{t('submit')}</Button>
```
becomes roughly `React.createElement(Button, { full: true, onClick: quit }, t('submit'))`.
Rules that follow from "it's JavaScript":
- `{ ... }` drops any JS **expression** into the markup (`{topic.name}`, `{answered + 1}`).
- Attributes are camelCase and use JS names: `className` (not `class`), `onClick`,
  `htmlFor`.
- A component must return **one** root node; wrap siblings in a fragment `<>…</>`.

### CSS Modules
Any file named `*.module.css` gets its class names **locally scoped**. When you write
`import styles from './Button.module.css'` and use `className={styles.btn}`, Vite renames
`.btn` to something unique like `Button_btn_a1b2` so styles from different files can never
collide. You get the simplicity of plain CSS with the safety of scoping — no BEM naming
gymnastics, no accidental global overrides.

---

## 2. How the app boots

A single trace, top to bottom:

1. **`index.html`** is the only HTML page. It contains `<div id="root"></div>` and a
   `<script type="module" src="/src/main.jsx">`. (This is a **Single-Page App**: one HTML
   file, everything else drawn by JS.)
2. **`main.jsx`** grabs that div and mounts React into it:
   ```jsx
   createRoot(document.getElementById('root')).render(
     <StrictMode>
       <StoreProvider>
         <App />
       </StoreProvider>
     </StrictMode>,
   )
   ```
   - `<StoreProvider>` wraps everything so any screen can read the shared data.
   - `<StrictMode>` is a dev-only helper: it double-invokes some functions to surface
     unsafe patterns. It renders nothing and disappears in production.
3. **`App.jsx`** decides **which screen** shows, based on one piece of state (`view`).
4. The chosen **screen** (Home/Session/…) reads data from the store and renders
   **components**.

That's the entire skeleton. No router, no backend, no global event bus.

---

## 3. React fundamentals

This project is a compact tour of the core hooks. Here's each concept with its exact home
in the code.

### Components & props
A **component** is a function that returns JSX. **Props** are its inputs — a read-only
object passed by the parent, exactly like function arguments.

```jsx
// components/TopicGlyph.jsx — pure "given data, draw a badge"
export function TopicGlyph({ topic, size }) {
  return (
    <span className={`${styles.glyph} ${size === 'sm' ? styles.sm : ''}`}
          style={{ color: topic.color, backgroundColor: `${topic.color}22` }}>
      {topic.glyph}
    </span>
  )
}
```
`{ topic, size }` is **destructuring** the props object. The parent controls it:
`<TopicGlyph topic={topic} size="sm" />`. A component never modifies its props — data flows
**down** (parent → child); changes flow **up** through callbacks (see events).

Good example of a reusable component with variants: `components/Button.jsx` (`variant`,
`size`, `full` props switch classes).

### Rendering & re-rendering
React calls your component function to get JSX, compares it to the previous result, and
patches the DOM. A component re-renders when:
- its **state** changes (`useState` setter called), or
- its **parent** re-renders and passes new props, or
- a **context** it consumes changes.

Re-rendering is cheap because React only touches the DOM nodes that differ.

### `useState` — local, changeable memory
```jsx
const [view, setView] = useState({ name: 'home' })  // App.jsx
```
`useState(initial)` returns `[currentValue, setter]`. Calling the setter schedules a
re-render with the new value. Key points:
- The value **persists across renders** (unlike a normal local variable, which is recreated
  every call).
- **Never mutate** it; always pass a new value/object to the setter. React decides "did it
  change?" by reference, so `arr.push(x); setArr(arr)` looks unchanged — you write
  `setArr([...arr, x])`.

`screens/Session.jsx` is the state-heaviest file — the whole question loop is state:
```jsx
const [question, setQuestion] = useState(makeQuestion) // current question object
const [input, setInput]       = useState('')            // what the user typed
const [phase, setPhase]       = useState('answering')   // 'answering' | 'feedback'
const [results, setResults]   = useState([])            // one boolean per question
```
Notice `useState(makeQuestion)` passes a **function** — the *lazy initializer*. React calls
it once on mount to get the initial value, instead of computing it on every render.

### Events, controlled inputs & forms
An **event handler** is just a function you hand to an event prop:
```jsx
<button onClick={quit}>✕</button>
```
A **controlled input** is one whose value comes from state and whose changes flow back into
state — React is the single source of truth for the field:
```jsx
<input
  value={input}
  onChange={(e) => setInput(sanitizeAnswer(e.target.value, question.kind))}
/>
```
Every keystroke fires `onChange` → we clean it → update state → the input shows the new
state. Because we own every keystroke, we can **sanitize** it (strip letters so only digits
/ `,` `.` `-` `/` survive — `sanitizeAnswer` at the bottom of `Session.jsx`).

Wrapping the input in `<form onSubmit={submit}>` gives us "press Enter = submit" for free;
`submit` calls `event.preventDefault()` to stop the browser's default full-page reload.

### Lists & keys
To render a list, `map` data to elements and give each a stable `key`:
```jsx
{topic.levels.map((label, i) => (
  <button key={i} disabled={i > maxTrainable}>{i + 1}. {label}</button>
))}
```
The **key** lets React match elements between renders so it can reorder/update instead of
rebuilding. Prefer a stable id; an index is fine only for a fixed, non-reordered list.

### `useEffect` — run code *after* render (side effects)
Rendering should be pure (just compute JSX). Anything that touches the outside world —
timers, focus, `localStorage`, the `document` — goes in an **effect**, which React runs
after painting.

```jsx
// useLocalStorage.js — save to storage whenever the value changes
useEffect(() => {
  localStorage.setItem(key, JSON.stringify(value))
}, [key, value])   // ← dependency array: re-run only when key or value changes
```
The **dependency array** controls *when* the effect re-runs:
- `[a, b]` → after any render where `a` or `b` changed.
- `[]` → once, after the first render (mount) only.
- omitted → after **every** render (rarely what you want).

An effect can **return a cleanup function**, which React runs before the next run and on
unmount. The countdown timer uses this so we never leak an interval:
```jsx
// Session.jsx — time mode
useEffect(() => {
  if (!byTime) return
  const id = setInterval(() => { /* tick / finish */ }, 500)
  return () => clearInterval(id)   // cleanup: stop the timer when leaving
}, [])
```
`StoreProvider` uses tiny effects to mirror settings onto the `<html>` element so CSS can
react (theme, motion, contrast, language):
```jsx
useEffect(() => { document.documentElement.dataset.theme = settings.theme }, [settings.theme])
```

### `useRef` — a value that survives renders *without* causing them
`useRef(x)` returns a box `{ current: x }`. Writing `ref.current = …` does **not**
re-render. Two distinct uses appear in `Session.jsx`:

1. **A handle to a DOM node** — to imperatively focus the input:
   ```jsx
   const inputRef = useRef(null)
   <input ref={inputRef} … />
   useEffect(() => { if (phase === 'answering') inputRef.current?.focus() }, [phase, question])
   ```
2. **A mutable value that shouldn't trigger renders**:
   - `startedAt` — the session's start time, captured once.
   - `finishedRef` — a guard so `finish()` can't run twice (e.g. the timer firing at the
     same moment as the last answer).
   - `resultsRef` — lets the long-lived timer read the **latest** results without being
     re-created every render. (The timer effect has `[]` deps, so it captured the *first*
     `results`; the ref bridges the gap.)

Rule of thumb: **state** if the UI should react to it; **ref** if it's bookkeeping the UI
doesn't directly display.

### `useMemo` — cache an expensive/identity-sensitive computation
`useMemo(fn, deps)` re-runs `fn` only when `deps` change; otherwise it returns the cached
value. In `StoreProvider`:
```jsx
const t = useMemo(() => makeT(lang), [lang])            // rebuild translator only on lang change
const topics = useMemo(() => TOPICS.map(t => localizeTopic(t, lang)), [lang])
```
Here it's partly about avoiding rework, but mostly about **stable identity**: if `topics`
were a fresh array every render, everything reading it would see "new data" every time.

### Context — share data without prop-drilling
Passing the store through every intermediate component would be tedious ("prop drilling").
**Context** is React's built-in broadcast channel:
```jsx
const StoreContext = createContext(null)
// provider (top of the tree):
<StoreContext.Provider value={value}>{children}</StoreContext.Provider>
// consumer (any depth):
export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore() must be inside <StoreProvider>')
  return store
}
```
Any screen calls `const { t, topics, progress, commitSession } = useStore()` and gets the
live store. `useStore` is a **custom hook** — just a function that calls other hooks and
adds a helpful error if used outside the provider.

### Derived state — compute, don't store
If a value can be calculated from existing state, calculate it during render instead of
storing a copy (a copy is one more thing that can drift out of sync). `Home.jsx` never
stores totals:
```jsx
const totalAnswered = allProgress.reduce((s, p) => s + p.answered, 0)
const overallPct = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0
```
Same idea for `currentTopicId` in the store (the first unlocked-but-unmastered topic) — it's
derived from `progress`, not saved separately.

### Keys & remounting — a trick worth knowing
Normally you avoid remounting, but sometimes a **fresh start** is exactly right. `App.jsx`
gives `<Session>` a `key` that includes the topic and level:
```jsx
<Session key={`practice-${view.topicId}-${view.levelIndex ?? 'cur'}`} … />
```
When the key changes, React throws the old `<Session>` away and mounts a brand-new one —
all its `useState` resets. So switching topics starts a clean session with zero manual
reset logic. **Changing a component's `key` is a deliberate "reset everything" button.**

---

## 4. The store

`store/StoreProvider.jsx` is the app's **single source of truth**. Everything that must
persist lives here, and it's the *only* place that changes it.

### The shape
Four independent slices, each its own `localStorage` key:
```jsx
const [storedSettings, setSettings] = useLocalStorage('unimath.settings', DEFAULT_SETTINGS)
const [progress, setProgress] = useLocalStorage('unimath.progress', {}) // { [topicId]: progressObj }
const [sessions, setSessions] = useLocalStorage('unimath.sessions', []) // newest first
const [exams, setExams]       = useLocalStorage('unimath.exams', [])
```

### Actions — the only mutators
Screens never call `setProgress` directly; they call **named actions** that encapsulate the
rules. This keeps "how do I save this?" to a single answer per operation:
- `updateSettings(patch)` — merge a partial settings change.
- `commitSession({ topicId, results, … })` — fold answers into progress, auto-advance the
  level if it's now "fixed," and log the session.
- `commitExam({ … })` — apply the exam up/stay/down rule and log it.
- `resetProgress()` — wipe progress but keep settings.

### Immutability, concretely
Look at `commitSession`:
```jsx
setProgress((prev) => {
  let prog = prev[topicId] ?? emptyProgress()
  const reviewing = level != null && level < prog.levelIndex
  for (const isCorrect of results) prog = recordAnswer(prog, isCorrect, reviewing)
  if (!reviewing) prog = advanceIfReady(prog, getTopic(topicId))
  return { ...prev, [topicId]: prog }   // new object, old one untouched
})
```
- The setter is called with a **function** `(prev) => next`. Use this "updater" form
  whenever the next value depends on the previous — it's race-proof against batched updates.
- `{ ...prev, [topicId]: prog }` builds a **new** map with one key replaced. React sees a
  new reference → re-renders. The old object is never mutated.
- `recordAnswer`/`advanceIfReady` are the pure functions from `mastery.js` (below) — the
  store just orchestrates them.

### Forward-compatible defaults
```jsx
const settings = { ...DEFAULT_SETTINGS, ...storedSettings }
```
If you ship a new setting next month, users with an old saved object still get a value for
it (the default fills the gap). Small line, saves real headaches.

---

## 5. Persistence

`store/useLocalStorage.js` is a **custom hook**: a drop-in `useState` that also mirrors the
value into the browser's `localStorage`, so it survives reloads. This is the app's entire
"database" — no server.

```jsx
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {                 // 1. lazy read on first render
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch { return initialValue }                          //    storage off/corrupt → default
  })
  useEffect(() => {                                          // 2. write back on every change
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  }, [key, value])
  return [value, setValue]
}
```
Concepts packed in here:
- **Lazy initializer** (`useState(() => …)`): read storage once, not every render.
- **Serialization**: `localStorage` only stores strings, so we `JSON.stringify` on the way
  out and `JSON.parse` on the way in.
- **Defensive `try/catch`**: private mode or a full quota can throw; we degrade to
  in-memory rather than crash.
- Because it returns the same `[value, setValue]` tuple as `useState`, callers can't tell
  it apart — a clean **abstraction**.

---

## 6. The pure-logic core

Everything in `lib/` (except the store's neighbors) is **pure**: given the same inputs it
returns the same output, with no side effects (no DOM, no storage, no randomness *baked in*
where it matters). Why this is a big deal:
- **Testable without a browser** — `selfcheck.mjs` imports these directly and runs ~113k
  assertions in Node.
- **Easy to reason about** — no hidden state to track.
- **Reusable** — the same generator feeds practice, exam, and the self-check.

### `math.js` — the primitives
`randInt(min, max)`, `pick(list)`, `gcd`, `reduceFraction` (keeps the sign on the
numerator), `round(value, places)` (kills float noise like `0.1 + 0.2`), and
`formatNumber` (Portuguese decimal comma vs English point). Small, boring, correct — the
foundation the rest builds on.

### `generators.js` — the heart: questions are *built*, not stored
Instead of a fixed question bank you could memorize, each topic **constructs** a fresh
question from random numbers. The contract every generator returns:
```
{ prompt, answer, kind: 'number'|'fraction', steps: string[], tips: string[] }
```
One function per topic, a `switch (level)` for difficulty. The crucial trick: **steps and
tips are built from the same random numbers as the question**, so the explanation can never
mismatch the prompt. Simplified shape:
```jsx
function divisao(level, lang) {
  const L = (pt, en) => (lang === 'en' ? en : pt)   // pick text by language
  const f = (v) => formatNumber(v, lang)            // format decimals by language
  switch (level) {
    case 0: {                       // Exact division
      const b = randInt(2, 9), q = randInt(2, 9), a = b * q  // build a so a÷b is exact
      return {
        prompt: `${a} ÷ ${b} = ?`, answer: q, kind: 'number',
        steps: [ L(`quantas vezes ${b} cabe em ${a}?`, `how many times does ${b} fit into ${a}?`), … ],
        tips: S.divisaoExataTips(a, b, q, lang),
      }
    }
    …
  }
}
// registered so callers can look it up by id:
const GENERATORS = { adicao, subtracao, multiplicacao, divisao, fracoes, … }
export function generateQuestion(topicId, levelIndex, lang = 'pt') { … }
```
Two patterns to notice:
- **Construct-to-guarantee**: instead of generating `a` and `b` and hoping `a ÷ b` is
  whole, we pick the quotient `q` and divisor `b` and set `a = b*q`. The answer is correct
  *by construction*. The same idea gives "no-carry" additions, reducible fractions, etc.
- **`L(pt, en)` / `f(v)`**: every generator localizes its own text and number formatting,
  so PT and EN come out of one function.

### `strategies.js` — the "Dica" (mental-math tips)
Separate from `steps` (the plain mechanical solution), `tips` teach the *smart* shortcut,
chosen from the specific numbers:
```jsx
export function divisaoExataTips(a, b, q, lang = 'pt') {
  if (b === 5) return [L(lang, `÷5 é ×2 e ÷10: ${a}×2=${a*2}, ÷10=${q}.`, `÷5 is ×2 then ÷10: …`)]
  if (b === 2) return [L(lang, `metade de ${a} é ${q}.`, `half of ${a} is ${q}.`)]
  …
}
```
This is why the app teaches *technique*, not just answers: ÷5 → the ×2÷10 trick, 15% → the
10%+5% block method, a fraction with a shared factor → cross-cancel.

### `checkAnswer.js` — grading what the user typed
```jsx
const TOLERANCE = 1e-3
```
- **Numbers**: parse the text (accepting a comma decimal), compare within a small tolerance
  so `0.33` matches `1/3`'s decimal.
- **Fractions**: parse `3/4`, reduce it, compare to the reduced answer — but *also* accept
  an equivalent decimal (`0,75`) and an unreduced form (`6/8`). Being lenient where it's
  mathematically correct is a UX choice.
- `formatAnswer` renders the correct answer for the feedback line (`2` instead of `2/1`).

### `mastery.js` — the progression algorithm
Pure rules that turn a stream of right/wrong answers into "level up / stay / unlock." A
topic's progress:
```
{ answered, correct, levelIndex, recent: boolean[], mastered }
```
`recent` is a **rolling window** of the last 10 answers — the mastery signal.

- `recordAnswer(prog, isCorrect, statsOnly)` — fold one answer in, **immutably**:
  ```jsx
  recent: statsOnly ? prog.recent : [...prog.recent, isCorrect].slice(-MASTERY_WINDOW)
  ```
  `slice(-10)` keeps only the last 10. `statsOnly` (used when reviewing an easier, already-
  passed level) counts the answer in lifetime totals but **not** the window — so acing old
  easy questions can't falsely advance you.
- `isLevelReady` — a **full** window of 10 **and** ≥80% correct.
- `advanceIfReady` — if ready: move up a level with a **fresh** window (`recent: []`), or,
  if it was the last level, set `mastered: true`.
- `applyExamResult` — the "prova da sexta" rule generalized to any total: **≥80%** up,
  **50–79%** stay, **<50%** down a level. A mastered topic is frozen (re-taking is just
  review).
- `topicStatus(topic, progressMap)` — combines the **lock rule** (locked until its
  `prerequisite` is mastered) with progress → `'locked' | 'available' | 'in_progress' |
  'mastered'`. This one function drives every badge and every unlock in the UI.

Because these are pure, `selfcheck.mjs` can hammer them: "10/10 → ready", "review answers
don't fill the window", "exam 8/10 advances / 3/10 drops", "mastering a prereq unlocks the
next topic", etc.

---

## 7. Internationalization

`lib/i18n.js` is a tiny, dependency-free i18n layer.

- **A flat dictionary per language**: `DICT = { pt: { key: 'texto' }, en: { key: 'text' } }`.
- **`makeT(lang)`** returns a `t(key, params)` bound to one language, filling
  `{placeholders}`:
  ```jsx
  t('level_of', { n: 2, m: 3 })  // "Nível 2/3"
  ```
  Missing keys fall back (to the PT string, then to the key name) so nothing ever renders
  blank.
- **`localizeTopic(topic, lang)`** swaps a topic's display strings to the chosen language by
  spreading its `en` block over it, leaving structural fields (id, glyph, color,
  prerequisite, **group**) untouched:
  ```jsx
  return { ...topic, ...topic.en }   // when lang === 'en'
  ```

The store builds `t` and the localized `topics` once per language change (`useMemo`), and
sets `<html lang>` so screen readers/browsers know the language. Note: **generated** text
(prompts/steps/tips) is localized inside the generators, not here — this file only covers
the fixed UI chrome.

---

## 8. Styling & theming

### Design tokens (CSS variables)
`src/index.css` defines the palette and rhythm once, as CSS custom properties on `:root`:
```css
:root {
  --bg: #171b24; --surface: #1f2530; --text: #e7eaf0;
  --accent: #7aa2f7; --success: #7ecb8f; --error: #e39191;
  --radius: 16px; --tap: 52px; --maxw: 480px;
  --font: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}
```
Every component references `var(--accent)` etc., so changing one line re-themes the whole
app. `--maxw: 480px` is the centered content column width — it's why the app looks like a
phone app even on a desktop, and it's the number that made the topic grid math work (see
§11).

### CSS Modules mechanics (recap)
`import styles from './Foo.module.css'` → `styles.bar` is the scoped, renamed class. Global
styles (reset, tokens, `body`) stay in plain `index.css`; everything component-specific is a
`*.module.css` next to its component.

### Themes & data-attributes
Alternate themes are just blocks that override the color tokens under a selector:
```css
:root[data-theme='sepia'] { --bg: #1e1a15; --accent: #d9a45b; … }
```
The store flips that attribute from a setting:
```jsx
useEffect(() => { document.documentElement.dataset.theme = settings.theme }, [settings.theme])
```
So `settings.theme = 'sepia'` → `<html data-theme="sepia">` → the CSS variables change →
every `var(--…)` updates at once. The same pattern drives `data-motion` (animations on/off)
and `data-contrast` (high-contrast). This is the cleanest theming approach on the web: **JS
sets one attribute; CSS does the rest.**

### Data-driven inline style (the glyph badge)
`TopicGlyph` builds a tinted badge from the topic's own hex color by appending an alpha
suffix:
```jsx
style={{ color: topic.color, backgroundColor: `${topic.color}22`, borderColor: `${topic.color}55` }}
```
`"#7aa2f7" + "22"` = the color at ~13% opacity — a quick way to derive a matching tint
without defining extra variables.

### The responsive grid (our grouping change)
`Home.module.css` / `Progress.module.css` lay topic cards out with:
```css
.track {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
```
- **`grid`** places children in rows/columns automatically.
- **`repeat(auto-fill, minmax(200px, 1fr))`** = "make as many columns as fit, each at least
  200px, sharing leftover space equally." On the 480px column (~448px usable) that yields
  **2 columns**; on a narrow phone it drops to **1**. Fully responsive with no media
  queries. `200px` was chosen precisely so two columns fit the fixed content width.

---

## 9. Accessibility & mobile touches

Small but deliberate, mostly in `Session.jsx` and `index.css`:
- **`aria-label`** on icon-only controls (`✕` close button) so screen readers announce a
  name.
- **`inputMode`** hints the on-screen keyboard: `'decimal'` for number answers, `'text'`
  for fractions/signed — the phone shows the right keys.
- **`enterKeyHint="go"`** labels the phone keyboard's Enter key.
- **Focus management**: an effect focuses the input on each new question; the "Próxima"
  button uses `autoFocus` so **Enter** flows through the whole session mouse-free.
- **`--tap: 52px`** minimum touch target, and **`body` font ≥16px** so mobile Safari doesn't
  zoom when you focus the answer box.

Accessibility here isn't an afterthought bolted on — it's a handful of correct attributes at
the point of use.

---

## 10. End-to-end

Trace one interaction through every layer, to see how the pieces connect:

1. **Home**, "Divisão" card, you tap the pill **"2. Com resto."** `TopicCard`'s
   `onStart(1)` fires → `navigate('session', { topicId: 'divisao', levelIndex: 1 })`.
2. **`App`** sets `view = { name:'session', topicId:'divisao', levelIndex:1 }` (state
   change → re-render). Its `key` includes topic+level, so a **fresh** `<Session>` mounts.
3. **`Session`** computes the level, calls `generateQuestion('divisao', 1, lang)` →
   `generators.js` builds a "with remainder" question (`prompt`, `answer`, `steps`, `tips`).
4. You type; `sanitizeAnswer` keeps it numeric; **Enter** submits the form.
5. `checkAnswer(input, question)` grades it → push a boolean into `results` (state) → show
   feedback (`steps`/`tips` render if the toggles are on).
6. You finish the count. `finish()` calls **`commitSession`** (a store action).
7. `commitSession` folds each result via `recordAnswer`, then `advanceIfReady` — if your
   last-10 hit 80%, `levelIndex` bumps and the window resets. It writes a **new** `progress`
   object.
8. `setProgress` → `useLocalStorage`'s effect serializes it to `localStorage` → survives
   reload.
9. Back on **Home**, `topicStatus` recomputes from the new `progress`: the level shows as
   advanced; if you mastered the last level, the **next** topic flips from `locked` to
   `available` automatically.

No step "told the UI to update" — every screen just re-rendered from the new state.

---

## 11. How our recent changes fit

### Adding the four new topics (Adição, Subtração, Multiplicação, Potências e raízes)
Because of the generator pattern, a new topic is **three data-shaped edits**:
1. `data/topics.js` — a topic object (`id`, `name`, `glyph`, `color`, `levels`,
   `prerequisite`, `group`, `en`). We also re-pointed Division's `prerequisite` to
   Multiplication so the basics come first in the chain.
2. `lib/generators.js` — one `topicId(level, lang)` function returning the standard
   `{ prompt, answer, kind, steps, tips }`, registered in `GENERATORS`.
3. `lib/strategies.js` — the mental-math `tips` for each level.

Nothing in the UI changed to support them: `selfcheck.mjs` loops over `TOPICS`, so it
started testing them automatically (we added independent checks that recompute each
`+ − × ÷ ^ √` answer, so a wrong generator would fail loudly).

### Grouping the topics on Home & Progress
The screens used to `map` all nine topics into one column — a long scroll. The change:
- **Data**: each topic gained a `group` field (`'fundamentos'` / `'avancado'`); labels live
  in `i18n.js` as `group_<key>`.
- **Render**: both screens bucket topics by `group` (order preserved), then render one
  labeled section + grid per group:
  ```jsx
  const groups = []
  for (const topic of topics) {
    const key = topic.group ?? 'outros'
    let g = groups.find(x => x.key === key)
    if (!g) { g = { key, topics: [] }; groups.push(g) }
    g.topics.push(topic)
  }
  ```
  This is deliberately data-driven: a new group key just needs a matching `i18n` label —
  no code edit.
- **Layout**: the `.track`/`.topicList` list became the responsive grid from §8 (2-up on
  the fixed column, 1-up on phones).
- **De-bloat**: the wide "EM ANDAMENTO" status **pill** was demoted to a small colored
  status **word** in the subtitle, so a half-width card doesn't crowd the topic name — a
  concrete instance of "less UI, same information."

Both screens now share one grouping system driven off the `group` field, so future topics
slot into both automatically.

---

## 12. Glossary

- **Component** — a function returning JSX; the unit of UI.
- **Props** — read-only inputs a parent passes to a child.
- **State** — data that can change and, when it does, triggers a re-render.
- **Hook** — a `use*` function that lets a component tap into React features (`useState`,
  `useEffect`, `useRef`, `useMemo`, `useContext`). Only call them at the top level of a
  component/hook, never in loops or conditions.
- **Render** — React calling your component to produce a UI description.
- **Effect** — code that runs *after* render for side effects; may return a cleanup.
- **Ref** — a mutable box (`.current`) that persists across renders without causing them.
- **Context** — a way to share a value with any descendant without prop-drilling.
- **Controlled input** — a form field whose value is driven by state.
- **Derived state** — a value computed from existing state at render time (not stored).
- **Pure function** — same input → same output, no side effects.
- **Immutability** — never mutate state; produce a new value so React can detect the change
  by reference.
- **CSS Module** — a `*.module.css` whose class names are locally scoped.
- **Design token** — a CSS variable (`--accent`) used everywhere instead of a literal.
- **HMR / Fast Refresh** — hot-reloading that patches the running app on save.
- **SPA** — Single-Page App: one HTML file, all views drawn by JS.
- **Lazy initializer** — `useState(() => …)`: compute the initial value once.
- **Rolling window** — the last N results (`recent`), the mastery signal.

---

### Good next exercises
- Add a **"Números primos"** or **"MMC/MDC"** topic (three-file recipe above) and watch the
  self-check cover it.
- Add a third group (e.g. split "Avançado" into "Números" and "Álgebra") — only a `group`
  value + one `i18n` label.
- Add a new **theme**: copy a `:root[data-theme='…']` block, tweak the tokens, add its id to
  `THEMES` in `Settings.jsx` and a `theme_<id>` label in `i18n.js`.
