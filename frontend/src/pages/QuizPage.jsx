import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Loader2, AlertCircle, Trophy,
  CheckCircle, XCircle, ArrowRight, Zap
} from 'lucide-react';
import QuizEngine from '../components/QuizEngine';
import { generateQuiz, submitQuiz } from '../lib/api';
import { useApp } from '../context/AppContext';

export default function QuizPage() {
  const navigate = useNavigate();
  const {
    sessionId, targetRole, resumeData,
    quizData, setQuizData, setQuizResults,
  } = useApp();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  // Redirect if no session
  useEffect(() => {
    if (!sessionId) {
      navigate('/upload');
      return;
    }
    if (!quizData) {
      loadQuiz();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  async function loadQuiz() {
    try {
      setLoading(true);
      const data = await generateQuiz(sessionId);
      setQuizData(data.quiz);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  }

  async function handleQuizComplete(answers, timeTaken) {
    setSubmitting(true);
    try {
      const data = await submitQuiz(
        sessionId,
        quizData.quiz_id,
        answers,
        timeTaken
      );
      setResults(data);
      setQuizResults(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to score quiz');
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue() {
    navigate('/results');
  }

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-wrapper flex-center" style={{ minHeight: '100vh', gap: 18, flexDirection: 'column' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 56, height: 56,
            border: '4.5px solid rgba(163, 82, 0, 0.08)',
            borderTopColor: 'var(--indigo)',
            borderRadius: '50%',
          }}
        />
        <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
          Generating your adaptive quiz...
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
          AI is compiling questions matching your target path
        </p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="page-wrapper flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center',
          padding: '20px 28px',
          background: 'rgba(225, 29, 72, 0.05)',
          border: '1.5px solid rgba(225, 29, 72, 0.25)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--rose)',
          fontWeight: 600,
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
        <button className="btn btn-secondary" onClick={() => { setError(''); loadQuiz(); }}>
          Try Again
        </button>
      </div>
    );
  }

  // ── Quiz Results screen ──────────────────────────────────────
  if (results) {
    return (
      <div className="page-wrapper" style={{ paddingTop: 110, paddingBottom: 80 }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', marginBottom: 36 }}
          >
            <div style={{
              width: 80, height: 80,
              background: 'linear-gradient(135deg, rgba(163, 82, 0, 0.1), rgba(97, 46, 2, 0.08))',
              border: '1.5px solid rgba(163, 82, 0, 0.25)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: 'var(--shadow-glow)',
            }}>
              <Trophy size={36} color="var(--indigo)" />
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.7rem)', marginBottom: 8 }}>
              Evaluation Complete!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', fontWeight: 600 }}>
              Diagnostic Score:{' '}
              <strong style={{ color: 'var(--indigo)', fontSize: '1.35rem', fontFamily: 'Space Grotesk' }}>
                {results.overall_score}%
              </strong>
            </p>
          </motion.div>

          {/* Per-skill breakdown */}
          <div style={{ display: 'grid', gap: 14, marginBottom: 32 }}>
            {results.per_skill_scores?.map((s, i) => (
              <motion.div
                key={s.skill}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card"
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 24px',
                  background: 'var(--bg-secondary)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
                      {s.skill}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'Space Grotesk' }}>
                      {s.correct}/{s.total} correct · {s.score}%
                    </span>
                  </div>
                  <div className="progress-track">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${s.score}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08 }}
                    />
                  </div>
                </div>
                <span style={{
                  padding: '5px 12px', borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem', fontWeight: 700,
                  fontFamily: 'Space Grotesk',
                  background: s.score >= 60 ? 'rgba(5, 150, 105, 0.08)' : 'rgba(225, 29, 72, 0.08)',
                  color: s.score >= 60 ? 'var(--emerald)' : 'var(--rose)',
                  border: `1.5px solid ${s.score >= 60 ? 'rgba(5, 150, 105, 0.2)' : 'rgba(225, 29, 72, 0.2)'}`,
                  whiteSpace: 'nowrap',
                }}>
                  {s.proficiency}
                </span>
              </motion.div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinue}
              className="btn btn-primary"
              style={{ padding: '14px 40px', fontSize: '1rem', boxShadow: 'var(--shadow-sm)' }}
            >
              <Zap size={16} />
              View Gap Analysis & Roadmap
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // ── Active Quiz ──────────────────────────────────────────────
  return (
    <div className="page-wrapper" style={{ paddingTop: 110, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 820 }}>
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 36 }}
        >
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(219, 39, 119, 0.06)',
            border: '1.5px solid rgba(219, 39, 119, 0.18)',
            fontSize: '0.78rem', fontWeight: 700,
            color: 'var(--violet)', marginBottom: 16,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            fontFamily: 'Space Grotesk',
          }}>
            <Brain size={12} />
            Step 2 of 4 — Skill Verification Audit
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.7rem)', marginBottom: 8 }}>
            Verify Core <span className="gradient-text">Competencies</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Adaptive Diagnostic MCQ · {targetRole} · Self-Paced
          </p>
        </motion.div>

        {/* Quiz */}
        <AnimatePresence>
          {submitting ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-center"
              style={{ flexDirection: 'column', gap: 16, padding: '60px 0' }}
            >
              <div className="spinner" />
              <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Scoring diagnostic answers...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ padding: '36px', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-md)' }}
            >
              <QuizEngine quiz={quizData} onComplete={handleQuizComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
