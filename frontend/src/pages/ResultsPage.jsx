import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Rocket, BookOpen, CheckCircle, XCircle,
  Loader2, RefreshCw, Target, TrendingUp, Award,
  Home, AlertCircle, Terminal, Sparkles, Zap, GraduationCap,
  Calendar, FileText, UserCheck, Briefcase, Menu, X, ChevronRight
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

  const [activeTab, setActiveTab] = useState('onboarding');
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState('');

  // Mobile menu visibility
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.05 }
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
    const resumeStrength = Math.round(atsScore || 75);
    overallReadiness = Math.round((matchScore * 0.7) + (resumeStrength * 0.3));
    readinessModeLabel = 'Skipped Mode';
  }

  const scoreColor = (s) => {
    if (s >= 70) return 'var(--emerald)';
    if (s >= 45) return 'var(--warning)';
    return 'var(--error)';
  };

  const getScoreBg = (s) => {
    if (s >= 70) return 'var(--success-bg)';
    if (s >= 45) return 'var(--warning-bg)';
    return 'var(--error-bg)';
  };

  const getScoreBorder = (s) => {
    if (s >= 70) return 'var(--success-border)';
    if (s >= 45) return 'var(--warning-border)';
    return 'var(--error-border)';
  };

  // Checklist verification states for sidebar
  const CHECKPOINTS = [
    { id: 'onboarding', label: 'Onboarding Overview', sub: 'Extracted profile details', isDone: true },
    { id: 'opportunity', label: 'Target Opportunity', sub: 'Configure target profiles', isDone: !!configOption },
    { id: 'quiz_status', label: 'Skill Diagnostics', sub: 'Adaptive MCQ quiz', isDone: hasQuiz || quizSkipped },
    { id: 'interview', label: 'Interview Assessment', sub: 'AI mock interview simulation', isDone: hasInterview || interviewSkipped },
    { id: 'readiness', label: 'Readiness Audit', sub: 'Radar topology & score', isDone: hasQuiz || quizSkipped || hasInterview || interviewSkipped },
    { id: 'simulation', label: 'Career Simulation', sub: 'Accelerated path metrics', isDone: !!simulations },
    { id: 'roadmap', label: 'Learning Roadmap', sub: '30-day week 1-4 schedule', isDone: !!roadmap },
    { id: 'courses', label: 'Curated Courses', sub: 'Upskilling recommendations', isDone: !!courses },
    { id: 'jobmatch', label: 'ATS Job Matcher', sub: 'Pasted job description audit', isDone: !!jdResults },
    { id: 'optimizer', label: 'ATS Resume Optimizer', sub: 'Bullet point suggestions', isDone: true },
    { id: 'livejobs', label: 'Live Jobs Discovery', sub: 'Explore matching job boards', isDone: true }
  ];

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 70 }}>
      
      {/* Mobile Workspace Navigation Header */}
      <div className="print-hide" style={{
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 70,
        zIndex: 100
      }} id="mobile-navigator-bar">
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Active Step: {CHECKPOINTS.find(c => c.id === activeTab)?.label}
        </span>
        <button
          onClick={() => setMobileMenuOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: '1px solid var(--border)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            color: 'var(--text-primary)'
          }}
        >
          <Menu size={14} /> Map
        </button>
      </div>

      {/* Styled inline media query tag to show/hide mobile components */}
      <style>{`
        @media (max-width: 900px) {
          #desktop-sidebar { display: none !important; }
          #mobile-navigator-bar { display: flex !important; }
          #workspace-main { padding-left: 0 !important; }
        }
      `}</style>

      {/* E2E Layout Split Wrapper */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        
        {/* LEFT SIDEBAR: Journey Navigator */}
        <aside
          id="desktop-sidebar"
          className="print-hide"
          style={{
            width: '300px',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border)',
            padding: '30px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            overflowY: 'auto',
            height: 'calc(100vh - 70px)',
            position: 'sticky',
            top: 70
          }}
        >
          <div>
            <h3 style={{ fontFamily: 'Syne', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              Career Journey Map
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Checkpoints to complete your readiness audit.
            </p>
          </div>

          {/* Checklist Tree */}
          <div style={{ display: 'grid', gap: 8 }}>
            {CHECKPOINTS.map((checkpoint) => {
              const isActive = activeTab === checkpoint.id;
              return (
                <div
                  key={checkpoint.id}
                  onClick={() => handleTabClick(checkpoint.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    background: isActive ? 'var(--bg-primary)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--border)' : 'transparent'}`,
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.84rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {checkpoint.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {checkpoint.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 20, display: 'grid', gap: 10 }}>
            <Link
              to="/upload"
              className="btn btn-ghost"
              style={{ padding: '8px 12px', fontSize: '0.8rem', justifyContent: 'center', textDecoration: 'underline' }}
            >
              Restart Journey
            </Link>
          </div>
        </aside>

        {/* RIGHT WORKSPACE */}
        <main
          id="workspace-main"
          style={{
            flex: 1,
            padding: '30px 24px 80px',
            overflowY: 'auto',
            background: 'var(--bg-primary)'
          }}
        >
          {/* Main Workspace Frame */}
          <div style={{ maxWidth: '840px', margin: '0 auto' }}>

            {/* Error Banner */}
            {error && (
              <div style={{
                display: 'flex', gap: 10, alignItems: 'center',
                padding: '12px 16px', marginBottom: 24,
                background: 'var(--error-bg)',
                border: '1px solid var(--error-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--error)', fontSize: '0.82rem',
                fontWeight: 600,
              }}>
                <AlertCircle size={15} />
                <span>{error}</span>
                <button
                  onClick={activeTab === 'roadmap' ? loadRoadmap : activeTab === 'courses' ? loadCourses : loadSimulation}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem', fontWeight: 700 }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Workspace Panels Router */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                
                {/* 1. ONBOARDING OVERVIEW */}
                {activeTab === 'onboarding' && (
                  <div style={{ display: 'grid', gap: 24 }}>
                    <div className="card results-card-anim" style={{ padding: 24, background: 'var(--bg-secondary)' }}>
                      <h2 style={{ fontFamily: 'Syne', fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>
                        Onboarding Overview
                      </h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                        Your verified resume profile credentials parsed from the scanner.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                        <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: 12 }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                            Experience Level
                          </div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Briefcase size={14} /> {resumeData?.experience_level || 'Fresher'}
                          </div>
                        </div>

                        <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: 12 }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                            Extracted Education
                          </div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <GraduationCap size={14} /> {(() => {
                              const edu = resumeData?.education;
                              if (!edu) return 'Not specified';
                              const item = Array.isArray(edu) ? edu[0] : edu;
                              if (typeof item === 'object' && item !== null) {
                                  return `${item.degree || ''}${item.institution ? ' at ' + item.institution : ''}`;
                              }
                              return String(item || 'Not specified');
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* LPA Salary Metric */}
                      {gapAnalysis?.role_info && (
                        <div style={{ background: 'var(--bg-primary)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>India Average Compensation</span>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>Target: {targetRole}</div>
                          </div>
                          <span style={{ color: 'var(--emerald)', fontWeight: 800, fontSize: '1.15rem', fontFamily: 'Space Grotesk' }}>
                            ₹{gapAnalysis.role_info.avg_salary_lpa[resumeData?.experience_level || 'fresher']} LPA
                          </span>
                        </div>
                      )}

                      {/* Extracted Skills List */}
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
                          Identified Technical Skills
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {resumeData?.skills?.map(s => (
                            <span key={s} className="skill-tag skill-tag-neutral">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Matched vs Missing Gaps Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div className="card" style={{ padding: 20, background: 'var(--bg-secondary)' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                          <CheckCircle size={14} color="var(--emerald)" /> Matched Skills ({matched.length})
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {matched.map(s => <span key={s} className="skill-tag skill-tag-matched">{s}</span>)}
                        </div>
                      </div>

                      <div className="card" style={{ padding: 20, background: 'var(--bg-secondary)' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                          <XCircle size={14} color="var(--rose)" /> Missing Gaps ({missing.length})
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {missing.map(s => <span key={s} className="skill-tag skill-tag-missing">{s}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. TARGET OPPORTUNITY CONFIGURATION */}
                {activeTab === 'opportunity' && (
                  <div className="card results-card-anim" style={{ padding: 24, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <h2 style={{ fontFamily: 'Syne', fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>
                      Target Opportunity Configuration
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                      Configure standard profiles or paste custom job openings to test alignment diagnostics.
                    </p>

                    {/* Option Radio grid */}
                    <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
                      {[
                        { id: 'continue_selected', title: 'Standard Role Target', desc: `Standard matched career: ${targetRole && !customRole ? targetRole : 'Select standard'}` },
                        { id: 'custom_role', title: 'Custom Role Target', desc: `Enter custom profile title: ${customRole ? customRole : 'Not configured'}` },
                        { id: 'paste_jd', title: 'Job Description Scan', desc: 'Scan against custom pasted job requirements' }
                      ].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleOptionChange(item.id)}
                          style={{
                            padding: '16px',
                            borderRadius: 'var(--radius-sm)',
                            border: `2px solid ${configOption === item.id ? 'var(--border-active)' : 'var(--border)'}`,
                            background: configOption === item.id ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input type="radio" checked={configOption === item.id} readOnly />
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{item.title}</span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '6px 0 0', paddingLeft: 24 }}>
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Target Panel Views */}
                    <AnimatePresence mode="wait">
                      {configOption === 'custom_role' && (
                        <motion.form
                          key="custom_role"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          onSubmit={handleConfirmCustomRole}
                          style={{ padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                        >
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                            Enter Custom Role Title
                          </label>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <input
                              type="text"
                              placeholder="e.g. Platform Architect, Devops Engineer..."
                              className="input"
                              value={customRoleInput}
                              onChange={(e) => setCustomRoleInput(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                              Confirm
                            </button>
                          </div>
                          {customRoleError && <p style={{ color: 'var(--rose)', fontSize: '0.8rem', marginTop: 8, fontWeight: 600 }}>{customRoleError}</p>}
                        </motion.form>
                      )}

                      {configOption === 'paste_jd' && (
                        <motion.form
                          key="paste_jd"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          onSubmit={handleConfirmJdAnalysis}
                          style={{ padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'grid', gap: 12 }}
                        >
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                              Paste Job Description Text
                            </label>
                            <textarea
                              placeholder="Paste requirements..."
                              value={jdTextInput}
                              onChange={(e) => setJdTextInput(e.target.value)}
                              rows={5}
                              className="input"
                              style={{ fontFamily: 'inherit', resize: 'vertical' }}
                            />
                          </div>
                          <button type="submit" disabled={loadingJdScan} className="btn btn-primary" style={{ padding: '10px 20px', width: 'fit-content' }}>
                            {loadingJdScan ? 'Comparing...' : 'Analyze Requirements'}
                          </button>

                          {jdError && <p style={{ color: 'var(--rose)', fontSize: '0.8rem', fontWeight: 600 }}>{jdError}</p>}

                          {loadingJdScan && (
                            <div style={{ padding: '20px 0', display: 'grid', gap: 10 }}>
                              <div className="skeleton" style={{ height: 40, width: '100%' }} />
                              <div className="skeleton" style={{ height: 80, width: '100%' }} />
                            </div>
                          )}

                          {jdResults && !loadingJdScan && (
                            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--border)', display: 'grid', gap: 16 }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: 14, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>JD Alignment Match</div>
                                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{jdResults.match_score}%</div>
                                </div>
                                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: 14, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ATS Score fit</div>
                                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{jdResults.ats_score}%</div>
                                </div>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Matching keywords</div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {jdResults.matching_skills.slice(0, 6).map(s => <span key={s} className="skill-tag skill-tag-matched" style={{ fontSize: '0.7rem' }}>{s}</span>)}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Missing requirements</div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {jdResults.missing_keywords.slice(0, 6).map(s => <span key={s} className="skill-tag skill-tag-missing" style={{ fontSize: '0.7rem' }}>{s}</span>)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 3. SKILL DIAGNOSTIC STATUS */}
                {activeTab === 'quiz_status' && (
                  <div className="card results-card-anim" style={{ padding: 24, background: 'var(--bg-secondary)' }}>
                    <h2 style={{ fontFamily: 'Syne', fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>
                      Skill Verification Diagnostics
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                      Verify your technical confidence on core target role requirements.
                    </p>

                    <div style={{
                      padding: 24,
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 16
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: hasQuiz ? 'var(--success-bg)' : 'var(--bg-accent-light)',
                        border: `1px solid ${hasQuiz ? 'var(--success-border)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Award size={20} color={hasQuiz ? 'var(--success)' : 'var(--text-primary)'} />
                      </div>

                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                          {hasQuiz ? `Verification Complete: ${overallQuiz}% Score` : 'Technical Diagnostic Quiz'}
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: 400, marginTop: 4 }}>
                          {hasQuiz 
                            ? 'Your skill categories have been verified and applied to your career readiness audit.' 
                            : 'This adaptive 15 MCQ quiz verifies your core competence matches. Results refine your readiness profile.'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        {!hasQuiz ? (
                          <>
                            <button onClick={() => navigate('/quiz')} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.84rem' }}>
                              Start Verification Quiz
                            </button>
                            {!quizSkipped && (
                              <button onClick={() => { setQuizSkipped(true); setTimeout(() => saveActiveState(true), 100); }} className="btn" style={{ padding: '8px 20px', fontSize: '0.84rem' }}>
                                Skip Optional
                              </button>
                            )}
                          </>
                        ) : (
                          <button onClick={() => navigate('/quiz')} className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.84rem' }}>
                            Retake Verification
                          </button>
                        )}
                        {quizSkipped && !hasQuiz && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 600 }}>Skipped (readiness calculated as estimation)</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. AI MOCK INTERVIEW */}
                {activeTab === 'interview' && (
                  <div className="card results-card-anim" style={{ padding: 24, background: 'var(--bg-secondary)' }}>
                    <h2 style={{ fontFamily: 'Syne', fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>
                      AI Mock Interview Assessment
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                      Test scenario-based behavioral and technical skills under pressure.
                    </p>
                    <InterviewSimulator sessionId={sessionId} targetRole={targetRole} />
                  </div>
                )}

                {/* 5. READINESS DIAGNOSTICS */}
                {activeTab === 'readiness' && (
                  <div style={{ display: 'grid', gap: 24 }}>
                    <div className="card results-card-anim" style={{ padding: 24, background: 'var(--bg-secondary)' }}>
                      <h2 style={{ fontFamily: 'Syne', fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>
                        Career Readiness Diagnostics
                      </h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                        Summary calculations verified across all available diagnostics categories.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 24 }}>
                        <div style={{ background: getScoreBg(overallReadiness), border: `1px solid ${getScoreBorder(overallReadiness)}`, padding: 18, borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Readiness Score</span>
                          <div style={{ fontSize: '2rem', fontWeight: 800, color: scoreColor(overallReadiness), fontFamily: 'Space Grotesk', marginTop: 4 }}>{overallReadiness}%</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{readinessModeLabel}</span>
                        </div>

                        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: 18, borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ATS Score Strength</span>
                          <div style={{ fontSize: '2rem', fontWeight: 800, color: scoreColor(atsScore), fontFamily: 'Space Grotesk', marginTop: 4 }}>{atsScore}%</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resume match strength</span>
                        </div>
                      </div>

                      {/* Radar Chart */}
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: 16, fontFamily: 'Space Grotesk' }}>
                          Extracted Skill Topology Map
                        </h4>
                        <div>
                          {perSkillScores.length > 0
                            ? <SkillRadarChart perSkillScores={perSkillScores} />
                            : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border)', borderRadius: 8 }}>
                                Take the Skill Verification Quiz to build your verified skill topology radar.
                              </p>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. CAREER SIMULATION */}
                {activeTab === 'simulation' && (
                  <div>
                    {loadingSimulation ? (
                      /* Shimmer Card Skeleton */
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                        {[1, 2, 3].map(i => (
                          <div key={i} className="card" style={{ padding: 24, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
                            <div className="skeleton" style={{ height: 14, width: '100%', marginBottom: 8 }} />
                            <div className="skeleton" style={{ height: 14, width: '85%', marginBottom: 20 }} />
                            <div className="skeleton" style={{ height: 32, width: '100%' }} />
                          </div>
                        ))}
                      </div>
                    ) : simulations ? (
                      <CareerDashboard simulations={simulations} />
                    ) : (
                      <div className="card" style={{ padding: 40, textAlign: 'center', background: 'var(--bg-secondary)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>No career simulations have been loaded yet.</p>
                        <button onClick={loadSimulation} className="btn btn-primary" style={{ padding: '8px 20px' }}>Simulate Careers</button>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. LEARNING ROADMAP */}
                {activeTab === 'roadmap' && (
                  <div>
                    {loadingRoadmap ? (
                      /* Shimmer Timeline Skeleton */
                      <div style={{ display: 'grid', gap: 20 }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="card" style={{ padding: 24, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            <div className="skeleton" style={{ height: 18, width: '30%', marginBottom: 16 }} />
                            <div style={{ display: 'grid', gap: 10 }}>
                              <div className="skeleton" style={{ height: 12, width: '90%' }} />
                              <div className="skeleton" style={{ height: 12, width: '80%' }} />
                              <div className="skeleton" style={{ height: 12, width: '95%' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : roadmap ? (
                      <RoadmapTimeline roadmap={roadmap} sessionId={sessionId} />
                    ) : (
                      <div className="card" style={{ padding: 40, textAlign: 'center', background: 'var(--bg-secondary)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>No roadmap schedule has been loaded yet.</p>
                        <button onClick={loadRoadmap} className="btn btn-primary" style={{ padding: '8px 20px' }}>Generate 30-Day Roadmap</button>
                      </div>
                    )}
                  </div>
                )}

                {/* 8. CURATED COURSES */}
                {activeTab === 'courses' && (
                  <div>
                    {loadingCourses ? (
                      /* Shimmer Courses Skeleton */
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="card" style={{ padding: 20, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 10 }} />
                            <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 16 }} />
                            <div className="skeleton" style={{ height: 12, width: '100%', marginBottom: 6 }} />
                            <div className="skeleton" style={{ height: 12, width: '90%', marginBottom: 16 }} />
                            <div className="skeleton" style={{ height: 28, width: '100%' }} />
                          </div>
                        ))}
                      </div>
                    ) : courses ? (
                      <CourseRecommendations recommendations={courses} />
                    ) : (
                      <div className="card" style={{ padding: 40, textAlign: 'center', background: 'var(--bg-secondary)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>No course recommendations have been loaded yet.</p>
                        <button onClick={loadCourses} className="btn btn-primary" style={{ padding: '8px 20px' }}>Load Recommendations</button>
                      </div>
                    )}
                  </div>
                )}

                {/* 9. ATS JOB MATCHER */}
                {activeTab === 'jobmatch' && (
                  <ATSJobMatcher />
                )}

                {/* 10. ATS RESUME OPTIMIZER */}
                {activeTab === 'optimizer' && (
                  <ATSResumeOptimizer sessionId={sessionId} missingSkills={missing} />
                )}

                {/* 11. LIVE JOBS DISCOVERY */}
                {activeTab === 'livejobs' && (
                  <LiveJobBoard />
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* MOBILE MAP MODAL / CHECKS DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(9,9,11,0.8)',
              zIndex: 9999,
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '300px',
                height: '100%',
                background: 'var(--bg-secondary)',
                padding: '30px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'Syne', fontSize: '1.1rem', fontWeight: 800 }}>Journey Map</h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Tree menu list */}
              <div style={{ display: 'grid', gap: 8 }}>
                {CHECKPOINTS.map((checkpoint) => {
                  const isActive = activeTab === checkpoint.id;
                  return (
                    <div
                      key={checkpoint.id}
                      onClick={() => {
                        handleTabClick(checkpoint.id);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        background: isActive ? 'var(--bg-primary)' : 'transparent',
                        border: `1px solid ${isActive ? 'var(--border)' : 'transparent'}`
                      }}
                    >
                      <div style={{
                        width: 18,
                        height: 18,
                        borderRadius: '3px',
                        border: `1.5px solid ${checkpoint.isDone ? 'var(--border-active)' : 'var(--border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: checkpoint.isDone ? 'var(--border-active)' : 'transparent',
                        color: checkpoint.isDone ? 'var(--bg-secondary)' : 'transparent',
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        marginTop: 2
                      }}>
                        {checkpoint.isDone && '✓'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: isActive ? 700 : 500, color: 'var(--text-primary)' }}>
                          {checkpoint.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 20, display: 'grid', gap: 10 }}>
                <button
                  onClick={() => { handleDownloadReport(); setMobileMenuOpen(false); }}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  <Download size={13} /> PDF Report
                </button>
                <Link
                  to="/upload"
                  className="btn btn-ghost"
                  style={{ padding: '8px 12px', fontSize: '0.8rem', justifyContent: 'center', textDecoration: 'underline' }}
                >
                  Restart Journey
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
