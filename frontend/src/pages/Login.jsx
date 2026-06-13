import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { login } from '../lib/api';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const { setAuthTokens } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.success) {
        await setAuthTokens(res.token, res.refreshToken, res.user);
        navigate('/upload');
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
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
          <div style={{ marginBottom: 30 }}>
            <h2 style={{
              fontFamily: 'Syne',
              fontSize: '1.8rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 8
            }}>
              Welcome Back
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Log in to manage your AI Career Intelligence profile.
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
          </AnimatePresence>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
            {/* Email field */}
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

            {/* Password field */}
            <div style={{ display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'underline' }}>
                  Forgot Password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input"
                  style={{
                    paddingLeft: '42px',
                    paddingRight: '42px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                fontWeight: 700,
                marginTop: 10
              }}
            >
              {loading ? (
                <div className="spinner" style={{ width: 20, height: 20 }} />
              ) : (
                <>
                  Log In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 28, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'underline' }}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
