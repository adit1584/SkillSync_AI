import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Rocket, BookOpen, CheckCircle, XCircle,
  Loader2, RefreshCw, Target, TrendingUp, Award,
  Home, AlertCircle, Terminal, Sparkles, Download, Zap, GraduationCap,
  Calendar, FileText, UserCheck, Briefcase
} from 'lucide-react';
import SkillRadarChart from '../components/SkillRadarChart';
import CareerDashboard from '../components/CareerDashboard';
import RoadmapTimeline from '../components/RoadmapTimeline';
import InterviewSimulator from '../components/InterviewSimulator';
import ATSResumeOptimizer from '../components/ATSResumeOptimizer';
import CourseRecommendations from '../components/CourseRecommendations';
import ATSJobMatcher from '../components/ATSJobMatcher';
import LiveJobBoard from '../components/LiveJobBoard';
import { simulateCareer, generateRoadmap, recommendCourses, selectRole, scanJobDescription } from '../lib/api';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'livejobs', label: 'Live Jobs', icon: Briefcase },
  { id: 'jobmatch', label: 'Job Match Scanner', icon: Target },
  { id: 'simulation', label: 'Career Paths', icon: Rocket },
  { id: 'roadmap', label: 'Learning Roadmap', icon: BookOpen },
  { id: 'courses', label: 'Recommended Courses', icon: GraduationCap },
  { id: 'interview', label: 'AI Mock Interview', icon: Terminal },
  { id: 'optimizer', label: 'ATS Optimizer', icon: Sparkles },
];

export default function ResultsPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    sessionId, resumeData, gapAnalysis, quizResults,
    targetRole, simulations, setSimulations,
    roadmap, setRoadmap, courses, setCourses,
    quizSkipped, setQuizSkipped, interviewSkipped, setInterviewSkipped,
    interviewScore, setInterviewScore, saveActiveState,
    customRole, setCustomRole, jobDescription, setJobDescription,
    targetOpportunityOption, setTargetOpportunityOption, setGapAnalysis, setTargetRole
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState('');

  // Target Opportunity Configuration states
  const [configOption, setConfigOption] = useState(targetOpportunityOption || 'continue_selected');
  const [customRoleInput, setCustomRoleInput] = useState(customRole || '');
  const [customRoleError, setCustomRoleError] = useState('');
  const [jdTextInput, setJdTextInput] = useState(jobDescription || '');
  const [jdError, setJdError] = useState('');
  const [jdResults, setJdResults] = useState(null);
  const [loadingJdScan, setLoadingJdScan] = useState(false);

  // Sync state if it updates in context
  useEffect(() => {
    if (targetOpportunityOption) {
      setConfigOption(targetOpportunityOption);
    }
  }, [targetOpportunityOption]);

  useEffect(() => {
    if (jobDescription) {
      setJdTextInput(jobDescription);
    }
  }, [jobDescription]);

  // Run job description scan immediately if jobDescription is active
  useEffect(() => {
    if (jobDescription && targetOpportunityOption === 'paste_jd') {
      runJdAnalysis(jobDescription);
    }
  }, [jobDescription, targetOpportunityOption]);

  const runJdAnalysis = async (jdText) => {
    setLoadingJdScan(true);
    setJdError('');
    try {
      const data = await scanJobDescription(jdText, null, targetRole, customRole);
      if (data.success) {
        setJdResults(data);
      } else {
        setJdError(data.error || 'Failed to scan job description.');
      }
    } catch (err) {
      setJdError(err.response?.data?.error || err.message || 'Job description analysis failed.');
    } finally {
      setLoadingJdScan(false);
    }
  };

  const handleConfirmCustomRole = async (e) => {
    e.preventDefault();
    const val = customRoleInput.trim();
    if (val.length < 2 || val.length > 100) {
      setCustomRoleError('Custom role must be between 2 and 100 characters.');
      return;
    }
    setCustomRoleError('');
    setLoadingSimulation(true);
    
    try {
      const res = await selectRole(sessionId, val, val);
      if (res.success) {
        setTargetRole(val);
        setCustomRole(val);
        setGapAnalysis(res.gap_analysis);
        setTargetOpportunityOption('custom_role');
        
        // Refresh career trajectory simulations on role change
        const simData = await simulateCareer(sessionId);
        setSimulations(simData.simulations);
        
        setTimeout(() => saveActiveState(true), 200);
      }
    } catch (err) {
      setCustomRoleError(err.response?.data?.error || err.message || 'Failed to select custom role.');
    } finally {
      setLoadingSimulation(false);
    }
  };

  const handleConfirmJdAnalysis = async (e) => {
    e.preventDefault();
    const val = jdTextInput.trim();
    if (!val) {
      setJdError('Please paste a job description first.');
      return;
    }
    setJdError('');
    setJobDescription(val);
    setTargetOpportunityOption('paste_jd');
    
    await runJdAnalysis(val);
    setTimeout(() => saveActiveState(true), 200);
  };

  const handleOptionChange = async (opt) => {
    setConfigOption(opt);
    setTargetOpportunityOption(opt);
    if (opt === 'continue_selected') {
      setCustomRole(null);
      try {
        const res = await selectRole(sessionId, targetRole);
        if (res.success) {
          setGapAnalysis(res.gap_analysis);
        }
      } catch (err) {
        console.warn('Revert standard role failed:', err.message);
      }
    }
    setTimeout(() => saveActiveState(true), 200);
  };

  // Redirect if no session
  useEffect(() => {
    if (!sessionId) { navigate('/upload'); return; }
    if (!simulations) loadSimulation();
  }, [sessionId]);

  // Run GSAP stagger animation on tab activation
  useEffect(() => {
    gsap.killTweensOf('.results-card-anim');
    gsap.fromTo('.results-card-anim', 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out', delay: 0.05 }
    );
  }, [activeTab, loadingSimulation, loadingRoadmap, loadingCourses]);

  async function loadSimulation() {
    setLoadingSimulation(true);
    setError('');
    try {
      const data = await simulateCareer(sessionId);
      setSimulations(data.simulations);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate career simulation.');
    } finally {
      setLoadingSimulation(false);
    }
  }

  async function loadRoadmap() {
    if (roadmap) { setActiveTab('roadmap'); return; }
    setLoadingRoadmap(true);
    setActiveTab('roadmap');
    setError('');
    try {
      const data = await generateRoadmap(sessionId);
      setRoadmap(data.roadmap);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate roadmap.');
    } finally {
      setLoadingRoadmap(false);
    }
  }

  async function loadCourses() {
    if (courses) { setActiveTab('courses'); return; }
    setLoadingCourses(true);
    setActiveTab('courses');
    setError('');
    try {
      const data = await recommendCourses(sessionId);
      setCourses(data.courses);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate course recommendations.');
    } finally {
      setLoadingCourses(false);
    }
  }

  function handleTabClick(tabId) {
    if (tabId === 'roadmap') { loadRoadmap(); return; }
    if (tabId === 'courses') { loadCourses(); return; }
    setActiveTab(tabId);
  }

  async function handleDownloadReport() {
    setLoadingRoadmap(true);
    setLoadingCourses(true);
    try {
      const promises = [];
      if (!simulations) promises.push(simulateCareer(sessionId).then(data => setSimulations(data.simulations)));
      if (!roadmap) promises.push(generateRoadmap(sessionId).then(data => setRoadmap(data.roadmap)));
      if (!courses) promises.push(recommendCourses(sessionId).then(data => setCourses(data.courses)));
      
      if (promises.length > 0) {
        await Promise.all(promises);
      }
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (err) {
      console.error("Failed to load all report sections for print:", err);
      window.print();
    } finally {
      setLoadingRoadmap(false);
      setLoadingCourses(false);
    }
  }

  // Calculate scores locally
  const matchScore = gapAnalysis?.match_score || 0;
  const atsScore = gapAnalysis?.ats_score || 0;
  const overallQuiz = quizResults?.overall_score || 0;
  const matched = gapAnalysis?.matched_skills || [];
  const missing = gapAnalysis?.missing_skills || [];
  const perSkillScores = quizResults?.per_skill_scores || [];

  const hasQuiz = quizResults && quizResults.overall_score !== undefined;
  const hasInterview = interviewScore !== null && interviewScore !== undefined;

  let overallReadiness = 0;
  let readinessModeLabel = 'Skipped Mode';

  if (hasQuiz && hasInterview) {
    overallReadiness = Math.round((matchScore * 0.4) + (overallQuiz * 0.3) + (interviewScore * 0.3));
    readinessModeLabel = 'Fully Assessed';
  } else if (hasQuiz) {
    overallReadiness = Math.round((matchScore * 0.6) + (overallQuiz * 0.4));
    readinessModeLabel = 'Interview Skipped';
  } else if (hasInterview) {
    overallReadiness = Math.round((matchScore * 0.6) + (interviewScore * 0.4));
    readinessModeLabel = 'Quiz Skipped';
  } else {
    // Both skipped: 70% Skill Match + 30% Resume Strength
    const resumeStrength = Math.round(atsScore || 75);
    overallReadiness = Math.round((matchScore * 0.7) + (resumeStrength * 0.3));
    readinessModeLabel = 'Skipped Mode';
  }

  const scoreColor = (s) => {
    if (s >= 70) return 'var(--emerald)';
    if (s >= 45) return 'var(--amber)';
    return 'var(--rose)';
  };

  const getScoreBg = (s) => {
    if (s >= 70) return 'rgba(5, 150, 105, 0.05)';
    if (s >= 45) return 'rgba(234, 88, 12, 0.05)';
    return 'rgba(225, 29, 72, 0.05)';
  };

  const getScoreBorder = (s) => {
    if (s >= 70) return 'rgba(5, 150, 105, 0.18)';
    if (s >= 45) return 'rgba(234, 88, 12, 0.18)';
    return 'rgba(225, 29, 72, 0.18)';
  };

  return (
    <div className="page-wrapper" style={{ paddingTop: 110, paddingBottom: 80 }}>
      {/* Background blobs */}
      <div style={{
        position: 'absolute',
        top: '10%', right: '5%',
        width: 450, height: 450,
        background: 'radial-gradient(circle, rgba(163, 82, 0, 0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%', left: '5%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(219, 39, 119, 0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ maxWidth: 1080, position: 'relative', zIndex: 1 }}>

        {/* ── Header ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(5, 150, 105, 0.06)',
                border: '1.5px solid rgba(5, 150, 105, 0.2)',
                fontSize: '0.74rem', fontWeight: 700,
                color: 'var(--emerald)', marginBottom: 12,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                fontFamily: 'Space Grotesk',
              }}>
                <CheckCircle size={12} />
                Career Audit Diagnostics Ready
              </div>
              <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.7rem)', margin: 0 }}>
                Candidate <span className="gradient-text">Report Card</span>
              </h1>
              {resumeData?.name && (
                <p style={{ color: 'var(--text-secondary)', marginTop: 6, marginBottom: 0, fontSize: '0.95rem', fontWeight: 600 }}>
                  {resumeData.name} · {targetRole} · <span style={{ textTransform: 'capitalize' }}>{resumeData.experience_level}</span>
                </p>
              )}
            </div>
            
            <div className="print-hide" style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleDownloadReport}
                className="btn btn-secondary"
                style={{ gap: 8, fontSize: '0.85rem', padding: '10px 20px', boxShadow: 'var(--shadow-sm)' }}
              >
                <Download size={14} />
                Download PDF
              </button>
              <Link to="/upload" className="btn btn-secondary" style={{ gap: 8, fontSize: '0.85rem', padding: '10px 20px', boxShadow: 'var(--shadow-sm)' }}>
                <Home size={14} />
                Select Another Journey
              </Link>
            </div>
          </div>
        </motion.div>
 
        {/* ── Score Cards Row ───────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          {[
            { label: 'Overall Readiness', value: `${overallReadiness}%`, sub: readinessModeLabel, color: scoreColor(overallReadiness), bg: getScoreBg(overallReadiness), border: getScoreBorder(overallReadiness), icon: UserCheck },
            { label: 'ATS Match Score', value: `${atsScore}%`, sub: `${matched.length}/${matched.length + missing.length} matched`, color: scoreColor(atsScore), bg: getScoreBg(atsScore), border: getScoreBorder(atsScore), icon: Target },
            { label: 'Skill Gap Score', value: `${matchScore}%`, sub: `${missing.length} missing skills`, color: scoreColor(matchScore), bg: getScoreBg(matchScore), border: getScoreBorder(matchScore), icon: CheckCircle },
            { label: 'Diagnostic Quiz', value: hasQuiz ? `${overallQuiz}%` : (quizSkipped ? 'Skipped' : 'Not Taken'), sub: 'Verification MCQ', color: hasQuiz ? scoreColor(overallQuiz) : 'var(--text-muted)', bg: hasQuiz ? getScoreBg(overallQuiz) : 'rgba(0,0,0,0.02)', border: hasQuiz ? getScoreBorder(overallQuiz) : 'var(--border)', icon: Award },
            { label: 'Mock Interview', value: hasInterview ? `${interviewScore}%` : (interviewSkipped ? 'Skipped' : 'Not Taken'), sub: 'Technical & Behavioral', color: hasInterview ? scoreColor(interviewScore) : 'var(--text-muted)', bg: hasInterview ? getScoreBg(interviewScore) : 'rgba(0,0,0,0.02)', border: hasInterview ? getScoreBorder(interviewScore) : 'var(--border)', icon: Terminal },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className="card"
              style={{
                padding: '20px 18px',
                background: 'var(--bg-secondary)',
                border: `1.5px solid ${card.border}`,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0, fontFamily: 'Space Grotesk' }}>
                  {card.label}
                </p>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: card.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${card.border}`,
                }}>
                  <card.icon size={14} color={card.color} />
                </div>
              </div>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 800,
                fontSize: '1.7rem',
                color: card.color,
                lineHeight: 1,
                marginBottom: 6,
                margin: 0
              }}>
                {card.value}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
                {card.sub}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div className="print-hide" style={{
          display: 'flex', gap: 6,
          background: 'var(--bg-secondary)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: 6,
          marginBottom: 32,
          overflowX: 'auto',
          maxWidth: '100%',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px',
                borderRadius: 'var(--radius-lg)',
                border: 'none', cursor: 'pointer',
                fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.88rem', fontWeight: 700,
                transition: 'all 0.2s ease',
                background: activeTab === tab.id
                  ? 'var(--grad-hero)'
                  : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: activeTab === tab.id ? '0 8px 20px rgba(163, 82, 0, 0.25)' : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="print-hide" style={{
            display: 'flex', gap: 10, alignItems: 'center',
            padding: '12px 18px', marginBottom: 20,
            background: 'rgba(225, 29, 72, 0.05)',
            border: '1.5px solid rgba(225, 29, 72, 0.2)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--rose)', fontSize: '0.88rem',
            fontWeight: 600,
          }}>
            <AlertCircle size={16} />
            {error}
            <button
              onClick={activeTab === 'roadmap' ? loadRoadmap : activeTab === 'courses' ? loadCourses : loadSimulation}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem', fontWeight: 700 }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Tab Content ──────────────────────────────────── */}
        <div className="tab-content-container">
          {/* OVERVIEW */}
          <div
            className="print-show-block"
            style={{ display: activeTab === 'overview' ? 'grid' : 'none', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}
          >
            {/* Target Opportunity Configuration */}
            <div className="card results-card-anim" style={{ gridColumn: '1 / -1', padding: '24px', background: 'var(--bg-secondary)', border: '1.5px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'Syne', fontSize: '1.15rem', color: 'var(--text-primary)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={18} color="var(--indigo)" />
                Target Opportunity Configuration
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                Align your career analysis diagnostics against a specific role or an active job opening description.
              </p>

              {/* Option Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
                <div 
                  onClick={() => handleOptionChange('continue_selected')}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${configOption === 'continue_selected' ? 'var(--indigo)' : 'var(--border)'}`,
                    background: configOption === 'continue_selected' ? 'rgba(163,82,0,0.02)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="radio" checked={configOption === 'continue_selected'} readOnly />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>Standard Role</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '8px 0 0', paddingLeft: 24 }}>
                    Continue with: {targetRole && !customRole ? targetRole : 'Select standard path'}
                  </p>
                </div>

                <div 
                  onClick={() => handleOptionChange('custom_role')}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${configOption === 'custom_role' ? 'var(--indigo)' : 'var(--border)'}`,
                    background: configOption === 'custom_role' ? 'rgba(163,82,0,0.02)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="radio" checked={configOption === 'custom_role'} readOnly />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>Custom Role</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '8px 0 0', paddingLeft: 24 }}>
                    Target custom profile: {customRole ? customRole : 'Not configured'}
                  </p>
                </div>

                <div 
                  onClick={() => handleOptionChange('paste_jd')}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${configOption === 'paste_jd' ? 'var(--indigo)' : 'var(--border)'}`,
                    background: configOption === 'paste_jd' ? 'rgba(163,82,0,0.02)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="radio" checked={configOption === 'paste_jd'} readOnly />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>Paste Job Description</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '8px 0 0', paddingLeft: 24 }}>
                    Match resume directly with a specific job posting
                  </p>
                </div>
              </div>

              {/* Option Subpanels */}
              <AnimatePresence mode="wait">
                {configOption === 'custom_role' && (
                  <motion.form 
                    key="custom_role_panel"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleConfirmCustomRole}
                    style={{ padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8 }}
                  >
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                      Enter Target Custom Role (2-100 characters)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      <input 
                        type="text"
                        placeholder="e.g. AI Engineer, DevOps Engineer, Cloud Architect, Quant Developer..."
                        value={customRoleInput}
                        onChange={(e) => setCustomRoleInput(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1.5px solid var(--border)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.88rem',
                          outline: 'none'
                        }}
                      />
                      <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                        Confirm Target Role
                      </button>
                    </div>
                    {customRoleError && (
                      <p style={{ color: 'var(--rose)', fontSize: '0.8rem', marginTop: 8, margin: 0, fontWeight: 600 }}>{customRoleError}</p>
                    )}
                  </motion.form>
                )}

                {configOption === 'paste_jd' && (
                  <motion.form 
                    key="paste_jd_panel"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleConfirmJdAnalysis}
                    style={{ padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, display: 'grid', gap: 12 }}
                  >
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                        Paste Job Description
                      </label>
                      <textarea
                        placeholder="Paste the complete job description text here..."
                        value={jdTextInput}
                        onChange={(e) => setJdTextInput(e.target.value)}
                        rows={6}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1.5px solid var(--border)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.88rem',
                          fontFamily: 'inherit',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    
                    <button type="submit" disabled={loadingJdScan} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem', width: 'fit-content' }}>
                      {loadingJdScan ? 'Running Comparison...' : 'Analyze Job Description'}
                    </button>

                    {jdError && (
                      <p style={{ color: 'var(--rose)', fontSize: '0.8rem', margin: 0, fontWeight: 600 }}>{jdError}</p>
                    )}

                    {/* JD Analysis Results Output */}
                    {jdResults && !loadingJdScan && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--border)', display: 'grid', gap: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: 14, borderRadius: 6, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Resume Match Score</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: jdResults.match_score >= 75 ? 'var(--emerald)' : 'var(--indigo)', fontFamily: 'Space Grotesk' }}>{jdResults.match_score}%</div>
                          </div>
                          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: 14, borderRadius: 6, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>ATS Fit Index</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: jdResults.ats_score >= 75 ? 'var(--emerald)' : 'var(--indigo)', fontFamily: 'Space Grotesk' }}>{jdResults.ats_score}%</div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                          <div>
                            <h5 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <CheckCircle size={14} color="var(--emerald)" />
                              Matching Keywords ({jdResults.matching_skills.length})
                            </h5>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {jdResults.matching_skills.slice(0, 10).map((s, idx) => (
                                <span key={idx} style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.04)', color: 'var(--emerald)', border: '1px solid rgba(16,185,129,0.12)', padding: '2px 6px', borderRadius: 4 }}>{s}</span>
                              ))}
                              {jdResults.matching_skills.length > 10 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>+{jdResults.matching_skills.length - 10} more</span>}
                            </div>
                          </div>

                          <div>
                            <h5 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <XCircle size={14} color="var(--rose)" />
                              Missing Keywords ({jdResults.missing_keywords.length})
                            </h5>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {jdResults.missing_keywords.slice(0, 8).map((s, idx) => (
                                <span key={idx} style={{ fontSize: '0.7rem', background: 'rgba(244,63,94,0.04)', color: 'var(--rose)', border: '1px solid rgba(244,63,94,0.12)', padding: '2px 6px', borderRadius: 4 }}>{s}</span>
                              ))}
                              {jdResults.missing_keywords.length > 8 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>+{jdResults.missing_keywords.length - 8} more</span>}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, borderTop: '1px dashed var(--border)', paddingTop: 12 }}>
                          <div>
                            <h5 style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: '0 0 4px' }}>Experience & Certification Gaps</h5>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 4px' }}><strong>Required Experience:</strong> {jdResults.experience_gap || 'Not specified'}</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                              <strong>Certification Gaps:</strong> {jdResults.certification_gap.length > 0 ? jdResults.certification_gap.join(', ') : 'None detected'}
                            </p>
                          </div>
                          <div>
                            <h5 style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: '0 0 4px' }}>Recommendations</h5>
                            <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {jdResults.suggestions.slice(0, 3).map((s, idx) => <li key={idx}>{s}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Assessment Center Prompt Cards */}
            {(!hasQuiz || !hasInterview) && (
              <div className="card results-card-anim" style={{ gridColumn: '1 / -1', padding: '24px', background: 'var(--bg-secondary)', border: '1.5px solid var(--border)' }}>
                <h3 style={{ fontFamily: 'Syne', fontSize: '1.15rem', color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={18} color="var(--indigo)" />
                  Assessment Verification Center
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
                  Complete assessments to verify your skills and unlock your final Career Readiness Score.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {/* Quiz Prompt */}
                  <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Award size={16} /> Skill Verification Quiz
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                        {hasQuiz ? `Completed with score: ${overallQuiz}%` : (quizSkipped ? 'Quiz was skipped. Your readiness score is estimated.' : 'Test your skills in target domain topics.')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {!hasQuiz ? (
                        <>
                          <button onClick={() => navigate('/quiz')} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>Start Quiz</button>
                          {!quizSkipped && (
                            <button onClick={() => { setQuizSkipped(true); setTimeout(() => saveActiveState(true), 100); }} className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', border: '1px solid var(--border)' }}>Skip</button>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--emerald)', fontWeight: 700 }}>Verified</span>
                      )}
                      {quizSkipped && !hasQuiz && (
                        <button onClick={() => { setQuizSkipped(false); navigate('/quiz'); }} className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', background: 'none', border: '1px underline' }}>Take Quiz</button>
                      )}
                    </div>
                  </div>

                  {/* Interview Prompt */}
                  <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Terminal size={16} /> AI Mock Interview
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                        {hasInterview ? `Completed with score: ${interviewScore}%` : (interviewSkipped ? 'Interview was skipped. Your readiness score is estimated.' : 'Practice technical, behavioral, and scenario questions.')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {!hasInterview ? (
                        <>
                          <button onClick={() => handleTabClick('interview')} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>Start Interview</button>
                          {!interviewSkipped && (
                            <button onClick={() => { setInterviewSkipped(true); setTimeout(() => saveActiveState(true), 100); }} className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', border: '1px solid var(--border)' }}>Skip</button>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--emerald)', fontWeight: 700 }}>Concluded</span>
                      )}
                      {interviewSkipped && !hasInterview && (
                        <button onClick={() => { setInterviewSkipped(false); handleTabClick('interview'); }} className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', background: 'none', border: '1px underline' }}>Take Interview</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Radar Chart */}
            <div className="card results-card-anim" style={{ padding: '24px', background: 'var(--bg-secondary)', border: '1.5px solid var(--border)' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8, margin: 0, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <Zap size={16} color="var(--indigo)" />
                Skill Verification Topology
              </h4>
              <div style={{ marginTop: 20 }}>
                {perSkillScores.length > 0
                  ? <SkillRadarChart perSkillScores={perSkillScores} />
                  : <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '40px 0' }}>
                      Complete the Skill Verification Quiz to build your skill topology radar.
                    </p>
                }
              </div>
            </div>

            {/* Matched vs Missing Skills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Matched */}
              <div className="card results-card-anim" style={{ padding: '20px', background: 'var(--bg-secondary)', border: '1.5px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, margin: 0, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                  <CheckCircle size={15} color="var(--emerald)" />
                  Extracted & Verified Skills ({matched.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                  {matched.map(s => (
                    <span key={s} className="skill-tag skill-tag-matched">{s}</span>
                  ))}
                </div>
              </div>

              {/* Missing */}
              <div className="card results-card-anim" style={{ padding: '20px', background: 'var(--bg-secondary)', border: '1.5px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, margin: 0, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                  <XCircle size={15} color="var(--rose)" />
                  Key Skill Gaps (To Upskill) ({missing.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                  {missing.map(s => (
                    <span key={s} className="skill-tag skill-tag-missing">{s}</span>
                  ))}
                </div>
              </div>

              {/* Role Info */}
              {gapAnalysis?.role_info && (
                <div className="card results-card-anim" style={{ padding: '20px', background: 'var(--bg-secondary)', border: '1.5px solid var(--border)' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: 10, color: 'var(--text-secondary)', margin: 0 }}>
                    Career Vector Metrics
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 14, marginTop: 8, lineHeight: 1.5 }}>
                    {gapAnalysis.role_info.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Average India LPA
                    </span>
                    <span style={{ color: 'var(--emerald)', fontWeight: 800, fontSize: '0.98rem', fontFamily: 'Space Grotesk' }}>
                      ₹{gapAnalysis.role_info.avg_salary_lpa[resumeData?.experience_level || 'fresher']} LPA
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LIVE JOBS BOARD */}
          {activeTab === 'livejobs' && (
            <LiveJobBoard />
          )}

          {/* JOB MATCH SCANNER */}
          {activeTab === 'jobmatch' && (
            <ATSJobMatcher />
          )}

          {/* SIMULATION TAB */}
          {activeTab === 'simulation' && loadingSimulation && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 18 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 48, height: 48,
                  border: '4px solid rgba(163, 82, 0, 0.08)',
                  borderTopColor: 'var(--indigo)',
                  borderRadius: '50%',
                }}
              />
              <p style={{ color: 'var(--text-primary)', fontSize: '1.02rem', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                AI is simulating your career growth trajectories...
              </p>
            </div>
          )}
          {simulations && (
            <div
              className="print-show-block"
              style={{ display: activeTab === 'simulation' && !loadingSimulation ? 'block' : 'none' }}
            >
              <h3 className="print-only" style={{ marginBottom: 16, fontFamily: 'Space Grotesk', fontSize: '1.3rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
                Career Simulator Paths
              </h3>
              <CareerDashboard simulations={simulations} />
            </div>
          )}

          {/* ROADMAP TAB */}
          {activeTab === 'roadmap' && loadingRoadmap && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 18 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 48, height: 48,
                  border: '4px solid rgba(163, 82, 0, 0.08)',
                  borderTopColor: 'var(--indigo)',
                  borderRadius: '50%',
                }}
              />
              <p style={{ color: 'var(--text-primary)', fontSize: '1.02rem', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                AI is constructing your personalized learning roadmap...
              </p>
            </div>
          )}
          {roadmap && (
            <div
              className="print-show-block"
              style={{ display: activeTab === 'roadmap' && !loadingRoadmap ? 'block' : 'none' }}
            >
              <h3 className="print-only" style={{ marginBottom: 16, fontFamily: 'Space Grotesk', fontSize: '1.3rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
                Personalized Learning Roadmap
              </h3>
              <RoadmapTimeline roadmap={roadmap} sessionId={sessionId} />
            </div>
          )}

          {/* COURSES TAB */}
          {activeTab === 'courses' && loadingCourses && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 18 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 48, height: 48,
                  border: '4px solid rgba(163, 82, 0, 0.08)',
                  borderTopColor: 'var(--indigo)',
                  borderRadius: '50%',
                }}
              />
              <p style={{ color: 'var(--text-primary)', fontSize: '1.02rem', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                AI is curating target course recommendations...
              </p>
            </div>
          )}
          {courses && (
            <div
              className="print-show-block"
              style={{ display: activeTab === 'courses' && !loadingCourses ? 'block' : 'none' }}
            >
              <h3 className="print-only" style={{ marginBottom: 16, fontFamily: 'Space Grotesk', fontSize: '1.3rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
                Skill Gap Course Recommendations
              </h3>
              <CourseRecommendations recommendations={courses} />
            </div>
          )}

          {/* RESUME OPTIMIZER TAB */}
          <div
            className="print-show-block"
            style={{ display: activeTab === 'optimizer' ? 'block' : 'none' }}
          >
            <h3 className="print-only" style={{ marginBottom: 16, fontFamily: 'Space Grotesk', fontSize: '1.3rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
              ATS Resume Optimizer Bullet Points
            </h3>
            <ATSResumeOptimizer sessionId={sessionId} missingSkills={missing} />
          </div>

          {/* MOCK INTERVIEW TAB */}
          <div
            className="print-hide"
            style={{ display: activeTab === 'interview' ? 'block' : 'none' }}
          >
            <InterviewSimulator sessionId={sessionId} targetRole={targetRole} />
          </div>
        </div>

      </div>
    </div>
  );
}
