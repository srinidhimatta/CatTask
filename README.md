# CatTask — A Cute Desktop Cat To-Do Companion 🐾

> **A charming, interactive desktop productivity companion built with Electron, React 19, TypeScript, and Vite.**  
> Designed for **Problem Statement 2: To-Do List Application**, featuring an animated desktop cat that responds dynamically to your productivity!

[![Live Demo](https://img.shields.io/badge/Live_Demo-CatTask_Web-FF7700?style=for-the-badge&logo=google-chrome&logoColor=white)](https://srinidhimatta.github.io/CatTask/)
[![GitHub](https://img.shields.io/badge/GitHub_Repo-srinidhimatta%2FCatTask-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/srinidhimatta/CatTask)

🌐 **Live Web Application:** [https://srinidhimatta.github.io/CatTask/](https://srinidhimatta.github.io/CatTask/)

---

## 📖 1. Project Overview

**CatTask** reimagines personal task management. Instead of switching back and forth to a sterile, boring to-do app, a cute, small, thin pixel black cat lives right on your desktop.

- **Desktop Presence:** The pixel cat floats transparently above your wallpaper and apps, resting quietly in the corner of your screen.
- **Interactive Companion:** You can freely drag the cat anywhere on your desktop.
- **Instant Task Access:** Clicking the cat (or the floating Tasks badge) smoothly toggles a cozy, floating task panel right beside the companion.
- **Dynamic Reactions:** As you accomplish goals, your companion rejoices with cheerful expressions, purring hearts, and celebratory confetti. When all tasks are finished, it curls up for a peaceful nap with floating `Zzz`s.

---

## ✨ 2. Key Features

### 🐱 A. Desktop Cat Character & State Machine
- **Cute Small Thin Pixel Black Cat:** Crisp retro pixel art design featuring a sleek, slender black cat silhouette, glowing emerald-gold pixel eyes, pointed ears with soft pink inner pads, and a delicate curved tail.
- **True Desktop Transparency:** Frameless window with 100% transparent background—no ugly rectangular bounding box.
- **Always-on-Top Floating Mode:** Sits gently above normal windows so it remains accessible while coding, browsing, or studying.
- **Draggable & Click-Aware:** Differentiates between mouse drags and clicks with zero input conflict. Dragging moves the companion smoothly; clicking anywhere on the cat triggers the task panel.
- **Full Cat Visibility:** No bottom bars or obstructing controls covering the cat's paws or body. A discreet `📋 Tasks` badge sits in the corner.
- **5-Minute Desktop Walk Cycle:** Automatically gets up and takes a 4-legged walk across your screen every 5 minutes while you work!
- **Reactive Cat Moods & Ambient Pet Behaviors:**
  - `idle`: Gentle pixel breathing animation, blinking glowing emerald eyes, soft tail sway.
  - `walking`: Slender 4-legged pixel trot; the cat physically walks along the bottom of the screen, reversing when near monitor boundaries.
  - `rolling`: Cute belly-up roll on its back with all 4 thin paws wiggling in the air and happy squinted eyes (`^ ^`).
  - `happy`: Cheerful pixel bounce, blushing pink cheeks, and floating hearts when any task is checked off.
  - `celebrating`: Special celebration with a golden party hat and fluttering sparkles/confetti when **all** tasks are completed!
  - `sleepy`: Peaceful closed downward curved eyes (`- -`) and floating `z Z z` bubbles when no pending tasks remain.
  - `curious`: Wide alert eyes and head tilt when hovered or clicked.

### 📋 B. Task Management
- **Add Tasks:** Intuitive text input with "+ Add" button and full `Enter` key support.
- **Input Validation:** Prevents adding empty or whitespace-only items.
- **Completion Checkbox:** Custom animated checkbox; checking off items applies a strikethrough and muted styling without sacrificing readability.
- **Delete Tasks:** Instant deletion via the hover trash icon.
- **Filter Tabs:** Effortlessly switch between:
  - **All** (total task count)
  - **Active** (in-progress count)
  - **Done** (completed count)
- **Clear Completed:** One-click bulk action to clear finished tasks.

### 📊 C. Progress Tracking & Empty States
- **Daily Progress Bar:** Animated pastel gradient progress bar with live percentage display.
- **Real-Time Counts:** Dynamically reports Total, Completed, and Remaining tasks.
- **Charming Empty States:**
  - *No tasks added:* "Nothing to do right now. Time to relax! 🐾"
  - *All tasks completed:* "Purr-fect! All caught up! Every task is completed. ✨"
  - *Category empty states:* Tailored feedback for active and completed tabs.

### 🎵 D. Web Audio Synthesizer (Zero External Dependencies)
- Uses the native HTML5 Web Audio API to synthesize adorable audio feedback with zero latency and no external MP3/WAV files:
  - Gentle kitten meow / chirp on cat clicks.
  - Sparkling arpeggio chime on task completion.
  - Cheerful bubble pop on adding a task.
  - Soft paper whoosh on task deletion.
  - Uplifting victory fanfare when all tasks are cleared.
- Includes a one-click **Sound Mute / Unmute** toggle in the header.

### 💾 E. Reliable Persistent Local Storage
- Local JSON storage managed securely by the Electron main process in `app.getPath('userData')/cattask-storage.json`.
- Uses atomic file writes (temporary file + rename) with fallbacks to avoid corruption.
- Persists all tasks, completed timestamps, sound preferences, and statistics across application restarts.

### 🛡️ F. Secure Desktop Architecture
- Electron `contextIsolation: true`.
- Renderer `nodeIntegration: false`.
- Sandboxed IPC bridge exposing strictly validated APIs via `contextBridge`.

---

## 🎨 3. Google Tools & Assessment Alignment

This project was built leveraging Google developer tools:

| Google Tool | Contribution to CatTask |
| :--- | :--- |
| **Google Stitch** | Used to conceive and refine the visual design system, cozy warm pastel color palette (`#FFFDF9`, `#F97316`, `#FFEDD5`, `#5C3D28`), typography pairings (`Comfortaa` & `Nunito`), and companion layout hierarchy. |
| **Google AI Studio** | Used for architectural planning, algorithmic design of the cat's finite-state mood machine, atomic file storage patterns, and Web Audio synthesis waveforms. |
| **Google Antigravity** | Used for end-to-end agentic implementation, project scaffolding, TypeScript compilation, Vite packaging, smoke testing, and desktop verification. |

---

## 🛠️ 4. Tech Stack

- **Desktop Framework:** [Electron 33](https://www.electronjs.org/)
- **Frontend Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool & Bundler:** [Vite 6](https://vitejs.dev/)
- **UI Icons:** [Lucide React](https://lucide.dev/)
- **Audio Engine:** Native Web Audio API Oscillator & Gain Nodes
- **Storage:** Node.js filesystem JSON persistence via Electron IPC

---

## 🚀 5. Installation and Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18, v20, v22, or v24)
- npm (v9+)

### Installation

1. Open PowerShell or a terminal and navigate to the project directory:
   ```bash
   cd d:\Projects\CatTask
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Build the application (compiles React frontend and Electron main/preload processes):
   ```bash
   npm run build
   ```

4. Launch CatTask:
   ```bash
   npm start
   ```

### Development Mode (with Hot Reload)
To run with live hot reloading:
```bash
npm run dev
```

---

## 🧪 6. Testing & Quality Verification

CatTask includes automated verification scripts and was rigorously tested against all 14 specification requirements:

Run the automated test suite:
```bash
npm test
```

### Test Results Summary

| # | Test Scenario | Status | Verification Details |
| :-: | :--- | :-: | :--- |
| 1 | **Add a task** | ✅ PASS | Tasks appear immediately in the list and progress section. |
| 2 | **Add task using Enter key** | ✅ PASS | Form submits on Enter key press; text field clears and refocuses. |
| 3 | **Attempt empty task** | ✅ PASS | Rejects empty and whitespace-only submissions safely. |
| 4 | **Mark task as completed** | ✅ PASS | Custom checkbox toggles with strikethrough, muted tone, and chime sound. |
| 5 | **Unmark completed task** | ✅ PASS | Clicking checkbox unmarks task, restores active state, and updates counters. |
| 6 | **Delete a task** | ✅ PASS | Hovering reveals trash icon; deletes task and triggers soft whoosh audio. |
| 7 | **Filter switching** | ✅ PASS | Seamlessly switches between All, Active, and Done with accurate badge counts. |
| 8 | **Progress statistics** | ✅ PASS | Percentage bar and remaining counts update synchronously with every action. |
| 9 | **Task persistence** | ✅ PASS | Verified across full app termination and restart via `test-storage.js`. |
| 10 | **Cat click toggle** | ✅ PASS | Clicking cat smoothly opens and closes the floating task panel. |
| 11 | **Cat dragging** | ✅ PASS | Cat is draggable across displays; distinguishes drags from clicks cleanly. |
| 12 | **Window boundary clamping** | ✅ PASS | Panel calculates available screen work area and positions near cat without overflowing screen edges. |
| 13 | **Non-intrusive desktop usage** | ✅ PASS | Cat window is compact (190×190) with no invisible hitboxes blocking background applications. |
| 14 | **Build and launch** | ✅ PASS | Verified with `npm run build` and `scripts/test-electron-launch.js`. |

---

## 📁 7. Project Structure

```
CatTask/
├── dist/                          # Compiled production bundles
│   ├── main/                      # Compiled Electron main process
│   ├── preload/                   # Compiled preload script
│   └── renderer/                  # Compiled React Vite SPA
├── scripts/
│   ├── dev-electron.js            # Dev runner bridging Vite and Electron
│   ├── test-storage.js            # Automated functional & persistence test suite
│   └── test-electron-launch.js    # Electron launch & window verification runner
├── src/
│   ├── main/
│   │   ├── main.ts                # Main Electron process, window management & IPC
│   │   └── taskStorage.ts         # Persistent atomic JSON storage engine
│   ├── preload/
│   │   └── preload.ts             # Secure contextBridge API definition
│   ├── renderer/
│   │   ├── components/
│   │   │   ├── CatCompanion.tsx   # Animated vector SVG cat companion & states
│   │   │   ├── TaskPanel.tsx      # Floating to-do management panel
│   │   │   ├── TaskInput.tsx      # Task creation form & validation
│   │   │   ├── TaskItem.tsx       # Individual task row with checkbox & delete
│   │   │   ├── TaskFilters.tsx    # All / Active / Done tab selector
│   │   │   └── TaskProgress.tsx   # Progress bar & task counter display
│   │   ├── styles/
│   │   │   ├── cat.css            # Companion styling, keyframes & particle animations
│   │   │   └── taskPanel.css      # Warm cozy pastel panel styling
│   │   ├── utils/
│   │   │   └── sound.ts           # Web Audio API sound synthesizer
│   │   ├── App.tsx                # Hash-based view router (cat / panel)
│   │   └── main.tsx               # React DOM bootstrap
│   └── types/
│       └── todo.ts                # Shared TypeScript models & IPC contracts
├── index.html                     # HTML root template
├── package.json                   # Dependencies, build scripts & metadata
├── tsconfig.json                  # TypeScript config for Vite renderer
├── tsconfig.electron.json         # TypeScript config for Electron backend
└── README.md                      # Project documentation
```

---

## 💡 8. Future Roadmap

- 🏷️ **Task Tags & Priorities:** Visual badges for High / Medium / Low urgency.
- ⏰ **Gentle Reminders:** Companion meows or nudges when a pending task has been active for a set duration.
- 🎨 **Cat Customization:** Multiple coat colorways (Calico, Tuxedo, Midnight Black, and Siamese).
- 🍅 **Pomodoro Mode:** Cat sleeps during focus intervals and celebrates during breaks.

---

*Developed with ❤️ using Google AI Studio, Google Stitch, and Google Antigravity.*
