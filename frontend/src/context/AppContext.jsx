import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [sessionId, setSessionId] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [recommendedRoles, setRecommendedRoles] = useState(null);
  const [targetRole, setTargetRole] = useState(null);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [compressedProfile, setCompressedProfile] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [simulations, setSimulations] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [courses, setCourses] = useState(null);
  const [careerReadinessScore, setCareerReadinessScore] = useState(null);
  const [interviewScore, setInterviewScore] = useState(null);

  const resetSession = () => {
    setSessionId(null);
    setResumeData(null);
    setRecommendedRoles(null);
    setTargetRole(null);
    setGapAnalysis(null);
    setCompressedProfile(null);
    setQuizData(null);
    setQuizResults(null);
    setSimulations(null);
    setRoadmap(null);
    setCourses(null);
    setCareerReadinessScore(null);
    setInterviewScore(null);
  };

  return (
    <AppContext.Provider value={{
      sessionId, setSessionId,
      resumeData, setResumeData,
      recommendedRoles, setRecommendedRoles,
      targetRole, setTargetRole,
      gapAnalysis, setGapAnalysis,
      compressedProfile, setCompressedProfile,
      quizData, setQuizData,
      quizResults, setQuizResults,
      simulations, setSimulations,
      roadmap, setRoadmap,
      courses, setCourses,
      careerReadinessScore, setCareerReadinessScore,
      interviewScore, setInterviewScore,
      resetSession,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
