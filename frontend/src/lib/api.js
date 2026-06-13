import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60s for AI calls
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillsync_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('skillsync_refresh_token');
      if (refreshToken) {
        try {
          // Use plain axios instance to avoid infinite loop
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
          if (res.data && res.data.success) {
            localStorage.setItem('skillsync_token', res.data.token);
            if (res.data.refreshToken) {
              localStorage.setItem('skillsync_refresh_token', res.data.refreshToken);
            }
            originalRequest.headers['Authorization'] = `Bearer ${res.data.token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('[api] Refresh token expired/failed:', refreshError.message);
          localStorage.removeItem('skillsync_token');
          localStorage.removeItem('skillsync_refresh_token');
          window.dispatchEvent(new Event('auth_session_expired'));
        }
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth Endpoints ──────────────────────────────────────────────────
export async function signup(userData) {
  const res = await api.post('/auth/signup', userData);
  if (res.data.success) {
    localStorage.setItem('skillsync_token', res.data.token);
    localStorage.setItem('skillsync_refresh_token', res.data.refreshToken);
  }
  return res.data;
}

export async function login(credentials) {
  const res = await api.post('/auth/login', credentials);
  if (res.data.success) {
    localStorage.setItem('skillsync_token', res.data.token);
    localStorage.setItem('skillsync_refresh_token', res.data.refreshToken);
  }
  return res.data;
}

export async function logout() {
  const refreshToken = localStorage.getItem('skillsync_refresh_token');
  try {
    await api.post('/auth/logout', { refresh_token: refreshToken });
  } catch (err) {
    console.warn('Logout server notification failed:', err.message);
  }
  localStorage.removeItem('skillsync_token');
  localStorage.removeItem('skillsync_refresh_token');
}

export async function forgotPassword(email) {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data;
}

// ── Session State Persistence ─────────────────────────────────────────
export async function getSessionState() {
  const res = await api.get('/session/state');
  return res.data;
}

export async function saveSessionState(stateData) {
  const res = await api.post('/session/save', stateData);
  return res.data;
}

// ── Upload resume ───────────────────────────────────────────────
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
export async function selectRole(sessionId, selectedRole, customRole) {
  const res = await api.post('/select-role', { 
    session_id: sessionId, 
    selected_role: selectedRole, 
    custom_role: customRole 
  });
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

// ── Job Description Scan (ATS Match) ──────────────────────────────────
export async function scanJobDescription(jobDescText, manualReqs = null, targetRole = null, customRole = null) {
  const res = await api.post('/jobmatch', {
    job_description: jobDescText,
    manual_requirements: manualReqs,
    target_role: targetRole,
    custom_role: customRole
  });
  return res.data;
}

// ── History Retrieval ─────────────────────────────────────────────
export async function getHistory() {
  const res = await api.get('/history');
  return res.data;
}

// ── Job Opportunities (Live Search & Saves) ─────────────────────────
export async function searchLiveJobs(filters) {
  const res = await api.post('/jobs/search', filters);
  return res.data;
}

export async function saveJob(job) {
  const res = await api.post('/jobs/save', { job });
  return res.data;
}

export async function getSavedJobs() {
  const res = await api.get('/jobs/saved');
  return res.data;
}

export async function getJobSearchHistory() {
  const res = await api.get('/jobs/history');
  return res.data;
}

// ── Interview Analytics ──────────────────────────────────────────
export async function saveInterviewAnalytics(payload) {
  const res = await api.post('/interview/analytics/save', payload);
  return res.data;
}

export async function getLatestInterviewAnalytics() {
  const res = await api.get('/interview/analytics/latest');
  return res.data;
}

// ── Health check ──────────────────────────────────────────────────
export async function checkHealth() {
  const res = await api.get('/health');
  return res.data;
}
