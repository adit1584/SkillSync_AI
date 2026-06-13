import React, { useState, useEffect } from 'react';
import { scanJobDescription } from '../lib/api';
import { FileSearch, Sparkles, CheckCircle, XCircle, AlertCircle, AlertTriangle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function ATSJobMatcher() {
  const { jobDescription: contextJd, targetRole, customRole } = useApp();
  const [scanType, setScanType] = useState('jd'); // 'jd' | 'manual'
  const [jobDescription, setJobDescription] = useState(contextJd || '');
  
  // Manual fields
  const [role, setRole] = useState(customRole || targetRole || '');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [certifications, setCertifications] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (contextJd) {
      setJobDescription(contextJd);
      triggerScan(contextJd);
    }
  }, [contextJd]);

  const triggerScan = async (jdText) => {
    setError('');
    setLoading(true);
    try {
      const data = await scanJobDescription(jdText, null, targetRole, customRole);
      if (data.success) {
        setResults(data);
      } else {
        setError(data.error || 'Failed to scan job requirements.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during scanning.');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    setError('');
    setResults(null);
    setLoading(true);

    try {
      let data;
      if (scanType === 'jd') {
        if (!jobDescription.trim()) {
          setError('Please paste a job description first.');
          setLoading(false);
          return;
        }
        data = await scanJobDescription(jobDescription, null, targetRole, customRole);
      } else {
        if (!role.trim() || !skills.trim()) {
          setError('Please fill in at least the target role and key skills.');
          setLoading(false);
          return;
        }
        data = await scanJobDescription(null, {
          role,
          skills,
          experience,
          certifications
        }, targetRole, customRole);
      }

      if (data.success) {
        setResults(data);
      } else {
        setError(data.error || 'Failed to scan job requirements.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during scanning.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <div style={{ display: 'grid', gap: 24 }} className="results-card-anim">
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{
          fontFamily: 'Syne',
          fontSize: '1.15rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <FileSearch size={18} color="var(--text-primary)" />
          Scan Resume Against Job Description
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
          Paste a full job description or enter manual role requirements to evaluate your resume match and get ATS optimizations.
        </p>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          gap: 8,
          background: 'var(--bg-primary)',
          padding: 4,
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          marginBottom: 20,
          width: 'fit-content'
        }}>
          <button
            onClick={() => { setScanType('jd'); setResults(null); }}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: scanType === 'jd' ? 'var(--bg-secondary)' : 'transparent',
              color: scanType === 'jd' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: scanType === 'jd' ? 'var(--shadow-sm)' : 'none',
              fontFamily: 'Space Grotesk'
            }}
          >
            Paste Job Description
          </button>
          <button
            onClick={() => { setScanType('manual'); setResults(null); }}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: scanType === 'manual' ? 'var(--bg-secondary)' : 'transparent',
              color: scanType === 'manual' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: scanType === 'manual' ? 'var(--shadow-sm)' : 'none',
              fontFamily: 'Space Grotesk'
            }}
          >
            Manual Requirements
          </button>
        </div>

        <form onSubmit={handleScan} style={{ display: 'grid', gap: 16 }}>
          {scanType === 'jd' ? (
            <div style={{ display: 'grid', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Job Description Text
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                rows={6}
                className="input"
                style={{ resize: 'vertical' }}
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Role Name</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior AI Engineer"
                  className="input"
                />
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. PyTorch, Python, LangChain"
                  className="input"
                />
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Experience Required</label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 3+ years"
                  className="input"
                />
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Certifications Required</label>
                <input
                  type="text"
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  placeholder="e.g. AWS Developer"
                  className="input"
                />
              </div>
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', gap: 10, padding: 12, background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: 'fit-content' }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 14, height: 14 }} />
                Scanning Resume...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Scan Resume
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Panel */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            style={{ display: 'grid', gap: 20 }}
          >
            {/* Scores Card */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16
            }}>
              {/* Match Score */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '20px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Space Grotesk' }}>
                  Semantic Match Score
                </p>
                <p style={{
                  fontSize: '2.2rem', fontWeight: 900, color: getScoreColor(results.match_score),
                  fontFamily: 'Space Grotesk', margin: '0 0 4px'
                }}>
                  {results.match_score}%
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Resume content vs Job description keywords
                </p>
              </div>

              {/* ATS Score */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '20px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Space Grotesk' }}>
                  ATS Compliance Index
                </p>
                <p style={{
                  fontSize: '2.2rem', fontWeight: 900, color: getScoreColor(results.ats_score),
                  fontFamily: 'Space Grotesk', margin: '0 0 4px'
                }}>
                  {results.ats_score}%
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Estimated probability of clearing automated filters
                </p>
              </div>
            </div>

            {/* Gaps Details Card */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              display: 'grid',
              gap: 20,
              boxShadow: 'var(--shadow-sm)'
            }}>
              {/* Keywords Match/Gap list */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                <div>
                  <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} color="var(--success)" />
                    Matching Keywords ({results.matching_skills.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {results.matching_skills.map(s => (
                      <span key={s} className="skill-tag skill-tag-matched" style={{ fontSize: '0.72rem' }}>
                        {s}
                      </span>
                    ))}
                    {results.matching_skills.length === 0 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No matching keywords detected.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <XCircle size={14} color="var(--error)" />
                    Missing Keywords ({results.missing_keywords.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {results.missing_keywords.map(s => (
                      <span key={s} className="skill-tag skill-tag-missing" style={{ fontSize: '0.72rem' }}>
                        {s}
                      </span>
                    ))}
                    {results.missing_keywords.length === 0 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No missing keywords detected.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Experience and Certification Gaps */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div>
                  <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={14} color="var(--text-primary)" />
                    Experience Requirement
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                    <strong>Required Experience:</strong> {results.experience_gap || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Award size={14} color="var(--text-primary)" />
                    Certification Gaps
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {results.certification_gap.length > 0 ? (
                      `Missing standard certificates: ${results.certification_gap.join(', ')}`
                    ) : (
                      'No certification gaps detected.'
                    )}
                  </p>
                </div>
              </div>

              {/* Suggestions */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} color="var(--text-primary)" />
                  Resume Tailoring Suggestions
                </h4>
                <ul style={{ paddingLeft: 18, margin: 0, display: 'grid', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {results.suggestions.map((suggestion, index) => (
                    <li key={index} style={{ lineHeight: 1.5 }}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
