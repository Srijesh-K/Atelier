'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../dashboard.module.css';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState('fsd');
  const [studentName, setStudentName] = useState('BUILDER');

  // Step 2 Skill levels (range 10 to 100)
  const [skills, setSkills] = useState({
    frontend: 45,
    backend: 40,
    databases: 35,
    algorithms: 30,
    systemDesign: 25
  });

  // Step 3 terminal simulation
  const [logs, setLogs] = useState([]);
  const [logIndex, setLogIndex] = useState(0);
  const [isProvisioned, setIsProvisioned] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const tracks = [
    {
      id: 'fsd',
      name: 'Full Stack & Distributed Systems',
      badge: 'Core Program',
      specs: 'Next.js 15 · Node.js · PostgreSQL · Redis · Docker',
      desc: 'Architect end-to-end cloud platforms with horizontal sharding, sub-millisecond cache layers, and real-time streaming architectures.'
    },
    {
      id: 'sys',
      name: 'Cloud Infrastructure & DevOps',
      badge: 'Systems Track',
      specs: 'Kubernetes · Terraform · AWS · CI/CD · Microservices',
      desc: 'Master multi-region resilience, zero-downtime rolling deploys, observability meshes, and scalable infrastructure-as-code.'
    },
    {
      id: 'ai',
      name: 'Applied AI Systems & LLM Engineering',
      badge: 'Frontier Track',
      specs: 'Python · Vector DBs · LangChain · Fine-Tuning · Agentic Mesh',
      desc: 'Build production-grade retrieval-augmented generation (RAG) pipelines, autonomous tool-calling agents, and fine-tuned model services.'
    }
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('studentProfile');
      if (stored) {
        try {
          const profile = JSON.parse(stored);
          if (profile.name) {
            setStudentName(profile.name.toUpperCase().replace(/\s+/g, '_'));
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    }
  }, []);

  // Radar chart mathematics
  const radarPoints = useMemo(() => {
    const cx = 130;
    const cy = 130;
    const maxVal = 100;
    const maxRadius = 95;

    const angles = [
      -Math.PI / 2,                     // Frontend (Top)
      -Math.PI / 2 + (2 * Math.PI) / 5,    // Backend
      -Math.PI / 2 + (4 * Math.PI) / 5,    // Databases
      -Math.PI / 2 + (6 * Math.PI) / 5,    // Algorithms
      -Math.PI / 2 + (8 * Math.PI) / 5     // Systems
    ];

    const values = [
      skills.frontend,
      skills.backend,
      skills.databases,
      skills.algorithms,
      skills.systemDesign
    ];

    const points = angles.map((angle, idx) => {
      const radius = (values[idx] / maxVal) * maxRadius;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      return { x, y };
    });

    const pathString = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';

    return { points, pathString };
  }, [skills]);

  // Terminal log sequence for Step 3
  const activeTrackObj = tracks.find((t) => t.id === selectedTrack) || tracks[0];

  useEffect(() => {
    if (step !== 3) return;

    const bootSequence = [
      `[01/06] Initializing Atelier Runtime Environment v2.4.0-prod`,
      `[02/06] Verifying workspace student token for ${studentName}... OK`,
      `[03/06] Mounting curriculum tree: "${activeTrackObj.name}"... OK`,
      `[04/06] Allocating isolated sandbox container (Node 20.x LTS / Linux x86_64)... OK`,
      `[05/06] Calibrating challenge envelope: [FE:${skills.frontend}% BE:${skills.backend}% DB:${skills.databases}% DSA:${skills.algorithms}% SYS:${skills.systemDesign}%]`,
      `[06/06] Telemetry connected to Atelier Core Grid. Port 3000 active. Zero errors.`,
      `✔ ATELIER LEARNING WORKSPACE IS ACTIVE AND READY.`
    ];

    if (logIndex < bootSequence.length) {
      const delay = logIndex === 0 ? 300 : 700 + Math.random() * 500;
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, bootSequence[logIndex]]);
        setLogIndex((i) => i + 1);
        setProgressPercent(Math.round(((logIndex + 1) / bootSequence.length) * 100));
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsProvisioned(true);
      // Persist onboarding state
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('studentProfile');
        let profile = stored ? JSON.parse(stored) : {};
        profile.onboardingCompleted = true;
        profile.track = selectedTrack;
        profile.skillsRadar = skills;
        localStorage.setItem('studentProfile', JSON.stringify(profile));
      }
    }
  }, [step, logIndex, selectedTrack, skills, studentName, activeTrackObj]);

  const handleNextStep = () => {
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      router.push('/dashboard');
    }
  };

  const handleSkillChange = (key, val) => {
    setSkills((prev) => ({
      ...prev,
      [key]: parseInt(val, 10)
    }));
  };

  const getTierLabel = (val) => {
    if (val < 35) return 'Foundational';
    if (val < 70) return 'Intermediate';
    return 'Advanced';
  };

  return (
    <div className={styles.onboardWrapper}>
      <div className={styles.onboardGrid} />
      <div className={styles.onboardGlow} />

      <div className={styles.onboardCard} style={{ maxWidth: '680px' }}>
        
        {/* Top Header / Progress Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-orange)', boxShadow: '0 0 10px var(--accent-orange)' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.12em', color: '#ffffff', textTransform: 'uppercase', fontFamily: 'monospace' }}>
              ATELIER // WORKSPACE SETUP
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: s === step ? 'var(--accent-orange)' : s < step ? '#30d158' : 'rgba(255,255,255,0.25)',
                  fontFamily: 'monospace'
                }}
              >
                <span>{s < step ? '✓' : `0${s}`}</span>
                {s < 3 && <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Track Selection */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 className={styles.onboardStepTitle} style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
                Select Your Focus Track
              </h2>
              <p className={styles.onboardStepDesc} style={{ marginBottom: 0 }}>
                Choose your primary specialization to calibrate your curriculum tech-tree and dev workbench.
              </p>
            </div>

            <div className={styles.onboardGridSelect} style={{ gap: '0.85rem' }}>
              {tracks.map((track) => {
                const isActive = selectedTrack === track.id;
                return (
                  <div
                    key={track.id}
                    className={`${styles.onboardOption} ${isActive ? styles.onboardOptionActive : ''}`}
                    onClick={() => setSelectedTrack(track.id)}
                    style={{ padding: '1.25rem' }}
                  >
                    <div className={styles.optionHeader}>
                      <span className={styles.optionName} style={{ fontSize: '1rem' }}>{track.name}</span>
                      <span className={styles.optionMeta}>{track.badge}</span>
                    </div>
                    <p className={styles.optionDesc} style={{ marginBottom: '0.65rem' }}>{track.desc}</p>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                      <span style={{ color: 'var(--accent-orange)' }}>Stack: </span>
                      {track.specs}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '2.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className={styles.onboardBtn}
                style={{ width: 'auto', padding: '0.85rem 2rem' }}
                onClick={handleNextStep}
              >
                Configure Skills Radar
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Baseline Skill Radar */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 className={styles.onboardStepTitle} style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
                Baseline Skills Radar
              </h2>
              <p className={styles.onboardStepDesc} style={{ marginBottom: 0 }}>
                Calibrate your current comfort level across 5 engineering domains to tailor active targets.
              </p>
            </div>

            {/* Interactive SVG Radar Chart */}
            <div className={styles.radarContainer} style={{ marginBottom: '1.5rem' }}>
              <svg className={styles.radarChart} viewBox="0 0 260 260">
                {/* Webs */}
                {[25, 50, 75, 95].map((radius) => {
                  const points = [0, 1, 2, 3, 4].map((i) => {
                    const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5;
                    const x = 130 + radius * Math.cos(angle);
                    const y = 130 + radius * Math.sin(angle);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  }).join(' ');
                  return (
                    <polygon
                      key={radius}
                      points={points}
                      className={styles.radarGridWeb}
                    />
                  );
                })}

                {/* Axes lines */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5;
                  const x = 130 + 95 * Math.cos(angle);
                  const y = 130 + 95 * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1="130"
                      y1="130"
                      x2={x.toFixed(1)}
                      y2={y.toFixed(1)}
                      className={styles.radarGridLine}
                    />
                  );
                })}

                {/* Labels */}
                <text x="130" y="16" className={styles.radarLabel}>FRONTEND</text>
                <text x="235" y="105" className={styles.radarLabel} style={{ textAnchor: 'start' }}>BACKEND</text>
                <text x="200" y="240" className={styles.radarLabel}>DATABASES</text>
                <text x="60" y="240" className={styles.radarLabel}>ALGORITHMS</text>
                <text x="25" y="105" className={styles.radarLabel} style={{ textAnchor: 'end' }}>SYSTEMS</text>

                {/* skill data polygon */}
                <path d={radarPoints.pathString} className={styles.radarArea} />

                {/* data vertex dots */}
                {radarPoints.points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x.toFixed(1)}
                    cy={p.y.toFixed(1)}
                    r="4"
                    className={styles.radarPoint}
                  />
                ))}
              </svg>
            </div>

            {/* 5 Range Sliders */}
            <div className={styles.skillSliders} style={{ gap: '0.85rem' }}>
              {[
                { key: 'frontend', label: 'Frontend Systems & UI State' },
                { key: 'backend', label: 'Backend APIs & Async Logic' },
                { key: 'databases', label: 'Databases & Query Optimization' },
                { key: 'algorithms', label: 'Data Structures & Algorithms' },
                { key: 'systemDesign', label: 'Distributed Systems & Architecture' }
              ].map(({ key, label }) => (
                <div key={key} className={styles.sliderGroup}>
                  <div className={styles.sliderLabelRow}>
                    <span>{label}</span>
                    <span style={{ fontFamily: 'monospace' }}>
                      <span style={{ color: 'var(--accent-orange)' }}>{skills[key]}%</span>
                      <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: '0.5rem', fontSize: '0.7rem' }}>
                        ({getTierLabel(skills[key])})
                      </span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    className={styles.sliderInput}
                    value={skills[key]}
                    onChange={(e) => handleSkillChange(key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}
              >
                ← Back
              </button>
              <button
                className={styles.onboardBtn}
                style={{ width: 'auto', padding: '0.85rem 2rem' }}
                onClick={handleNextStep}
              >
                Initialize Workspace
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Setup Terminal */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 className={styles.onboardStepTitle} style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
                Provisioning Learning Environment
              </h2>
              <p className={styles.onboardStepDesc} style={{ marginBottom: 0 }}>
                Allocating runtime container, binding curriculum nodes, and registering student telemetry.
              </p>
            </div>

            {/* Terminal Window */}
            <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem', background: '#050506' }}>
              {/* Terminal Window Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                  atelier-bootstrap --runtime
                </span>
                <span style={{ fontSize: '0.7rem', color: isProvisioned ? '#30d158' : 'var(--accent-orange)', fontFamily: 'monospace', fontWeight: '700' }}>
                  {isProvisioned ? 'READY' : `${progressPercent}%`}
                </span>
              </div>

              {/* Terminal Body */}
              <div className={styles.terminalWrapper} style={{ height: '220px', border: 'none', borderRadius: 0, margin: 0, padding: '1rem 1.25rem' }}>
                {logs.map((log, idx) => {
                  const isSuccess = log.includes('READY') || log.includes('✔');
                  const isOk = log.includes('OK');
                  return (
                    <p key={idx} className={styles.terminalLine} style={{ color: isSuccess ? '#30d158' : isOk ? '#ffffff' : 'rgba(255,255,255,0.7)', fontWeight: isSuccess ? '700' : '400', marginBottom: '0.35rem' }}>
                      {log}
                    </p>
                  );
                })}
                {!isProvisioned && (
                  <p className={styles.terminalLine} style={{ color: 'var(--accent-orange)' }}>
                    <span style={{ animation: 'blink 1s infinite' }}>▋</span>
                  </p>
                )}
              </div>
            </div>

            {/* Launch Action */}
            <div>
              <button
                className={`${styles.onboardBtn} ${!isProvisioned ? styles.onboardBtnDisabled : ''}`}
                disabled={!isProvisioned}
                onClick={handleNextStep}
                style={{ width: '100%', padding: '1rem', fontSize: '0.95rem' }}
              >
                {isProvisioned ? 'Launch Learning Workspace →' : 'Bootstrapping Atelier Container...'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
