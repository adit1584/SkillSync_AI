# SkillSync AI — Frontend Documentation

> Detailed technical reference for the React + Vite frontend of the SkillSync AI platform.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Directory Structure](#directory-structure)
4. [Routing](#routing)
5. [Pages](#pages)
6. [Components](#components)
7. [State Management & Context](#state-management--context)
8. [API Client](#api-client)
9. [Design System](#design-system)
10. [Dark / Light Mode](#dark--light-mode)
11. [PDF Export](#pdf-export)
12. [Getting Started](#getting-started)
13. [Environment Variables](#environment-variables)
14. [Scripts](#scripts)

---

## Overview

The SkillSync AI frontend is a premium single-page application (SPA) built with **React 19** and **Vite 8**. It consumes the SkillSync AI REST API and renders a full career intelligence experience:

- Drag-and-drop resume upload
- AI-powered skill gap analysis with radar charts
- Adaptive MCQ quiz engine
- Career simulation dashboards
- Phase-based learning roadmaps with progress tracking
- Curated course recommendations
- Real-time AI mock interview terminal
- ATS resume optimizer with copyable bullet points
- One-click printable PDF report

---

## Tech Stack

| Library | Version | Role |
|---|---|---|
| **React** | 19.x | UI framework |
| **Vite** | 8.x | Dev server & bundler |
| **React Router DOM** | 7.x | Client-side routing |
| **Framer Motion** | 12.x | Page & element animations |
| **GSAP** | 3.x | Scroll-triggered entrance animations |
| **Recharts** | 3.x | Radar & bar charts |
| **Lucide React** | 1.x | SVG icon library |
| **Axios** | 1.x | HTTP client |
| **React Dropzone** | 15.x | File drag-and-drop |
| **Vanilla CSS** | — | Custom design system (no Tailwind) |

---

## Directory Structure

```
frontend/
├── public/                   # Static public assets
├── src/
│   ├── assets/               # Logos, images, SVGs
│   │
│   ├── components/           # Reusable feature components
│   │   ├── ATSResumeOptimizer.jsx    # Resume bullet optimizer UI
│   │   ├── CareerDashboard.jsx       # Simulation overview cards
│   │   ├── CourseRecommendations.jsx # Course cards grid
│   │   ├── InterviewSimulator.jsx    # Chat-based mock interview
│   │   ├── Navbar.jsx                # Fixed top nav + theme toggle
│   │   ├── QuizEngine.jsx            # MCQ quiz renderer
│   │   ├── ResumeUploader.jsx        # Drag-and-drop file upload
│   │   ├── RoadmapTimeline.jsx       # Phase roadmap with checkboxes
│   │   └── SkillRadarChart.jsx       # Recharts radar chart
│   │
│   ├── context/
│   │   ├── ThemeContext.jsx          # Global dark/light theme state
│   │   └── AppContext.jsx            # Global session state (sessionId, etc.)
│   │
│   ├── lib/
│   │   └── api.js                    # All Axios API call functions
│   │
│   ├── pages/                # Route-level page components
│   │   ├── LandingPage.jsx           # Hero / marketing page
│   │   ├── UploadPage.jsx            # Resume upload + role select
│   │   ├── QuizPage.jsx              # Adaptive quiz flow
│   │   └── ResultsPage.jsx           # 6-tab results dashboard
│   │
│   ├── App.jsx               # Root: providers + router + routes
│   ├── index.css             # Global CSS variables & design system
│   └── main.jsx              # React DOM entry point
│
├── index.html                # HTML shell with meta/title
├── vite.config.js            # Vite config + /api proxy
├── eslint.config.js          # ESLint rules
├── package.json
└── .env                      # Local env vars (not committed)
```

---

## Routing

Defined in [`App.jsx`](./frontend/src/App.jsx). All routes are wrapped in `ThemeProvider` and `AppProvider`.

| Path | Component | Description |
|---|---|---|
| `/` | `LandingPage` | Hero landing with features & CTA |
| `/upload` | `UploadPage` | Resume upload + target role selection |
| `/quiz` | `QuizPage` | AI-generated adaptive quiz |
| `/results` | `ResultsPage` | Full 6-tab career results dashboard |

---

## Pages

### `LandingPage.jsx`
The entry marketing page. Features:
- Animated hero headline with gradient text
- Feature card grid (6 feature highlights)
- Testimonial / stats section
- Prominent CTA button → `/upload`
- GSAP scroll-triggered entrance animations on cards

### `UploadPage.jsx`
The resume intake page. Features:
- **Drag-and-drop zone** (React Dropzone) accepting PDF and DOCX
- **Target role selector** with 30+ engineering, data, design, and product roles organised by category
- Upload progress feedback with animated state steps
- On success → stores `session_id` in context → navigates to `/quiz`

### `QuizPage.jsx`
Adaptive skill verification quiz. Features:
- Fetches AI-generated MCQ questions via `generateQuiz(sessionId)`
- Renders questions one-by-one with animated transitions
- Allows answer changes before advancing
- No timer (unlimited pace)
- Submits all answers via `submitQuiz()` → navigates to `/results`

### `ResultsPage.jsx`
The main career intelligence dashboard. Features:
- **6 navigable tabs** (Overview · Simulation · Roadmap · Courses · AI Interview · Optimizer)
- **Download PDF** button: concurrently fetches all tab data, waits 500 ms, then calls `window.print()`
- All tab components exist in the DOM simultaneously (CSS `display` toggling, not conditional rendering) to enable complete PDF capture

---

## Components

### `Navbar.jsx`
Fixed top navigation bar.
- Logo with gradient icon
- Navigation links (Home, Upload)
- **Dark / Light theme toggle** (sun/moon icon)
- Hides during print via `.print-hide` class

---

### `ResumeUploader.jsx`
Drag-and-drop file upload widget.
- Validates file type (`.pdf`, `.docx`)
- Validates file size (max 5 MB)
- Animated border on drag-over
- Shows selected file name and size
- Calls `uploadResume(file, targetRole)` from `api.js`

---

### `CareerDashboard.jsx`
Career simulation overview panel.
- Match score ring / progress indicator
- 3 career path cards (Accelerated / Steady / Pivot) with LPA salary projections
- Interview readiness score bar
- Skill gap count summary
- Renders the `SkillRadarChart` sub-component

---

### `SkillRadarChart.jsx`
Recharts `RadarChart` showing skill coverage across detected domains.
- Responsive container
- Custom tooltip
- Terracotta / brand color fill

---

### `RoadmapTimeline.jsx`
Phase-by-phase interactive learning timeline.
- Vertical timeline layout with animated phase cards
- Each phase contains: title, duration, skill focus, milestones, resources, and project task
- **Checkbox progress tracking** — saved to `localStorage` keyed by `sessionId`
- Overall progress bar showing % of tasks completed

---

### `CourseRecommendations.jsx`
Grid of curated course recommendation cards.
- Platform badge (Coursera, Udemy, YouTube, etc.) with colour coding
- Gap type badge: `Missing Skill` (red) or `Weak Skill` (amber)
- Difficulty level indicator
- Estimated duration
- External link button

---

### `InterviewSimulator.jsx`
Real-time AI mock interview terminal.
- Terminal-style monospace UI with animated chat bubbles
- Calls `startInterview(sessionId)` on mount to get greeting + first question
- User types answers, sends via `chatInterview(sessionId, message)`
- Conversation history rendered with role-based bubble styling (interviewer vs. candidate)
- Auto-concludes after 5 exchanges (10 history entries) or when AI signals conclusion
- **Scorecard screen** on conclusion: Overall Score, Technical Depth, Communication (% bars), Strengths list, Improvements list, and Feedback Summary
- "Restart Mock Interview" button resets the session

---

### `QuizEngine.jsx`
MCQ quiz renderer used inside `QuizPage`.
- Animated question slide transitions (Framer Motion)
- Option selection with visual highlight
- Tracks selected answers per question index
- Submit triggers `submitQuiz()` and navigates to results

---

### `ATSResumeOptimizer.jsx`
ATS resume bullet point optimizer.
- Fetches suggestions via `optimizeResume(sessionId)`
- Side-by-side display: original generic bullet → AI-optimized bullet
- One-click copy to clipboard with toast confirmation
- Skill tag for each suggestion

---

## State Management & Context

### `ThemeContext.jsx`
Provides `theme` (`'light'` | `'dark'`) and `toggleTheme()` globally.

- Sets `data-theme="dark"` on `<html>` to activate the dark CSS variable set
- Persists preference in `localStorage`

### `AppContext.jsx`
Provides shared session state across pages:

| Value | Type | Description |
|---|---|---|
| `sessionId` | `string` | Backend session ID from upload |
| `setSessionId` | `fn` | Update session after upload |
| `targetRole` | `string` | Selected target career role |
| `setTargetRole` | `fn` | Update from UploadPage |

---

## API Client

All HTTP calls are in [`src/lib/api.js`](./frontend/src/lib/api.js).

Base URL resolves from `VITE_API_URL` env var, falling back to `http://localhost:5000/api`.

Axios instance is configured with a **60-second timeout** to handle long-running AI calls.

### Functions

```js
uploadResume(file, targetRole)      // POST /api/upload
generateQuiz(sessionId)             // POST /api/quiz/generate
submitQuiz(sessionId, quizId, ...)  // POST /api/quiz/submit
simulateCareer(sessionId)           // POST /api/simulate
generateRoadmap(sessionId, hours)   // POST /api/roadmap
startInterview(sessionId)           // POST /api/interview/start
chatInterview(sessionId, message)   // POST /api/interview/chat
optimizeResume(sessionId)           // POST /api/optimize
recommendCourses(sessionId)         // POST /api/courses
checkHealth()                       // GET  /api/health
```

---

## Design System

All design tokens live in [`src/index.css`](./frontend/src/index.css) as CSS custom properties.

### Color Variables

```css
/* ── Light Mode (default) ── */
--primary:          #C2714F;   /* Terracotta */
--primary-dark:     #A0522D;
--accent:           #8B4513;   /* Warm brown */
--bg-primary:       #FAF6F0;   /* Warm sand */
--bg-secondary:     #F5EFE6;
--bg-card:          #FFFFFF;
--text-primary:     #2D1810;   /* Deep brown */
--text-secondary:   #6B4C3B;
--border:           #E8DDD4;

/* ── Dark Mode [data-theme="dark"] ── */
--bg-primary:       #121212;   /* Material light-black */
--bg-secondary:     #1E1E1E;
--bg-card:          #252525;
--text-primary:     #F0EAE0;
--text-secondary:   #B8A99A;
--border:           #3A2E28;
--primary:          #D4845A;   /* Brighter terracotta for dark bg */
```

### Typography

| Token | Font | Usage |
|---|---|---|
| Headings | **Space Grotesk** | `h1`–`h4`, scorecard numbers |
| Body | **Inter** | All body copy, labels |
| Terminal / Code | **JetBrains Mono** | Interview simulator chat |

All fonts loaded from Google Fonts CDN via `index.html`.

### Utility Classes

| Class | Effect |
|---|---|
| `.btn.btn-primary` | Terracotta CTA button with hover lift |
| `.btn.btn-secondary` | Ghost/outline button |
| `.card` | Rounded card with `--bg-card` background and border |
| `.badge` | Inline pill label |
| `.print-hide` | Hidden during `@media print` |
| `.print-show-block` | Visible only during `@media print` |

---

## Dark / Light Mode

Theme is toggled via the **Navbar switch**, which calls `toggleTheme()` from `ThemeContext`.

The context applies `document.documentElement.setAttribute('data-theme', 'dark')`, activating the `[data-theme="dark"]` CSS variable block in `index.css`.

The preference is persisted in `localStorage` under the key `skillsync-theme`.

---

## PDF Export

Clicking **"Download PDF"** on the Results page triggers `handleDownloadReport()`:

1. Concurrently calls `simulateCareer`, `generateRoadmap`, `recommendCourses`, and `optimizeResume` to prefetch all tab data.
2. Waits 500 ms for React to render all sections.
3. Calls `window.print()`.

The `@media print` block in `index.css`:
- Hides `.print-hide` elements (Navbar, tab bar, download button, footer).
- Forces all tab sections to `display: block` regardless of active tab.
- Applies `print-color-adjust: exact` so background colors and charts print correctly.
- Adds clean page breaks between sections.

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** 9+
- Backend running on `http://localhost:5000`

### Install & Run

```bash
cd frontend
npm install
npm run dev
```

App available at **[http://localhost:3000](http://localhost:3000)**

> The Vite dev server automatically proxies `/api/*` → `http://localhost:5000` — no CORS setup needed.

---

## Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ Never commit `.env`. It is listed in `.gitignore`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 3000 with HMR |
| `npm run build` | Compile production bundle → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint on all source files |

---

*SkillSync AI · Team DevForge · LNCT Group of Colleges*
