import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, Rocket, BookOpen, CheckCircle, XCircle,
  Loader2, RefreshCw, Target, TrendingUp, Award,
  Home, AlertCircle, Terminal, Sparkles, Download, Zap, GraduationCap
} from 'lucide-react';
import SkillRadarChart from '../components/SkillRadarChart';
import CareerDashboard from '../components/CareerDashboard';
import RoadmapTimeline from '../components/RoadmapTimeline';
import InterviewSimulator from '../components/InterviewSimulator';
import ATSResumeOptimizer from '../components/ATSResumeOptimizer';
import CourseRecommendations from '../components/CourseRecommendations';
import { simulateCareer, generateRoadmap, recommendCourses } from '../lib/api';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
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
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState('');

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

  const matchScore = gapAnalysis?.match_score || 0;
  const atsScore = gapAnalysis?.ats_score || 0;
  const overallQuiz = quizResults?.overall_score || 0;
  const matched = gapAnalysis?.matched_skills || [];
  const missing = gapAnalysis?.missing_skills || [];
  const perSkillScores = quizResults?.per_skill_scores || [];

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
              <Link to="/" className="btn btn-secondary" style={{ gap: 8, fontSize: '0.85rem', padding: '10px 20px', boxShadow: 'var(--shadow-sm)' }}>
                <Home size={14} />
                Reset Engine
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Score Cards Row ───────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          {[
            { label: 'ATS Match Score', value: `${atsScore}%`, sub: `${matched.length}/${matched.length + missing.length} skills matched`, color: scoreColor(atsScore), bg: getScoreBg(atsScore), border: getScoreBorder(atsScore), icon: Target },
            { label: 'Verified Skills', value: `${matchScore}%`, sub: `${missing.length} gap skills to learn`, color: scoreColor(matchScore), bg: getScoreBg(matchScore), border: getScoreBorder(matchScore), icon: CheckCircle },
            { label: 'Diagnostic Quiz', value: `${overallQuiz}%`, sub: `${perSkillScores.length} topics evaluated`, color: scoreColor(overallQuiz), bg: getScoreBg(overallQuiz), border: getScoreBorder(overallQuiz), icon: Award },
            { label: 'Target Path', value: resumeData?.experience_level || 'N/A', sub: targetRole, color: 'var(--indigo)', bg: 'rgba(163, 82, 0, 0.04)', border: 'rgba(163, 82, 0, 0.15)', icon: TrendingUp, capitalize: true },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className="card"
              style={{
                padding: '22px 20px',
                background: 'var(--bg-secondary)',
                border: `1.5px solid ${card.border}`,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0, fontFamily: 'Space Grotesk' }}>
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
                fontSize: '1.9rem',
                color: card.color,
                lineHeight: 1,
                textTransform: card.capitalize ? 'capitalize' : 'none',
                marginBottom: 6,
                margin: 0
              }}>
                {card.value}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: card.capitalize ? 'capitalize' : 'none', margin: 0, fontWeight: 500 }}>
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
                      No verification parameters generated
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

          {/* SIMULATION TAB */}
          {simulations && (
            <div
              className="print-show-block"
              style={{ display: activeTab === 'simulation' ? 'block' : 'none' }}
            >
              <h3 className="print-only" style={{ marginBottom: 16, fontFamily: 'Space Grotesk', fontSize: '1.3rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
                Career Simulator Paths
              </h3>
              <CareerDashboard simulations={simulations} />
            </div>
          )}

          {/* ROADMAP TAB */}
          {roadmap && (
            <div
              className="print-show-block"
              style={{ display: activeTab === 'roadmap' ? 'block' : 'none' }}
            >
              <h3 className="print-only" style={{ marginBottom: 16, fontFamily: 'Space Grotesk', fontSize: '1.3rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
                Personalized Learning Roadmap
              </h3>
              <RoadmapTimeline roadmap={roadmap} sessionId={sessionId} />
            </div>
          )}

          {/* COURSES TAB */}
          {courses && (
            <div
              className="print-show-block"
              style={{ display: activeTab === 'courses' ? 'block' : 'none' }}
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
