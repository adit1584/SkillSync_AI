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
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Background */}
      <div style={{
        position: 'absolute', top: '15%', left: '15%',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(163, 82, 0, 0.06) 0%, transparent 75%)',
        filter: 'blur(35px)', zIndex: 0
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--bg-secondary)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1,
          backdropFilter: 'blur(10px)'
        }}
      >
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
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--indigo)'}
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
            Enter your email and we'll send instructions to reset your password.
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
                background: 'rgba(185, 28, 28, 0.05)',
                border: '1px solid rgba(185, 28, 28, 0.25)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--rose)',
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
                background: 'rgba(133, 77, 14, 0.05)',
                border: '1px solid rgba(133, 77, 14, 0.25)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--emerald)',
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
                      alert(`Mocking Reset flow using reset token successfully! For this demo, password has been reset to "123456". You can now log in using the email and password "123456".`);
                    }}
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--indigo)',
                      fontWeight: 700,
                      wordBreak: 'break-all'
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
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: 'var(--bg-primary)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'var(--transition)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--indigo)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--indigo)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'var(--transition)'
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.background = 'var(--indigo-light)')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.background = 'var(--indigo)')}
            >
              {loading ? (
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
