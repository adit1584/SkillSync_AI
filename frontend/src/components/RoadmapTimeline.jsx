import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Code, ExternalLink, ChevronDown, ChevronUp,
  Target, Play, CheckSquare, Calendar, Square, CheckSquare as CheckedBox, Award
} from 'lucide-react';

const RESOURCE_ICONS = {
  course: BookOpen,
  video: Play,
  doc: CheckSquare,
  practice: Code,
};

const RESOURCE_COLORS = {
  course: { color: 'var(--indigo)', bg: 'rgba(163, 82, 0, 0.06)' },
  video: { color: 'var(--violet)', bg: 'rgba(97, 46, 2, 0.06)' },
  doc: { color: 'var(--emerald)', bg: 'rgba(133, 77, 14, 0.06)' },
  practice: { color: 'var(--amber)', bg: 'rgba(163, 82, 0, 0.06)' },
};

function WeekCard({ week, index, progressState, toggleTask }) {
  const [open, setOpen] = useState(index === 0);

  // Compute completed tasks & projects in this week
  const tasks = week.daily_tasks || [];
  const totalItems = tasks.length + (week.checkpoint_project ? 1 : 0);
  let completedItems = 0;

  tasks.forEach((_, i) => {
    if (progressState[`w${week.week}_t${i}`]) completedItems++;
  });
  if (week.checkpoint_project && progressState[`w${week.week}_p`]) completedItems++;

  const isWeekCompleted = totalItems > 0 && completedItems === totalItems;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      style={{
        display: 'flex',
        gap: 0,
        position: 'relative',
      }}
    >
      {/* Timeline Line + Dot */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginRight: 18,
        flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: '50%',
          background: isWeekCompleted
            ? 'linear-gradient(135deg, var(--emerald), #10b981)'
            : open
              ? 'var(--grad-hero)'
              : 'var(--bg-secondary)',
          border: isWeekCompleted
            ? '1.8px solid rgba(5, 150, 105, 0.35)'
            : open
              ? '1.8px solid rgba(163, 82, 0, 0.35)'
              : '1.8px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Space Grotesk',
          fontWeight: 700,
          fontSize: '0.82rem',
          color: open || isWeekCompleted ? '#ffffff' : 'var(--text-secondary)',
          transition: 'var(--transition)',
          boxShadow: isWeekCompleted
            ? '0 0 15px rgba(5, 150, 105, 0.2)'
            : open ? '0 0 15px rgba(163, 82, 0, 0.2)' : 'var(--shadow-sm)',
          zIndex: 1,
        }}>
          {isWeekCompleted ? <CheckedBox size={14} /> : week.week}
        </div>
        {/* Vertical line */}
        <div style={{
          width: 2,
          flex: 1,
          minHeight: 20,
          background: 'var(--border)',
          marginTop: 4,
          opacity: 0.6,
        }} />
      </div>

      {/* Card */}
      <div style={{
        flex: 1,
        background: isWeekCompleted
          ? 'rgba(5, 150, 105, 0.02)'
          : open
            ? 'rgba(163, 82, 0, 0.03)'
            : 'var(--bg-secondary)',
        border: `1.5px solid ${
          isWeekCompleted
            ? 'rgba(5, 150, 105, 0.2)'
            : open
              ? 'rgba(163, 82, 0, 0.2)'
              : 'var(--border)'
        }`,
        borderRadius: 'var(--radius-lg)',
        marginBottom: 16,
        overflow: 'hidden',
        transition: 'var(--transition)',
        boxShadow: open ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}>
        {/* Week Header */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: '100%', background: 'none', border: 'none',
            cursor: 'pointer', padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 12,
            textAlign: 'left',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: isWeekCompleted ? 'var(--emerald)' : 'var(--indigo)',
                fontFamily: 'Space Grotesk',
              }}>
                Week {week.week} {isWeekCompleted && '— Complete'}
              </span>
              <span style={{
                padding: '3px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: isWeekCompleted ? 'rgba(5, 150, 105, 0.08)' : 'rgba(163, 82, 0, 0.08)',
                color: isWeekCompleted ? 'var(--emerald)' : 'var(--indigo)',
                border: `1px solid ${isWeekCompleted ? 'rgba(5, 150, 105, 0.18)' : 'rgba(163, 82, 0, 0.18)'}`,
                fontFamily: 'Space Grotesk',
              }}>
                {week.focus_skill}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, fontFamily: 'Space Grotesk' }}>
                ({completedItems}/{totalItems} items completed)
              </span>
            </div>
            <p style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--text-primary)',
              textDecoration: isWeekCompleted ? 'line-through' : 'none',
              opacity: isWeekCompleted ? 0.65 : 1,
              margin: 0,
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
              {week.goal}
            </p>
          </div>
          {open
            ? <ChevronUp size={16} color="var(--text-secondary)" />
            : <ChevronDown size={16} color="var(--text-secondary)" />
          }
        </button>

        {/* Expanded content */}
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: '0 20px 20px' }}
          >
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: 16 }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 16 }}>
              {/* Daily Tasks */}
              <div>
                <p style={{
                  fontSize: '0.73rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: 'var(--text-muted)', marginBottom: 10,
                  fontFamily: 'Space Grotesk',
                }}>
                  Daily Target checklist
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tasks.map((task, i) => {
                    const taskKey = `w${week.week}_t${i}`;
                    const isChecked = !!progressState[taskKey];
                    return (
                      <div
                        key={i}
                        onClick={() => toggleTask(taskKey)}
                        style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'flex-start',
                          cursor: 'pointer',
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: isChecked ? 'rgba(5, 150, 105, 0.03)' : 'transparent',
                          transition: 'var(--transition)',
                        }}
                      >
                        <div style={{ color: isChecked ? 'var(--emerald)' : 'var(--text-muted)', marginTop: 2, flexShrink: 0 }}>
                          {isChecked ? <CheckedBox size={14} /> : <Square size={14} />}
                        </div>
                        <span style={{
                          fontSize: '0.84rem',
                          color: isChecked ? 'var(--text-muted)' : 'var(--text-secondary)',
                          lineHeight: 1.5,
                          textDecoration: isChecked ? 'line-through' : 'none'
                        }}>
                          {task}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Checkpoint Project */}
              {week.checkpoint_project && (
                <div>
                  <p style={{
                    fontSize: '0.73rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: 'var(--text-muted)', marginBottom: 10,
                    fontFamily: 'Space Grotesk',
                  }}>
                    Weekly Project Checkpoint
                  </p>
                  {(() => {
                    const projKey = `w${week.week}_p`;
                    const isChecked = !!progressState[projKey];
                    return (
                      <div
                        onClick={() => toggleTask(projKey)}
                        style={{
                          padding: '16px',
                          background: isChecked ? 'rgba(5, 150, 105, 0.02)' : 'rgba(5, 150, 105, 0.05)',
                          border: `1.5px solid ${isChecked ? 'rgba(5, 150, 105, 0.15)' : 'rgba(5, 150, 105, 0.25)'}`,
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6 }}>
                          <div style={{ color: isChecked ? 'var(--emerald)' : 'var(--emerald)', marginTop: 2, flexShrink: 0 }}>
                            {isChecked ? <CheckedBox size={14} /> : <Square size={14} />}
                          </div>
                          <p style={{
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: isChecked ? 'var(--text-secondary)' : 'var(--emerald)',
                            textDecoration: isChecked ? 'line-through' : 'none',
                            margin: 0,
                            fontFamily: 'Space Grotesk'
                          }}>
                            {week.checkpoint_project.name}
                          </p>
                        </div>
                        <p style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          marginBottom: 10,
                          marginTop: 0,
                          lineHeight: 1.4,
                          opacity: isChecked ? 0.6 : 1
                        }}>
                          {week.checkpoint_project.description}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, opacity: isChecked ? 0.6 : 1 }}>
                          {(week.checkpoint_project.tech_used || []).map((t, i) => (
                            <span key={i} style={{
                              padding: '2px 8px', borderRadius: 'var(--radius-full)',
                              fontSize: '0.68rem', background: 'rgba(5, 150, 105, 0.08)',
                              color: 'var(--emerald)', border: '1px solid rgba(5, 150, 105, 0.15)',
                              fontWeight: 600,
                              fontFamily: 'Space Grotesk'
                            }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Resources */}
            {week.resources?.length > 0 && (
              <div>
                <p style={{
                  fontSize: '0.73rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: 'var(--text-muted)', marginBottom: 10,
                  fontFamily: 'Space Grotesk',
                }}>
                  Structured resource index
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8 }}>
                  {week.resources.map((r, i) => {
                    const ResIcon = RESOURCE_ICONS[r.type] || BookOpen;
                    const clr = RESOURCE_COLORS[r.type] || RESOURCE_COLORS.course;
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px',
                        background: 'var(--bg-secondary)',
                        border: '1.5px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                      }}>
                        <div style={{
                          width: 32, height: 32,
                          background: clr.bg,
                          borderRadius: 8,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                          border: `1px solid ${clr.color}18`,
                        }}>
                          <ResIcon size={13} color={clr.color} />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <p style={{
                            fontSize: '0.83rem', fontWeight: 700,
                            color: 'var(--text-primary)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            margin: 0,
                            fontFamily: 'Space Grotesk'
                          }}>
                            {r.name}
                          </p>
                          <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
                            {r.platform}
                          </p>
                        </div>
                        {r.url && r.url !== '' && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--text-muted)', flexShrink: 0, padding: 4 }}
                            className="btn-ghost"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function RoadmapTimeline({ roadmap, sessionId }) {
  const [progress, setProgress] = useState({});

  // Load progress from localStorage on mount
  useEffect(() => {
    if (sessionId) {
      const stored = localStorage.getItem(`skillsync_progress_${sessionId}`);
      if (stored) {
        try {
          setProgress(JSON.parse(stored));
        } catch (e) {
          setProgress({});
        }
      }
    }
  }, [sessionId]);

  if (!roadmap || !roadmap.weeks?.length) return null;

  // Compute overall completion stats
  let totalItems = 0;
  let completedItems = 0;

  roadmap.weeks.forEach(w => {
    const tasks = w.daily_tasks || [];
    totalItems += tasks.length;
    tasks.forEach((_, i) => {
      if (progress[`w${w.week}_t${i}`]) completedItems++;
    });

    if (w.checkpoint_project) {
      totalItems += 1;
      if (progress[`w${w.week}_p`]) completedItems++;
    }
  });

  const completionPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  function toggleTask(key) {
    const newProgress = { ...progress, [key]: !progress[key] };
    setProgress(newProgress);
    localStorage.setItem(`skillsync_progress_${sessionId}`, JSON.stringify(newProgress));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Roadmap Meta + Progress bar */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
        }}>
          {/* Metadata chips */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 16px',
              background: 'var(--bg-primary)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              fontFamily: 'Space Grotesk'
            }}>
              <Calendar size={14} color="var(--indigo)" />
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{roadmap.weeks.length}</strong> Weeks
              </span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 16px',
              background: 'var(--bg-primary)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              fontFamily: 'Space Grotesk'
            }}>
              <Target size={14} color="var(--indigo)" />
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{roadmap.weekly_hours}h</strong> / week
              </span>
            </div>
          </div>

          {/* Completion label */}
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
            Completion Ratio: <strong style={{ color: 'var(--emerald)', fontSize: '1.05rem' }}>{completionPercent}%</strong>
          </span>
        </div>

        {/* Global Progress Track */}
        <div className="progress-track" style={{ height: 8 }}>
          <motion.div
            className="progress-fill"
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.5 }}
            style={{ background: 'linear-gradient(90deg, var(--indigo) 0%, var(--emerald) 100%)' }}
          />
        </div>
      </div>

      {/* Week cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {roadmap.weeks.map((week, i) => (
          <WeekCard
            key={week.week || i}
            week={week}
            index={i}
            progressState={progress}
            toggleTask={toggleTask}
          />
        ))}
      </div>
    </div>
  );
}
