import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, TrendingUp, GitBranch,
  IndianRupee, Globe, Target, ChevronDown, ChevronUp,
  Calendar, Star, Zap, Brain, Trophy, Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const PATH_CONFIG = {
  accelerated: {
    icon: Rocket,
    label: 'Accelerated Path',
    color: 'var(--indigo)',
    bg: 'rgba(163, 82, 0, 0.04)',
    border: 'rgba(163, 82, 0, 0.15)',
    glow: 'rgba(163, 82, 0, 0.1)',
    tagline: 'Aggressive upskilling · 6–12 months',
  },
  steady: {
    icon: TrendingUp,
    label: 'Steady Growth',
    color: 'var(--emerald)',
    bg: 'rgba(5, 150, 105, 0.04)',
    border: 'rgba(5, 150, 105, 0.15)',
    glow: 'rgba(5, 150, 105, 0.1)',
    tagline: 'Organic growth · 1–2 years',
  },
  pivot: {
    icon: GitBranch,
    label: 'Career Pivot',
    color: 'var(--amber)',
    bg: 'rgba(234, 88, 12, 0.04)',
    border: 'rgba(234, 88, 12, 0.15)',
    glow: 'rgba(234, 88, 12, 0.1)',
    tagline: 'Adjacent role · Leverage strengths',
  },
};

function SimCard({ sim, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  const cfg = PATH_CONFIG[sim.path] || PATH_CONFIG.steady;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{
        background: 'var(--bg-secondary)',
        border: `1.5px solid ${cfg.border}`,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        transition: 'var(--transition)',
        boxShadow: expanded ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        marginBottom: 16
      }}
      className="hover-glow"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', background: 'none', border: 'none',
          cursor: 'pointer', padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: 16,
          textAlign: 'left',
        }}
      >
        <div style={{
          width: 44, height: 44,
          background: cfg.bg,
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1.5px solid ${cfg.border}`,
          flexShrink: 0,
        }}>
          <Icon size={20} color={cfg.color} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h4 style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              {cfg.label}
            </h4>
            {index === 0 && (
              <span style={{
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.68rem',
                fontWeight: 700,
                background: 'rgba(163, 82, 0, 0.08)',
                color: 'var(--indigo)',
                border: '1.5px solid rgba(163, 82, 0, 0.18)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontFamily: 'Space Grotesk'
              }}>
                Recommended
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>{cfg.tagline}</p>
        </div>

        {/* Readiness Score */}
        <div style={{ textAlign: 'center', marginRight: 8 }}>
          <p style={{
            fontFamily: 'Space Grotesk',
            fontWeight: 800,
            fontSize: '1.45rem',
            color: cfg.color,
            lineHeight: 1,
            margin: 0
          }}>
            {sim.interview_readiness_score}%
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 2, margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Ready</p>
        </div>

        {expanded ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 24px 24px' }}>
              <hr style={{ border: 'none', borderTop: `1px solid var(--border)`, marginBottom: 18 }} />

              {/* Summary */}
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                marginBottom: 18,
              }}>
                {sim.summary}
              </p>

              {/* Stats Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 12,
                marginBottom: 20,
              }}>
                {/* Timeline */}
                <div style={{
                  padding: '12px 14px',
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border)',
                  textAlign: 'center',
                }}>
                  <Calendar size={15} color="var(--text-muted)" style={{ marginBottom: 4 }} />
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600 }}>TIMELINE</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'Space Grotesk' }}>{sim.timeline}</p>
                </div>

                {/* Salary India */}
                <div style={{
                  padding: '12px 14px',
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border)',
                  textAlign: 'center',
                }}>
                  <IndianRupee size={15} color="var(--text-muted)" style={{ marginBottom: 4 }} />
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600 }}>INDIA LPA</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--emerald)', margin: 0, fontFamily: 'Space Grotesk' }}>{sim.salary_range?.india_lpa}</p>
                </div>

                {/* Trajectory */}
                <div style={{
                  padding: '12px 14px',
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border)',
                  textAlign: 'center',
                }}>
                  <Zap size={15} color="var(--text-muted)" style={{ marginBottom: 4 }} />
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600 }}>GROWTH</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: cfg.color, margin: 0, textTransform: 'capitalize', fontFamily: 'Space Grotesk' }}>
                    {sim.growth_trajectory}
                  </p>
                </div>
              </div>

              {/* Milestones */}
              {sim.milestones?.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, fontFamily: 'Space Grotesk' }}>
                    Key Milestones
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sim.milestones.map((m, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: cfg.color, marginTop: 7, flexShrink: 0,
                        }} />
                        <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills to Acquire */}
              {sim.skills_to_acquire?.length > 0 && (
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, fontFamily: 'Space Grotesk' }}>
                    Required Upgrades
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {sim.skills_to_acquire.map((s, i) => (
                      <span key={i} style={{
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        background: `${cfg.bg}`,
                        color: cfg.color,
                        border: `1.5px solid ${cfg.border}`,
                        fontFamily: 'Space Grotesk'
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CareerReadinessGauge({ score, quizScore, skillMatchScore, interviewScore }) {
  if (score === null || score === undefined) return null;

  const getColor = (s) => {
    if (s >= 80) return '#059669';
    if (s >= 60) return 'var(--indigo)';
    if (s >= 40) return '#d97706';
    return '#dc2626';
  };
  const getLabel = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Moderate';
    return 'Needs Work';
  };

  const color = getColor(score);
  const circumference = 2 * Math.PI * 54;
  const dash = (score / 100) * circumference;

  const metrics = [
    { label: 'Skill Match', weight: '40%', value: skillMatchScore, color: 'var(--indigo)', icon: Target },
    { label: 'Quiz Score', weight: '30%', value: quizScore, color: '#0891b2', icon: Brain },
    { label: 'Interview', weight: '30%', value: interviewScore, color: '#7c3aed', icon: Trophy },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--bg-secondary)',
        border: `2px solid ${color}30`,
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        marginBottom: 24,
        boxShadow: `0 8px 32px ${color}12`,
      }}
    >
      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk', marginBottom: 20 }}>
        Career Readiness Score
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
        {/* Circular gauge */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="54" fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle
              cx="64" cy="64" r="54" fill="none"
              stroke={color} strokeWidth="10"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeLinecap="round"
              transform="rotate(-90 64 64)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color, fontFamily: 'Space Grotesk', lineHeight: 1 }}>{score}%</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{getLabel(score)}</span>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>
            Formula: <span style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk', fontWeight: 700 }}>40% Skill Match + 30% Quiz + 30% Interview</span>
          </p>
          {metrics.map((m) => (
            <div key={m.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <m.icon size={13} color={m.color} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{m.label}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>({m.weight})</span>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: m.color, fontFamily: 'Space Grotesk' }}>
                  {m.value !== null && m.value !== undefined ? `${m.value}%` : '—'}
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value || 0}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{ height: '100%', background: m.color, borderRadius: 3 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function CareerDashboard({ simulations }) {
  const { careerReadinessScore, quizResults, gapAnalysis, interviewScore } = useApp();

  const quizScore = quizResults?.overall_score ?? null;
  const skillMatchScore = gapAnalysis?.match_score ?? null;

  if (!simulations || simulations.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Career Readiness Score (shown once interview is complete) */}
      <CareerReadinessGauge
        score={careerReadinessScore}
        quizScore={quizScore}
        skillMatchScore={skillMatchScore}
        interviewScore={interviewScore}
      />
      {simulations.map((sim, i) => (
        <SimCard key={sim.path || i} sim={sim} index={i} />
      ))}
    </div>
  );
}
