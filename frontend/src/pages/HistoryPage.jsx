import React, { useEffect, useState } from 'react';
import { getHistory } from '../lib/api';
import { FileText, Award, Calendar, Briefcase, ChevronRight, ChevronDown, BookOpen, Clock, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('scans'); // 'scans' | 'quizzes' | 'interviews' | 'roadmaps'

  const [quizzes, setQuizzes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [scans, setScans] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);

  // Expanded items state trackers
  const [expandedScan, setExpandedScan] = useState(null);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [expandedInterview, setExpandedInterview] = useState(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await getHistory();
        if (res.success) {
          setQuizzes(res.quizzes || []);
          setInterviews(res.interviews || []);
          setScans(res.scans || []);
          setRoadmaps(res.roadmaps || []);
        } else {
          setError('Failed to load history.');
        }
      } catch (err) {
        setError('Error loading history. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const tabs = [
    { id: 'scans', label: 'Job Matching Scans', count: scans.length, icon: Briefcase },
    { id: 'quizzes', label: 'Quizzes', count: quizzes.length, icon: Award },
    { id: 'interviews', label: 'Interviews', count: interviews.length, icon: Clock },
    { id: 'roadmaps', label: 'Roadmaps', count: roadmaps.length, icon: BookOpen },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--indigo)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 1000,
      margin: '100px auto 60px',
      padding: '0 24px',
      minHeight: 'calc(100vh - 200px)'
    }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{
          fontFamily: 'Syne',
          fontSize: '2.2rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: 6
        }}>
          Assessment & Scan History
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem' }}>
          Access and review your past career match analysis reports and learning roadmaps.
        </p>
      </div>

      {error && (
        <div style={{
          padding: 16,
          background: 'rgba(185, 28, 28, 0.05)',
          border: '1.5px solid rgba(185, 28, 28, 0.2)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--rose)',
          marginBottom: 20
        }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid var(--border)',
        paddingBottom: 2,
        marginBottom: 24,
        overflowX: 'auto'
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                border: 'none',
                background: 'none',
                borderBottom: `2.5px solid ${isActive ? 'var(--indigo)' : 'transparent'}`,
                color: isActive ? 'var(--indigo)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontFamily: 'Space Grotesk, sans-serif',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              {tab.label}
              <span style={{
                background: isActive ? 'var(--bg-accent-light)' : 'var(--border)',
                color: isActive ? 'var(--text-accent)' : 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Panels */}
      <div>
        {activeTab === 'scans' && (
          <div style={{ display: 'grid', gap: 16 }}>
            {scans.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No job matching scans yet.</p>
            ) : (
              scans.map(scan => (
                <div key={scan._id} style={{
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
                    <div>
                      <h3 style={{ fontFamily: 'Syne', color: 'var(--text-primary)', margin: '0 0 6px', fontSize: '1.1rem' }}>
                        Job Scan: {scan.job_description.slice(0, 45)}...
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} /> {new Date(scan.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ textAlign: 'center', background: 'var(--bg-accent-light)', padding: '6px 12px', borderRadius: 8 }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--indigo)' }}>{scan.match_score}%</div>
                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Match</div>
                      </div>
                      <div style={{ textAlign: 'center', background: 'var(--bg-primary)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{scan.ats_score}</div>
                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>ATS</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedScan(expandedScan === scan._id ? null : scan._id)}
                    style={{
                      marginTop: 14,
                      background: 'none',
                      border: 'none',
                      color: 'var(--indigo)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {expandedScan === scan._id ? (
                      <>Hide Details <ChevronDown size={14} /></>
                    ) : (
                      <>View Match Gaps & Suggestions <ChevronRight size={14} /></>
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedScan === scan._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden', marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}
                      >
                        <div style={{ display: 'grid', md: 'grid-cols-2', gap: 20 }}>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0 0 6px' }}>Matching Keywords</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {scan.matching_skills.map(s => (
                                <span key={s} style={{ fontSize: '0.75rem', background: 'rgba(133, 77, 14, 0.05)', color: 'var(--emerald)', border: '1px solid rgba(133, 77, 14, 0.15)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0 0 6px' }}>Missing Keywords</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {scan.missing_keywords.map(s => (
                                <span key={s} style={{ fontSize: '0.75rem', background: 'rgba(185,28,28,0.04)', color: 'var(--rose)', border: '1px solid rgba(185,28,28,0.1)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: 14 }}>
                          <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0 0 6px' }}>Resume Improvement Bullet Suggestions</p>
                          <ul style={{ paddingLeft: 18, margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'grid', gap: 6 }}>
                            {scan.suggestions.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div style={{ display: 'grid', gap: 16 }}>
            {quizzes.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No quizzes completed yet.</p>
            ) : (
              quizzes.map(quiz => (
                <div key={quiz._id} style={{
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontFamily: 'Syne', color: 'var(--text-primary)', margin: '0 0 6px', fontSize: '1.1rem' }}>
                        {quiz.role} Skill Verification
                      </h3>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        Completed on {new Date(quiz.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ textAlign: 'center', background: 'var(--bg-accent-light)', padding: '8px 16px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--indigo)', fontFamily: 'Space Grotesk' }}>
                        {quiz.score}%
                      </div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Score</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedQuiz(expandedQuiz === quiz._id ? null : quiz._id)}
                    style={{
                      marginTop: 14,
                      background: 'none',
                      border: 'none',
                      color: 'var(--indigo)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {expandedQuiz === quiz._id ? (
                      <>Hide Question List <ChevronDown size={14} /></>
                    ) : (
                      <>Review Questions <ChevronRight size={14} /></>
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedQuiz === quiz._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden', marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}
                      >
                        <div style={{ display: 'grid', gap: 12 }}>
                          {Array.isArray(quiz.questions) && quiz.questions.map((q, idx) => (
                            <div key={idx} style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 8 }}>
                              <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0 0 4px' }}>
                                Q{idx + 1}: {q.question}
                              </p>
                              {q.code_snippet && (
                                <pre style={{ background: '#2d2d2d', color: '#f8f8f2', padding: 10, borderRadius: 6, fontSize: '0.8rem', overflowX: 'auto', margin: '8px 0' }}>
                                  <code>{q.code_snippet}</code>
                                </pre>
                              )}
                              <p style={{ fontSize: '0.8rem', color: q.is_correct ? 'var(--emerald)' : 'var(--rose)', fontWeight: 600, margin: '4px 0 0' }}>
                                Your Answer: {q.user_selected || 'Skipped'} {q.is_correct ? '✓' : '✗'}
                              </p>
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                                <strong>Explanation:</strong> {q.explanation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'interviews' && (
          <div style={{ display: 'grid', gap: 16 }}>
            {interviews.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No mock interviews conducted yet.</p>
            ) : (
              interviews.map(interview => (
                <div key={interview._id} style={{
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontFamily: 'Syne', color: 'var(--text-primary)', margin: '0 0 6px', fontSize: '1.1rem' }}>
                        {interview.role} Mock Interview
                      </h3>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        Conducted on {new Date(interview.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ textAlign: 'center', background: 'var(--bg-accent-light)', padding: '8px 16px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--indigo)', fontFamily: 'Space Grotesk' }}>
                        {interview.scorecard?.overall_score || interview.scorecard?.score || 80}%
                      </div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Score</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedInterview(expandedInterview === interview._id ? null : interview._id)}
                    style={{
                      marginTop: 14,
                      background: 'none',
                      border: 'none',
                      color: 'var(--indigo)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {expandedInterview === interview._id ? (
                      <>Hide Feedback & Transcript <ChevronDown size={14} /></>
                    ) : (
                      <>View Detailed Feedback & Transcript <ChevronRight size={14} /></>
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedInterview === interview._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden', marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}
                      >
                        <div style={{ marginBottom: 14, padding: 12, background: 'var(--bg-primary)', borderRadius: 8 }}>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0 0 6px' }}>Evaluation summary</p>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 8px' }}>
                            <strong>Feedback:</strong> {interview.scorecard?.feedback_summary || 'Great job demonstrating technical skills and clear communications.'}
                          </p>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                            <strong>Strengths:</strong> {Array.isArray(interview.scorecard?.strengths) ? interview.scorecard.strengths.join(', ') : 'Technical depth, clear explanation'}
                          </p>
                        </div>

                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0 0 6px' }}>Interview Transcript</p>
                          <div style={{ display: 'grid', gap: 10, maxWaitHeight: 250, overflowY: 'auto', paddingRight: 6 }}>
                            {Array.isArray(interview.chat_history) && interview.chat_history.slice(1).map((msg, idx) => (
                              <div key={idx} style={{
                                padding: '8px 12px',
                                borderRadius: 8,
                                fontSize: '0.8rem',
                                background: msg.role === 'assistant' ? 'var(--bg-primary)' : 'var(--bg-accent-light)',
                                alignSelf: msg.role === 'assistant' ? 'flex-start' : 'flex-end',
                                maxWidth: '85%'
                              }}>
                                <strong>{msg.role === 'assistant' ? 'Interviewer' : 'You'}:</strong> {msg.content}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'roadmaps' && (
          <div style={{ display: 'grid', gap: 16 }}>
            {roadmaps.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No roadmaps generated yet.</p>
            ) : (
              roadmaps.map(roadmap => (
                <div key={roadmap._id} style={{
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h3 style={{ fontFamily: 'Syne', color: 'var(--text-primary)', margin: '0 0 6px', fontSize: '1.1rem' }}>
                        30-Day learning roadmap for {roadmap.role}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} /> Generated on {new Date(roadmap.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0 0 6px' }}>Priority Target Skills</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {roadmap.priority_skills.map(s => (
                        <span key={s} style={{ fontSize: '0.75rem', background: 'var(--bg-accent-light)', color: 'var(--text-accent)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                          {s}
                        </span>
                      ))}
                    </div>

                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0 0 6px' }}>Weekly Milestones</p>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {Array.isArray(roadmap.weeks) && roadmap.weeks.map((week, idx) => (
                        <div key={idx} style={{ padding: 10, background: 'var(--bg-primary)', borderRadius: 6, fontSize: '0.82rem' }}>
                          <strong>Week {week.week || idx + 1}:</strong> {week.focus || week.topic} - {week.milestone || week.goal}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
