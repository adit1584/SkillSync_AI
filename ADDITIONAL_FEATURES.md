# SkillSync AI — Additional Premium Features

This document outlines the premium capabilities introduced to make SkillSync AI an outstanding career preparation product.

---

## 1. 💬 AI Mock Interview Simulator
An interactive chat terminal that simulates a live technical interview for the target role.
- **Backend Endpoints**: 
  - `POST /api/interview/start` — Initializes interview state and returns greeting + first question.
  - `POST /api/interview/chat` — Handles subsequent chat exchanges and queries AI.
- **Frontend Component**: [InterviewSimulator.jsx](file:///c:/Users/aditk/OneDrive/Desktop/Vibe%20Code/SkillSync%20AI/frontend/src/components/InterviewSimulator.jsx) — Monospace terminal interface with typewriter loading effects, user inputs, and a final scoring scorecard grading the user's communication, technical depth, and overall performance.

## 2. 📋 Interactive Learning Roadmap & Checklist
Converts the week-by-week learning roadmap from a static timeline into an active progress tracker.
- **Frontend Component**: [RoadmapTimeline.jsx](file:///c:/Users/aditk/OneDrive/Desktop/Vibe%20Code/SkillSync%20AI/frontend/src/components/RoadmapTimeline.jsx) — Displays interactive checkbox items for daily tasks and project milestones.
- **State Persistence**: Saves checked tasks locally in `localStorage` mapped by `session_id` so progress is retained upon page reloads. Includes a dynamic completion progress tracker bar.

## 3. 📝 Live ATS Resume Optimizer
An interactive assistant that helps users optimize their resumes for applicant tracking systems.
- **Backend Endpoint**: `POST /api/optimize` — Generates concrete, high-impact resume bullet points tailored to the user's target role and missing skills.
- **Frontend Component**: [ATSResumeOptimizer.jsx](file:///c:/Users/aditk/OneDrive/Desktop/Vibe%20Code/SkillSync%20AI/frontend/src/components/ATSResumeOptimizer.jsx) — Side-by-side comparison of current generic bullets vs. AI-optimized phrasing, with one-click copy feedback.

## 4. 🏆 Shareable Career Readiness PDF Report
Allows users to print or download a high-fidelity PDF containing their profile metrics, quiz results, radar charts, and career trajectory predictions.
- **Frontend Implementation**: Built-in styling with print-media styling (`@media print` in [index.css](file:///c:/Users/aditk/OneDrive/Desktop/Vibe%20Code/SkillSync%20AI/frontend/src/index.css)) and clean layout adjustments, enabling standard system PDF generation with zero external heavy libraries.

## 5. ✨ Advanced UI/UX Overlays
- **Immersive Loader Overlay**: Frosted-glass backdrop with a circular spinner, pulsing glowing gradient orb, and stepping progress logs that display current backend states (Scanning, Extracting, Gap Match, Profile Ready).
- **Quiz Adjustments**: Removed timer limits to let candidates answer MCQs at their own pace, and allowed changing selected options before advancing.
- **Glow Effects**: Radial glowing gradient cards and hover-responsive neon borders.

## 6. 🎓 AI-Driven Course Recommender
A personalized learning recommendations dashboard tailored to the candidate's specific skill weaknesses and gaps.
- **Backend Endpoint**: `POST /api/courses` — Evaluates user's missing skills (from resume parser) and weak skills (scored low on the technical quiz), queries Groq to retrieve custom course listings, and caches the results via MongoDB/Memory Cache.
- **Frontend Component**: [CourseRecommendations.jsx](file:///c:/Users/aditk/OneDrive/Desktop/Vibe%20Code/SkillSync%20AI/frontend/src/components/CourseRecommendations.jsx) — Displays responsive neon glowing cards for recommended courses. Categorizes items with "Missing Skill" or "Weak Skill" badges, displaying platform tags, course duration, target difficulty levels, and interactive external course links.
