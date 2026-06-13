# SkillSync AI 🚀
### AI-Powered Career Intelligence · Resume Parsing · Video-Guarded Mock Interview Simulator · Interactive Job Matching

SkillSync AI is a premium, privacy-focused career intelligence platform designed to bridge the gap between "skills listed" on a resume and "skills proven" in assessments. By utilizing local processing, client-side browser telemetry, and efficient LLM reasoning, SkillSync AI offers a low-cost, high-impact career development journey.

---

## 🌟 Key Features

### 1. 📹 Video-Guarded AI Mock Interview Simulator
An advanced client-side behavioral and technical mock interview panel featuring real-time telemetry tracking:
* **Interactive AI Terminal**: Practice natural-language technical mock interviews via a custom simulated terminal.
* **Client-Side Eye & Gaze Tracking**: Powered by **MediaPipe Face Landmarker**, the app analyzes eye movement, face presence, and blink rates locally in the browser to compute screen focus.
* **Voice Activity Detection**: Utilizes the **Web Audio API** to capture speech-to-silence ratios and voice amplitude without uploading audio data.
* **Anti-Distraction Monitor**: Tracks browser tab switches and window blur events to calculate tab focus scores.
* **Live Developer Diagnostics**: Includes a real-time hardware tracking panel overlay showing stream status, track health, device label, video element readyState, and playback error logs for easy troubleshooting.
* **Composite Readiness Reports**: Generates deep-dive scorecards blending technical correctness, speech style, screen presence, and attention metrics.

### 2. 🔍 Job Search & ATS Resume Matcher
Bridge the gap between your profile and live job markets:
* **Live Job Board**: Search real-time career opportunities directly from the application workspace.
* **ATS Job Description Matcher**: Copy-paste any job description and compare it against your uploaded resume.
* **Keyword Gap Analysis**: The engine parses your profile and the target role description, identifying missing keywords, critical match scores, and formatting improvements.
* **Resume Optimizer**: Suggests concrete bullet points, active verbs, and structural improvements to optimize ATS parsers.

### 3. 🗺️ Dynamic 30-Day Learning Roadmap
A custom structured study plan to help you bridge your technical skill gaps:
* **Personalized Timeline**: Tailored week-by-week checkpoints based on your assessments.
* **Real Resources & Projects**: Features specific online resource links, reading materials, and hands-on project ideas.
* **MongoDB Roadmaps Cache**: Uses a database cache manager to prevent duplicate API generation, leading to instant reloads.

### 4. 🧠 Token & Cost Optimization
* **93% Token Reduction**: Employs a custom token compressor that shrinks raw resumes and job description data, bringing costs down to **~₹0.15 per user session** using Groq LLM API.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js (Vite) · Framer Motion (Animations) · Recharts · Lucide Icons |
| **Telemetry / AI Vision** | Google MediaPipe Face Landmarker (WebAssembly) · Web Audio API |
| **Styling** | Vanilla CSS · Curated harmonized CSS variables (Dark/Light Modes) |
| **Backend** | Node.js · Express.js |
| **Database** | MongoDB Atlas / In-Memory Fallback |
| **AI Layer** | Groq API (`llama-3.3-70b-versatile`) |
| **PDF Parsing** | pdf-parse |

---

## 🚀 Quick Start

### Prerequisites
* **Node.js** (v18+)
* **Groq API Key** (Get one at [console.groq.com](https://console.groq.com))
* **MongoDB Atlas Connection URI** (Fallback to in-memory datasets is automatically enabled if disconnected)

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the environment template:
   ```bash
   copy .env.example .env
   ```
3. Edit `.env` and enter your API keys:
   ```env
   PORT=5000
   GROQ_API_KEY=your_groq_api_key_here
   MONGODB_URI=your_mongodb_atlas_uri_here
   JWT_SECRET=your_jwt_signing_secret_here
   ```
4. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```
   *Backend runs on:* `http://localhost:5000`

---

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   *Frontend runs on:* `http://localhost:5173`

---

## 📁 Repository Structure

```
SkillSync_AI/
├── backend/
│   ├── data/
│   │   └── roleDatasets.json        # Pre-loaded baseline datasets for skill comparison
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT access gatekeeper
│   │   └── rateLimitMiddleware.js   # Local request limits
│   ├── models/
│   │   ├── User.js                  # User profile and session schema
│   │   └── QuizResult.js            # Skill assessment scores
│   ├── routes/
│   │   ├── auth.js                  # Signup, login, and token refresh
│   │   ├── upload.js                # Resume processing (pdf-parse)
│   │   ├── quiz.js                  # Dynamic AI questions generation
│   │   ├── simulate.js              # Career scenario mockups
│   │   ├── roadmap.js               # Structured 30-day roadmap builder
│   │   └── session.js               # Global session state persistence
│   └── server.js                    # Express application entrypoint
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ATSJobMatcher.jsx        # ATS scan comparison interface
    │   │   ├── ATSResumeOptimizer.jsx   # Profile optimization suggestions
    │   │   ├── InterviewSimulator.jsx   # Live webcam telemetry simulator
    │   │   ├── LiveJobBoard.jsx         # Search and save live jobs board
    │   │   └── QuizEngine.jsx           # Assessment engine
    │   ├── pages/
    │   │   ├── LandingPage.jsx          # Feature directory & role hub
    │   │   ├── ResultsPage.jsx          # Roadmap dashboard & assessment timeline
    │   │   └── UploadPage.jsx           # Resume onboarding console
    │   ├── context/
    │   │   ├── AppContext.jsx           # Global state (resets, auth, session tracking)
    │   │   └── ThemeContext.jsx         # Aesthetic toggles
    │   └── lib/
    │       └── api.js                   # Axios interceptors & backend API client
```

---

## 💰 Cost Analysis (Per User Session)

| Action | Execution Method | Token Count | Cost (INR) |
|---|---|---|---|
| **Onboarding PDF Parse** | Local (Client/Server CPU) | 0 | ₹0.00 |
| **ATS Profile Extract** | Groq AI Service | ~600 | ~₹0.04 |
| **Baseline Gap Match** | Local JS Algorithms | 0 | ₹0.00 |
| **Interactive Assessment** | Groq AI Service | ~800 | ~₹0.05 |
| **Interview Simulator** | MediaPipe (Local WASM) | 0 | ₹0.00 |
| **Career Sim Scenario** | Groq AI Service | ~600 | ~₹0.04 |
| **30-Day Roadmap** | Groq AI + MongoDB Cache | ~500 | ~₹0.03 |
| **Total Session Cost** | | **~2,500** | **~₹0.15** |

---

*SkillSync AI · Premium Career Intelligence Platform*
