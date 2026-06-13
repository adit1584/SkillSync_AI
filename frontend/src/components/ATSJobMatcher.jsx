import React, { useState, useEffect } from 'react';
import { scanJobDescription } from '../lib/api';
import { FileSearch, Sparkles, CheckCircle, XCircle, AlertCircle, AlertTriangle, ArrowRight, Award } from 'lucide-react';
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
    if (score >= 75) return 'var(--emerald)';
    if (score >= 50) return 'var(--cyan)';
    return 'var(--rose)';
  };

  return (
    <div style={{ display: 'grid', gap: 24 }} className="results-card-anim">
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '30px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{
          fontFamily: 'Syne',
          fontSize: '1.25rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <FileSearch size={20} color="var(--indigo)" />
          Scan Resume Against Job Description
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 20 }}>
          Paste a full job description or enter manual role requirements to evaluate your resume match and get ATS optimizations.
        </p>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          gap: 10,
          background: 'var(--bg-primary)',
          padding: 4,
          borderRadius: 8,
          marginBottom: 20,
          width: 'fit-content'
        }}>
          <button
            onClick={() => { setScanType('jd'); setResults(null); }}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.82rem',
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
              padding: '6px 14px',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.82rem',
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
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Job Description Text
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                rows={8}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-primary)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Role Name</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior AI Engineer"
                  style={{
                    width: '100%', padding: '10px 12px', background: 'var(--bg-primary)',
                    border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. PyTorch, Python, LangChain"
                  style={{
                    width: '100%', padding: '10px 12px', background: 'var(--bg-primary)',
                    border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Experience Required</label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 3+ years"
                  style={{
                    width: '100%', padding: '10px 12px', background: 'var(--bg-primary)',
                    border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Certifications Required</label>
                <input
                  type="text"
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  placeholder="e.g. AWS Developer, TensorFlow Certificate"
                  style={{
                    width: '100%', padding: '10px 12px', background: 'var(--bg-primary)',
                    border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', gap: 10, padding: 12, background: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.15)', color: 'var(--rose)', borderRadius: 6, fontSize: '0.82rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: 'var(--indigo)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: 'fit-content'
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                Scanning Resume...
              </>
            ) : (
              <>
                <Sparkles size={16} />
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
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
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Space Grotesk' }}>
                  Semantic Match Score
                </p>
                <p style={{
                  fontSize: '2.5rem', fontWeight: 900, color: getScoreColor(results.match_score),
                  fontFamily: 'Space Grotesk', margin: '0 0 4px'
                }}>
                  {results.match_score}%
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Resume content vs Job description keywords
                </p>
              </div>

              {/* ATS Score */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Space Grotesk' }}>
                  ATS Compliance Index
                </p>
                <p style={{
                  fontSize: '2.5rem', fontWeight: 900, color: getScoreColor(results.ats_score),
                  fontFamily: 'Space Grotesk', margin: '0 0 4px'
                }}>
                  {results.ats_score}%
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Estimated probability of clearing automated filters
                </p>
              </div>
            </div>

            {/* Gaps Details Card */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'grid',
              gap: 20,
              boxShadow: 'var(--shadow-sm)'
            }}>
              {/* Keywords Match/Gap list */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={15} color="var(--emerald)" />
                    Matching Keywords ({results.matching_skills.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {results.matching_skills.map(s => (
                      <span key={s} style={{ fontSize: '0.75rem', background: 'rgba(133, 77, 14, 0.05)', color: 'var(--emerald)', border: '1px solid rgba(133, 77, 14, 0.15)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        {s}
                      </span>
                    ))}
                    {results.matching_skills.length === 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No matching keywords detected.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <XCircle size={15} color="var(--rose)" />
                    Missing Keywords ({results.missing_keywords.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {results.missing_keywords.map(s => (
                      <span key={s} style={{ fontSize: '0.75rem', background: 'rgba(185,28,28,0.04)', color: 'var(--rose)', border: '1px solid rgba(185,28,28,0.1)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        {s}
                      </span>
                    ))}
                    {results.missing_keywords.length === 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No missing keywords detected.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Experience and Certification Gaps */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={15} color="var(--indigo)" />
                    Experience Requirement
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                    <strong>Required Experience:</strong> {results.experience_gap || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Award size={15} color="var(--indigo)" />
                    Certification Gaps
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
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
                <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} color="var(--indigo)" />
                  Resume Tailoring Suggestions
                </h4>
                <ul style={{ paddingLeft: 18, margin: 0, display: 'grid', gap: 10, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
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
