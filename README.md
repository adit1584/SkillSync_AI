# SkillSync AI 🚀
### AI-Powered Skill Gap Analyzer · Resume Intelligence · Career Simulator

> *"Bridging the Gap Between Skills Listed and Skills Proven"*
> 
> **Team DevForge · LNCT Group of Colleges**

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Resume Analysis** | AI extracts skills, projects, certifications from PDF |
| 🎯 **Skill Gap Analysis** | Local matching — zero AI cost |
| 🧠 **Adaptive Quiz** ⭐ | 15 AI-generated MCQs tuned to your experience level |
| 🚀 **Career Simulation** | 3 paths: Accelerated / Steady / Pivot with LPA salary data |
| 🗺️ **Learning Roadmap** | Week-by-week plan with real resources & projects |
| ⚡ **Token Optimization** | 93% token reduction — ~₹0.15 per user session |

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React.js (Vite) · Framer Motion · Recharts |
| Styling | Vanilla CSS · Dark/Light Mode |
| Backend | Node.js · Express.js |
| AI Layer | Groq API (llama-3.3-70b-versatile) |
| Database | MongoDB Atlas |
| PDF Parsing | pdf-parse |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Groq API key → [console.groq.com](https://console.groq.com)
- MongoDB Atlas URI → [cloud.mongodb.com](https://cloud.mongodb.com)

### 1. Setup Backend

```bash
cd backend
copy .env.example .env
# Edit .env and fill in GROQ_API_KEY and MONGODB_URI
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## 📁 Project Structure

```
SkillSync AI/
├── backend/
│   ├── data/
│   │   └── roleDatasets.json       # 4 role skill datasets
│   ├── services/
│   │   ├── pdfParser.js            # PDF text extraction
│   │   ├── skillMatcher.js         # Local gap analysis (0 tokens)
│   │   ├── tokenCompressor.js      # 93% token reduction
│   │   ├── cacheManager.js         # MongoDB roadmap cache
│   │   └── aiService.js            # Groq API wrapper
│   ├── models/
│   │   ├── User.js                 # Session model
│   │   └── QuizResult.js           # Quiz scores model
│   ├── routes/
│   │   ├── upload.js               # POST /api/upload
│   │   ├── quiz.js                 # POST /api/quiz/generate|submit
│   │   ├── simulate.js             # POST /api/simulate
│   │   └── roadmap.js              # POST /api/roadmap
│   ├── server.js
│   └── .env                        # YOUR KEYS GO HERE
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ResumeUploader.jsx
        │   ├── QuizEngine.jsx       ⭐
        │   ├── SkillRadarChart.jsx
        │   ├── RoadmapTimeline.jsx
        │   └── CareerDashboard.jsx
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── UploadPage.jsx
        │   ├── QuizPage.jsx         ⭐
        │   └── ResultsPage.jsx
        ├── context/
        │   ├── ThemeContext.jsx
        │   └── AppContext.jsx
        └── lib/
            └── api.js
```

---

## 🎯 Target Roles

- **Frontend Developer** — React, JS, TypeScript, Next.js, Redux
- **Backend Engineer** — Node.js, Python, SQL, MongoDB, Express.js
- **Fullstack Developer** — React, Node.js, SQL, MongoDB, TypeScript
- **AI Engineer** — Python, PyTorch, LLMs, LangChain, FastAPI
- **Data Analyst** — SQL, Power BI, Python, Tableau, Statistics
- **Cloud Engineer** — AWS, GCP, Docker, Kubernetes, Terraform
- **DevOps Engineer** — Docker, Kubernetes, CI/CD, Linux, Terraform

---

## 💰 Cost Per User Session

| Operation | Method | Tokens | Cost |
|-----------|--------|--------|------|
| PDF Parsing | Local pdf-parse | 0 | ₹0 |
| Skill Extraction | Groq AI | ~600 | ~₹0.04 |
| Skill Matching | Local JS | 0 | ₹0 |
| Quiz Generation | Groq AI | ~800 | ~₹0.05 |
| Quiz Scoring | Local JS | 0 | ₹0 |
| Career Simulation | Groq AI | ~600 | ~₹0.04 |
| Roadmap | Groq AI + Cache | ~500 | ~₹0.03 |
| **Total** | | **~2,500** | **~₹0.15** |

---

*SkillSync AI · Team DevForge*
