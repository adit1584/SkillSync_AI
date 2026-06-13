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
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Blobs */}
      <div style={{
        position: 'absolute', top: '10%', right: '10%',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(163, 82, 0, 0.07) 0%, transparent 75%)',
        filter: 'blur(40px)', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '10%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(97, 46, 2, 0.05) 0%, transparent 75%)',
        filter: 'blur(45px)', zIndex: 0
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--bg-secondary)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1,
          backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
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
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
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
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
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
              transition: 'var(--transition)',
              marginTop: 10
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.background = 'var(--indigo-light)')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.background = 'var(--indigo)')}
          >
            {loading ? (
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <>
                Register Account <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--indigo)', fontWeight: 700, textDecoration: 'none' }}>
            Log In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
