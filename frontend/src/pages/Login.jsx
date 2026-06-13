import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { login } from '../lib/api';
import { Mail, Lock, Eye, EyeOff, Key, AlertCircle, ArrowRight } from 'lucide-react';
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
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Blobs */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(163, 82, 0, 0.08) 0%, transparent 75%)',
        filter: 'blur(40px)', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '10%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(97, 46, 2, 0.06) 0%, transparent 75%)',
        filter: 'blur(50px)', zIndex: 0
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--bg-secondary)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1,
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
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

          {/* Password field */}
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--indigo)', fontWeight: 600, textDecoration: 'none' }}>
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
                Log In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 28, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--indigo)', fontWeight: 700, textDecoration: 'none' }}>
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
