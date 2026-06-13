import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../lib/api';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setDemoLink('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setMessage('Password reset instructions generated successfully.');
        if (res.resetLink) {
          setDemoLink(res.resetLink);
        }
      } else {
        setError(res.error || 'Failed to request password reset.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'No account with that email was found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      {/* Left Brand Panel */}
      <div className="auth-split-left">
        <div>
          <h1 style={{
            fontFamily: 'Syne',
            fontSize: '2rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#FAFAFA',
            marginBottom: '8px'
          }}>
            SkillSync AI
          </h1>
          <p style={{ color: '#A1A1AA', fontSize: '0.95rem' }}>
            The Professional Career Intelligence Platform
          </p>
        </div>

        <div style={{ display: 'grid', gap: '30px', margin: '40px 0' }}>
          <div style={{ borderLeft: '2px solid #FAFAFA', paddingLeft: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#FAFAFA', marginBottom: '4px' }}>
              Linear Career Checkpoints
            </h3>
            <p style={{ color: '#A1A1AA', fontSize: '0.88rem' }}>
              Navigate step-by-step from resume uploading and skills assessment to career simulations.
            </p>
          </div>
          <div style={{ borderLeft: '2px solid #27272A', paddingLeft: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#FAFAFA', marginBottom: '4px' }}>
              Interactive Assessment Console
            </h3>
            <p style={{ color: '#A1A1AA', fontSize: '0.88rem' }}>
              Simulate interviews and skill checks directly inside a clean, distraction-free environment.
            </p>
          </div>
          <div style={{ borderLeft: '2px solid #27272A', paddingLeft: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#FAFAFA', marginBottom: '4px' }}>
              Gap Bridging & Timeline Roadmap
            </h3>
            <p style={{ color: '#A1A1AA', fontSize: '0.88rem' }}>
              Map your technical and interview prep through a structured 30-day dashboard.
            </p>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#71717A' }}>
          &copy; {new Date().getFullYear()} SkillSync AI. Premium Career Intelligence.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-split-right">
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <Link to="/login" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: 20,
              transition: 'var(--transition)'
            }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
            
            <h2 style={{
              fontFamily: 'Syne',
              fontSize: '1.8rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 8
            }}>
              Reset Password
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Enter your email and we will send instructions to reset your password.
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'var(--error-bg)',
                  border: '1px solid var(--error-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--error)',
                  fontSize: '0.82rem',
                  marginBottom: 20
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </motion.div>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: '14px 18px',
                  background: 'var(--success-bg)',
                  border: '1px solid var(--success-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--success)',
                  fontSize: '0.86rem',
                  marginBottom: 20
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <CheckCircle size={18} style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{message}</span>
                </div>
                
                {demoLink && (
                  <div style={{
                    marginTop: 10,
                    padding: 10,
                    background: 'var(--bg-primary)',
                    borderRadius: 6,
                    border: '1px dashed var(--border)'
                  }}>
                    <p style={{ margin: '0 0 6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Developer Demo Reset Link:
                    </p>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Mocking Reset flow using reset token successfully. For this demo, password has been reset to "123456". You can now log in using the email and password "123456".`);
                      }}
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-primary)',
                        fontWeight: 700,
                        wordBreak: 'break-all',
                        textDecoration: 'underline'
                      }}
                    >
                      Click to Reset Password to "123456" for demo
                    </a>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!message && (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input"
                    style={{
                      paddingLeft: '42px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.95rem',
                  fontWeight: 700
                }}
              >
                {loading ? (
                  <div className="spinner" style={{ width: 20, height: 20 }} />
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
