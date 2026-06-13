import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, Award, Brain } from 'lucide-react';

export default function QuizEngine({ quiz, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [startTime] = useState(Date.now());

  const questions = quiz?.questions || [];
  const question = questions[currentIdx];
  const totalQ = questions.length;

  function handleSelect(option) {
    setSelected(option);
  }

  function handleNext(forcedAnswer) {
    const answer = forcedAnswer !== undefined ? forcedAnswer : selected;
    const newAnswers = [
      ...answers,
      { questionId: question.id, selectedOption: answer }
    ];
    setAnswers(newAnswers);
    setSelected(null);

    if (currentIdx + 1 < totalQ) {
      setCurrentIdx(i => i + 1);
    } else {
      // Quiz complete
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      onComplete(newAnswers, timeTaken);
    }
  }

  const progress = ((currentIdx) / totalQ) * 100;

  const difficultyStyles = {
    easy: { color: 'var(--emerald)', bg: 'rgba(5, 150, 105, 0.08)', border: 'rgba(5, 150, 105, 0.2)' },
    medium: { color: 'var(--amber)', bg: 'rgba(234, 88, 12, 0.08)', border: 'rgba(234, 88, 12, 0.2)' },
    hard: { color: 'var(--rose)', bg: 'rgba(225, 29, 72, 0.08)', border: 'rgba(225, 29, 72, 0.2)' },
  };
  const diff = difficultyStyles[question?.difficulty] || difficultyStyles.easy;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header: Progress */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 20,
      }}>
        {/* Question count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Space Grotesk' }}>
            Diagnostic
          </span>
          <span style={{
            fontFamily: 'Space Grotesk',
            fontWeight: 800,
            fontSize: '1.15rem',
            color: 'var(--text-primary)',
          }}>
            {currentIdx + 1} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {totalQ}</span>
          </span>
        </div>

        {/* Skill badge */}
        <span style={{
          padding: '5px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          fontWeight: 700,
          background: 'rgba(163, 82, 0, 0.06)',
          color: 'var(--indigo)',
          border: '1.5px solid rgba(163, 82, 0, 0.15)',
          fontFamily: 'Space Grotesk',
        }}>
          {question?.skill}
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-track" style={{ marginBottom: 28 }}>
        <motion.div
          className="progress-fill"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {/* Difficulty + Topic */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: diff.bg,
              color: diff.color,
              border: `1.5px solid ${diff.border}`,
              fontFamily: 'Space Grotesk',
            }}>
              {question?.difficulty}
            </span>
            <span style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)',
              border: '1.5px solid var(--border)',
              fontFamily: 'Space Grotesk',
            }}>
              {question?.topic}
            </span>
          </div>

          {/* Question text */}
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.45,
            marginBottom: question?.has_code ? 16 : 26,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            {question?.question}
          </h3>

          {/* Optional Code Snippet */}
          {question?.has_code && question?.code_snippet && (
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border)',
              background: '#0e1117',
              overflow: 'hidden',
              marginBottom: 26,
              boxShadow: 'var(--shadow-sm)',
            }}>
              {/* Code header bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
                background: '#161b22',
                borderBottom: '1.5px solid var(--border)',
              }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}>
                  {question?.skill || 'Code'} Snippet
                </span>
                {/* Dots mimicking editor */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24', opacity: 0.8 }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', opacity: 0.8 }} />
                </div>
              </div>
              {/* Code area */}
              <pre style={{
                margin: 0,
                padding: '16px 20px',
                color: '#e6edf3',
                overflowX: 'auto',
                fontSize: '0.86rem',
                fontFamily: 'Fira Code, Source Code Pro, Consolas, Monaco, monospace',
                lineHeight: 1.6,
                whiteSpace: 'pre',
                textAlign: 'left',
              }}>
                <code>{question.code_snippet}</code>
              </pre>
            </div>
          )}

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {question && Object.entries(question.options).map(([key, value]) => {
              const isSelected = selected === key;
              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelect(key)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    background: isSelected ? 'var(--indigo)' : 'var(--bg-secondary)',
                    border: `1.5px solid ${isSelected ? 'var(--indigo)' : 'var(--border)'}`,
                    color: isSelected ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                  }}
                >
                  {/* Key badge */}
                  <span style={{
                    width: 32, height: 32, flexShrink: 0,
                    borderRadius: 8,
                    background: isSelected
                      ? '#ffffff'
                      : 'rgba(163, 82, 0, 0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: 'var(--indigo)',
                    border: '1.5px solid',
                    borderColor: isSelected ? '#ffffff' : 'rgba(163, 82, 0, 0.15)',
                    fontFamily: 'Space Grotesk',
                  }}>
                    {key}
                  </span>
                  {value}
                </motion.button>
              );
            })}
          </div>

          {/* Next button */}
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNext()}
              disabled={selected === null}
              className="btn btn-primary"
              style={{ gap: 8, boxShadow: 'var(--shadow-sm)' }}
            >
              {currentIdx + 1 === totalQ ? (
                <>
                  <Award size={16} />
                  Submit Quiz Answers
                </>
              ) : (
                <>
                  Next Question
                  <ChevronRight size={16} />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
