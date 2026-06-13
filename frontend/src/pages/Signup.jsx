import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { signup } from '../lib/api';
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Signup() {
  const { setAuthTokens } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await signup({ name, email, password, confirmPassword, phone });
      if (res.success) {
        await setAuthTokens(res.token, res.refreshToken, res.user);
        navigate('/upload');
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Email may already be in use.');
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
          <div style={{ marginBottom: 26 }}>
            <h2 style={{
              fontFamily: 'Syne',
              fontSize: '1.8rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 6
            }}>
              Create Account
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Join SkillSync AI and advance your career.
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

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            {/* Full Name */}
            <div style={{ display: 'grid', gap: 4 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="input"
                  style={{
                    paddingLeft: '42px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ display: 'grid', gap: 4 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Email Address *
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

            {/* Phone Number */}
            <div style={{ display: 'grid', gap: 4 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Phone Number (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="input"
                  style={{
                    paddingLeft: '42px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'grid', gap: 4 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
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

            {/* Confirm Password */}
            <div style={{ display: 'grid', gap: 4 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Confirm Password *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
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
                fontWeight: 700,
                marginTop: 10
              }}
            >
              {loading ? (
                <div className="spinner" style={{ width: 20, height: 20 }} />
              ) : (
                <>
                  Register Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'underline' }}>
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
