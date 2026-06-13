import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, Zap, Menu, X, Briefcase } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logoutUser } = useApp();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const hideNavbarPaths = ['/login', '/signup', '/forgot-password', '/forget-password'];
  const currentPath = location.pathname.toLowerCase().trim().replace(/\/$/, '');
  if (hideNavbarPaths.includes(currentPath)) {
    return null;
  }

  const navLinks = [
    { label: 'Home', to: '/' },
    ...(user ? [
      { label: 'Workspace', to: '/results' },
      { label: 'Analyze', to: '/upload' },
      { label: 'History', to: '/history' },
    ] : [
      { label: 'Login', to: '/login' },
      { label: 'Signup', to: '/signup' },
    ])
  ];

  const activeColor = 'var(--text-primary)';
  const inactiveColor = 'var(--text-secondary)';

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        padding: scrolled ? '10px 0' : '16px 0',
        transition: 'all 0.2s ease',
        background: scrolled ? 'var(--bg-secondary)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
      }}
    >
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo */}
        <Link
          to={user ? "/results" : "/"}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <div style={{
            width: 32, height: 32,
            background: 'var(--primary)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--bg-secondary)',
          }}>
            <Briefcase size={16} />
          </div>
          <span style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: '1.25rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
          }}>
            SkillSync
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="desktop-nav">
          {navLinks.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  fontFamily: 'Space Grotesk, sans-serif',
                  color: isActive ? 'var(--bg-secondary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  transition: 'var(--transition)',
                }}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              width: 32,
              height: 32,
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)',
              marginLeft: 4,
            }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
              <div style={{
                background: 'var(--bg-accent-light)',
                color: 'var(--text-accent)',
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 700,
                fontFamily: 'Space Grotesk, sans-serif',
                border: '1px solid var(--border)'
              }}>
                {user.name.split(' ')[0]}
              </div>
              <button
                onClick={logoutUser}
                className="btn btn-secondary"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary"
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                marginLeft: 8,
                borderRadius: 'var(--radius-sm)'
              }}
            >
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-menu-btn"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            display: 'none',
          }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: '100%', left: 0, right: 0,
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              style={{
                textDecoration: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                fontWeight: 600,
                fontFamily: 'Space Grotesk, sans-serif',
                padding: '6px 0',
              }}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              toggleTheme();
              setMobileOpen(false);
            }}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--text-secondary)',
              fontSize: '0.9rem', textAlign: 'left', padding: '6px 0',
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
}
