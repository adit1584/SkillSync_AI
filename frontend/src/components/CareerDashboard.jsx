import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, TrendingUp, GitBranch,
  IndianRupee, ChevronDown, ChevronUp,
  Calendar, Award, Target, Briefcase
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const PATH_CONFIG = {
  accelerated: {
    icon: Rocket,
    label: 'Accelerated Path',
    color: 'var(--text-primary)',
    bg: 'var(--bg-accent-light)',
    border: 'var(--border)',
    tagline: 'Aggressive upskilling · 6-12 months',
  },
  steady: {
    icon: TrendingUp,
    label: 'Steady Growth',
    color: 'var(--text-primary)',
    bg: 'var(--bg-accent-light)',
    border: 'var(--border)',
    tagline: 'Organic growth · 1-2 years',
  },
  pivot: {
    icon: GitBranch,
    label: 'Career Pivot',
    color: 'var(--text-primary)',
    bg: 'var(--bg-accent-light)',
    border: 'var(--border)',
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
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        transition: 'var(--transition)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 16
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          textAlign: 'left',
        }}
      >
        <div style={{
          width: 40, height: 40,
          background: cfg.bg,
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <Icon size={18} color="var(--text-primary)" />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h4 style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              {cfg.label}
            </h4>
            {index === 0 && (
              <span style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.65rem',
                fontWeight: 700,
                background: 'var(--bg-accent-light)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'Space Grotesk'
              }}>
                Recommended
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>{cfg.tagline}</p>
        </div>

        {/* Readiness Score */}
        <div style={{ textAlign: 'center', marginRight: 8 }}>
          <p style={{
            fontFamily: 'Space Grotesk',
            fontWeight: 800,
            fontSize: '1.3rem',
            color: 'var(--text-primary)',
            lineHeight: 1,
            margin: 0
          }}>
            {sim.interview_readiness_score}%
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.62rem', marginTop: 2, margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Ready</p>
        </div>

        {expanded ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 24px 24px' }}>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: 18 }} />

              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                marginBottom: 18,
              }}>
                {sim.summary}
              </p>

              {/* Stats Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: 12,
                marginBottom: 20,
              }}>
                {/* Timeline */}
                <div style={{
                  padding: '12px 14px',
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                }}>
                  <Calendar size={14} color="var(--text-muted)" style={{ marginBottom: 4 }} />
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600 }}>TIMELINE</p>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'Space Grotesk' }}>{sim.timeline}</p>
                </div>

                {/* Salary India */}
                <div style={{
                  padding: '12px 14px',
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                }}>
                  <IndianRupee size={14} color="var(--text-muted)" style={{ marginBottom: 4 }} />
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600 }}>INDIA LPA</p>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--emerald)', margin: 0, fontFamily: 'Space Grotesk' }}>{sim.salary_range?.india_lpa}</p>
                </div>

                {/* Trajectory */}
                <div style={{
                  padding: '12px 14px',
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                }}>
                  <Briefcase size={14} color="var(--text-muted)" style={{ marginBottom: 4 }} />
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600 }}>GROWTH</p>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, textTransform: 'capitalize', fontFamily: 'Space Grotesk' }}>
                    {sim.growth_trajectory}
                  </p>
                </div>
              </div>

              {/* Milestones */}
              {sim.milestones?.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, fontFamily: 'Space Grotesk' }}>
                    Key Milestones
                  </p>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {sim.milestones.map((m, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <div style={{
                          width: 4, height: 4, borderRadius: '50%',
                          background: 'var(--text-primary)', marginTop: 8, flexShrink: 0,
                        }} />
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills to Acquire */}
              {sim.skills_to_acquire?.length > 0 && (
                <div>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, fontFamily: 'Space Grotesk' }}>
                    Required Upgrades
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {sim.skills_to_acquire.map((s, i) => (
                      <span key={i} className="skill-tag skill-tag-neutral" style={{ fontSize: '0.72rem' }}>
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

  const circumference = 2 * Math.PI * 54;
  const dash = (score / 100) * circumference;

  const metrics = [
    { label: 'Skill Match', weight: '40%', value: skillMatchScore, color: 'var(--text-primary)', icon: Target },
    { label: 'Quiz Score', weight: '30%', value: quizScore, color: 'var(--text-secondary)', icon: Award },
    { label: 'Interview', weight: '30%', value: interviewScore, color: 'var(--text-muted)', icon: Briefcase },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '24px',
        marginBottom: 24,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk', marginBottom: 20 }}>
        Career Readiness Score
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
        {/* Circular gauge */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width="120" height="120" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle
              cx="64" cy="64" r="54" fill="none"
              stroke="var(--primary)" strokeWidth="8"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeLinecap="square"
              transform="rotate(-90 64 64)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Space Grotesk', lineHeight: 1 }}>{score}%</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>Ready</span>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>
            Formula: <span style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk', fontWeight: 700 }}>40% Skill Match + 30% Quiz + 30% Interview</span>
          </p>
          {metrics.map((m) => (
            <div key={m.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <m.icon size={12} color="var(--text-secondary)" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{m.label}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>({m.weight})</span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
                  {m.value !== null && m.value !== undefined ? `${m.value}%` : '--'}
                </span>
              </div>
              <div className="progress-track" style={{ height: 4 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value || 0}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="progress-fill"
                  style={{ height: '100%', borderRadius: 0 }}
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
      {/* Career Readiness Score */}
      <CareerReadinessGauge
        score={careerReadinessScore}
        quizScore={quizScore}
        skillMatchScore={skillMatchScore}
        interviewScore={interviewScore}
      />

      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '24px',
        marginBottom: 16,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, fontFamily: 'Space Grotesk' }}>
          Current vs Future Trajectory Comparisons
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 16 }}>
          Visual mapping of skill updates, salary prospects, and growth potential as you upskill across simulation paths.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div style={{ padding: 14, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Current Alignment</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Grotesk', marginTop: 4 }}>
              {skillMatchScore}% Match
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Based on resume data</span>
          </div>

          <div style={{ padding: 14, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Future Target Match</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald)', fontFamily: 'Space Grotesk', marginTop: 4 }}>
              100% Match
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>After upskilling plan</span>
          </div>
        </div>
      </div>

      {simulations.map((sim, i) => (
        <SimCard key={sim.path || i} sim={sim} index={i} />
      ))}
    </div>
  );
}
