import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [sessionId, setSessionId] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [targetRole, setTargetRole] = useState(null);
  const [compressedProfile, setCompressedProfile] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [simulations, setSimulations] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [courses, setCourses] = useState(null);

  const resetSession = () => {
    setSessionId(null);
    setResumeData(null);
    setGapAnalysis(null);
    setTargetRole(null);
    setCompressedProfile(null);
    setQuizData(null);
    setQuizResults(null);
    setSimulations(null);
    setRoadmap(null);
    setCourses(null);
  };

  return (
    <AppContext.Provider value={{
      sessionId, setSessionId,
      resumeData, setResumeData,
      gapAnalysis, setGapAnalysis,
      targetRole, setTargetRole,
      compressedProfile, setCompressedProfile,
      quizData, setQuizData,
      quizResults, setQuizResults,
      simulations, setSimulations,
      roadmap, setRoadmap,
      courses, setCourses,
      resetSession,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
