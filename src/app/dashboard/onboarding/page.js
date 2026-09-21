'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState('fsd');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [primaryGoal, setPrimaryGoal] = useState('job');
  const [studentName, setStudentName] = useState('Student');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('studentProfile');
      if (stored) {
        try {
          const profile = JSON.parse(stored);
          if (profile.name) {
            setStudentName(profile.name.trim().split(' ')[0] || 'Student');
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    }
  }, []);

  const tracks = [
    {
      id: 'fsd',
      name: 'Full-Stack Web Development',
      badge: 'Most Popular',
      desc: 'Build real-world web applications from frontend to backend with React, Next.js, and databases.',
      stack: 'React · Next.js · Node.js · PostgreSQL · Tailwind'
    },
    {
      id: 'sys',
      name: 'Backend & System Design',
      badge: 'Core Systems',
      desc: 'Master scalable backend architectures, database indexing, caching strategies, and robust APIs.',
      stack: 'Node.js · PostgreSQL · Redis · Docker · Microservices'
    },
    {
      id: 'ai',
      name: 'Applied AI & Software Engineering',
      badge: 'Emerging Tech',
      desc: 'Learn to build and ship production applications powered by modern AI models, embeddings, and tool pipelines.',
      stack: 'Python · LLMs · Vector Databases · Next.js · APIs'
    }
  ];

  const experienceLevels = [
    { id: 'beginner', title: 'Beginner', subtitle: 'New to programming or web development. Want step-by-step guidance.' },
    { id: 'intermediate', title: 'Intermediate', subtitle: 'Comfortable with JavaScript or programming basics. Want to build serious projects.' },
    { id: 'advanced', title: 'Advanced', subtitle: 'Experienced developer looking to master system design, scaling, and architecture.' }
  ];

  const goals = [
    { id: 'job', icon: '💼', title: 'Land a Developer Job / Internship' },
    { id: 'projects', icon: '🚀', title: 'Build & Ship Portfolio Projects' },
    { id: 'skills', icon: '🧠', title: 'Deepen Architecture & System Design' }
  ];

  const activeTrackObj = tracks.find((t) => t.id === selectedTrack) || tracks[0];
  const activeExpObj = experienceLevels.find((e) => e.id === experienceLevel) || experienceLevels[1];
  const activeGoalObj = goals.find((g) => g.id === primaryGoal) || goals[0];

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('studentProfile');
      let profile = stored ? JSON.parse(stored) : {};
      profile.onboardingCompleted = true;
      profile.track = selectedTrack;
      profile.experienceLevel = experienceLevel;
      profile.primaryGoal = primaryGoal;
      localStorage.setItem('studentProfile', JSON.stringify(profile));
      window.dispatchEvent(new Event('profileChanged'));
    }
    router.push('/dashboard');
  };

  return (
    <div className={styles.onboardWrapper} data-lenis-prevent>
      <div className={styles.onboardGrid} />
      <div className={styles.onboardGlow} />

      <div className={styles.onboardCard}>
        {/* Progress Navigation Header */}
        <div className={styles.onboardHeaderRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-orange)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.04em', color: '#ffffff' }}>
              Atelier Setup
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                style={{
                  width: s === step ? '22px' : '7px',
                  height: '7px',
                  borderRadius: '4px',
                  background: s === step ? 'var(--accent-orange)' : s < step ? '#30d158' : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  display: 'inline-block'
                }}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Select Track */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 className={styles.onboardStepTitle}>Welcome, {studentName}!</h1>
              <p className={styles.onboardStepDesc}>
                Select the path you would like to focus on for your curriculum.
              </p>
            </div>

            <div className={styles.onboardGridSelect}>
              {tracks.map((track) => {
                const isActive = selectedTrack === track.id;
                return (
                  <div
                    key={track.id}
                    className={`${styles.onboardOption} ${isActive ? styles.onboardOptionActive : ''}`}
                    onClick={() => setSelectedTrack(track.id)}
                  >
                    <div className={styles.optionHeader}>
                      <span className={styles.optionName}>{track.name}</span>
                      <span className={styles.optionMeta}>{track.badge}</span>
                    </div>
                    <p className={styles.optionDesc}>{track.desc}</p>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
                      <span style={{ color: 'var(--accent-orange)', fontWeight: '600' }}>Stack: </span>
                      {track.stack}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className={styles.onboardBtn}
                onClick={() => setStep(2)}
              >
                Continue
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Experience & Goal */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 className={styles.onboardStepTitle}>Experience & Goals</h2>
              <p className={styles.onboardStepDesc}>
                Help us tune your course recommendations and pace.
              </p>
            </div>

            {/* Experience Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.65rem' }}>
                Your Current Experience
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {experienceLevels.map((lvl) => {
                  const isActive = experienceLevel === lvl.id;
                  return (
                    <div
                      key={lvl.id}
                      className={`${styles.onboardOption} ${isActive ? styles.onboardOptionActive : ''}`}
                      onClick={() => setExperienceLevel(lvl.id)}
                      style={{ padding: '0.85rem 1rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.92rem', color: isActive ? 'var(--accent-orange)' : '#ffffff' }}>
                          {lvl.title}
                        </span>
                        {isActive && <span style={{ color: 'var(--accent-orange)', fontSize: '0.9rem' }}>✓</span>}
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', margin: '0.2rem 0 0 0', lineHeight: '1.4' }}>
                        {lvl.subtitle}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Goal Selection */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.65rem' }}>
                Primary Goal
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {goals.map((g) => {
                  const isActive = primaryGoal === g.id;
                  return (
                    <div
                      key={g.id}
                      className={`${styles.onboardOption} ${isActive ? styles.onboardOptionActive : ''}`}
                      onClick={() => setPrimaryGoal(g.id)}
                      style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>{g.icon}</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: '600', color: isActive ? 'var(--accent-orange)' : '#ffffff' }}>
                          {g.title}
                        </span>
                      </div>
                      {isActive && <span style={{ color: 'var(--accent-orange)', fontSize: '0.85rem' }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600', padding: '0.5rem' }}
              >
                ← Back
              </button>
              <button
                className={styles.onboardBtn}
                onClick={() => setStep(3)}
              >
                Continue
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Ready to Go */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(48, 209, 88, 0.12)',
              border: '2px solid rgba(48, 209, 88, 0.4)',
              color: '#30d158',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              margin: '0 auto 1.25rem'
            }}>
              ✓
            </div>

            <h2 className={styles.onboardStepTitle} style={{ marginBottom: '0.5rem' }}>
              You are all set, {studentName}!
            </h2>
            <p className={styles.onboardStepDesc} style={{ marginBottom: '1.75rem' }}>
              Your learning preferences have been configured. Here is a summary of your workspace:
            </p>

            {/* Summary Box */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>Track</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>{activeTrackObj.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>Level</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-orange)' }}>{activeExpObj.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>Goal</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>{activeGoalObj.title}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600', padding: '0.5rem 1rem' }}
              >
                ← Back
              </button>
              <button
                className={styles.onboardBtn}
                onClick={handleFinish}
                style={{ flex: 1, padding: '0.95rem 1.5rem', justifyContent: 'center' }}
              >
                Open Dashboard
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
