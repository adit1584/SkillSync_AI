import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, BookOpen, Clock, Gauge, Award, ShieldAlert, Sparkles } from 'lucide-react';

export default function CourseRecommendations({ recommendations = [] }) {
  if (recommendations.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center', background: 'var(--bg-secondary)' }}>
        <Award size={48} style={{ margin: '0 auto 16px', color: 'var(--emerald)' }} />
        <h3 style={{ fontFamily: 'Space Grotesk' }}>All Matched!</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          You have successfully matched all required skills for this target role. No gaps or weak areas identified!
        </p>
      </div>
    );
  }

  // Group recommendations by skill
  const grouped = recommendations.reduce((acc, rec) => {
    if (!acc[rec.skill]) acc[acc.skill = []]; // Handle potential syntax or grouping bugs safely
    if (acc[rec.skill]) {
      acc[rec.skill].push(rec);
    } else {
      acc[rec.skill] = [rec];
    }
    return acc;
  }, {});

  const getPlatformStyle = (platform) => {
    const p = (platform || '').toLowerCase();
    if (p.includes('coursera')) return { color: '#1a56db', bg: 'rgba(26,86,219,0.08)', border: 'rgba(26,86,219,0.15)' };
    if (p.includes('udemy')) return { color: '#a21caf', bg: 'rgba(162,28,175,0.08)', border: 'rgba(162,28,175,0.15)' };
    if (p.includes('youtube')) return { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.15)' };
    if (p.includes('edx')) return { color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.15)' };
    if (p.includes('mdn') || p.includes('doc')) return { color: 'var(--indigo)', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.15)' };
    return { color: 'var(--text-secondary)', bg: 'rgba(15,23,42,0.05)', border: 'var(--border)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {Object.entries(grouped).map(([skill, recs], groupIdx) => {
        if (!skill || !Array.isArray(recs)) return null;
        return (
          <motion.div
            key={skill}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIdx * 0.08 }}
          >
            {/* Skill Title Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
              borderBottom: '1.5px solid var(--border)',
              paddingBottom: 10
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                fontFamily: 'Space Grotesk, sans-serif',
                color: 'var(--text-primary)',
                margin: 0
              }}>
                {skill}
              </h3>
              
              {/* Reason Badge */}
              {recs[0]?.reason === 'weak' ? (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: 'rgba(225,29,72,0.06)',
                  color: 'var(--rose)',
                  border: '1.5px solid rgba(225,29,72,0.18)',
                  fontFamily: 'Space Grotesk',
                }}>
                  <ShieldAlert size={11} />
                  Weak Area (Score &lt; 60%)
                </span>
              ) : (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: 'rgba(234,88,12,0.06)',
                  color: 'var(--amber)',
                  border: '1.5px solid rgba(234,88,12,0.18)',
                  fontFamily: 'Space Grotesk',
                }}>
                  <Sparkles size={11} />
                  Missing Skill Gap
                </span>
              )}
            </div>

            {/* Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 16
            }}>
              {recs.map((rec, i) => {
                const platformStyle = getPlatformStyle(rec.platform);
                return (
                  <motion.div
                    key={i}
                    whileHover={{ y: -3 }}
                    className="card hover-glow"
                    style={{
                      padding: 24,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: 'var(--bg-secondary)',
                      border: '1.5px solid var(--border)',
                      boxShadow: 'var(--shadow-sm)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div>
                      {/* Header info */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: platformStyle.bg,
                          color: platformStyle.color,
                          border: `1px solid ${platformStyle.border}`,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          fontFamily: 'Space Grotesk',
                        }}>
                          {rec.platform}
                        </span>

                        <div style={{ display: 'flex', gap: 10, color: 'var(--text-muted)', fontSize: '0.76rem', fontWeight: 600, fontFamily: 'Space Grotesk' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={12} />
                            {rec.duration}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Gauge size={12} />
                            {rec.level}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: 8,
                        lineHeight: 1.4,
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}>
                        {rec.course_title}
                      </h4>

                      {/* Description */}
                      <p style={{
                        fontSize: '0.84rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        marginBottom: 20
                      }}>
                        {rec.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                      <a
                        href={rec.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.8rem',
                          gap: 6,
                          textDecoration: 'none',
                          width: 'fit-content',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <BookOpen size={13} />
                        Go to Course
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
