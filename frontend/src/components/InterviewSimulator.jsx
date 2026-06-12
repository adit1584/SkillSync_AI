import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Terminal, Cpu, User, AlertCircle, RefreshCw, Award, CheckCircle, ChevronRight, BarChart3, HelpCircle } from 'lucide-react';
import { startInterview, chatInterview } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

export default function InterviewSimulator({ sessionId, targetRole }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [chatting, setChatting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [concluded, setConcluded] = useState(false);
  const [scorecard, setScorecard] = useState(null);

  const feedRef = useRef(null);

  // Load / Start Interview on mount
  useEffect(() => {
    initInterview();
  }, [sessionId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, chatting]);

  async function initInterview() {
    try {
      setLoading(true);
      setError('');
      setConcluded(false);
      setScorecard(null);
      const res = await startInterview(sessionId);
      if (res.success) {
        setMessages(res.history);
        setConcluded(res.concluded);
        setScorecard(res.scorecard);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e) {
    if (e) e.preventDefault();
    if (!input.trim() || chatting) return;

    const userMessage = input.trim();
    setInput('');
    setChatting(true);

    // Optimistically add user message to local feed
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const res = await chatInterview(sessionId, userMessage);
      if (res.success) {
        setMessages(res.history);
        setConcluded(res.concluded);
        setScorecard(res.scorecard);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send message');
    } finally {
      setChatting(false);
    }
  }

  // ── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 16 }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600 }}>
          Configuring technical AI interviewer...
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
        <button className="btn btn-secondary" onClick={initInterview}>
          <RefreshCw size={14} /> Retry Interview
        </button>
      </div>
    );
  }

  // ── Concluded Scorecard state ────────────────────────────────────
  if (concluded && scorecard) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        {/* Header Banner */}
        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(163,82,0,0.08) 0%, rgba(219,39,119,0.04) 100%)',
          border: '1.5px solid rgba(163,82,0,0.2)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            width: 56, height: 56,
            background: 'rgba(163, 82, 0, 0.12)',
            border: '1.5px solid rgba(163, 82, 0, 0.25)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Award size={28} color="var(--indigo)" />
          </div>
          <h2 style={{ fontSize: '1.45rem', marginBottom: 4, fontFamily: 'Space Grotesk' }}>Interview Complete</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>
            {targetRole} Evaluation Report
          </p>
        </div>

        {/* Core Scores Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { label: 'Overall Score', score: scorecard.overall_score, color: 'var(--indigo)' },
            { label: 'Technical Depth', score: scorecard.technical_depth_score, color: 'var(--violet)' },
            { label: 'Communication', score: scorecard.communication_score, color: 'var(--emerald)' }
          ].map(scoreCard => (
            <div key={scoreCard.label} style={{
              background: 'var(--bg-secondary)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              textAlign: 'center',
              display: 'flex', flexDirection: 'column', gap: 8,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                {scoreCard.label}
              </span>
              <span style={{ fontSize: '2.4rem', fontWeight: 800, color: scoreCard.color, fontFamily: 'Space Grotesk' }}>
                {scoreCard.score}%
              </span>
              <div className="progress-track" style={{ height: 5 }}>
                <div className="progress-fill" style={{ width: `${scoreCard.score}%`, background: scoreCard.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Strengths & Improvements */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {/* Strengths */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1.5px solid rgba(5, 150, 105, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--emerald)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Space Grotesk' }}>
              <CheckCircle size={16} /> Key Strengths
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 0, listStyle: 'none' }}>
              {scorecard.strengths?.map((s, i) => (
                <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--emerald)', marginTop: 2, fontWeight: 800 }}>•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1.5px solid rgba(225, 29, 72, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--rose)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Space Grotesk' }}>
              <HelpCircle size={16} /> Suggested Upgrades
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 0, listStyle: 'none' }}>
              {scorecard.improvements?.map((imp, i) => (
                <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--rose)', marginTop: 2, fontWeight: 800 }}>•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feedback Summary */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h4 style={{ fontSize: '1.05rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Space Grotesk' }}>
            <BarChart3 size={16} color="var(--indigo)" /> Overall Performance Feedback
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            {scorecard.feedback_summary}
          </p>
        </div>

        {/* Restart Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <button className="btn btn-primary" onClick={initInterview}>
            <RefreshCw size={14} /> Restart Mock Interview
          </button>
        </div>
      </motion.div>
    );
  }

  // Define dynamic terminal theme parameters
  const termBg = theme === 'dark' ? '#0b0816' : '#ffffff';
  const termBorder = theme === 'dark' ? 'rgba(189, 90, 247, 0.25)' : 'rgba(163, 82, 0, 0.12)';
  const termHeaderBg = theme === 'dark' ? '#120d2b' : '#FAF6F0';
  const termText = theme === 'dark' ? '#cbd5e1' : '#1e293b';

  // ── Active Chat state ────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 540,
      background: termBg,
      border: `1.5px solid ${termBorder}`,
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-md)',
    }}>
      {/* Terminal Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        background: termHeaderBg,
        borderBottom: `1.5px solid ${termBorder}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Terminal size={14} color="var(--indigo)" />
          <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
            Mock_AI_Interviewer_Terminal.sh
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f56' }} />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#27c93f' }} />
        </div>
      </div>

      {/* Terminal Messages Feed */}
      <div
        ref={feedRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          lineHeight: 1.5,
        }}
      >
        {/* Intro logs */}
        <div style={{ color: 'var(--text-muted)' }}>
          <div>[system] Connecting to local AI agent session...</div>
          <div>[system] Target role: {targetRole} loaded successfully.</div>
          <div>[system] Interview console ready. Response speed: fast.</div>
          <div style={{ margin: '8px 0', borderTop: `1px dashed ${termBorder}` }} />
        </div>

        {messages.map((m, idx) => {
          const isInterviewer = m.role === 'assistant';
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: isInterviewer ? -8 : 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                gap: 10,
                alignSelf: isInterviewer ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
              }}
            >
              <div style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: isInterviewer ? 'rgba(163, 82, 0, 0.08)' : 'rgba(97, 46, 2, 0.08)',
                border: `1px solid ${isInterviewer ? 'rgba(163, 82, 0, 0.25)' : 'rgba(219, 39, 119, 0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                marginTop: 2
              }}>
                {isInterviewer ? <Cpu size={13} color="var(--indigo)" /> : <User size={13} color="var(--violet)" />}
              </div>
              <div style={{
                background: isInterviewer ? (theme === 'dark' ? '#120d2b' : '#FAF6F0') : 'rgba(163, 82, 0, 0.04)',
                border: `1.5px solid ${isInterviewer ? 'var(--border)' : 'rgba(163, 82, 0, 0.15)'}`,
                borderRadius: isInterviewer ? '0 12px 12px 12px' : '12px 0 12px 12px',
                padding: '12px 16px',
                color: termText,
                whiteSpace: 'pre-wrap'
              }}>
                {m.content}
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {chatting && (
          <div style={{ display: 'flex', gap: 10, alignSelf: 'flex-start' }}>
            <div style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: 'rgba(163, 82, 0, 0.08)',
              border: '1.5px solid rgba(163, 82, 0, 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Cpu size={13} color="var(--indigo)" />
            </div>
            <div style={{
              background: theme === 'dark' ? '#120d2b' : '#FAF6F0',
              border: '1.5px solid var(--border)',
              borderRadius: '0 12px 12px 12px',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              {[0, 1, 2].map(dot => (
                <motion.span
                  key={dot}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.15 }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--indigo)', display: 'inline-block' }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Terminal Input Form */}
      <form
        onSubmit={handleSend}
        style={{
          display: 'flex',
          gap: 12,
          padding: '16px',
          background: termHeaderBg,
          borderTop: `1.5px solid ${termBorder}`,
          alignItems: 'center',
        }}
      >
        <span style={{ color: 'var(--emerald)', fontFamily: 'monospace', fontSize: '0.95rem', paddingLeft: 4, fontWeight: 'bold' }}>$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={chatting ? 'Interviewer is typing...' : 'Type your answer here...'}
          disabled={chatting}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: termText,
            fontFamily: 'monospace',
            fontSize: '0.88rem',
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || chatting}
          style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: input.trim() && !chatting ? 'var(--indigo)' : 'var(--border)',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() && !chatting ? 'pointer' : 'not-allowed',
            color: 'white',
            transition: 'background 0.2s',
          }}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
