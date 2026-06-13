import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Cpu, Database, Cloud, Server, Layers, Terminal,
  ArrowRight, CheckCircle, AlertCircle, HelpCircle,
  Zap, FileSearch, BrainCircuit, BarChart, Sparkles,
  TrendingUp, Star, ChevronRight, Shield, Wrench, Smartphone,
  Target, Award
} from 'lucide-react';
import ResumeUploader from '../components/ResumeUploader';
import { uploadResume, recommendRoles, selectRole } from '../lib/api';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';

const ROLE_OPTIONS = [
  'AI Engineer',
  'Data Scientist',
  'Frontend Developer',
  'Backend Engineer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'Fullstack Developer',
  'DevOps Engineer',
  'Security Engineer'
];

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
  'Cybersecurity Analyst':     { icon: Shield,      color: '#dc2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.25)' },
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

export default function UploadPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    sessionId, setSessionId, setResumeData, setGapAnalysis,
    setTargetRole, setCustomRole, setCompressedProfile, setRecommendedRoles,
    mode, setMode, saveActiveState
  } = useApp();

  // Internal states
  const [internalPhase, setInternalPhase] = useState('select_mode'); // 'select_mode' | 'path_a_select_role' | 'path_a_upload' | 'path_b_upload' | 'path_b_recommendations'
  const [selectedRoleA, setSelectedRoleA] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRoleLocal, setSelectedRoleLocal] = useState(null);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [customRoleError, setCustomRoleError] = useState('');

  const scannerSvgRef = useRef(null);

  // Restore matching step from global state on load
  useEffect(() => {
    if (mode === 'path_a') {
      setInternalPhase('path_a_select_role');
    } else if (mode === 'path_b') {
      setInternalPhase('path_b_upload');
    }
  }, [mode]);

  // GSAP loader animations
  useEffect(() => {
    if (loading && scannerSvgRef.current) {
      gsap.to('.loader-outer-ring', { rotation: 360, duration: 9, repeat: -1, ease: 'none' });
      gsap.to('.loader-inner-ring', { rotation: -360, duration: 6, repeat: -1, ease: 'none' });
      gsap.to('.loader-center-hub', { scale: 1.25, opacity: 0.85, duration: 1.1, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.fromTo('.loader-sweep', { rotate: 0 }, { rotate: 360, duration: 3, repeat: -1, ease: 'none', transformOrigin: '24px 24px' });
    }
  }, [loading]);

  const selectPath = (chosenPath) => {
    setMode(chosenPath);
    if (chosenPath === 'path_a') {
      setInternalPhase('path_a_select_role');
    } else {
      setInternalPhase('path_b_upload');
    }
  };

  const handleRoleSelectA = (role) => {
    setSelectedRoleA(role);
    setCustomRole(null);
    setInternalPhase('path_a_upload');
  };

  const handleCustomRoleSubmit = (e) => {
    e.preventDefault();
    const val = customRoleInput.trim();
    if (val.length < 2 || val.length > 100) {
      setCustomRoleError('Custom role must be between 2 and 100 characters.');
      return;
    }
    setCustomRoleError('');
    setCustomRoleInput('');

    if (internalPhase === 'path_a_select_role') {
      setSelectedRoleA(val);
      setCustomRole(val);
      setInternalPhase('path_a_upload');
    } else if (internalPhase === 'path_b_recommendations') {
      handleSelectRecommendedRole(val, true);
    }
  };

  // Perform PDF parsing & API uploads
  const handleUploadAndProcess = async () => {
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

      setSessionId(data.session_id);
      setResumeData(data.resume);

      if (mode === 'path_a') {
        const isCustom = !ROLE_OPTIONS.includes(selectedRoleA);
        const selRes = await selectRole(data.session_id, selectedRoleA, isCustom ? selectedRoleA : undefined);
        setTargetRole(selectedRoleA);
        if (isCustom) setCustomRole(selectedRoleA);
        setGapAnalysis(selRes.gap_analysis);
        setCompressedProfile(selRes.compressed_profile);
        setLoading(false);
        // Save state in background
        setTimeout(() => saveActiveState(true), 500);
        navigate('/results');
      } else {
        // Path B: Run recommendation phase
        setLoading(false);
        await handleGetRecommendations(data.session_id);
      }
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.response?.data?.error || err.message || 'Failed to process resume. Please try again.');
      setLoading(false);
    }
  };

  // Path B Recommendations
  const handleGetRecommendations = async (sid) => {
    setInternalPhase('path_b_recommendations');
    setLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(s => Math.min(s + 1, RECOMMEND_STEPS.length - 1));
    }, 2200);

    try {
      const data = await recommendRoles(sid);
      clearInterval(stepInterval);
      setLoadingStep(RECOMMEND_STEPS.length - 1);
      await new Promise(r => setTimeout(r, 500));

      setRecommendations(data.recommendations || []);
      setRecommendedRoles(data.recommendations || []);
      setLoading(false);
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.response?.data?.error || err.message || 'Failed to generate recommendations.');
      setLoading(false);
      setInternalPhase('path_b_upload');
    }
  };

  // Select recommended role in Path B
  const handleSelectRecommendedRole = async (role, isCustom = false) => {
    if (selectedRoleLocal === role) return;
    setSelectedRoleLocal(role);
    setLoading(true);
    setError('');

    try {
      const data = await selectRole(sessionId, role, isCustom ? role : undefined);
      setTargetRole(role);
      if (isCustom) setCustomRole(role);
      else setCustomRole(null);
      setGapAnalysis(data.gap_analysis);
      setCompressedProfile(data.compressed_profile);
      await new Promise(r => setTimeout(r, 400));
      setLoading(false);
      // Save state in background
      setTimeout(() => saveActiveState(true), 500);
      navigate('/results');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to target role.');
      setLoading(false);
      setSelectedRoleLocal(null);
    }
  };

  const handleReset = () => {
    setMode(null);
    setInternalPhase('select_mode');
    setSelectedFile(null);
    setSelectedRoleA('');
    setRecommendations([]);
    setSelectedRoleLocal(null);
    setError('');
  };

  const currentSteps = internalPhase.includes('recommendations') ? RECOMMEND_STEPS : UPLOAD_STEPS;

  return (
    <div className="page-wrapper" style={{ paddingTop: 110, paddingBottom: 80 }}>
      {/* Background Orbs */}
      <div style={{ position: 'absolute', top: '15%', left: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(163,82,0,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '5%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(219,39,119,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="container" style={{ maxWidth: 860, position: 'relative', zIndex: 1 }}>

        {/* ── MODE SELECTION ── */}
        {internalPhase === 'select_mode' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <h1 style={{ fontSize: 'clamp(2.1rem, 5vw, 3.1rem)', marginBottom: 10 }}>
                Get Career <span className="gradient-text">Intelligence</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: 520, margin: '0 auto' }}>
                Analyze skills, validate readiness, map learning pathways, and simulate future tech growth.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320, 1fr))',
              gap: 24,
              marginTop: 20
            }}>
              {/* Path A */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => selectPath('path_a')}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '36px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'var(--bg-accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20, border: '1.5px solid rgba(163,82,0,0.15)'
                }}>
                  <Target size={24} color="var(--indigo)" />
                </div>
                <h3 style={{ fontFamily: 'Syne', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
                  I Know My Target Role
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Select a specific target job first, then upload your resume to get instant gaps analysis, adaptive quizzes, and roadmaps.
                </p>
              </motion.div>

              {/* Path B */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => selectPath('path_b')}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '36px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'var(--bg-accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20, border: '1.5px solid rgba(163,82,0,0.15)'
                }}>
                  <Sparkles size={24} color="var(--indigo)" />
                </div>
                <h3 style={{ fontFamily: 'Syne', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
                  Recommend Roles For Me
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Upload your resume first, and our AI will suggest the top 3 to 5 most suitable career paths based on your current skill sets.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ── PATH A: SELECT ROLE ── */}
        {internalPhase === 'path_a_select_role' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', marginBottom: 10 }}>
                ← Change Journey Path
              </button>
              <h2 style={{ fontFamily: 'Syne', fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Select Target Role
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Which tech career path would you like to verify yourself against?
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 16
            }}>
              {ROLE_OPTIONS.map(role => {
                const meta = getRoleMeta(role);
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={role}
                    whileHover={{ y: -3, scale: 1.01 }}
                    onClick={() => handleRoleSelectA(role)}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${meta.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} color={meta.color} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
                      {role}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Custom Role Input */}
            <div style={{
              marginTop: '32px',
              padding: '24px',
              background: 'var(--bg-secondary)',
              border: '1.5px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                Can't find your role? Enter a Custom Role
              </h3>
              <form onSubmit={handleCustomRoleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 500, margin: '0 auto' }}>
                <input
                  type="text"
                  placeholder="e.g., AI Architect, SRE, Quant Developer..."
                  value={customRoleInput}
                  onChange={(e) => {
                    setCustomRoleInput(e.target.value);
                    if (customRoleError) setCustomRoleError('');
                  }}
                  style={{
                    flex: '1 1 280px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}
                >
                  Confirm Custom Role
                </button>
              </form>
              {customRoleError && (
                <p style={{ color: 'var(--rose)', fontSize: '0.82rem', marginTop: '10px', fontWeight: 600 }}>
                  {customRoleError}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── PATH A: UPLOAD RESUME ── */}
        {internalPhase === 'path_a_upload' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <button onClick={() => setInternalPhase('path_a_select_role')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', marginBottom: 10 }}>
                ← Back to Roles Selection
              </button>
              <h2 style={{ fontFamily: 'Syne', fontSize: '1.9rem', color: 'var(--text-primary)' }}>
                Target: {selectedRoleA}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Now, upload your resume to run the skill gap analysis.
              </p>
            </div>

            <div style={{ display: 'grid', gap: 20 }}>
              <div className="card" style={{ padding: 24, background: 'var(--bg-secondary)' }}>
                <ResumeUploader onFileSelect={setSelectedFile} selectedFile={selectedFile} onClear={() => setSelectedFile(null)} />
              </div>

              {error && (
                <div style={{ display: 'flex', gap: 10, padding: 14, background: 'rgba(185,28,28,0.04)', border: '1px solid rgba(185,28,28,0.15)', color: 'var(--rose)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                disabled={!selectedFile || loading}
                onClick={handleUploadAndProcess}
                className="btn btn-primary"
                style={{ padding: '14px', width: '100%' }}
              >
                Analyze Profile and Find Gaps
              </button>
            </div>
          </motion.div>
        )}

        {/* ── PATH B: UPLOAD RESUME ── */}
        {internalPhase === 'path_b_upload' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', marginBottom: 10 }}>
                ← Change Journey Path
              </button>
              <h2 style={{ fontFamily: 'Syne', fontSize: '1.9rem', color: 'var(--text-primary)' }}>
                Upload Resume for Recommendations
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                We will suggest the top career paths matching your experience.
              </p>
            </div>

            <div style={{ display: 'grid', gap: 20 }}>
              <div className="card" style={{ padding: 24, background: 'var(--bg-secondary)' }}>
                <ResumeUploader onFileSelect={setSelectedFile} selectedFile={selectedFile} onClear={() => setSelectedFile(null)} />
              </div>

              {error && (
                <div style={{ display: 'flex', gap: 10, padding: 14, background: 'rgba(185,28,28,0.04)', border: '1px solid rgba(185,28,28,0.15)', color: 'var(--rose)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                disabled={!selectedFile || loading}
                onClick={handleUploadAndProcess}
                className="btn btn-primary"
                style={{ padding: '14px', width: '100%' }}
              >
                Analyze Resume & Recommend Roles
              </button>
            </div>
          </motion.div>
        )}

        {/* ── PATH B: CAREER MATCH RECOMMENDATIONS ── */}
        {internalPhase === 'path_b_recommendations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', marginBottom: 10 }}>
                ← Start Over
              </button>
              <h2 style={{ fontFamily: 'Syne', fontSize: '1.9rem', color: 'var(--text-primary)' }}>
                Your AI Career Matches
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Based on your skills, here are the recommended paths. Click one to begin.
              </p>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              {recommendations.map((rec, index) => {
                const meta = getRoleMeta(rec.role);
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={rec.role}
                    whileHover={{ scale: 1.01, x: 4 }}
                    onClick={() => handleSelectRecommendedRole(rec.role)}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '20px 24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${meta.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} color={meta.color} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', margin: '0 0 4px' }}>
                        {rec.role}
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Click to target this role and begin assessments.
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: meta.color, fontFamily: 'Space Grotesk' }}>
                        {rec.match_score}%
                      </div>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Match</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Custom Role Input */}
            <div style={{
              marginTop: '32px',
              padding: '24px',
              background: 'var(--bg-secondary)',
              border: '1.5px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                Not matching your preference? Enter a Custom Role
              </h3>
              <form onSubmit={handleCustomRoleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 500, margin: '0 auto' }}>
                <input
                  type="text"
                  placeholder="e.g., Platform Engineer, Security Researcher..."
                  value={customRoleInput}
                  onChange={(e) => {
                    setCustomRoleInput(e.target.value);
                    if (customRoleError) setCustomRoleError('');
                  }}
                  style={{
                    flex: '1 1 280px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}
                >
                  Confirm Custom Role
                </button>
              </form>
              {customRoleError && (
                <p style={{ color: 'var(--rose)', fontSize: '0.82rem', marginTop: '10px', fontWeight: 600 }}>
                  {customRoleError}
                </p>
              )}
            </div>
          </motion.div>
        )}

      </div>

      {/* Loading overlay with text descriptions */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: theme === 'dark' ? 'rgba(18,18,18,0.92)' : 'rgba(250,246,240,0.92)',
              backdropFilter: 'blur(10px)',
              zIndex: 9999, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: 24,
            }}
          >
            {/* Synapse loading graphic */}
            <svg ref={scannerSvgRef} width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ overflow: 'visible', marginBottom: 30 }}>
              <circle className="loader-outer-ring" cx="24" cy="24" r="20" stroke="var(--indigo)" strokeWidth="2" strokeDasharray="6,8" style={{ transformOrigin: '24px 24px' }} />
              <circle className="loader-inner-ring" cx="24" cy="24" r="13" stroke="var(--violet)" strokeWidth="1.5" strokeDasharray="4,6" style={{ transformOrigin: '24px 24px' }} />
              <circle className="loader-center-hub" cx="24" cy="24" r="6" fill="var(--indigo)" />
              <line className="loader-sweep" x1="24" y1="24" x2="24" y2="4" stroke="var(--indigo)" strokeWidth="1.5" opacity="0.6" style={{ transformOrigin: '24px 24px' }} />
            </svg>

            {/* Stepper description */}
            <div style={{ textAlign: 'center', maxWidth: 320 }}>
              <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Syne', marginBottom: 16 }}>
                Processing Profile
              </p>
              
              <div style={{ display: 'grid', gap: 10 }}>
                {currentSteps.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isDone = idx < loadingStep;
                  const isActive = idx === loadingStep;

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                        background: isActive ? 'var(--bg-secondary)' : 'transparent',
                        border: `1.5px solid ${isActive ? 'var(--border)' : 'transparent'}`,
                        opacity: isDone || isActive ? 1 : 0.4,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: isDone ? 'var(--bg-accent-light)' : (isActive ? 'var(--bg-primary)' : 'rgba(0,0,0,0.05)'),
                        display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
                        color: isDone ? 'var(--emerald)' : (isActive ? 'var(--indigo)' : 'inherit'),
                        fontSize: '0.8rem', fontWeight: 800,
                      }}>
                        {isDone ? <CheckCircle size={16} color="var(--emerald)" /> : <StepIcon size={14} />}
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, color: 'var(--text-secondary)', textAlign: 'left', flex: 1 }}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
