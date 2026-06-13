import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Cpu, Database, Cloud, Server, Layers, Terminal,
  ArrowRight, CheckCircle, AlertCircle,
  Zap, FileSearch, BrainCircuit, BarChart, Sparkles,
  TrendingUp, Star, ChevronRight, Shield, Wrench, Smartphone
} from 'lucide-react';
import ResumeUploader from '../components/ResumeUploader';
import { uploadResume, recommendRoles, selectRole } from '../lib/api';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';

// Role icon/color map for display
const ROLE_META = {
  'Frontend Developer':        { icon: Code,        color: '#A35200', bg: 'rgba(163,82,0,0.08)',    border: 'rgba(163,82,0,0.25)' },
  'Backend Engineer':          { icon: Server,      color: '#2563eb', bg: 'rgba(37,99,235,0.08)',   border: 'rgba(37,99,235,0.25)' },
  'Fullstack Developer':       { icon: Layers,      color: '#0d9488', bg: 'rgba(13,148,136,0.08)', border: 'rgba(13,148,136,0.25)' },
  'AI Engineer':               { icon: Cpu,         color: '#db2777', bg: 'rgba(219,39,119,0.08)', border: 'rgba(219,39,119,0.25)' },
  'Data Analyst':              { icon: Database,    color: '#ea580c', bg: 'rgba(234,88,12,0.08)',  border: 'rgba(234,88,12,0.25)' },
  'Data Scientist':            { icon: BarChart,    color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.25)' },
  'Machine Learning Engineer': { icon: BrainCircuit,color: '#0891b2', bg: 'rgba(8,145,178,0.08)',  border: 'rgba(8,145,178,0.25)' },
  'Cloud Engineer':            { icon: Cloud,       color: '#059669', bg: 'rgba(5,150,105,0.08)',  border: 'rgba(5,150,105,0.25)' },
  'DevOps Engineer':           { icon: Terminal,    color: '#4f46e5', bg: 'rgba(79,70,229,0.08)',  border: 'rgba(79,70,229,0.25)' },
  'Site Reliability Engineer': { icon: Shield,      color: '#b45309', bg: 'rgba(180,83,9,0.08)',   border: 'rgba(180,83,9,0.25)' },
  'Security Engineer':         { icon: Shield,      color: '#dc2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.25)' },
  'QA Engineer':               { icon: CheckCircle, color: '#16a34a', bg: 'rgba(22,163,74,0.08)',  border: 'rgba(22,163,74,0.25)' },
  'Mobile Developer':          { icon: Smartphone,  color: '#9333ea', bg: 'rgba(147,51,234,0.08)', border: 'rgba(147,51,234,0.25)' },
  'Blockchain Developer':      { icon: Zap,         color: '#d97706', bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.25)' },
  'Platform Engineer':         { icon: Wrench,      color: '#0369a1', bg: 'rgba(3,105,161,0.08)',  border: 'rgba(3,105,161,0.25)' },
  'Embedded Systems Engineer': { icon: Cpu,         color: '#6d28d9', bg: 'rgba(109,40,217,0.08)', border: 'rgba(109,40,217,0.25)' },
  'Product Engineer':          { icon: Star,        color: '#be185d', bg: 'rgba(190,24,93,0.08)',  border: 'rgba(190,24,93,0.25)' },
};

function getRoleMeta(roleName) {
  return ROLE_META[roleName] || {
    icon: Code,
    color: '#A35200',
    bg: 'rgba(163,82,0,0.08)',
    border: 'rgba(163,82,0,0.25)'
  };
}

const UPLOAD_STEPS = [
  { icon: FileSearch,  label: 'Scanning PDF resume...' },
  { icon: BrainCircuit,label: 'Extracting skills with AI...' },
  { icon: Sparkles,    label: 'Building your profile...' },
  { icon: CheckCircle, label: 'Profile ready!' },
];

const RECOMMEND_STEPS = [
  { icon: BrainCircuit, label: 'Analyzing your skills...' },
  { icon: TrendingUp,   label: 'Matching career paths...' },
  { icon: Star,         label: 'Ranking top roles for you...' },
  { icon: CheckCircle,  label: 'Recommendations ready!' },
];

// Phase: 'upload' | 'recommending' | 'select' | 'selecting'
export default function UploadPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    setSessionId, setResumeData, setGapAnalysis,
    setTargetRole, setCompressedProfile, setRecommendedRoles
  } = useApp();

  const [phase, setPhase] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [sessionIdLocal, setSessionIdLocal] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRoleLocal, setSelectedRoleLocal] = useState(null);

  const scannerSvgRef = useRef(null);

  // GSAP animation on loader overlay
  useEffect(() => {
    if (loading && scannerSvgRef.current) {
      gsap.to('.loader-outer-ring', { rotation: 360, duration: 9, repeat: -1, ease: 'none' });
      gsap.to('.loader-inner-ring', { rotation: -360, duration: 6, repeat: -1, ease: 'none' });
      gsap.to('.loader-center-hub', { scale: 1.25, opacity: 0.85, duration: 1.1, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.fromTo('.loader-sweep', { rotate: 0 }, { rotate: 360, duration: 3, repeat: -1, ease: 'none', transformOrigin: '24px 24px' });
    }
  }, [loading]);

  // Phase 1: Upload resume, extract skills
  async function handleUploadAndExtract() {
    if (!selectedFile) return;
    setLoading(true);
    setError('');
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(s => Math.min(s + 1, UPLOAD_STEPS.length - 1));
    }, 2500);

    try {
      const data = await uploadResume(selectedFile);
      clearInterval(stepInterval);
      setLoadingStep(UPLOAD_STEPS.length - 1);
      await new Promise(r => setTimeout(r, 600));

      setSessionIdLocal(data.session_id);
      setSessionId(data.session_id);
      setResumeData(data.resume);

      // Immediately move to recommendation phase
      setLoading(false);
      await handleGetRecommendations(data.session_id);
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.response?.data?.error || err.message || 'Failed to process resume. Please try again.');
      setLoading(false);
    }
  }

  // Phase 2: Get AI career recommendations
  async function handleGetRecommendations(sid) {
    setPhase('recommending');
    setLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(s => Math.min(s + 1, RECOMMEND_STEPS.length - 1));
    }, 2200);

    try {
      const data = await recommendRoles(sid || sessionIdLocal);
      clearInterval(stepInterval);
      setLoadingStep(RECOMMEND_STEPS.length - 1);
      await new Promise(r => setTimeout(r, 500));

      setRecommendations(data.recommendations || []);
      setRecommendedRoles(data.recommendations || []);
      setLoading(false);
      setPhase('select');
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.response?.data?.error || err.message || 'Failed to get recommendations. Please try again.');
      setLoading(false);
      setPhase('upload');
    }
  }

  // Phase 3: User selects a role
  async function handleRoleSelect(role) {
    if (selectedRoleLocal === role) return;
    setSelectedRoleLocal(role);
    setPhase('selecting');
    setError('');

    try {
      const data = await selectRole(sessionIdLocal, role);
      setTargetRole(role);
      setGapAnalysis(data.gap_analysis);
      setCompressedProfile(data.compressed_profile);
      await new Promise(r => setTimeout(r, 400));
      navigate('/quiz');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to select role. Please try again.');
      setPhase('select');
      setSelectedRoleLocal(null);
    }
  }

  const canUpload = selectedFile && !loading;

  const activeSteps = (phase === 'upload' || phase === 'recommending' && !recommendations.length)
    ? (loading && phase === 'recommending' ? RECOMMEND_STEPS : UPLOAD_STEPS)
    : RECOMMEND_STEPS;

  const currentSteps = phase === 'recommending' ? RECOMMEND_STEPS : UPLOAD_STEPS;

  return (
    <div className="page-wrapper" style={{ paddingTop: 110, paddingBottom: 80 }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', top: '15%', left: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(163,82,0,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '5%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(219,39,119,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="container" style={{ maxWidth: 860, position: 'relative', zIndex: 1 }}>

        {/* ── PHASE: upload ──────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {(phase === 'upload') && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 44 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '6px 18px', borderRadius: 'var(--radius-full)',
                  background: 'rgba(163,82,0,0.06)', border: '1.5px solid rgba(163,82,0,0.18)',
                  fontSize: '0.78rem', fontWeight: 700, color: 'var(--indigo)', marginBottom: 16,
                  letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Space Grotesk, sans-serif',
                }}>
                  <Zap size={12} fill="var(--indigo)" />
                  Step 1 — Upload Resume
                </span>
                <h1 style={{ fontSize: 'clamp(2.1rem, 5vw, 3.1rem)', marginBottom: 10 }}>
                  Upload Your <span className="gradient-text">Resume</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: 460, margin: '0 auto' }}>
                  AI will analyze your skills and recommend the best-fit career roles tailored specifically for you.
                </p>
              </div>

              <div style={{ display: 'grid', gap: 24 }}>
                {/* Upload Card */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card" style={{ padding: '28px', background: 'var(--bg-secondary)' }}>
                  <h2 style={{ fontSize: '1.15rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Space Grotesk' }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(163,82,0,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 800, color: 'var(--indigo)' }}>1</span>
                    Attach Resume Document
                  </h2>
                  <ResumeUploader onFileSelect={setSelectedFile} selectedFile={selectedFile} onClear={() => setSelectedFile(null)} />
                </motion.div>

                {/* What happens next info */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card" style={{ padding: '22px 28px', background: 'var(--bg-secondary)', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(163,82,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1.5px solid rgba(163,82,0,0.2)' }}>
                    <Sparkles size={20} color="var(--indigo)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6, fontFamily: 'Space Grotesk' }}>What happens next?</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                      AI extracts your skills → analyzes your profile → recommends your top 5 best-fit career roles with match scores. You then choose the role you want to target.
                    </p>
                  </div>
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '14px 18px', background: 'rgba(225,29,72,0.05)', border: '1.5px solid rgba(225,29,72,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--rose)', fontSize: '0.88rem', fontWeight: 600 }}>
                      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                  <motion.button
                    whileHover={canUpload ? { scale: 1.02 } : {}}
                    whileTap={canUpload ? { scale: 0.98 } : {}}
                    onClick={handleUploadAndExtract}
                    disabled={!canUpload}
                    className="btn btn-primary"
                    style={{ padding: '16px 48px', fontSize: '1.05rem', minWidth: 280 }}
                  >
                    <BrainCircuit size={18} />
                    Analyze Resume & Get Recommendations
                    <ArrowRight size={16} />
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ── PHASE: select ──────────────────────────────────────────── */}
          {(phase === 'select' || phase === 'selecting') && (
            <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 44 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '6px 18px', borderRadius: 'var(--radius-full)',
                  background: 'rgba(163,82,0,0.06)', border: '1.5px solid rgba(163,82,0,0.18)',
                  fontSize: '0.78rem', fontWeight: 700, color: 'var(--indigo)', marginBottom: 16,
                  letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Space Grotesk, sans-serif',
                }}>
                  <Star size={12} fill="var(--indigo)" />
                  Step 2 — Choose Your Target Role
                </span>
                <h1 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.9rem)', marginBottom: 10 }}>
                  Your AI <span className="gradient-text">Career Matches</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: 520, margin: '0 auto' }}>
                  Based on your resume, here are your top {recommendations.length} best-fit roles. Click one to begin your personalized skill assessment.
                </p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '14px 18px', marginBottom: 20, background: 'rgba(225,29,72,0.05)', border: '1.5px solid rgba(225,29,72,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--rose)', fontSize: '0.88rem', fontWeight: 600 }}>
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recommendation Cards */}
              <div style={{ display: 'grid', gap: 16 }}>
                {recommendations.map((rec, index) => {
                  const meta = getRoleMeta(rec.role);
                  const IconComponent = meta.icon;
                  const isSelected = selectedRoleLocal === rec.role;
                  const isLoading = phase === 'selecting' && isSelected;

                  return (
                    <motion.button
                      key={rec.role}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      whileHover={phase === 'select' ? { scale: 1.01, x: 4 } : {}}
                      whileTap={phase === 'select' ? { scale: 0.99 } : {}}
                      onClick={() => phase === 'select' && handleRoleSelect(rec.role)}
                      disabled={phase === 'selecting'}
                      style={{
                        background: isSelected ? meta.bg : 'var(--bg-secondary)',
                        border: `2px solid ${isSelected ? meta.color : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '20px 24px',
                        cursor: phase === 'select' ? 'pointer' : 'default',
                        textAlign: 'left',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 20,
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? `0 8px 28px ${meta.color}22` : 'var(--shadow-sm)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Rank badge */}
                      <div style={{
                        position: 'absolute', top: 12, left: 12,
                        width: 22, height: 22, borderRadius: 6,
                        background: `${meta.color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.68rem', fontWeight: 800, color: meta.color,
                        fontFamily: 'Space Grotesk',
                      }}>
                        #{index + 1}
                      </div>

                      {/* Role icon */}
                      <div style={{
                        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                        background: `${meta.color}12`,
                        border: `1.5px solid ${meta.color}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: 4,
                      }}>
                        <IconComponent size={22} color={meta.color} />
                      </div>

                      {/* Main info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <p style={{ fontWeight: 800, fontSize: '1.08rem', color: isSelected ? meta.color : 'var(--text-primary)', fontFamily: 'Space Grotesk', margin: 0 }}>
                            {rec.role}
                          </p>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500, margin: '6px 0 0', fontFamily: 'Space Grotesk' }}>
                          {isSelected ? 'Setting up your assessment...' : 'Click to start your personalized assessment'}
                        </p>
                      </div>

                      {/* Match score + arrow */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{
                          fontSize: '2rem', fontWeight: 900, color: meta.color,
                          fontFamily: 'Space Grotesk', lineHeight: 1,
                        }}>
                          {rec.match_score}%
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>match</span>
                        {isLoading ? (
                          <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${meta.color}30`, borderTop: `2px solid ${meta.color}`, animation: 'spin 0.8s linear infinite' }} />
                        ) : (
                          <ChevronRight size={18} color={isSelected ? meta.color : 'var(--text-muted)'} />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Re-upload option */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ textAlign: 'center', marginTop: 24 }}>
                <button
                  onClick={() => { setPhase('upload'); setRecommendations([]); setSelectedFile(null); setError(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'underline' }}
                >
                  ← Upload a different resume
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full-screen Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: theme === 'dark' ? 'rgba(9,5,20,0.92)' : 'rgba(246,248,253,0.92)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              zIndex: 9999, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: '24px',
            }}
          >
            {/* Animated SVG Scanner */}
            <div style={{ position: 'relative', marginBottom: 40 }}>
              <svg ref={scannerSvgRef} width="120" height="120" viewBox="0 0 48 48" style={{ overflow: 'visible' }}>
                <circle className="loader-outer-ring" cx="24" cy="24" r="21" fill="none" stroke="url(#stepperGrad)" strokeWidth="1.2" strokeDasharray="30,10,5,10" style={{ transformOrigin: '24px 24px' }} />
                <circle className="loader-inner-ring" cx="24" cy="24" r="16" fill="none" stroke="url(#stepperGrad)" strokeWidth="0.8" strokeDasharray="10,4,2,4" style={{ transformOrigin: '24px 24px' }} />
                <line className="loader-sweep" x1="24" y1="24" x2="24" y2="4" stroke="var(--violet)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                <circle className="loader-center-hub" cx="24" cy="24" r="4.5" fill="url(#hubGrad)" style={{ transformOrigin: '24px 24px' }} />
                <defs>
                  <linearGradient id="stepperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--indigo)" />
                    <stop offset="100%" stopColor="var(--violet)" />
                  </linearGradient>
                  <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--violet)" />
                    <stop offset="100%" stopColor="var(--indigo)" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            {/* Loading label */}
            <motion.h2
              key={`${phase}-${loadingStep}`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 32, textAlign: 'center', height: 32, fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {phase === 'recommending' ? RECOMMEND_STEPS[loadingStep]?.label : UPLOAD_STEPS[loadingStep]?.label}
            </motion.h2>

            {/* Step indicators */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 640 }}>
              {(phase === 'recommending' ? RECOMMEND_STEPS : UPLOAD_STEPS).map((step, i) => {
                const isActive = i === loadingStep;
                const isDone = i < loadingStep;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'rgba(163,82,0,0.08)' : isDone ? 'rgba(5,150,105,0.06)' : 'rgba(15,23,42,0.02)',
                    border: `1.5px solid ${isActive ? 'rgba(163,82,0,0.3)' : isDone ? 'rgba(5,150,105,0.2)' : 'var(--border)'}`,
                    fontSize: '0.82rem', fontWeight: 700, fontFamily: 'Space Grotesk',
                    color: isActive ? 'var(--indigo)' : isDone ? 'var(--emerald)' : 'var(--text-muted)',
                    transition: 'all 0.4s ease',
                    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  }}>
                    <step.icon size={13} color={isDone ? 'var(--emerald)' : isActive ? 'var(--indigo)' : 'var(--text-muted)'} />
                    <span>{step.label.replace('...', '')}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
