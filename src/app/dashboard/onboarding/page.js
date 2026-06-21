'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPath, setSelectedPath] = useState(null);

  // Step 2 Skill levels (range 0 to 100)
  const [skills, setSkills] = useState({
    frontend: 30,
    backend: 20,
    databases: 10,
    algorithms: 25,
    systemDesign: 15
  });

  // Step 3 terminal log lines simulation
  const [logs, setLogs] = useState([]);
  const [logIndex, setLogIndex] = useState(0);
  const [isProvisioned, setIsProvisioned] = useState(false);

  const pathOptions = [
    {
      id: 'fsd',
      name: 'Full Stack Web Development',
      meta: 'Average Package: Rs. 9.5 LPA',
      desc: 'Build highly scalable production SaaS products, master React/NextJS, SQL/NoSQL databases, cloud computing, and deployment strategies.'
    },
    {
      id: 'ds',
      name: 'Data Science & Analytics',
      meta: 'Average Package: Rs. 10.8 LPA',
      desc: 'Master analytical statistics, deep learning networks, data models, Python libraries (Pandas, Numpy), and visual reporting tools (PowerBI).'
    },
    {
      id: 'ai',
      name: 'AI Engineering & LLMs',
      meta: 'Average Package: Rs. 12.5 LPA',
      desc: 'Build AI agents, manage vector database structures, fine-tune model parameters, orchestrate pipelines with LangChain, and design APIs.'
    }
  ];

  // Radar chart calculations
  const radarPoints = useMemo(() => {
    const cx = 130;
    const cy = 130;
    const maxVal = 100;
    const maxRadius = 100;

    const angles = [
      -Math.PI / 2,                  // Frontend (Top)
      -Math.PI / 2 + (2 * Math.PI) / 5, // Backend
      -Math.PI / 2 + (4 * Math.PI) / 5, // Databases
      -Math.PI / 2 + (6 * Math.PI) / 5, // Algorithms
      -Math.PI / 2 + (8 * Math.PI) / 5  // System Design
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

  // Terminal log simulation effect
  const [studentName, setStudentName] = useState('STUDENT');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const profile = JSON.parse(localStorage.getItem('studentProfile') || '{}');
      if (profile.name) {
        setStudentName(profile.name.toUpperCase().replace(/\s+/g, '_'));
      }
    }
  }, []);

  useEffect(() => {
    if (step !== 3) return;

    const logMessages = [
      'Establishing connection to Sphere Hive gateways...',
      'SECURE HANDSHAKE: Completed.',
      `Allocating server instance for: ${studentName}`,
      'Configuring cloud directory nodes...',
      `CLONING TEMPLATE: ${selectedPath === 'fsd' ? 'MERN_STACK_V4' : selectedPath === 'ds' ? 'DATA_SCIENCE_ROOT' : 'AI_AGENTS_CORE'}`,
      'Installing dependency structures...',
      'Setting up Skill Radar coordinates...',
      `SKILL ENVELOPE INITIALIZED: FE:${skills.frontend}% BE:${skills.backend}% DB:${skills.databases}% DSA:${skills.algorithms}% SD:${skills.systemDesign}%`,
      'Compiling local workbench binaries...',
      'Provisions compiled. System initialized successfully.',
      'READY FOR COMMAND WORKSPACE ACCESS.'
    ];

    if (logIndex < logMessages.length) {
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, logMessages[logIndex]]);
        setLogIndex((idx) => idx + 1);
      }, 700 + Math.random() * 600);
      return () => clearTimeout(timer);
    } else {
      setIsProvisioned(true);
    }
  }, [step, logIndex, selectedPath, skills, studentName]);

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

  return (
    <div className={styles.onboardWrapper}>
      <div className={styles.onboardGrid} />
      <div className={styles.onboardGlow} />

      <div className={styles.onboardCard}>
        
        {/* STEP 1: Path Selection */}
        {step === 1 && (
          <>
            <h2 className={styles.onboardStepTitle}>Select your path</h2>
            <p className={styles.onboardStepDesc}>
              Choose a cohort track. This will initialize your curriculum tech-tree.
            </p>

            <div className={styles.onboardGridSelect}>
              {pathOptions.map((opt) => {
                const isActive = selectedPath === opt.id;
                return (
                  <div
                    key={opt.id}
                    className={`${styles.onboardOption} ${isActive ? styles.onboardOptionActive : ''}`}
                    onClick={() => setSelectedPath(opt.id)}
                  >
                    <div className={styles.optionHeader}>
                      <span className={styles.optionName}>{opt.name}</span>
                      <span className={styles.optionMeta}>{opt.meta}</span>
                    </div>
                    <p className={styles.optionDesc}>{opt.desc}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <button
                className={`${styles.onboardBtn} ${!selectedPath ? styles.onboardBtnDisabled : ''}`}
                disabled={!selectedPath}
                onClick={handleNextStep}
              >
                Continue
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Skill Assessment */}
        {step === 2 && (
          <>
            <h2 className={styles.onboardStepTitle}>Assess your skills</h2>
            <p className={styles.onboardStepDesc}>
              Define your comfort levels to customize daily code challenges.
            </p>

            {/* Interactive SVG Radar Chart */}
            <div className={styles.radarContainer}>
              <svg className={styles.radarChart} viewBox="0 0 260 260">
                {/* Webs */}
                {[25, 50, 75, 100].map((radius) => {
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
                  const x = 130 + 100 * Math.cos(angle);
                  const y = 130 + 100 * Math.sin(angle);
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
                <text x="130" y="15" className={styles.radarLabel}>FRONTEND</text>
                <text x="235" y="105" className={styles.radarLabel} style={{ textAnchor: 'start' }}>BACKEND</text>
                <text x="200" y="235" className={styles.radarLabel}>DATABASES</text>
                <text x="60" y="235" className={styles.radarLabel}>ALGORITHMS</text>
                <text x="25" y="105" className={styles.radarLabel} style={{ textAnchor: 'end' }}>SYSTEMS</text>

                {/* skill data shape */}
                <path d={radarPoints.pathString} className={styles.radarArea} />

                {/* data vertex points */}
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

            {/* Range sliders */}
            <div className={styles.skillSliders}>
              <div className={styles.sliderGroup}>
                <div className={styles.sliderLabelRow}>
                  <span>Frontend Basics</span>
                  <span>{skills.frontend}%</span>
                </div>
                <input
                  type="range"
                  className={styles.sliderInput}
                  value={skills.frontend}
                  onChange={(e) => handleSkillChange('frontend', e.target.value)}
                />
              </div>

              <div className={styles.sliderGroup}>
                <div className={styles.sliderLabelRow}>
                  <span>Backend & API Logic</span>
                  <span>{skills.backend}%</span>
                </div>
                <input
                  type="range"
                  className={styles.sliderInput}
                  value={skills.backend}
                  onChange={(e) => handleSkillChange('backend', e.target.value)}
                />
              </div>

              <div className={styles.sliderGroup}>
                <div className={styles.sliderLabelRow}>
                  <span>Databases & Queries</span>
                  <span>{skills.databases}%</span>
                </div>
                <input
                  type="range"
                  className={styles.sliderInput}
                  value={skills.databases}
                  onChange={(e) => handleSkillChange('databases', e.target.value)}
                />
              </div>

              <div className={styles.sliderGroup}>
                <div className={styles.sliderLabelRow}>
                  <span>Data Structures & Algorithms</span>
                  <span>{skills.algorithms}%</span>
                </div>
                <input
                  type="range"
                  className={styles.sliderInput}
                  value={skills.algorithms}
                  onChange={(e) => handleSkillChange('algorithms', e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <button className={styles.onboardBtn} onClick={handleNextStep}>
                Initialize Setup
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* STEP 3: Setup Deploying */}
        {step === 3 && (
          <>
            <h2 className={styles.onboardStepTitle}>Provisioning Workspace</h2>
            <p className={styles.onboardStepDesc}>
              Setting up your personalized development environment. Please hold.
            </p>

            <div className={styles.terminalWrapper}>
              {logs.map((log, idx) => {
                const isFinalReady = log.includes('READY FOR COMMAND');
                const isStepHeader = log.startsWith('establishing') || log.startsWith('provisions');
                let cls = styles.terminalLine;
                if (isFinalReady) cls += ` ${styles.terminalAccent}`;
                else if (isStepHeader) cls += ` ${styles.terminalMuted}`;
                
                return (
                  <p key={idx} className={cls}>
                    {isFinalReady ? '🚀 ' : '> '}
                    {log}
                  </p>
                );
              })}
            </div>

            <div>
              <button
                className={`${styles.onboardBtn} ${!isProvisioned ? styles.onboardBtnDisabled : ''}`}
                disabled={!isProvisioned}
                onClick={handleNextStep}
              >
                {isProvisioned ? 'Access Command Center' : 'Initializing Workbench...'}
                {isProvisioned && (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
