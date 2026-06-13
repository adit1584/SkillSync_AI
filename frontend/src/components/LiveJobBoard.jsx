import React, { useState, useEffect } from 'react';
import { 
  Briefcase, MapPin, DollarSign, Clock, CheckCircle2, AlertCircle, 
  Bookmark, BookmarkCheck, ExternalLink, Search, Sliders, History, 
  Sparkles, Check, ChevronDown, ChevronUp
} from 'lucide-react';
import { searchLiveJobs, saveJob, getSavedJobs, getJobSearchHistory } from '../lib/api';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveJobBoard() {
  const { sessionId, targetRole, customRole, resumeData } = useApp();
  
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
    handleSearch(true); // Initial auto-search based on target role
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
          fetchSearchHistory(); // Refresh history log
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
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
    }
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
    // Run search
    setTimeout(() => {
      handleSearch(false);
    }, 100);
  };

  const isJobSaved = (jobId) => {
    return savedJobs.some(sj => sj.jobId === jobId);
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
            borderBottom: activeTab === 'search' ? '2.5px solid var(--indigo)' : '2.5px solid transparent',
            color: activeTab === 'search' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.92rem',
            transition: 'all 0.2s ease',
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
            borderBottom: activeTab === 'saved' ? '2.5px solid var(--indigo)' : '2.5px solid transparent',
            color: activeTab === 'saved' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.92rem',
            transition: 'all 0.2s ease',
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gap: 20 }}
          >
            {/* Search Filters Card */}
            <div className="card" style={{ padding: 20, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: '2 1 300px', position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Enter target job role..."
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 42px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ flex: '1 1 200px', position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Location (e.g. San Francisco or Remote)..."
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 42px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn"
                    style={{
                      padding: '12px 16px',
                      border: '1.5px solid var(--border)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <Sliders size={16} />
                    <span>Filters</span>
                  </button>
                  
                  <button
                    onClick={() => handleSearch(false)}
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Search size={16} />
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 20, paddingTop: 20, borderTop: '1px dashed var(--border)' }}>
                      <div>
                        <label style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 8 }}>
                          Workplace Settings
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} />
                            Remote
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <input type="checkbox" checked={hybrid} onChange={(e) => setHybrid(e.target.checked)} />
                            Hybrid
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <input type="checkbox" checked={onsite} onChange={(e) => setOnsite(e.target.checked)} />
                            Onsite
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 8 }}>
                          Experience Level
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2-5 years or Entry Level..."
                          value={experienceInput}
                          onChange={(e) => setExperienceInput(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid var(--border)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 8 }}>
                          Salary Expectation
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 15-25 LPA or $120k+..."
                          value={salaryRange}
                          onChange={(e) => setSalaryRange(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid var(--border)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 8 }}>
                          Target Specific Skills
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. React, Node, AWS..."
                          value={skillsInput}
                          onChange={(e) => setSkillsInput(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid var(--border)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error / Success alerts */}
            {error && (
              <div style={{ display: 'flex', gap: 10, padding: 14, background: 'rgba(185,28,28,0.04)', border: '1px solid rgba(185,28,28,0.15)', color: 'var(--rose)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div style={{ display: 'flex', gap: 10, padding: 14, background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)', color: 'var(--emerald)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Loading Indicator */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div className="spinner" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Searching and ranking tailored opportunities...</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {/* Query History list if search is empty */}
                {jobs.length === 0 && searchHistory.length > 0 && (
                  <div className="card" style={{ padding: 20, background: 'var(--bg-secondary)' }}>
                    <h4 style={{ fontFamily: 'Syne', fontSize: '1.05rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <History size={16} color="var(--indigo)" />
                      <span>Recent Searches</span>
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {searchHistory.map((h, i) => (
                        <button
                          key={i}
                          onClick={() => triggerHistorySearch(h)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '20px',
                            background: 'var(--bg-primary)',
                            border: '1.5px solid var(--border)',
                            fontSize: '0.8rem',
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
                        border: '1.5px solid var(--border)',
                        transition: 'var(--transition)'
                      }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--indigo)', background: 'var(--bg-accent-light)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                              {job.applicationSource}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Posted {job.postedDate}
                            </span>
                          </div>
                          
                          <h3 style={{ fontFamily: 'Syne', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                            {job.title}
                          </h3>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span style={{ fontWeight: 700 }}>{job.company}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={14} />
                              {job.location} ({job.workType})
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <DollarSign size={14} />
                              {job.salary}
                            </span>
                          </div>
                        </div>

                        {/* Matching score panel */}
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <div style={{ textAlign: 'center', padding: '10px 14px', background: 'var(--bg-primary)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: job.analysis.matchScore >= 80 ? 'var(--emerald)' : job.analysis.matchScore >= 60 ? 'var(--indigo)' : 'var(--rose)', fontFamily: 'Space Grotesk' }}>
                              {job.analysis.matchScore}%
                            </div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>Match</div>
                          </div>

                          <div style={{ textAlign: 'center', padding: '10px 14px', background: 'var(--bg-primary)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: job.analysis.atsScore >= 80 ? 'var(--emerald)' : job.analysis.atsScore >= 60 ? 'var(--indigo)' : 'var(--rose)', fontFamily: 'Space Grotesk' }}>
                              {job.analysis.atsScore}%
                            </div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>ATS Fit</div>
                          </div>
                        </div>
                      </div>

                      {/* Required skills badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 18 }}>
                        {job.requiredSkills.map((skill, sIdx) => {
                          const isMatched = job.analysis.matchingSkills.map(ms => ms.toLowerCase()).includes(skill.toLowerCase());
                          return (
                            <span 
                              key={sIdx} 
                              style={{ 
                                fontSize: '0.75rem', 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                background: isMatched ? 'rgba(16,185,129,0.06)' : 'rgba(0,0,0,0.03)',
                                border: `1px solid ${isMatched ? 'rgba(16,185,129,0.18)' : 'var(--border)'}`,
                                color: isMatched ? 'var(--emerald)' : 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              {isMatched ? <Check size={11} /> : null}
                              <span>{skill}</span>
                            </span>
                          );
                        })}
                      </div>

                      {/* Expandable comparison details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                              <div>
                                <h4 style={{ fontFamily: 'Syne', fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <Sparkles size={14} color="var(--emerald)" />
                                  <span>Strength Areas</span>
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'grid', gap: 6 }}>
                                  {job.analysis.strengths.map((str, idx) => (
                                    <li key={idx}>{str}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 style={{ fontFamily: 'Syne', fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <AlertCircle size={14} color="var(--indigo)" />
                                  <span>Improvement Areas</span>
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'grid', gap: 6 }}>
                                  {job.analysis.improvements.map((imp, idx) => (
                                    <li key={idx}>{imp}</li>
                                  ))}
                                </ul>
                              </div>

                              {job.analysis.missingSkills.length > 0 && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                  <h4 style={{ fontFamily: 'Syne', fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 8 }}>
                                    Missing Skills & Keyword Gaps
                                  </h4>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {job.analysis.missingSkills.map((ms, idx) => (
                                      <span key={idx} style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 4, background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', color: 'var(--rose)' }}>
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
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20, justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          onClick={() => toggleExpand(job.jobId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--indigo)',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <span>{isExpanded ? 'Hide Analysis' : 'Compare With Resume'}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleToggleSave(job)}
                            disabled={actionLoading === job.jobId}
                            className="btn"
                            style={{
                              padding: '8px 12px',
                              border: '1.5px solid var(--border)',
                              background: 'var(--bg-primary)',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title={isSaved ? 'Unsave Job' : 'Save Job'}
                          >
                            {isSaved ? <BookmarkCheck size={16} color="var(--indigo)" /> : <Bookmark size={16} />}
                          </button>
                          
                          <button
                            onClick={() => handleApply(job.url)}
                            className="btn btn-primary"
                            style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
                          >
                            <span>Apply Now</span>
                            <ExternalLink size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {jobs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0', border: '1.5px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <Briefcase size={28} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>No matching live jobs found. Adjust your search keywords or location filters.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gap: 16 }}
          >
            {savedJobs.map((job) => (
              <div 
                key={job.jobId}
                className="card"
                style={{ 
                  padding: 20, 
                  background: 'var(--bg-secondary)', 
                  border: '1.5px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--indigo)', background: 'var(--bg-accent-light)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                        {job.applicationSource}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'Syne', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                      {job.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
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
                        border: '1.5px solid var(--border)',
                        background: 'var(--bg-primary)',
                        color: 'var(--indigo)'
                      }}
                    >
                      <BookmarkCheck size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleApply(job.url)}
                      className="btn btn-primary"
                      style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}
                    >
                      <span>Apply</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {savedJobs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', border: '1.5px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                <Bookmark size={28} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>No saved jobs yet. Find jobs and click the bookmark icon to save them.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
