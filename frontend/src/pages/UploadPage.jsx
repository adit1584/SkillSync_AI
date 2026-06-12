import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Cpu, Database, Cloud, Server, Layers, Terminal,
  ArrowRight, CheckCircle, AlertCircle,
  Zap, FileSearch, BrainCircuit, BarChart
} from 'lucide-react';
import ResumeUploader from '../components/ResumeUploader';
import { uploadResume } from '../lib/api';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';

const ROLES = [
  {
    id: 'Frontend Developer',
    icon: Code,
    color: '#A35200',
    bg: 'rgba(163, 82, 0, 0.08)',
    border: 'rgba(163, 82, 0, 0.2)',
    skills: ['React', 'JavaScript', 'CSS', 'Next.js', 'TypeScript'],
  },
  {
    id: 'Backend Engineer',
    icon: Server,
    color: '#2563eb',
    bg: 'rgba(37, 99, 235, 0.08)',
    border: 'rgba(37, 99, 235, 0.2)',
    skills: ['Node.js', 'Python', 'SQL', 'MongoDB', 'Express.js'],
  },
  {
    id: 'Fullstack Developer',
    icon: Layers,
    color: '#0d9488',
    bg: 'rgba(13, 148, 136, 0.08)',
    border: 'rgba(13, 148, 136, 0.2)',
    skills: ['React', 'Node.js', 'SQL', 'MongoDB', 'TypeScript'],
  },
  {
    id: 'AI Engineer',
    icon: Cpu,
    color: '#db2777',
    bg: 'rgba(219, 39, 119, 0.08)',
    border: 'rgba(219, 39, 119, 0.2)',
    skills: ['Python', 'PyTorch', 'LLMs', 'LangChain', 'FastAPI'],
  },
  {
    id: 'Data Analyst',
    icon: Database,
    color: '#ea580c',
    bg: 'rgba(234, 88, 12, 0.08)',
    border: 'rgba(234, 88, 12, 0.2)',
    skills: ['SQL', 'Python', 'Tableau', 'Power BI', 'Statistics'],
  },
  {
    id: 'Cloud Engineer',
    icon: Cloud,
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.08)',
    border: 'rgba(5, 150, 105, 0.2)',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'GCP'],
  },
  {
    id: 'DevOps Engineer',
    icon: Terminal,
    color: '#4f46e5',
    bg: 'rgba(79, 70, 229, 0.08)',
    border: 'rgba(79, 70, 229, 0.2)',
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'],
  },
];

const LOADING_STEPS = [
  { icon: FileSearch, label: 'Scanning PDF resume...' },
  { icon: BrainCircuit, label: 'Extracting skills with AI...' },
  { icon: BarChart, label: 'Analyzing skill gaps...' },
  { icon: CheckCircle, label: 'Building your profile...' },
];

export default function UploadPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    setSessionId, setResumeData, setGapAnalysis,
    setTargetRole, setCompressedProfile
  } = useApp();

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');

  const scannerSvgRef = useRef(null);

  // GSAP animation on loader overlay activation
  useEffect(() => {
    if (loading && scannerSvgRef.current) {
      // Spin the outer ring clock-wise
      gsap.to('.loader-outer-ring', {
        rotation: 360,
        duration: 9,
        repeat: -1,
        ease: 'none'
      });

      // Spin the inner ring counter-clock-wise
      gsap.to('.loader-inner-ring', {
        rotation: -360,
        duration: 6,
        repeat: -1,
        ease: 'none'
      });

      // Pulse central synapse hub
      gsap.to('.loader-center-hub', {
        scale: 1.25,
        opacity: 0.85,
        duration: 1.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Pulse radar scanner sweep lines
      gsap.fromTo('.loader-sweep', 
        { rotate: 0 },
        { rotate: 360, duration: 3, repeat: -1, ease: 'none', transformOrigin: '24px 24px' }
      );
    }
  }, [loading]);

  async function handleAnalyze() {
    if (!selectedFile || !selectedRole) return;

    setLoading(true);
    setError('');
    setLoadingStep(0);

    // Simulate step progression
    const stepInterval = setInterval(() => {
      setLoadingStep(s => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 2800);

    try {
      const data = await uploadResume(selectedFile, selectedRole);
      clearInterval(stepInterval);
      setLoadingStep(LOADING_STEPS.length - 1);

      // Save to global context
      setSessionId(data.session_id);
      setResumeData(data.resume);
      setGapAnalysis(data.gap_analysis);
      setTargetRole(selectedRole);
      setCompressedProfile(data.compressed_profile);

      await new Promise(r => setTimeout(r, 600));
      navigate('/quiz');
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.response?.data?.error || err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const canSubmit = selectedFile && selectedRole && !loading;

  return (
    <div className="page-wrapper" style={{ paddingTop: 110, paddingBottom: 80 }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute',
        top: '15%', left: '5%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(163, 82, 0, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%', right: '5%',
        width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(219, 39, 119, 0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ maxWidth: 840, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 44 }}
        >
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(163, 82, 0, 0.06)',
            border: '1.5px solid rgba(163, 82, 0, 0.18)',
            fontSize: '0.78rem', fontWeight: 700,
            color: 'var(--indigo)', marginBottom: 16,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            fontFamily: 'Space Grotesk, sans-serif',
          }}>
            <Zap size={12} fill="var(--indigo)" />
            Step 1 of 4 — Upload & Profile Alignment
          </span>

          <h1 style={{ fontSize: 'clamp(2.1rem, 5vw, 3.1rem)', marginBottom: 10 }}>
            Configure Your <span className="gradient-text">Profile</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: 460, margin: '0 auto' }}>
            Upload your professional resume and select a target career path to analyze gaps.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gap: 24 }}>
          {/* Upload Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="card"
            style={{ padding: '28px', background: 'var(--bg-secondary)' }}
          >
            <h2 style={{ fontSize: '1.15rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Space Grotesk' }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(163, 82, 0, 0.12)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.82rem', fontWeight: 800, color: 'var(--indigo)',
              }}>1</span>
              Attach Resume Document
            </h2>
            <ResumeUploader
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              onClear={() => setSelectedFile(null)}
            />
          </motion.div>

          {/* Role Selector */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card"
            style={{ padding: '28px', background: 'var(--bg-secondary)' }}
          >
            <h2 style={{ fontSize: '1.15rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Space Grotesk' }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(163, 82, 0, 0.12)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.82rem', fontWeight: 800, color: 'var(--indigo)',
              }}>2</span>
              Specify Target Career Role
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
            }}>
              {ROLES.map(role => {
                const isSelected = selectedRole === role.id;
                return (
                  <motion.button
                    key={role.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRole(role.id)}
                    style={{
                      background: isSelected ? role.bg : 'var(--bg-secondary)',
                      border: `1.8px solid ${isSelected ? role.color : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '22px 18px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? `0 8px 25px ${role.color}18` : 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{
                      width: 42, height: 42,
                      background: `${role.color}12`,
                      borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 14,
                      border: `1.5px solid ${role.color}20`,
                    }}>
                      <role.icon size={20} color={role.color} />
                    </div>
                    <p style={{
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      color: isSelected ? role.color : 'var(--text-primary)',
                      marginBottom: 8,
                      fontFamily: 'Space Grotesk, sans-serif',
                    }}>
                      {role.id}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {role.skills.slice(0, 3).map(s => (
                        <span key={s} style={{
                          fontSize: '0.68rem',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: `${role.color}08`,
                          color: isSelected ? role.color : 'var(--text-secondary)',
                          border: `1px solid ${role.color}15`,
                          fontWeight: 600,
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                    {isSelected && (
                      <CheckCircle
                        size={16}
                        color={role.color}
                        style={{ position: 'absolute', top: 12, right: 12 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '14px 18px',
                  background: 'rgba(225, 29, 72, 0.05)',
                  border: '1.5px solid rgba(225, 29, 72, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--rose)', fontSize: '0.88rem',
                  fontWeight: 600,
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Action */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}
          >
            <motion.button
              whileHover={canSubmit ? { scale: 1.02 } : {}}
              whileTap={canSubmit ? { scale: 0.98 } : {}}
              onClick={handleAnalyze}
              disabled={!canSubmit}
              className="btn btn-primary"
              style={{ padding: '16px 48px', fontSize: '1.05rem', minWidth: 260 }}
            >
              <Zap size={18} />
              Begin Skill Diagnostics
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Full-screen Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: theme === 'dark' ? 'rgba(9, 5, 20, 0.92)' : 'rgba(246, 248, 253, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            {/* GSAP-Animated Sweeping/Rotating SVG Scanner */}
            <div style={{ position: 'relative', marginBottom: 40 }}>
              <svg
                ref={scannerSvgRef}
                width="120"
                height="120"
                viewBox="0 0 48 48"
                style={{ overflow: 'visible' }}
              >
                {/* Outer tech scanner wheel */}
                <circle className="loader-outer-ring" cx="24" cy="24" r="21" fill="none" stroke="url(#stepperGrad)" strokeWidth="1.2" strokeDasharray="30, 10, 5, 10" style={{ transformOrigin: '24px 24px' }} />
                
                {/* Inner counter-rotating dial */}
                <circle className="loader-inner-ring" cx="24" cy="24" r="16" fill="none" stroke="url(#stepperGrad)" strokeWidth="0.8" strokeDasharray="10, 4, 2, 4" style={{ transformOrigin: '24px 24px' }} />
                
                {/* Laser Sweep line */}
                <line className="loader-sweep" x1="24" y1="24" x2="24" y2="4" stroke="var(--violet)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                
                {/* Central hub */}
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

            {/* Current Loading Label */}
            <motion.h2
              key={loadingStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontSize: '1.4rem', fontWeight: 800,
                color: 'var(--text-primary)', marginBottom: 32,
                textAlign: 'center', height: 32,
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            >
              {LOADING_STEPS[loadingStep]?.label}
            </motion.h2>

            {/* Stepper progress indicator */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 640 }}>
              {LOADING_STEPS.map((step, i) => {
                const isActive = i === loadingStep;
                const isDone = i < loadingStep;
                
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 20px',
                      borderRadius: 'var(--radius-full)',
                      background: isActive
                        ? 'rgba(163, 82, 0, 0.08)'
                        : isDone
                          ? 'rgba(5, 150, 105, 0.06)'
                          : 'rgba(15, 23, 42, 0.02)',
                      border: `1.5px solid ${
                        isActive
                          ? 'rgba(163, 82, 0, 0.3)'
                          : isDone
                            ? 'rgba(5, 150, 105, 0.2)'
                            : 'var(--border)'
                      }`,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      fontFamily: 'Space Grotesk',
                      color: isActive
                        ? 'var(--indigo)'
                        : isDone
                          ? 'var(--emerald)'
                          : 'var(--text-muted)',
                      transition: 'all 0.4s ease',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    <step.icon size={13} color={isDone ? 'var(--emerald)' : isActive ? 'var(--indigo)' : 'var(--text-muted)'} />
                    <span>{step.label.replace('...', '')}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
