import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getMe, getSessionState, saveSessionState, logout as apiLogout } from '../lib/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Authentication State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillsync_token'));
  const [authLoading, setAuthLoading] = useState(true);

  // Platform Workspace State
  const [sessionId, setSessionId] = useState(null);
  const [mode, setMode] = useState(null); // 'path_a' or 'path_b'
  const [resumeData, setResumeData] = useState(null);
  const [recommendedRoles, setRecommendedRoles] = useState(null);
  const [targetRole, setTargetRole] = useState(null);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [compressedProfile, setCompressedProfile] = useState(null);
  
  // Assessment State
  const [quizData, setQuizData] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizSkipped, setQuizSkipped] = useState(false);
  const [interviewSkipped, setInterviewSkipped] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [interviewConcluded, setInterviewConcluded] = useState(false);
  const [interviewScore, setInterviewScore] = useState(null);

  // Simulation & Roadmaps
  const [simulations, setSimulations] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [courses, setCourses] = useState(null);
  const [careerReadinessScore, setCareerReadinessScore] = useState(null);

  // Autosave status indicator
  const [saveStatus, setSaveStatus] = useState('Saved'); // 'Saved' | 'Saving...' | 'Last Saved at HH:MM:SS'
  const [lastSavedTime, setLastSavedTime] = useState(null);

  const prevSaveDataRef = useRef(null);

  // Reset all states (e.g. on logout)
  const resetSession = useCallback(() => {
    setUser(null);
    setToken(null);
    setSessionId(null);
    setMode(null);
    setResumeData(null);
    setRecommendedRoles(null);
    setTargetRole(null);
    setGapAnalysis(null);
    setCompressedProfile(null);
    setQuizData(null);
    setQuizResults(null);
    setQuizAnswers([]);
    setCurrentQuizIdx(0);
    setQuizSkipped(false);
    setInterviewSkipped(false);
    setInterviewHistory([]);
    setInterviewConcluded(false);
    setInterviewScore(null);
    setSimulations(null);
    setRoadmap(null);
    setCourses(null);
    setCareerReadinessScore(null);
    setSaveStatus('Saved');
    setLastSavedTime(null);
    localStorage.removeItem('skillsync_token');
    localStorage.removeItem('skillsync_refresh_token');
  }, []);

  // Restore session state from DB
  const restoreSessionState = useCallback(async () => {
    try {
      const stateRes = await getSessionState();
      if (stateRes.success) {
        const { state, resume } = stateRes;
        
        // Restore active user workflow state
        if (state) {
          setMode(state.mode || null);
          setTargetRole(state.selected_role || null);
          setQuizAnswers(state.quiz_answers || []);
          setCurrentQuizIdx(state.current_quiz_idx || 0);
          setQuizSkipped(state.quiz_skipped || false);
          setInterviewSkipped(state.interview_skipped || false);
          setInterviewHistory(state.interview_history || []);
          setInterviewConcluded(state.interview_concluded || false);
          if (state.last_saved) {
            const date = new Date(state.last_saved);
            setLastSavedTime(date.toLocaleTimeString());
            setSaveStatus(`Last Saved at ${date.toLocaleTimeString()}`);
          }
        }

        // Restore latest resume
        if (resume) {
          const parsedResume = {
            id: resume.id,
            cloudinaryUrl: resume.cloudinary_url,
            publicId: resume.public_id,
            parsedContent: resume.parsed_text,
            extractedSkills: resume.extracted_skills || [],
            extractedProjects: resume.extracted_projects || [],
            extractedExperience: resume.extracted_experience || [],
            extractedEducation: resume.extracted_education || [],
            extractedCertifications: resume.extracted_certifications || [],
            // compat:
            technical_skills: resume.extracted_skills || [],
            tools_and_frameworks: [],
            soft_skills: [],
            experience_level: resume.extracted_experience?.[0]?.title || 'Mid',
            projects: resume.extracted_projects || [],
            certifications: resume.extracted_certifications || [],
            experience: resume.extracted_experience || [],
            education: resume.extracted_education || []
          };
          setResumeData(parsedResume);
          // Set session ID as the user's ID
          setSessionId(state?.user_id || 'active_session');
        }
      }
    } catch (err) {
      console.warn('[appContext] Failed to restore session state:', err.message);
    }
  }, []);

  // Initialize Auth verification on reload
  useEffect(() => {
    async function verifyAuth() {
      const activeToken = localStorage.getItem('skillsync_token');
      if (!activeToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const userRes = await getMe();
        if (userRes.success && userRes.user) {
          setUser(userRes.user);
          setToken(activeToken);
          // Load active session state immediately
          await restoreSessionState();
        } else {
          resetSession();
        }
      } catch (err) {
        console.warn('[appContext] Token verification failed:', err.message);
        if (err.response?.status === 401) {
          resetSession();
        }
      } finally {
        setAuthLoading(false);
      }
    }

    verifyAuth();

    // Listen to token expired events from api.js interceptor
    const handleExpired = () => resetSession();
    window.addEventListener('auth_session_expired', handleExpired);
    return () => {
      window.removeEventListener('auth_session_expired', handleExpired);
    };
  }, [restoreSessionState, resetSession]);

  // Set auth tokens and reload user
  const setAuthTokens = useCallback(async (accessToken, refreshToken, userData) => {
    localStorage.setItem('skillsync_token', accessToken);
    localStorage.setItem('skillsync_refresh_token', refreshToken);
    setToken(accessToken);
    setUser(userData);
    setAuthLoading(true);
    await restoreSessionState();
    setAuthLoading(false);
  }, [restoreSessionState]);

  // Logout wrapper
  const logoutUser = useCallback(async () => {
    await apiLogout();
    resetSession();
  }, [resetSession]);

  // Explicit Save State Method (used in autosave and manual triggers)
  const saveActiveState = useCallback(async (force = false) => {
    if (!token || !user) return;

    const currentSaveData = JSON.stringify({
      mode,
      selected_role: targetRole,
      quiz_answers: quizAnswers,
      current_quiz_idx: currentQuizIdx,
      quiz_skipped: quizSkipped,
      interview_skipped: interviewSkipped,
      interview_history: interviewHistory,
      interview_concluded: interviewConcluded
    });

    // Avoid duplicate requests if no state has changed
    if (!force && prevSaveDataRef.current === currentSaveData) {
      return;
    }

    setSaveStatus('Saving...');
    try {
      const stateData = {
        mode,
        selected_role: targetRole,
        quiz_answers: quizAnswers,
        current_quiz_idx: currentQuizIdx,
        quiz_skipped: quizSkipped,
        interview_skipped: interviewSkipped,
        interview_history: interviewHistory,
        interview_concluded: interviewConcluded
      };
      
      const res = await saveSessionState(stateData);
      if (res.success) {
        prevSaveDataRef.current = currentSaveData;
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        setLastSavedTime(timeStr);
        setSaveStatus(`Saved`);
        setTimeout(() => {
          setSaveStatus(`Last Saved at ${timeStr}`);
        }, 1500);
      } else {
        setSaveStatus('Error saving');
      }
    } catch (err) {
      console.warn('[autosave] Failed to auto-save state:', err.message);
      setSaveStatus('Error saving');
    }
  }, [token, user, mode, targetRole, quizAnswers, currentQuizIdx, quizSkipped, interviewSkipped, interviewHistory, interviewConcluded]);

  // 30-Second Auto Save Interval
  useEffect(() => {
    if (!token || !user) return;

    const interval = setInterval(() => {
      saveActiveState();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [saveActiveState, token, user]);

  return (
    <AppContext.Provider value={{
      // Auth variables & functions
      user, setUser,
      token, setToken,
      authLoading,
      setAuthTokens,
      logoutUser,

      // Workspace state
      sessionId, setSessionId,
      mode, setMode,
      resumeData, setResumeData,
      recommendedRoles, setRecommendedRoles,
      targetRole, setTargetRole,
      gapAnalysis, setGapAnalysis,
      compressedProfile, setCompressedProfile,
      
      // Assessments
      quizData, setQuizData,
      quizResults, setQuizResults,
      quizAnswers, setQuizAnswers,
      currentQuizIdx, setCurrentQuizIdx,
      quizSkipped, setQuizSkipped,
      interviewSkipped, setInterviewSkipped,
      interviewHistory, setInterviewHistory,
      interviewConcluded, setInterviewConcluded,
      interviewScore, setInterviewScore,
      
      // Simulations/Reports
      simulations, setSimulations,
      roadmap, setRoadmap,
      courses, setCourses,
      careerReadinessScore, setCareerReadinessScore,
      
      // Autosave indicator state
      saveStatus,
      lastSavedTime,
      saveActiveState,

      resetSession,
      restoreSessionState
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
