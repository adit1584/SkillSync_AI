import React, { useState, useEffect } from 'react';
import { 
  Briefcase, MapPin, DollarSign, Bookmark, BookmarkCheck, ExternalLink,
  Search, Sliders, History, Sparkles, Check, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { searchLiveJobs, saveJob, getSavedJobs, getJobSearchHistory } from '../lib/api';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveJobBoard() {
  const { sessionId, targetRole, customRole } = useApp();
  
  // Search state
  const [roleInput, setRoleInput] = useState(customRole || targetRole || '');
  const [locationInput, setLocationInput] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [experienceInput, setExperienceInput] = useState('');
  const [remote, setRemote] = useState(false);
  const [hybrid, setHybrid] = useState(false);
  const [onsite, setOnsite] = useState(false);
  const [salaryRange, setSalaryRange] = useState('');
  
  // UI views
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'saved'
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);
  
  // Loading and alerts
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Initial load
  useEffect(() => {
    fetchSavedJobs();
    fetchSearchHistory();
    handleSearch(true);
  }, [targetRole, customRole]);

  const fetchSavedJobs = async () => {
    try {
      const res = await getSavedJobs();
      if (res.success) {
        setSavedJobs(res.jobs || []);
      }
    } catch (err) {
      console.warn('Failed to fetch saved jobs:', err.message);
    }
  };

  const fetchSearchHistory = async () => {
    try {
      const res = await getJobSearchHistory();
      if (res.success) {
        setSearchHistory(res.history || []);
      }
    } catch (err) {
      console.warn('Failed to fetch search history:', err.message);
    }
  };

  const handleSearch = async (isInitial = false) => {
    if (!isInitial && !roleInput.trim()) {
      setError('Please enter a role to search.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const filters = {
        role: isInitial ? (customRole || targetRole || '') : roleInput,
        customRole: isInitial ? (customRole || '') : (roleInput !== targetRole ? roleInput : customRole),
        location: locationInput,
        experience: experienceInput,
        remote,
        hybrid,
        onsite,
        salaryRange,
        skills: skillsInput
      };
      
      const res = await searchLiveJobs(filters);
      if (res.success) {
        setJobs(res.jobs || []);
        if (!isInitial) {
          fetchSearchHistory();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to search jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (job) => {
    setActionLoading(job.jobId);
    try {
      const res = await saveJob(job);
      if (res.success) {
        setSuccessMsg(res.saved ? 'Job saved successfully.' : 'Job removed from saved list.');
        setTimeout(() => setSuccessMsg(''), 3000);
        await fetchSavedJobs();
      }
    } catch (err) {
      setError('Failed to update saved job status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApply = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleExpand = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const triggerHistorySearch = (item) => {
    setRoleInput(item.query || '');
    if (item.filters) {
      setLocationInput(item.filters.location || '');
      setExperienceInput(item.filters.experience || '');
      setSkillsInput(item.filters.skills || '');
      setRemote(!!item.filters.remote);
      setHybrid(!!item.filters.hybrid);
      setOnsite(!!item.filters.onsite);
      setSalaryRange(item.filters.salaryRange || '');
    }
    setActiveTab('search');
    setTimeout(() => {
      handleSearch(false);
    }, 100);
  };

  const isJobSaved = (jobId) => {
    return savedJobs.some(sj => sj.jobId === jobId);
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Tab Selectors */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: 8 }}>
        <button
          onClick={() => setActiveTab('search')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'search' ? '2px solid var(--border-active)' : '2px solid transparent',
            color: activeTab === 'search' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.88rem',
            transition: 'all 0.15s ease',
            fontFamily: 'Space Grotesk'
          }}
        >
          Discover Jobs
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'saved' ? '2px solid var(--border-active)' : '2px solid transparent',
            color: activeTab === 'saved' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.88rem',
            transition: 'all 0.15s ease',
            fontFamily: 'Space Grotesk'
          }}
        >
          Saved Opportunities ({savedJobs.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'search' ? (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'grid', gap: 20 }}
          >
            {/* Search Filters Card */}
            <div className="card" style={{ padding: 20, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: '2 1 300px', position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Enter target job role..."
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
                <div style={{ flex: '1 1 200px', position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Location (e.g. Remote)..."
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn"
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Sliders size={14} />
                    <span>Filters</span>
                  </button>
                  
                  <button
                    onClick={() => handleSearch(false)}
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Extended filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--border)' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 8 }}>
                          Workplace Settings
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} />
                            Remote
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <input type="checkbox" checked={hybrid} onChange={(e) => setHybrid(e.target.checked)} />
                            Hybrid
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <input type="checkbox" checked={onsite} onChange={(e) => setOnsite(e.target.checked)} />
                            Onsite
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                          Experience Level
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2-5 years..."
                          value={experienceInput}
                          onChange={(e) => setExperienceInput(e.target.value)}
                          className="input"
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                          Salary Expectation
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 15-25 LPA..."
                          value={salaryRange}
                          onChange={(e) => setSalaryRange(e.target.value)}
                          className="input"
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                          Target Specific Skills
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. React, Node..."
                          value={skillsInput}
                          onChange={(e) => setSkillsInput(e.target.value)}
                          className="input"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Alerts */}
            {error && (
              <div style={{ display: 'flex', gap: 10, padding: 14, background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div style={{ display: 'flex', gap: 10, padding: 14, background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                <Check size={15} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Loading Indicator */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div className="spinner" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Searching and ranking tailored opportunities...</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {/* Search History list */}
                {jobs.length === 0 && searchHistory.length > 0 && (
                  <div className="card" style={{ padding: 20, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontFamily: 'Syne', fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <History size={15} color="var(--text-primary)" />
                      <span>Recent Searches</span>
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {searchHistory.map((h, i) => (
                        <button
                          key={i}
                          onClick={() => triggerHistorySearch(h)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border)',
                            fontSize: '0.78rem',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <Search size={12} />
                          <span>{h.query}</span>
                          {h.filters?.location && <span style={{ color: 'var(--text-muted)' }}>({h.filters.location})</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Job Cards */}
                {jobs.map((job) => {
                  const isSaved = isJobSaved(job.jobId);
                  const isExpanded = expandedJobId === job.jobId;
                  
                  return (
                    <div 
                      key={job.jobId}
                      className="card"
                      style={{ 
                        padding: 24, 
                        background: 'var(--bg-secondary)', 
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                            <span className="badge badge-indigo" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                              {job.applicationSource}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Posted {job.postedDate}
                            </span>
                          </div>
                          
                          <h3 style={{ fontFamily: 'Syne', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                            {job.title}
                          </h3>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <span style={{ fontWeight: 700 }}>{job.company}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={12} />
                              {job.location} ({job.workType})
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <DollarSign size={12} />
                              {job.salary}
                            </span>
                          </div>
                        </div>


                      </div>

                      {/* Required skills badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                        {job.requiredSkills.map((skill, sIdx) => {
                          const isMatched = job.analysis.matchingSkills.map(ms => ms.toLowerCase()).includes(skill.toLowerCase());
                          return (
                            <span 
                              key={sIdx}
                              className={isMatched ? 'skill-tag skill-tag-matched' : 'skill-tag skill-tag-neutral'}
                              style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              {isMatched ? <Check size={10} /> : null}
                              <span>{skill}</span>
                            </span>
                          );
                        })}
                      </div>

                      {/* Expanded comparison details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
                              <div>
                                <h4 style={{ fontFamily: 'Syne', fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <Sparkles size={12} color="var(--text-primary)" />
                                  <span>Strength Areas</span>
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'grid', gap: 4 }}>
                                  {job.analysis.strengths.map((str, idx) => (
                                    <li key={idx}>{str}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 style={{ fontFamily: 'Syne', fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <AlertCircle size={12} color="var(--text-primary)" />
                                  <span>Improvement Areas</span>
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'grid', gap: 4 }}>
                                  {job.analysis.improvements.map((imp, idx) => (
                                    <li key={idx}>{imp}</li>
                                  ))}
                                </ul>
                              </div>

                              {job.analysis.missingSkills.length > 0 && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                  <h4 style={{ fontFamily: 'Syne', fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 6 }}>
                                    Missing Skills & Keyword Gaps
                                  </h4>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {job.analysis.missingSkills.map((ms, idx) => (
                                      <span key={idx} className="skill-tag skill-tag-missing" style={{ fontSize: '0.7rem' }}>
                                        {ms}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Card Actions */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18, justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          onClick={() => toggleExpand(job.jobId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            textDecoration: 'underline'
                          }}
                        >
                          <span>{isExpanded ? 'Hide Analysis' : 'Compare With Resume'}</span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                        
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleToggleSave(job)}
                            disabled={actionLoading === job.jobId}
                            className="btn"
                            style={{
                              padding: '8px 10px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)',
                              background: 'var(--bg-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                          </button>
                          
                          <button
                            onClick={() => handleApply(job.url)}
                            className="btn btn-primary"
                            style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                          >
                            <span>Apply</span>
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {jobs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)' }}>
                    <Briefcase size={24} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>No matching live jobs found. Adjust your search keywords or location filters.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="saved"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'grid', gap: 16 }}
          >
            {savedJobs.map((job) => (
              <div 
                key={job.jobId}
                className="card"
                style={{ 
                  padding: 20, 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className="badge badge-indigo" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {job.applicationSource}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'Syne', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                      {job.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span style={{ fontWeight: 700 }}>{job.company}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <MapPin size={12} />
                        {job.location} ({job.workType})
                      </span>
                      {job.salary && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <DollarSign size={12} />
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleToggleSave(job)}
                      className="btn"
                      style={{
                        padding: '8px 10px',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <BookmarkCheck size={14} />
                    </button>
                    
                    <button
                      onClick={() => handleApply(job.url)}
                      className="btn btn-primary"
                      style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }}
                    >
                      <span>Apply</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {savedJobs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)' }}>
                <Bookmark size={24} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>No saved jobs yet. Find jobs and click the bookmark icon to save them.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
