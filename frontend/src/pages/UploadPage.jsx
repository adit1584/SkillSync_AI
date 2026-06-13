import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Cpu, Database, Cloud, Server, Layers, Terminal,
  ArrowRight, CheckCircle, AlertCircle, HelpCircle,
  FileSearch, BrainCircuit, BarChart, ChevronRight, Shield,
  Target, Award, User, Briefcase, GraduationCap
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
  'Frontend Developer':        { icon: Code,        color: '#09090B' },
  'Backend Engineer':          { icon: Server,      color: '#09090B' },
  'Fullstack Developer':       { icon: Layers,      color: '#09090B' },
  'AI Engineer':               { icon: Cpu,         color: '#09090B' },
  'Data Analyst':              { icon: Database,    color: '#09090B' },
  'Data Scientist':            { icon: BarChart,    color: '#09090B' },
  'Machine Learning Engineer': { icon: BrainCircuit,color: '#09090B' },
  'Cloud Engineer':            { icon: Cloud,       color: '#09090B' },
  'DevOps Engineer':           { icon: Terminal,    color: '#09090B' },
  'Security Engineer':         { icon: Shield,      color: '#09090B' },
  'Cybersecurity Analyst':     { icon: Shield,      color: '#09090B' }
};

function getRoleIcon(roleName) {
  const meta = ROLE_META[roleName];
  return meta ? meta.icon : Code;
}

const UPLOAD_STEPS = [
  { icon: FileSearch,  label: 'Scanning PDF resume...' },
  { icon: BrainCircuit,label: 'Extracting skills with AI...' },
  { icon: Award,       label: 'Building your profile...' },
  { icon: CheckCircle, label: 'Profile ready!' },
];

const RECOMMEND_STEPS = [
  { icon: BrainCircuit, label: 'Analyzing your skills...' },
  { icon: BarChart,     label: 'Matching career paths...' },
  { icon: Award,        label: 'Ranking top roles for you...' },
  { icon: CheckCircle,  label: 'Recommendations ready!' },
];

export default function UploadPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    sessionId, setSessionId, setResumeData, setGapAnalysis,
    setTargetRole, setCustomRole, setCompressedProfile, setRecommendedRoles,
    mode, setMode, saveActiveState, resumeData, resetAnalysis
  } = useApp();

  // Wizard active step: 1 (Mode), 2 (Target), 3 (Upload), 4 (Overview)
  const [stepNumber, setStepNumber] = useState(1);
  const [internalPhase, setInternalPhase] = useState('select_mode');
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

  // Restore matching step from global state on load if exists
  useEffect(() => {
    if (mode === 'path_a') {
      setInternalPhase('path_a_select_role');
      setStepNumber(2);
    } else if (mode === 'path_b') {
      setInternalPhase('path_b_upload');
      setStepNumber(3);
    }
  }, [mode]);

  // GSAP loader animations
  useEffect(() => {
    if (loading && scannerSvgRef.current) {
      gsap.to('.loader-outer-ring', { rotation: 360, duration: 9, repeat: -1, ease: 'none' });
      gsap.to('.loader-inner-ring', { rotation: -360, duration: 6, repeat: -1, ease: 'none' });
      gsap.to('.loader-sweep', { rotate: 360, duration: 3, repeat: -1, ease: 'none', transformOrigin: '24px 24px' });
    }
  }, [loading]);

  const selectPath = (chosenPath) => {
    setMode(chosenPath);
    if (chosenPath === 'path_a') {
      setInternalPhase('path_a_select_role');
      setStepNumber(2);
    } else {
      setInternalPhase('path_b_upload');
      setStepNumber(3); // Skip step 2 for recommend path
    }
  };

  const handleRoleSelectA = (role) => {
    setSelectedRoleA(role);
    setCustomRole(null);
    setInternalPhase('path_a_upload');
    setStepNumber(3);
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
      setStepNumber(3);
    } else if (internalPhase === 'path_b_recommendations') {
      handleSelectRecommendedRole(val, true);
    }
  };

  const handleUploadAndProcess = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError('');
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(s => Math.min(s + 1, UPLOAD_STEPS.length - 1));
    }, 2000);

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
        setInternalPhase('extraction_overview');
        setStepNumber(4);
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

  const handleGetRecommendations = async (sid) => {
    setInternalPhase('path_b_recommendations');
    setLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(s => Math.min(s + 1, RECOMMEND_STEPS.length - 1));
    }, 2000);

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
      setStepNumber(3);
    }
  };

  const handleSelectRecommendedRole = async (role, isCustom = false) => {
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
      setInternalPhase('extraction_overview');
      setStepNumber(4);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to target role.');
      setLoading(false);
      setSelectedRoleLocal(null);
    }
  };

  const handleContinueToWorkspace = () => {
    setTimeout(() => saveActiveState(true), 100);
    navigate('/results');
  };

  const handleReset = () => {
    resetAnalysis();
    setInternalPhase('select_mode');
    setStepNumber(1);
    setSelectedFile(null);
    setSelectedRoleA('');
    setRecommendations([]);
    setSelectedRoleLocal(null);
    setError('');
  };

  const currentSteps = internalPhase.includes('recommendations') ? RECOMMEND_STEPS : UPLOAD_STEPS;

  return (
    <div className="page-wrapper" style={{ paddingTop: 90, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 760 }}>
        
        {/* Step Progress Tracker */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 40,
          borderBottom: '1px solid var(--border)',
          paddingBottom: 20
        }}>
          {[
            { step: 1, label: 'Mode' },
            { step: 2, label: 'Target' },
            { step: 3, label: 'Upload' },
            { step: 4, label: 'Overview' }
          ].map((item) => {
            const isActive = stepNumber === item.step;
            const isCompleted = stepNumber > item.step;
            return (
              <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: isCompleted ? 'var(--success-bg)' : (isActive ? 'var(--primary)' : 'var(--bg-accent-light)'),
                  color: isCompleted ? 'var(--success)' : (isActive ? 'var(--bg-secondary)' : 'var(--text-muted)'),
                  border: `1px solid ${isCompleted ? 'var(--success-border)' : 'var(--border)'}`
                }}>
                  {isCompleted ? '✓' : item.step}
                </div>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)'
                }}>
                  {item.label}
                </span>
                {item.step < 4 && <ChevronRight size={14} color="var(--border)" style={{ marginLeft: 8 }} />}
              </div>
            );
          })}
        </div>

        {/* ── STEP 1: MODE SELECTION ── */}
        {internalPhase === 'select_mode' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8, fontFamily: 'Syne' }}>
                Choose Your Career Mode
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 460, margin: '0 auto' }}>
                Select how you would like to align your experience against industry standards.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div
                onClick={() => selectPath('path_a')}
                className="card"
                style={{
                  padding: '30px',
                  cursor: 'pointer',
                  background: 'var(--bg-secondary)',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16, border: '1px solid var(--border)'
                }}>
                  <Target size={20} color="var(--text-primary)" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, fontFamily: 'Space Grotesk' }}>
                  I Know My Target Role
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                  Select your desired position or enter a custom title, then upload your resume for skill gap assessments.
                </p>
              </div>

              <div
                onClick={() => selectPath('path_b')}
                className="card"
                style={{
                  padding: '30px',
                  cursor: 'pointer',
                  background: 'var(--bg-secondary)',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16, border: '1px solid var(--border)'
                }}>
                  <Award size={20} color="var(--text-primary)" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, fontFamily: 'Space Grotesk' }}>
                  Recommend Roles For Me
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                  Upload your resume first, and our matching model will suggest the top career tracks that fit your skills.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: TARGET ROLE SELECTION (PATH A ONLY) ── */}
        {internalPhase === 'path_a_select_role' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ marginBottom: 24 }}>
              <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline', padding: 0, marginBottom: 10 }}>
                ← Change Mode
              </button>
              <h2 style={{ fontFamily: 'Syne', fontSize: '1.6rem', fontWeight: 800 }}>
                Select Target Role
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Which tech career path would you like to verify yourself against?
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 12,
              marginBottom: 30
            }}>
              {ROLE_OPTIONS.map(role => {
                const Icon = getRoleIcon(role);
                return (
                  <div
                    key={role}
                    onClick={() => handleRoleSelectA(role)}
                    className="card"
                    style={{
                      padding: '16px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: 'var(--bg-secondary)'
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--bg-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                      <Icon size={16} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', fontFamily: 'Space Grotesk' }}>
                      {role}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{
              padding: '24px',
              background: 'var(--bg-secondary)',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.98rem', marginBottom: '10px' }}>
                Enter a Custom Target Role
              </h3>
              <form onSubmit={handleCustomRoleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 480, margin: '0 auto' }}>
                <input
                  type="text"
                  placeholder="e.g., AI Architect, Cloud Security Engineer..."
                  value={customRoleInput}
                  onChange={(e) => {
                    setCustomRoleInput(e.target.value);
                    if (customRoleError) setCustomRoleError('');
                  }}
                  className="input"
                  style={{
                    flex: '1',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '10px 20px' }}
                >
                  Confirm
                </button>
              </form>
              {customRoleError && (
                <p style={{ color: 'var(--rose)', fontSize: '0.8rem', marginTop: '8px', fontWeight: 600 }}>
                  {customRoleError}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: PREMIUM UPLOAD (PATH A OR PATH B) ── */}
        {(internalPhase === 'path_a_upload' || internalPhase === 'path_b_upload') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={() => {
                  if (internalPhase === 'path_a_upload') {
                    setInternalPhase('path_a_select_role');
                    setStepNumber(2);
                  } else {
                    handleReset();
                  }
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline', padding: 0, marginBottom: 10 }}
              >
                ← Back
              </button>
              <h2 style={{ fontFamily: 'Syne', fontSize: '1.6rem', fontWeight: 800 }}>
                {internalPhase === 'path_a_upload' ? `Target Role: ${selectedRoleA}` : 'Upload Profile Resume'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {internalPhase === 'path_a_upload' 
                  ? 'Upload your resume to check alignment gaps.' 
                  : 'Upload your resume. Our AI model will extract matching career paths.'}
              </p>
            </div>

            <div style={{ display: 'grid', gap: 20 }}>
              <div className="card" style={{ padding: 24, background: 'var(--bg-secondary)' }}>
                <ResumeUploader onFileSelect={setSelectedFile} selectedFile={selectedFile} onClear={() => setSelectedFile(null)} />
              </div>

              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                display: 'grid',
                gap: 8
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Privacy & Data Notice:</div>
                <div>We strictly parse your skills locally and do not share credentials with external trackers without consent. Supporting PDF formats up to 10MB.</div>
              </div>

              {error && (
                <div style={{ display: 'flex', gap: 10, padding: 14, background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                disabled={!selectedFile || loading}
                onClick={handleUploadAndProcess}
                className="btn btn-primary"
                style={{ padding: '14px', width: '100%', borderRadius: 'var(--radius-sm)' }}
              >
                Analyze Profile and Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* ── PATH B: CAREER RECOMMENDATION SUGGESTIONS ── */}
        {internalPhase === 'path_b_recommendations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline', padding: 0, marginBottom: 10 }}>
                ← Start Over
              </button>
              <h2 style={{ fontFamily: 'Syne', fontSize: '1.6rem', fontWeight: 800 }}>
                Suggested Target Careers
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Select one of the suggested paths below to target.
              </p>
            </div>

            <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
              {recommendations.map((rec) => {
                const Icon = getRoleIcon(rec.role);
                return (
                  <div
                    key={rec.role}
                    onClick={() => handleSelectRecommendedRole(rec.role)}
                    className="card"
                    style={{
                      padding: '18px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      background: 'var(--bg-secondary)'
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--bg-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                      <Icon size={16} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 2px' }}>
                        {rec.role}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                        Click to select this target pathway
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
                        {rec.match_score}%
                      </div>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Match</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              padding: '20px',
              background: 'var(--bg-secondary)',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
                Target a Custom Role Instead
              </h3>
              <form onSubmit={handleCustomRoleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 480, margin: '0 auto' }}>
                <input
                  type="text"
                  placeholder="e.g., Blockchain Developer, Product Engineer..."
                  value={customRoleInput}
                  onChange={(e) => {
                    setCustomRoleInput(e.target.value);
                    if (customRoleError) setCustomRoleError('');
                  }}
                  className="input"
                  style={{
                    flex: '1',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '10px 20px' }}
                >
                  Target Role
                </button>
              </form>
              {customRoleError && (
                <p style={{ color: 'var(--rose)', fontSize: '0.8rem', marginTop: '8px', fontWeight: 600 }}>
                  {customRoleError}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: EXTRACTION OVERVIEW ── */}
        {internalPhase === 'extraction_overview' && resumeData && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'Syne', fontSize: '1.6rem', fontWeight: 800 }}>
                Profile Extracted Successfully
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Review the skills and details identified in your resume before loading the workspace.
              </p>
            </div>

            <div style={{ display: 'grid', gap: 20, marginBottom: 30 }}>
              {/* Parsed Summary Card */}
              <div className="card" style={{ padding: 24, background: 'var(--bg-secondary)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Space Grotesk' }}>
                  <User size={18} /> Extracted Credentials
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: 12 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                      Experience Level
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Briefcase size={14} /> {resumeData.experience_level || 'Not specified'}
                    </div>
                  </div>

                  <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: 12 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                      Education
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <GraduationCap size={14} /> {(() => {
                        const edu = resumeData.education;
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

                {/* Skills Grid */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                    Identified Technical Skills
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {resumeData.skills && resumeData.skills.length > 0 ? (
                      resumeData.skills.map((skill) => (
                        <span key={skill} className="skill-tag skill-tag-neutral">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>No skills identified automatically.</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinueToWorkspace}
                className="btn btn-primary"
                style={{ padding: '14px', width: '100%', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem' }}
              >
                Continue to Career Intelligence Workspace
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

      </div>

      {/* Loading overlay with progressive text indicators */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: theme === 'dark' ? 'rgba(9,9,11,0.95)' : 'rgba(250,249,246,0.95)',
              zIndex: 9999, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: 24,
            }}
          >
            <svg ref={scannerSvgRef} width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ overflow: 'visible', marginBottom: 30 }}>
              <circle className="loader-outer-ring" cx="24" cy="24" r="20" stroke="var(--text-primary)" strokeWidth="2" strokeDasharray="6,8" style={{ transformOrigin: '24px 24px' }} />
              <circle className="loader-inner-ring" cx="24" cy="24" r="13" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4,6" style={{ transformOrigin: '24px 24px' }} />
              <circle cx="24" cy="24" r="4" fill="var(--text-primary)" />
              <line className="loader-sweep" x1="24" y1="24" x2="24" y2="4" stroke="var(--text-primary)" strokeWidth="1.5" opacity="0.6" style={{ transformOrigin: '24px 24px' }} />
            </svg>

            <div style={{ textAlign: 'center', maxWidth: 320 }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Syne', marginBottom: 16 }}>
                Processing Profile
              </p>
              
              <div style={{ display: 'grid', gap: 8 }}>
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
                        border: `1px solid ${isActive ? 'var(--border)' : 'transparent'}`,
                        opacity: isDone || isActive ? 1 : 0.4,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: isDone ? 'var(--success-bg)' : (isActive ? 'var(--bg-primary)' : 'rgba(0,0,0,0.05)'),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isDone ? 'var(--success)' : (isActive ? 'var(--text-primary)' : 'inherit'),
                      }}>
                        {isDone ? <CheckCircle size={14} color="var(--success)" /> : <StepIcon size={12} />}
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 700 : 500, color: 'var(--text-secondary)', textAlign: 'left', flex: 1 }}>
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
