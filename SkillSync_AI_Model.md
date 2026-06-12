# SkillSync AI
### AI-Powered Skill Gap Analyzer · Resume Intelligence · Career Simulator
**Team:** DevForge | **Theme:** Smart Education
**PS Category:** Software | **PS Title:** Skill Gap Analyzer from Resume + Target Role

---

## The Problem

Students face significant hurdles in their career journey:

- Learning random skills without a clear goal
- Lack of definitive career direction
- Uncertainty regarding industry expectations
- Difficulty in tracking placement readiness

There is no platform that verifies claimed skills, simulates career paths based on *validated* skills, or generates structured roadmaps from real skill gaps.

---

## Proposed Solution

SkillSync AI is an AI-powered platform designed to bridge the skill gap through six core capabilities:

- **Resume Analysis** — Deep scans for current proficiency
- **Gap Identification** — Pinpoints missing skills for target roles
- **Personalized Roadmaps** — Customized AI-generated learning paths
- **AI Skill Verification** — Adaptive quizzes based on resume-listed skills ⭐
- **Career Prediction** — Forecasts growth and role suitability
- **Token Optimization** — Faster processing and scalable architecture

---

## Tech Stack

**Frontend:** React.js / Vite · Vanilla CSS · Framer Motion · Recharts

**Backend:** Native Node.js (Pure `http` module, no Express/Multer, custom binary multipart parser)

**AI Layer:** Groq API (primary) · Gemini API (fallback)

**Resume Processing:** PDF Parser (Stable v1.1.1 function)

**Skill Matching Engine:** Predefined role datasets · Local comparison logic · ATS scoring

**Database:** MongoDB Atlas (Optional) with persistent JSON sessions fallback

**Optimization Layer:** Hybrid AI Architecture · Token Compression · Cached AI Responses

**Deployment:** Vercel (frontend) · Render / Railway (backend)

---

## End-to-End Process Flow

```
1. USER INPUT
   Upload Resume (PDF) + Select Target Role (e.g. AI Engineer)
            │
            ▼
2. RESUME PROCESSING
   PDF Parsing + OCR → Structured JSON
   Extracted Sections: Skills · Projects · Experience · Education · Certifications
            │
            ▼
3. SKILL EXTRACTION (NLP)
   Extract: Technical Skills · Soft Skills · Tools & Frameworks
            Roles & Experience · Projects & Domains
   Output: Structured Profile (Key Entities)
            │
            ▼
4. SKILL MATCHING ENGINE                        ← LOCAL (No AI cost)
   Compare with Target Role Requirements
   Output: Match Score · Matched Skills · Missing Skills (Gap)
           Strengths · Improvement Areas
            │
            ▼
5. ADAPTIVE SKILL VERIFICATION QUIZ ⭐          ← AI CALL #1
   AI-generated MCQs per resume-listed skill
   → Skill Validation Score computed locally
            │
            ▼
6. CAREER SIMULATION ENGINE                     ← AI CALL #2
   Simulate Future Outcomes: Salary · Growth · Readiness · Interview Chance
   Predict Career Impact After Learning Missing Skills
   Simulations: Salary Projection · Growth Trajectory
                Role Transition Time · Interview Readiness
            │
            ▼
7. AI INSIGHTS & ROADMAP GENERATION             ← AI CALL #3 (cached)
   Generate Personalized Learning Roadmap
   Roadmap Includes: Skill-wise Learning Path · Recommended Resources
                     Projects to Build · Practice Problems · Timeline & Priority
            │
            ▼
8. OUTPUT DASHBOARD
   Skill Gap Report · Match Score · AI Roadmap
   Career Simulation · ROI of Learning · Learning Timeline
   Visual Insights: Graphs & Charts · Progress Tracker
                    Comparison View · Actionable Steps
```

---

## Token Optimization Architecture

The core financial innovation — 93% token reduction by doing all parsing, matching, and scoring locally.

```
TOKEN OPTIMIZATION STRATEGY
────────────────────────────────────────────────────────────────

1. Structured Data Extraction
   Convert resume to compact JSON before any AI call

2. Hybrid AI Architecture
   AI used only for high-value tasks (quiz · roadmap · simulation)

3. Predefined Role Databases
   Local role & skill datasets — no AI needed for matching

4. Cached Recommendations
   Reuse common AI responses via MongoDB hash cache

5. Smart Prompt Engineering
   Minimal, focused, context-rich prompts

FLOW:
─────────────────────────────────────────────────────────────────
INPUT OPTIMIZATION    → Remove redundant text, headers, footers
                         Result: Smaller, clean input → Fewer tokens

DATA COMPRESSION      → Convert to structured JSON (minimal tokens)
                         Result: Reduced size of input payload

SMART AI CALLING      → Send only necessary context to AI
                         Result: Lower tokens per request

RESPONSE CACHING      → Cache common roadmaps & recommendations
                         Result: Avoid repeated AI calls

LOCAL PROCESSING      → Skill matching, scoring & analytics done locally
                         Result: No tokens used for calculations

OUTCOME:
  ✅ 80–90% Token Reduction
  ✅ Faster Response Time
  ✅ Lower API Cost
  ✅ Scalable Architecture
```

---

## Feasibility & Viability

**Feasibility**
- Hybrid AI architecture for scalable processing
- Token-optimized AI workflow for low API cost (~$0.002 per user)
- Real-time personalized career analysis
- AI-based future career simulation
- Dynamic quiz generation using detected resume skills and AI prompts ⭐

**Challenges & Solutions**

| Challenge | Solution |
|-----------|----------|
| Resume Formatting Variability | NLP + predefined skill database handles varied layouts |
| High Token Usage | Hybrid AI — only 3 targeted AI calls per user session |
| Accurate Skill Scoring | Role-based structured datasets ensure precise matching |

**Scalability — Can evolve into:**
- AI Career Copilot
- Placement Intelligence Platform
- Enterprise Hiring Assistant
- EdTech SaaS Product

---

## Impact & Benefits

**Target Audience:** Students · Colleges · Recruiters

**For Students**
- Personalized career guidance
- Faster placement preparation
- Clear learning direction
- Better resume optimization
- Validates actual proficiency behind resume-listed skills ⭐

**For Colleges**
- Placement analytics dashboard
- Student skill tracking at scale
- Industry alignment insights
- Data-driven curriculum planning

**For Recruiters**
- Skill-based candidate filtering
- Better pre-screened candidate evaluation
- Verified quiz scores on candidate profiles
- Reduces first-round interview overhead

**Social & Economic Impact**
- Reduces skill mismatch in the job market
- Improves employability of fresh graduates
- Supports data-driven learning in institutions
- Bridges the education–industry gap

**Future Scope**
- AI Mock Interviews
- GitHub / LinkedIn Profile Analysis
- Live Job Market Integration
- Real-time Skill Trends
- Personalized AI Career Mentor

---

## Research & References

**Research Platforms**
- LinkedIn — Job market & skill demand data
- Internshala — Internship skill trends
- Naukri — Role-based skill requirements
- Coursera — Learning path benchmarks
- Resume ATS Systems — ATS scoring standards

**Tech References (AI & NLP)**
- Groq API — Ultra-fast LLM inference
- Gemini API — AI & NLP fallback
- PDF.js + Tesseract.js — Resume text extraction & OCR
- React.js / Next.js — Frontend framework

**Datasets & Role Analysis**
- Frontend Developer → React, JS, CSS, REST APIs
- AI Engineer → Python, ML, PyTorch, LLMs
- Data Analyst → SQL, Power BI, Python, Statistics
- Cloud Engineer → AWS, GCP, Docker, Kubernetes

---

## Project File Structure

```
skillsync-ai/
├── frontend/                        # Next.js
│   ├── components/
│   │   ├── ResumeUploader.jsx
│   │   ├── QuizEngine.jsx           ⭐
│   │   ├── CareerDashboard.jsx
│   │   ├── SkillRadarChart.jsx
│   │   └── RoadmapTimeline.jsx
│   ├── pages/
│   │   ├── index.jsx
│   │   ├── quiz.jsx                 ⭐
│   │   └── results.jsx
│
├── backend/                         # Node.js + Express
│   ├── routes/
│   │   ├── upload.js
│   │   ├── quiz.js                  ⭐
│   │   ├── simulate.js
│   │   └── roadmap.js
│   ├── services/
│   │   ├── pdfParser.js
│   │   ├── skillMatcher.js          # Local — zero AI cost
│   │   ├── tokenCompressor.js       # 93% token reduction
│   │   ├── cacheManager.js          # MongoDB hash cache
│   │   └── aiService.js             # Groq / Gemini wrapper
│   ├── data/
│   │   └── roleDatasets.json        # Predefined skill sets
│   └── models/
│       ├── User.js
│       └── QuizResult.js            ⭐
```

---

---

# Master Prompt — SkillSync AI Model

> This is the complete prompt system for building and running SkillSync AI. Copy each section into the appropriate AI call in your backend.

---

## SYSTEM IDENTITY PROMPT
*(Used as the base system prompt for all SkillSync AI API calls)*

```
You are SkillSync AI, an intelligent career acceleration engine built for students and freshers.

Your role is to:
1. Analyze resumes and extract structured skill data
2. Identify skill gaps vs. a target role
3. Generate adaptive quizzes to verify actual skill proficiency
4. Simulate future career paths based on validated skills
5. Build personalized, week-by-week learning roadmaps

Behavior rules:
- Always respond in strict JSON unless told otherwise
- Be technically precise — no vague advice
- Adapt difficulty based on the user's experience level
- Prioritize recommendations by career ROI
- Never fabricate skill requirements — use only the role dataset provided
- Keep all outputs concise and structured for dashboard rendering
```

---

## PROMPT 1 — Resume Skill Extraction

**When called:** After PDF parsing, before local skill matching.
**Input:** Raw resume text
**Output:** Structured JSON

```
SYSTEM:
You are a resume parser and skill extractor. Extract all structured information
from the resume text below. Be thorough and precise.

USER:
Resume text:
"""
{raw_resume_text}
"""

Extract and return ONLY this JSON structure — no explanation, no markdown:

{
  "name": "",
  "email": "",
  "phone": "",
  "experience_level": "fresher | junior | mid | senior",
  "education": [
    { "degree": "", "institution": "", "year": "" }
  ],
  "experience": [
    { "role": "", "company": "", "duration": "", "description": "" }
  ],
  "technical_skills": [],
  "soft_skills": [],
  "tools_and_frameworks": [],
  "projects": [
    { "name": "", "tech_stack": [], "description": "" }
  ],
  "certifications": [],
  "domains": []
}
```

---

## PROMPT 2 — Skill Gap Analysis
*(This runs LOCALLY using predefined role datasets — no AI call needed)*

```javascript
// Local skill matching — zero tokens
function analyzeSkillGap(userSkills, targetRole, roleDatasets) {
  const required = roleDatasets[targetRole].required_skills;
  const nice     = roleDatasets[targetRole].nice_to_have;

  const matched  = required.filter(s => userSkills.includes(s));
  const missing  = required.filter(s => !userSkills.includes(s));
  const score    = Math.round((matched.length / required.length) * 100);

  return { match_score: score, matched_skills: matched,
           missing_skills: missing, nice_to_have_gaps: nice.filter(s => !userSkills.includes(s)) };
}
```

---

## PROMPT 3 — Adaptive Skill Verification Quiz ⭐

**When called:** After skill gap analysis, before career simulation.
**Input:** Compressed skill summary (~300 tokens, not full resume)
**Output:** Quiz JSON

```
SYSTEM:
You are an expert technical interviewer. Generate an adaptive multiple-choice quiz
to verify practical knowledge of resume-listed skills.
Rules:
- Questions must test PRACTICAL understanding, not just definitions
- Scale difficulty to experience_level:
    fresher  → conceptual + basic application
    junior   → implementation + common errors
    mid      → debugging + architecture trade-offs
    senior   → system design + performance optimization
- 1 correct answer + 3 plausible wrong answers per question
- Tag every question with skill, difficulty, and topic
- Output ONLY valid JSON — no explanation, no markdown fences

USER:
Skills to test: {top_3_skills_from_resume}
Target Role: {target_role}
Experience Level: {experience_level}

Generate 5 questions per skill (15 questions total).

Return ONLY this JSON:
{
  "quiz_id": "{uuid}",
  "target_role": "",
  "experience_level": "",
  "questions": [
    {
      "id": 1,
      "skill": "",
      "difficulty": "easy | medium | hard",
      "topic": "",
      "question": "",
      "options": {
        "A": "",
        "B": "",
        "C": "",
        "D": ""
      },
      "correct": "A | B | C | D",
      "explanation": ""
    }
  ]
}
```

---

## PROMPT 4 — Career Simulation Engine

**When called:** After quiz scoring.
**Input:** Validated skill scores + ATS score
**Output:** 3 career path scenarios

```
SYSTEM:
You are a senior career strategist with deep expertise in tech hiring and career
trajectory modeling. Generate realistic, data-driven career simulations.
Be specific. Use real role titles, real timelines, real salary ranges.
Output ONLY valid JSON.

USER:
Candidate Profile:
- Validated Skills (with quiz scores): {validated_skills_json}
  Example: [{"skill":"React.js","score":72},{"skill":"Node.js","score":58}]
- Missing Skills: {missing_skills}
- ATS Match Score: {ats_score}%
- Quiz Performance: {overall_quiz_percent}%
- Target Role: {target_role}
- Experience Level: {experience_level}

Generate exactly 3 career simulation paths:
1. ACCELERATED — aggressive upskilling, 6–12 months
2. STEADY — organic growth, 1–2 years
3. PIVOT — adjacent role leveraging existing strengths

Return ONLY this JSON:
{
  "simulations": [
    {
      "path": "accelerated | steady | pivot",
      "summary": "",
      "timeline": "",
      "milestones": ["", "", ""],
      "immediate_actions": ["", ""],
      "target_roles": ["", ""],
      "skills_to_acquire": ["", ""],
      "salary_range": {
        "india_lpa": "",
        "global_usd": ""
      },
      "interview_readiness_score": 0,
      "growth_trajectory": "high | medium | moderate"
    }
  ]
}
```

---

## PROMPT 5 — Personalized Learning Roadmap

**When called:** After career simulation. Cached by skill_profile_hash.
**Input:** Skill gaps + validated strengths + target role
**Output:** Week-by-week roadmap

```
SYSTEM:
You are a personalized learning architect. Build a structured, actionable roadmap
based on validated skill gaps. Be specific — real course names, real resources,
real projects. No generic advice. No placeholder text.
Output ONLY valid JSON.

USER:
Skill Gaps (must learn): {gap_skills}
Strong Skills (already validated): {strong_skills}
Target Role: {target_role}
Hours Available Per Week: {hours_per_week}
Target Completion Date: {target_date}

Rules:
- Prioritize skills by career ROI (highest-impact skills first)
- Each week has a focus skill, daily tasks, and a checkpoint project
- Resources must be real: course name + platform + URL if known
- Checkpoint projects must be deployable mini-projects

Return ONLY this JSON:
{
  "roadmap_id": "{skill_profile_hash}",
  "target_role": "",
  "total_weeks": 0,
  "weekly_hours": 0,
  "weeks": [
    {
      "week": 1,
      "focus_skill": "",
      "goal": "",
      "daily_tasks": ["Mon: ...", "Tue: ...", "Wed: ...", "Thu: ...", "Fri: ..."],
      "resources": [
        {
          "name": "",
          "platform": "",
          "url": "",
          "type": "course | doc | video | practice"
        }
      ],
      "checkpoint_project": {
        "name": "",
        "description": "",
        "tech_used": []
      }
    }
  ]
}
```

---

## PROMPT 6 — AI Mock Interview Start & Chat

**When called:** When starting or replying in a mock technical interview.
**Input:** Target role, candidate experience level, technical skills, and chat history.
**Output:** Interviewer response JSON.

```
SYSTEM:
You are SkillSync AI — an expert technical interviewer at a tier-1 tech company.
Conduct a professional technical interview.
Analyze the candidate's last answer, give a brief implicit correction if needed, and ask the next technical question.
Output ONLY a JSON object. Do not wrap in markdown fences or backticks.
```

USER (Start Interview):
Target Role: {target_role}
Experience Level: {experience_level}
Candidate Skills: {skills}

Generate and return ONLY this JSON:
{
  "message": "The interviewer's greeting and first question",
  "history": [
    { "role": "assistant", "content": "The interviewer's greeting and first question" }
  ]
}

USER (Chat Continuation):
User Message: "{user_message}"
Conversation History so far: {history}

Generate and return ONLY this JSON:
{
  "message": "The interviewer's response and next question (or conclusion)",
  "history": [
    ...previous_history_with_new_responses
  ],
  "concluded": true | false
}
```

---

## PROMPT 7 — AI Mock Interview Evaluator

**When called:** When the mock interview concludes.
**Input:** Interview transcript history.
**Output:** Detailed performance scorecard JSON.

```
SYSTEM:
You are SkillSync AI — a senior technical evaluator.
Review the complete technical interview chat history and produce a detailed scorecard.
Be constructive, honest, and precise.
Output ONLY a JSON object. Do not wrap in markdown fences or backticks.
```

USER:
Target Role: {target_role}
Interview History: {history}

Return ONLY this JSON:
{
  "overall_score": 0,
  "technical_depth_score": 0,
  "communication_score": 0,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "feedback_summary": "Overall constructive review of the candidate's performance."
}
```

---

## PROMPT 8 — AI Resume Keyword/ATS Optimizer

**When called:** When requesting keyword resume optimization.
**Input:** Target role, missing skills, current profile JSON.
**Output:** Tailored optimized resume bullets JSON.

```
SYSTEM:
You are SkillSync AI — a professional resume writer and ATS optimization expert.
Analyze the target role and missing skills vs. the candidate's current profile, and generate concrete, high-impact resume bullet points that incorporate the missing skills.
Ensure the bullet points use active verbs and show impact.
Output ONLY a JSON object. Do not wrap in markdown fences or backticks.
```

USER:
Target Role: {target_role}
Missing Skills to target: {missing_skills}
Current Profile: {current_resume_data}

Return ONLY this JSON:
{
  "suggestions": [
    {
      "skill": "React",
      "original_bullet_suggestion": "Built features using JavaScript",
      "optimized_bullet_suggestion": "Designed and deployed dynamic, responsive UI components using React.js, improving load times by 25% and modularizing core product features",
      "impact_metric": "25% load time improvement"
    }
  ]
}
```

---

## PROMPT 9 — Course Recommender System

**When called:** When requesting personalized course recommendations.
**Input:** Target role, missing skills, weak skills (quiz scores < 60%).
**Output:** Targeted course list JSON.

```
SYSTEM:
You are SkillSync AI — a career upskilling strategist.
Analyze the target role, missing skills, and weak skills (where the user scored poorly on the technical quiz), and generate a list of highly targeted online course recommendations.
For each recommended course, suggest a title, platform (e.g. Udemy, Coursera, YouTube, edX, MDN), estimated duration, appropriate difficulty level (Beginner, Intermediate, Advanced), a brief value-add description, and a realistic placeholder URL or real documentation link.
Categorize each course with the skill it addresses, and mark the reason as "missing" or "weak".
Output ONLY a JSON object. Do not wrap in markdown fences or backticks.
```

USER:
Target Role: {target_role}
Missing Skills (from gap analysis): {missing_skills}
Weak Skills (scored low in quiz): {weak_skills}

Return ONLY this JSON structure:
{
  "recommendations": [
    {
      "skill": "TypeScript",
      "reason": "missing | weak",
      "course_title": "TypeScript Complete Guide",
      "platform": "Udemy",
      "url": "https://www.udemy.com/topic/typescript/",
      "duration": "15 hours",
      "level": "Beginner to Intermediate",
      "description": "Master TypeScript, including compiler options, interfaces, classes, and how to use it with React."
    }
  ]
}
```

---

## Token Compression Function
*(Run this BEFORE every AI call — reduces resume JSON from ~4000 to ~300 tokens)*

```javascript
function compressForAI(resumeJSON, targetRole, quizScores = null) {
  return {
    skills: resumeJSON.technical_skills.slice(0, 10),
    tools: resumeJSON.tools_and_frameworks.slice(0, 8),
    level: resumeJSON.experience_level,
    role: targetRole,
    ...(quizScores && { quiz: quizScores })
    // Never send: raw_text, full_experience, education details, contact info
  };
}
// Result: ~300 tokens instead of ~4000 → 93% reduction
```

---

## Caching Strategy

```javascript
const crypto = require('crypto');

function getSkillHash(skills, targetRole) {
  const key = [...skills].sort().join(',') + '|' + targetRole;
  return crypto.createHash('md5').update(key).digest('hex');
}

async function getRoadmapCached(skillHash, db) {
  const cached = await db.collection('roadmap_cache').findOne({ hash: skillHash });
  if (cached) return cached.roadmap;           // 0 tokens
  const roadmap = await callAI(PROMPT_5, ...); // ~500 tokens
  await db.collection('roadmap_cache').insertOne({ hash: skillHash, roadmap });
  return roadmap;
}
```

---

## Cost Summary Per User Session

| Operation | Method | Tokens | Est. Cost |
|-----------|--------|--------|-----------|
| Resume Parsing | Local PDF.js | 0 | ₹0 |
| Skill Extraction | AI Prompt 1 | ~600 | ~₹0.04 |
| Skill Matching + ATS | Local dataset | 0 | ₹0 |
| Quiz Generation | AI Prompt 3 | ~800 | ~₹0.05 |
| Quiz Scoring | Local logic | 0 | ₹0 |
| Career Simulation | AI Prompt 4 | ~600 | ~₹0.04 |
| Roadmap Generation | AI Prompt 5 (cached) | ~500 | ~₹0.03 |
| Course Recommendations | AI Prompt 9 (cached) | ~400 | ~₹0.02 |
| **Total** | | **~2,900 tokens** | **~₹0.17** |

---

*SkillSync AI — Team DevForge — LNCT Group of Colleges*
*"Bridging the Gap Between Skills Listed and Skills Proven"*
