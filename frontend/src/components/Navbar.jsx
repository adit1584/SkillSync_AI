import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, Zap, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const logoRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (logoRef.current) {
      // Continuous slow rotation of the synapse SVG
      gsap.to(logoRef.current, {
        rotation: 360,
        duration: 30,
        repeat: -1,
        ease: 'none',
      });

      // Staggered pulsing glow of the inner nodes
      gsap.to('.logo-node', {
        scale: 1.3,
        opacity: 0.9,
        duration: 1.2,
        stagger: {
          each: 0.25,
          repeat: -1,
          yoyo: true,
        },
        ease: 'sine.inOut',
      });

      // Flowing dash offset for the connections representing data sync
      gsap.to('.logo-link', {
        strokeDashoffset: -20,
        duration: 2,
        repeat: -1,
        ease: 'none',
      });
    }
  }, []);

  const handleLogoHover = () => {
    // Spin quickly on hover
    gsap.to(logoRef.current, {
      rotation: '+=90',
      duration: 0.6,
      ease: 'back.out(1.5)',
    });
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Analyze', to: '/upload' },
  ];

  const activeColor = 'var(--indigo)';
  const inactiveColor = 'var(--text-secondary)';

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        padding: scrolled ? '12px 0' : '18px 0',
        transition: 'all 0.3s ease',
        background: scrolled
          ? (theme === 'dark' ? 'rgba(9, 5, 20, 0.85)' : 'rgba(250, 246, 240, 0.85)')
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled
          ? (theme === 'dark' ? '1px solid rgba(189, 90, 247, 0.15)' : '1px solid rgba(163, 82, 0, 0.08)')
          : 'none',
      }}
    >
      <div className="container flex-between">
        {/* Logo */}
        <Link
          to="/"
          onMouseEnter={handleLogoHover}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <div style={{
            width: 42, height: 42,
            background: theme === 'dark' ? 'rgba(189, 90, 247, 0.1)' : 'rgba(163, 82, 0, 0.08)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid var(--border)',
            boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
            position: 'relative',
          }}>
            <svg
              ref={logoRef}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ overflow: 'visible' }}
            >
              {/* Connection links */}
              <line className="logo-link" x1="12" y1="4" x2="6" y2="14" stroke="url(#logoGrad)" strokeWidth="1.5" strokeDasharray="4,4" />
              <line className="logo-link" x1="12" y1="4" x2="18" y2="14" stroke="url(#logoGrad)" strokeWidth="1.5" strokeDasharray="4,4" />
              <line className="logo-link" x1="6" y1="14" x2="18" y2="14" stroke="url(#logoGrad)" strokeWidth="1.5" strokeDasharray="4,4" />
              <line className="logo-link" x1="12" y1="4" x2="12" y2="20" stroke="url(#logoGrad)" strokeWidth="1.5" strokeDasharray="4,4" />
              
              {/* Interactive nodes */}
              <circle className="logo-node" cx="12" cy="4" r="2.8" fill={theme === 'dark' ? '#120d2b' : '#ffffff'} stroke="url(#logoGrad)" strokeWidth="1.8" style={{ transformOrigin: '12px 4px' }} />
              <circle className="logo-node" cx="6" cy="14" r="2.8" fill={theme === 'dark' ? '#120d2b' : '#ffffff'} stroke="url(#logoGrad)" strokeWidth="1.8" style={{ transformOrigin: '6px 14px' }} />
              <circle className="logo-node" cx="18" cy="14" r="2.8" fill={theme === 'dark' ? '#120d2b' : '#ffffff'} stroke="url(#logoGrad)" strokeWidth="1.8" style={{ transformOrigin: '18px 14px' }} />
              <circle className="logo-node" cx="12" cy="20" r="2.8" fill={theme === 'dark' ? '#120d2b' : '#ffffff'} stroke="url(#logoGrad)" strokeWidth="1.8" style={{ transformOrigin: '12px 20px' }} />
              
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--indigo)" />
                  <stop offset="100%" stopColor="var(--violet)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: '1.35rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            display: 'flex',
            alignItems: 'center',
          }}>
            Skill<span className="gradient-text" style={{ marginLeft: 2 }}>Sync</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="desktop-nav">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                textDecoration: 'none',
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: 'Space Grotesk, sans-serif',
                color: location.pathname === link.to ? activeColor : inactiveColor,
                background: location.pathname === link.to
                  ? (theme === 'dark' ? 'rgba(189,90,247,0.12)' : 'rgba(124,58,237,0.08)')
                  : 'transparent',
                transition: 'var(--transition)',
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              padding: '10px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              transition: 'var(--transition)',
              marginLeft: 8,
            }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark'
              ? <Sun size={15} color="#f59e0b" />
              : <Moon size={15} color="var(--indigo)" />
            }
          </button>

          <Link
            to="/upload"
            className="btn btn-primary"
            style={{
              padding: '9px 22px',
              fontSize: '0.85rem',
              marginLeft: 8,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Zap size={14} />
            Get Started
          </Link>
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
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
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
            background: theme === 'dark' ? 'rgba(9, 5, 20, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            borderBottom: '1px solid var(--border)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            backdropFilter: 'blur(20px)',
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
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: 'Space Grotesk, sans-serif',
                padding: '8px 0',
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
              fontSize: '0.95rem', textAlign: 'left', padding: '8px 0',
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
}
