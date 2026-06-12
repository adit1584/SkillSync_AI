import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Check, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { optimizeResume } from '../lib/api';

export default function ATSResumeOptimizer({ sessionId, missingSkills }) {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadSuggestions();
  }, [sessionId]);

  async function loadSuggestions() {
    try {
      setLoading(true);
      setError('');
      const res = await optimizeResume(sessionId);
      if (res.success) {
        setSuggestions(res.suggestions || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch suggestions');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text, idx) {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // ── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 16 }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600 }}>
          Generating ATS optimization recommendations...
        </p>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '40px 20px' }}>
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center',
          padding: '16px 24px',
          background: 'rgba(225, 29, 72, 0.05)',
          border: '1.5px solid rgba(225, 29, 72, 0.25)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--rose)',
          fontWeight: 600,
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
        <button className="btn btn-secondary" onClick={loadSuggestions}>
          <RefreshCw size={14} /> Retry Optimization
        </button>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────
  if (suggestions.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 24px',
        background: 'var(--bg-secondary)',
        border: '1.5px dashed var(--border)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--text-secondary)'
      }}>
        <FileText size={48} color="var(--emerald)" style={{ marginBottom: 16, opacity: 0.7 }} />
        <h3 style={{ fontSize: '1.15rem', marginBottom: 8, color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>Resume fully optimized!</h3>
        <p style={{ fontSize: '0.88rem', maxWidth: 440, margin: '0 auto' }}>
          Your profile matches all required core tech skills for this target role. No additional keyword additions are recommended.
        </p>
      </div>
    );
  }

  // ── Main Content ─────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div style={{
        padding: '20px',
        background: 'var(--bg-secondary)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          width: 44, height: 44,
          borderRadius: 'var(--radius-md)',
          background: 'rgba(163, 82, 0, 0.08)',
          border: '1.5px solid rgba(163, 82, 0, 0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <Sparkles size={20} color="var(--indigo)" />
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4, margin: 0, fontFamily: 'Space Grotesk' }}>
            Tailored Resume Bullet Suggestions
          </h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Insert these high-impact keywords and descriptions into your resume's Projects or Experience section to boost your ATS match score.
          </p>
        </div>
      </div>

      {/* List of suggestions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {suggestions.map((s, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className="card"
            style={{
              background: 'var(--bg-secondary)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {/* Skill badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.74rem',
                fontWeight: 700,
                background: 'rgba(163, 82, 0, 0.08)',
                color: 'var(--indigo)',
                border: '1.5px solid rgba(163, 82, 0, 0.18)',
                fontFamily: 'Space Grotesk'
              }}>
                {s.skill}
              </span>
              {s.impact_metric && (
                <span style={{ fontSize: '0.82rem', color: 'var(--emerald)', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                  Suggested Impact: {s.impact_metric}
                </span>
              )}
            </div>

            {/* Comparison view */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {/* Original (Generic suggestion) */}
              <div style={{
                padding: '14px 18px',
                background: 'var(--bg-primary)',
                border: '1.5px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', flexDirection: 'column', gap: 4
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
                  Original / Weak Phrase
                </span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                  "{s.original_bullet_suggestion || `Worked with ${s.skill}`}"
                </p>
              </div>

              {/* Optimized suggestion */}
              <div style={{
                padding: '14px 18px',
                background: 'rgba(163, 82, 0, 0.04)',
                border: '1.5px solid rgba(163, 82, 0, 0.18)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', flexDirection: 'column', gap: 4,
                position: 'relative'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--indigo)', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
                  ATS-Optimized Bullet Point
                </span>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600, paddingRight: 32, lineHeight: 1.5, margin: 0 }}>
                  "{s.optimized_bullet_suggestion}"
                </p>
                {/* Copy overlay button */}
                <button
                  onClick={() => handleCopy(s.optimized_bullet_suggestion, idx)}
                  style={{
                    position: 'absolute',
                    top: 14, right: 14,
                    width: 28, height: 28,
                    borderRadius: '50%',
                    background: copiedId === idx ? 'rgba(5, 150, 105, 0.15)' : 'var(--bg-secondary)',
                    border: '1.5px solid',
                    borderColor: copiedId === idx ? 'var(--emerald)' : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    color: copiedId === idx ? 'var(--emerald)' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                  }}
                  title="Copy bullet suggestion"
                >
                  {copiedId === idx ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
