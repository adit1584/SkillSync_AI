import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import {
  FileText, Target, Brain, Rocket, BarChart3,
  ArrowRight, Shield, Layers, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import gsap from 'gsap';

const FEATURES = [
  {
    icon: FileText,
    title: 'Resume Intelligence',
    desc: 'Extracts your technical skills, projects, and certifications automatically into a professional profile.',
  },
  {
    icon: Target,
    title: 'Skill Gap Analysis',
    desc: 'Local matching engine compares your current skills against industry standard target roles.',
  },
  {
    icon: Brain,
    title: 'Adaptive Verification Quiz',
    desc: 'AI-generated evaluation tailored to your level to measure and prove actual capability.',
  },
  {
    icon: Rocket,
    title: 'Career Simulations',
    desc: 'Model three distinct paths: Accelerated growth, steady progression, and custom pivots.',
  },
  {
    icon: BarChart3,
    title: '30-Day Learning Roadmap',
    desc: 'A week-by-week actionable plan with curated learning resources and milestone projects.',
  },
  {
    icon: Shield,
    title: 'Zero-Cost Core Matching',
    desc: 'Optimized local parsing for instant feedback before querying AI endpoints for roadmap generation.',
  },
];

const FAQS = [
  {
    q: 'How does the skill verification work?',
    a: 'We evaluate your uploaded resume skills locally, then generate a tailored interactive quiz. This quiz tests your core knowledge and feeds results back into your readiness profile.',
  },
  {
    q: 'Is my resume data secure?',
    a: 'Absolutely. We process data strictly for career analysis and profile building. Your data is protected by secure database policies and is not shared with third-party recruiters without your consent.',
  },
  {
    q: 'What is the difference between custom and suggested target roles?',
    a: 'Suggested roles are preset pathways (like AI Engineer, Frontend Developer) matching industry profiles. Custom roles allow you to target any specific job title by matching against your own copy-pasted job description.',
  },
  {
    q: 'Can I download the 30-day learning roadmap?',
    a: 'Yes. The career intelligence dashboard includes a printable version of your timeline, milestone checklists, and resources.',
  },
];

export default function LandingPage() {
  const { user, resetAnalysis } = useApp();
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    // Basic GSAP fade-in animations
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 })
      .fromTo('.hero-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
      .fromTo('.hero-ctas', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.hero-stats', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3');
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <section style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 100,
        paddingBottom: 60,
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
            <h1 className="hero-title" style={{
              fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: 24,
              letterSpacing: '-0.03em',
              opacity: 0,
              color: 'var(--text-primary)',
            }}>
              Know Your Career Potential Before Recruiters Do.
            </h1>

            <p className="hero-desc" style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: 38,
              maxWidth: 680,
              margin: '0 auto 38px',
              opacity: 0,
            }}>
              Upload your resume to instantly audit skill gaps, test competence using AI-adaptive quizzes, and unlock structured 30-day roadmaps designed to get you hired.
            </p>

            <div className="hero-ctas" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', opacity: 0 }}>
              {user ? (
                <>
                  <Link to="/results" className="btn btn-primary" style={{ padding: '14px 30px', fontSize: '0.95rem' }}>
                    Go to Workspace
                    <ArrowRight size={16} />
                  </Link>
                  <Link 
                    to="/upload" 
                    onClick={resetAnalysis} 
                    className="btn btn-secondary" 
                    style={{ padding: '14px 30px', fontSize: '0.95rem' }}
                  >
                    New Analysis
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/upload" className="btn btn-primary" style={{ padding: '14px 30px', fontSize: '0.95rem' }}>
                    Get Started
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 30px', fontSize: '0.95rem' }}>
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <div className="hero-stats" style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 48,
              marginTop: 64,
              flexWrap: 'wrap',
              opacity: 0
            }}>
              {[
                { val: '93%', label: 'Cost Optimized' },
                { val: '30-Day', label: 'Structured Roadmaps' },
                { val: '100%', label: 'Flat Layout Verified' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{
                    fontFamily: 'Space Grotesk',
                    fontWeight: 700,
                    fontSize: '1.8rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.1,
                  }}>
                    {s.val}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{
        padding: '80px 0',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 12 }}>
              Supercharged Career Intelligence
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>
              Evaluate qualification gaps, simulate salary growth, and optimize profiles inside a single workspace.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}>
            {FEATURES.map((f) => (
              <div
                className="card"
                key={f.title}
                style={{
                  padding: '30px',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  background: 'var(--bg-accent-light)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  border: '1px solid var(--border)'
                }}>
                  <f.icon size={20} color="var(--text-primary)" />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trajectory Simulation Preview */}
      <section style={{
        padding: '80px 0',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 40,
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 16 }}>
                Simulate Your Growth
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 24 }}>
                SkillSync AI maps your trajectory using current profile credentials and calculates potential gains. Access side-by-side growth analytics comparing standard timelines against accelerated roadmaps.
              </p>
              <div style={{ display: 'grid', gap: 16 }}>
                {[
                  'Verify technical confidence via sandbox testing',
                  'Identify skill discrepancies before applying',
                  'Follow optimized week-by-week roadmap checks'
                ].map(text => (
                  <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.88rem' }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%',
                      background: 'var(--success-bg)',
                      border: '1px solid var(--success-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                    </div>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '30px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, fontFamily: 'Space Grotesk' }}>
                Trajectory Comparison
              </h3>
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 600 }}>Standard Track</span>
                    <span style={{ color: 'var(--text-muted)' }}>45% Match Score</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '45%' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 600 }}>Accelerated Track</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>88% Match Score</span>
                  </div>
                  <div className="progress-track" style={{ borderColor: 'var(--success-border)' }}>
                    <div className="progress-fill" style={{ width: '88%', background: 'var(--success)' }} />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Potential Salary Offset</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>+32% Acceleration</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{
        padding: '80px 0',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 12 }}>
              Built for Professionals
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Read reviews from platform developers and candidates.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}>
            {[
              {
                text: 'SkillSync AI identified exactly which backend patterns I was missing for my Target AI role, helping me bridge the gap in days.',
                author: 'Siddharth K.',
                role: 'AI Engineer Candidate'
              },
              {
                text: 'The verification quizzes tested my actual practical skill levels rather than typical resume buzzwords.',
                author: 'Pooja M.',
                role: 'Fullstack Developer'
              }
            ].map((t, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '30px',
              }}>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 20 }}>
                  "{t.text}"
                </p>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>{t.author}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section style={{
        padding: '80px 0',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 12 }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Common questions about the SkillSync career workspace.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '20px',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    fontFamily: 'Space Grotesk'
                  }}
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {openFaq === idx && (
                  <div style={{
                    padding: '0 20px 20px',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    color: 'var(--text-secondary)',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '16px'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer style={{
        padding: '40px 0',
        background: 'var(--bg-secondary)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.82rem',
      }}>
        <div className="container">
          <p style={{ fontWeight: 600, fontFamily: 'Space Grotesk', color: 'var(--text-secondary)' }}>
            SkillSync AI · Career Intelligence Platform
          </p>
          <p style={{ marginTop: 6, fontSize: '0.78rem' }}>
            Bridging the gap between credentials listed and skills proven.
          </p>
        </div>
      </footer>
    </div>
  );
}
