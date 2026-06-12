import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, FileText, Target, Brain, Rocket, BarChart3,
  ArrowRight, CheckCircle, Shield, TrendingUp,
  Code, Database, Cloud, Cpu, Server, Layers, Terminal
} from 'lucide-react';
import gsap from 'gsap';

const FEATURES = [
  {
    icon: FileText,
    title: 'Resume Intelligence',
    desc: 'AI extracts your technical skills, projects, certifications, and experience into a structured profile.',
    color: '#A35200',
    bg: 'rgba(163, 82, 0, 0.08)',
  },
  {
    icon: Target,
    title: 'Skill Gap Analysis',
    desc: 'Local matching engine compares your skills against role requirements. Zero AI cost, instant results.',
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.08)',
  },
  {
    icon: Brain,
    title: 'Adaptive Quiz ⭐',
    desc: 'AI generates 15 MCQs tailored to your skills and experience level to verify actual proficiency.',
    color: '#db2777',
    bg: 'rgba(219, 39, 119, 0.08)',
  },
  {
    icon: Rocket,
    title: 'Career Simulation',
    desc: 'Get 3 career path predictions — Accelerated, Steady, and Pivot — with real salary data.',
    color: '#ea580c',
    bg: 'rgba(234, 88, 12, 0.08)',
  },
  {
    icon: BarChart3,
    title: 'Personalized Roadmap',
    desc: 'Week-by-week learning plan with real resources, daily tasks, and deployable checkpoint projects.',
    color: '#0284c7',
    bg: 'rgba(2, 132, 199, 0.08)',
  },
  {
    icon: Zap,
    title: 'Token Optimization',
    desc: '93% token reduction via hybrid AI architecture. Only 3 targeted AI calls per session. ~₹0.15/user.',
    color: '#e11d48',
    bg: 'rgba(225, 29, 72, 0.08)',
  },
];

const ROLES = [
  { icon: Code, label: 'Frontend Developer', color: '#A35200' },
  { icon: Server, label: 'Backend Engineer', color: '#2563eb' },
  { icon: Layers, label: 'Fullstack Developer', color: '#0d9488' },
  { icon: Cpu, label: 'AI Engineer', color: '#db2777' },
  { icon: Database, label: 'Data Analyst', color: '#ea580c' },
  { icon: Cloud, label: 'Cloud Engineer', color: '#059669' },
  { icon: Terminal, label: 'DevOps Engineer', color: '#4f46e5' },
];

const STEPS = [
  { num: '01', title: 'Upload Resume', desc: 'PDF parsed instantly — no manual input needed.' },
  { num: '02', title: 'Skill Gap Analysis', desc: 'Local matching against predefined role datasets.' },
  { num: '03', title: 'Take Adaptive Quiz', desc: 'AI verifies your actual skill proficiency with MCQs.' },
  { num: '04', title: 'Get Your Roadmap', desc: 'Career simulation + week-by-week learning path.' },
];

export default function LandingPage() {
  const particleContainerRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);

  useEffect(() => {
    // 1. Create and animate floating GSAP background particles
    if (particleContainerRef.current) {
      const container = particleContainerRef.current;
      container.innerHTML = ''; // Clear existing
      
      const numParticles = 16;
      const elements = [];

      for (let i = 0; i < numParticles; i++) {
        const el = document.createElement('div');
        const size = Math.random() * 12 + 6;
        const x = Math.random() * 100;
        const y = Math.random() * 100;

        el.style.position = 'absolute';
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
        el.style.borderRadius = '50%';
        el.style.pointerEvents = 'none';

        const colorVal = Math.random();
        if (colorVal < 0.35) {
          el.style.background = 'radial-gradient(circle, rgba(163, 82, 0, 0.2) 0%, transparent 80%)';
          el.style.border = '1px solid rgba(163, 82, 0, 0.15)';
        } else if (colorVal < 0.7) {
          el.style.background = 'radial-gradient(circle, rgba(219, 39, 119, 0.18) 0%, transparent 80%)';
          el.style.border = '1px solid rgba(219, 39, 119, 0.15)';
        } else {
          el.style.background = 'radial-gradient(circle, rgba(234, 88, 12, 0.18) 0%, transparent 80%)';
          el.style.border = '1px solid rgba(234, 88, 12, 0.15)';
        }

        container.appendChild(el);
        elements.push(el);
      }

      elements.forEach(el => {
        gsap.to(el, {
          x: 'random(-50, 50)',
          y: 'random(-50, 50)',
          duration: 'random(8, 15)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }

    // 2. Staggered Intro Animation for Hero elements
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.hero-badge', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8 })
      .fromTo('.hero-title', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.55')
      .fromTo('.hero-desc', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.55')
      .fromTo('.hero-ctas', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.45')
      .fromTo('.hero-stat-box', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.08 }, '-=0.35');

    // 3. Scroll trigger-like entry for target roles section
    gsap.fromTo('.role-badge-anim', 
      { opacity: 0, y: 15 }, 
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, delay: 1.2 }
    );
  }, []);

  return (
    <div className="page-wrapper" ref={heroRef}>
      {/* ── HERO ────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 120,
        paddingBottom: 40,
      }}>
        {/* Particle and Grid Wrapper */}
        <div ref={particleContainerRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

        {/* Ambient glow backgrounds */}
        <div style={{
          position: 'absolute',
          top: '10%', left: '15%',
          width: 550, height: 550,
          background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%', right: '10%',
          width: 450, height: 450,
          background: 'radial-gradient(circle, rgba(219,39,119,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
            {/* Badge */}
            <div className="hero-badge" style={{ marginBottom: 26, opacity: 0 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 22px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(163, 82, 0, 0.06)',
                border: '1.5px solid rgba(163, 82, 0, 0.15)',
                fontSize: '0.82rem', fontWeight: 700,
                color: 'var(--indigo)',
                letterSpacing: '0.04em',
                fontFamily: 'Space Grotesk, sans-serif',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <Zap size={13} fill="var(--indigo)" />
                AI-Powered Career Intelligence
              </span>
            </div>

            {/* Headline */}
            <h1 className="hero-title" style={{
              fontSize: 'clamp(2.6rem, 6.5vw, 4.6rem)',
              fontWeight: 800,
              lineHeight: 1.12,
              marginBottom: 24,
              letterSpacing: '-0.02em',
              opacity: 0,
            }}>
              Verify Skills. Predict Growth.{' '}
              <span className="gradient-text">Own Your Trajectory.</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-desc" style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: 38,
              maxWidth: 620,
              margin: '0 auto 38px',
              opacity: 0,
            }}>
              Upload your resume to instantly audit skill gaps, test competence using AI-adaptive quizzes, and unlock custom roadmaps designed to get you hired.
            </p>

            {/* CTAs */}
            <div className="hero-ctas" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', opacity: 0 }}>
              <Link to="/upload" className="btn btn-primary" style={{ padding: '15px 34px', fontSize: '1rem' }}>
                <Zap size={18} />
                Get Started
                <ArrowRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                className="btn btn-secondary"
                style={{ padding: '15px 34px', fontSize: '1rem' }}
              >
                Learn More
              </a>
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 36,
              marginTop: 64, flexWrap: 'wrap',
            }}>
              {[
                { val: '93%', label: 'Token Reduction' },
                { val: '~₹0.15', label: 'Cost Per Session' },
                { val: 'GSAP', label: 'Drift Animations' },
                { val: '100%', label: 'Legit Resources' },
              ].map(s => (
                <div className="hero-stat-box" key={s.val} style={{ textAlign: 'center', opacity: 0 }}>
                  <p style={{
                    fontFamily: 'Space Grotesk',
                    fontWeight: 800,
                    fontSize: '1.9rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1,
                  }}>
                    {s.val}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ROLES ───────────────────────────────────────────────── */}
      <section style={{ padding: '20px 0 60px' }}>
        <div className="container">
          <p style={{
            textAlign: 'center', fontSize: '0.78rem',
            fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
            color: 'var(--text-muted)', marginBottom: 20,
            fontFamily: 'Space Grotesk',
          }}>
            Curated Career Target Profiles
          </p>
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
          }}>
            {ROLES.map(r => (
              <div
                className="role-badge-anim"
                key={r.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 22px',
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                  opacity: 0,
                  fontFamily: 'Space Grotesk',
                }}
              >
                <r.icon size={16} color={r.color} />
                {r.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section className="section" ref={featuresRef} style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.7rem)', marginBottom: 16 }}>
              Supercharged Analytics
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto' }}>
              Verify qualifications, simulate trajectories, optimize documents, and generate actionable roadmaps instantly.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {FEATURES.map((f, i) => (
              <div
                className="card"
                key={f.title}
                style={{
                  padding: '30px',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{
                  width: 52, height: 52,
                  background: f.bg,
                  borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                  border: `1.5px solid ${f.color}20`,
                }}>
                  <f.icon size={24} color={f.color} />
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="section" id="how-it-works" ref={stepsRef}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.7rem)', marginBottom: 16 }}>
              The Pathway Flow
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Your acceleration plan is built in four key steps
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 20,
            position: 'relative',
          }}>
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="card"
                style={{
                  padding: '32px 24px',
                  textAlign: 'center',
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{
                  fontFamily: 'Space Grotesk',
                  fontWeight: 800,
                  fontSize: '3rem',
                  color: 'rgba(163, 82, 0, 0.15)',
                  lineHeight: 1,
                  marginBottom: 16,
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: 10, fontFamily: 'Space Grotesk' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────── */}
      <section className="section" style={{ padding: '60px 0 100px' }}>
        <div className="container">
          <div style={{
            textAlign: 'center',
            padding: '70px 40px',
            background: 'linear-gradient(135deg, rgba(163, 82, 0, 0.05) 0%, rgba(97, 46, 2, 0.03) 100%)',
            border: '1.5px solid rgba(163, 82, 0, 0.15)',
            borderRadius: 'var(--radius-xl)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(163, 82, 0, 0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', marginBottom: 16, position: 'relative' }}>
              Bridge Your Skill Gaps Today
            </h2>
            <p style={{
              color: 'var(--text-secondary)', fontSize: '1.05rem',
              marginBottom: 36, maxWidth: 520, margin: '0 auto 36px',
              position: 'relative',
            }}>
              Start simulating careers, verifying resume claims, and acquiring missing capabilities with optimized resources.
            </p>
            <Link
              to="/upload"
              className="btn btn-primary"
              style={{ padding: '15px 38px', fontSize: '1rem', position: 'relative', boxShadow: 'var(--shadow-sm)' }}
            >
              <Zap size={18} />
              Analyze My Resume
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '36px 0',
        background: 'var(--bg-secondary)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        zIndex: 1,
        position: 'relative',
      }}>
        <div className="container">
          <p style={{ fontWeight: 600, fontFamily: 'Space Grotesk' }}>
            SkillSync AI · Team DevForge · LNCT Group of Colleges
          </p>
          <p style={{ marginTop: 8, fontSize: '0.78rem', opacity: 0.85 }}>
            "Bridging the Gap Between Skills Listed and Skills Proven"
          </p>
        </div>
      </footer>
    </div>
  );
}
