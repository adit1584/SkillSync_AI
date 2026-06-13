import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60s for AI calls
});

// ── Upload resume (no role needed) ───────────────────────────────────
export async function uploadResume(file) {
  const form = new FormData();
  form.append('resume', file);

  const res = await api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// ── Career Role Recommendation ─────────────────────────────────
export async function recommendRoles(sessionId) {
  const res = await api.post('/recommend', { session_id: sessionId });
  return res.data;
}

// ── Select Role (triggers local skill gap) ────────────────────────
export async function selectRole(sessionId, selectedRole) {
  const res = await api.post('/select-role', { session_id: sessionId, selected_role: selectedRole });
  return res.data;
}

// ── Generate quiz ─────────────────────────────────────────────────
export async function generateQuiz(sessionId) {
  const res = await api.post('/quiz/generate', { session_id: sessionId });
  return res.data;
}

// ── Submit quiz answers ───────────────────────────────────────────
export async function submitQuiz(sessionId, quizId, answers, timeTaken) {
  const res = await api.post('/quiz/submit', {
    session_id: sessionId,
    quiz_id: quizId,
    answers,
    time_taken_seconds: timeTaken,
  });
  return res.data;
}

// ── Career simulation ─────────────────────────────────────────────
export async function simulateCareer(sessionId) {
  const res = await api.post('/simulate', { session_id: sessionId });
  return res.data;
}

// ── Roadmap generation ────────────────────────────────────────────
export async function generateRoadmap(sessionId, hoursPerWeek = 10) {
  const res = await api.post('/roadmap', {
    session_id: sessionId,
    hours_per_week: hoursPerWeek,
  });
  return res.data;
}

// ── Mock Interview ────────────────────────────────────────────────
export async function startInterview(sessionId) {
  const res = await api.post('/interview/start', { session_id: sessionId });
  return res.data;
}

export async function chatInterview(sessionId, message) {
  const res = await api.post('/interview/chat', { session_id: sessionId, message });
  return res.data;
}

// ── Resume Optimizer ──────────────────────────────────────────────
export async function optimizeResume(sessionId) {
  const res = await api.post('/optimize', { session_id: sessionId });
  return res.data;
}

// ── Course Recommendations ────────────────────────────────────────
export async function recommendCourses(sessionId) {
  const res = await api.post('/courses', { session_id: sessionId });
  return res.data;
}

// ── Health check ──────────────────────────────────────────────────
export async function checkHealth() {
  const res = await api.get('/health');
  return res.data;
}
