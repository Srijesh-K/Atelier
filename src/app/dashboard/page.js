'use client';

import React, { useState, useEffect } from 'react';
import { getStudents, saveCallback } from '../actions';
import styles from './dashboard.module.css';

export default function StudentDashboard({ activeCourseId = 1 }) {
  const [activeNode, setActiveNode] = useState(2); // Node 2 is active by default
  const [showDrawer, setShowDrawer] = useState(false);
  const [streak, setStreak] = useState(1);
  const [studentName, setStudentName] = useState('Student Builder');
  const [toastMessage, setToastMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Form input states
  const [hotlineTopic, setHotlineTopic] = useState('');
  const [hotlinePhone, setHotlinePhone] = useState('');
  const [submittingCallback, setSubmittingCallback] = useState(false);

  // Reset active node index on course switch
  useEffect(() => {
    setActiveNode(2);
  }, [activeCourseId]);

  // Sync profile details
  useEffect(() => {
    const syncProfile = async () => {
      const email = localStorage.getItem('loggedInStudentEmail');
      if (!email) return;
      const studentsList = await getStudents();
      const student = studentsList.find((s) => s.email.toLowerCase() === email.toLowerCase());
      if (student) {
        setStreak(student.streak || 0);
        setStudentName(student.name);
        setHotlinePhone(student.phone || '');
      }
    };
    syncProfile();
    window.addEventListener('profileChanged', syncProfile);
    return () => {
      window.removeEventListener('profileChanged', syncProfile);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Curriculum node tree details based on selected course
  const nodes = activeCourseId === 2 ? [
    { id: 1, label: 'Load Balancers & CDN', x: 250, y: 35, status: 'completed' },
    { id: 2, label: 'Database Partitioning', x: 250, y: 115, status: 'active' },
    { id: 3, label: 'Caching (Redis/Memcached)', x: 150, y: 205, status: 'locked' },
    { id: 4, label: 'Message Queues (Kafka)', x: 350, y: 205, status: 'locked' },
    { id: 5, label: 'Microservices Mesh', x: 250, y: 295, status: 'locked' }
  ] : [
    { id: 1, label: 'HTML/CSS Basics', x: 250, y: 35, status: 'completed' },
    { id: 2, label: 'JavaScript & DOM', x: 250, y: 115, status: 'active' },
    { id: 3, label: 'Database Schemes', x: 150, y: 205, status: 'locked' },
    { id: 4, label: 'API Development', x: 350, y: 205, status: 'locked' },
    { id: 5, label: 'System Design Root', x: 250, y: 295, status: 'locked' }
  ];

  const getCodeSnippet = () => {
    if (activeCourseId === 2) {
      switch (activeNode) {
        case 1:
          return `// Load Balancer Configuration (Nginx)
upstream backend_servers {
  least_conn; # load balancer algorithm
  server backend1.atelier.academy:8080;
  server backend2.atelier.academy:8080;
  keepalive 32;
}

server {
  listen 80;
  location / {
    proxy_pass http://backend_servers;
  }
}`;
        case 2:
          return `// Horizontal Sharding Key Router
function getShardForUser(userId) {
  // Consistent Hashing implementation
  const hash = crypto.createHash('md5').update(userId).digest('hex');
  const numericHash = parseInt(hash.substring(0, 8), 16);
  const shardIndex = numericHash % SHARD_COUNT;
  return shardConnections[shardIndex];
}`;
        default:
          return `// Secure System Architecture Node is Locked.
// Complete preceding exercises to unlock configurations.`;
      }
    } else {
      switch (activeNode) {
        case 1:
          return `// HTML/CSS Workbench Target
<div class="card">
  <h3>Initialize Project</h3>
  <button id="cta-btn">Start</button>
</div>

/* Styling Workbench */
.card {
  padding: 2rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
}`;
        case 2:
          return `// JavaScript DOM Target - Daily Streaks Task
const button = document.querySelector('#cta-btn');

button.addEventListener('click', (event) => {
  // Trigger system workspace container allocations
  console.log('Deploying Atelier node binaries...');
  event.target.classList.add('active');
  initializeCommandCenter();
});`;
        default:
          return `// Secure workspace node is currently locked
// Complete predecessor curriculum nodes to reveal code targets.
function lockedNode() {
  return null;
}`;
      }
    }
  };

  const getFilename = () => {
    if (activeCourseId === 2) {
      return activeNode === 1 ? 'nginx/nginx.conf' : 'sharding/router.js';
    }
    return 'workspace/sandbox/index.js';
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSubmitCallback = async (e) => {
    e.preventDefault();
    setSubmittingCallback(true);
    try {
      const cbData = {
        studentName: studentName,
        phone: hotlinePhone,
        topic: hotlineTopic,
        status: 'Pending'
      };
      await saveCallback(cbData);
      window.dispatchEvent(new Event('courseChanged'));
      setShowDrawer(false);
      showToast(`Callback requested! An instructor will reach out at ${hotlinePhone} shortly.`);
    } catch (err) {
      showToast('Unable to schedule callback. Please try again.');
    } finally {
      setSubmittingCallback(false);
    }
  };

  return (
    <div className={styles.bentoContainer}>
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '5rem',
          right: '2rem',
          background: '#08080a',
          border: '1px solid var(--accent-orange)',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          color: '#ffffff',
          zIndex: 1000,
          boxShadow: '0 12px 36px rgba(0,0,0,0.8), 0 0 20px rgba(242, 85, 34, 0.2)',
          fontFamily: 'var(--font-heading)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          <span style={{ color: 'var(--accent-orange)' }}>◆</span>
          <span>{toastMessage}</span>
        </div>
      )}
      
      {/* LEFT DASHBOARD PANEL */}
      <div className={styles.dashboardLeft}>
        
        {/* Tech Tree curriculum Map */}
        <div className={styles.cardPanel}>
          <div className={styles.cardPanelHeader}>
            <h2 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2.5">
                <circle cx="12" cy="5" r="3" />
                <circle cx="6" cy="19" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M12 8v4" />
                <path d="M12 12l-6 4" />
                <path d="M12 12l6 4" />
              </svg>
              Curriculum Tech-Tree
            </h2>
            <span className={styles.cardHeaderAction} onClick={() => setActiveNode(2)}>
              Reset View
            </span>
          </div>

          <div className={styles.techTreeContainer}>
            <svg className={styles.treeSvg} viewBox="0 0 500 340">
              {/* Connection Paths */}
              <path d="M 250,35 L 250,115" className={styles.treePathActive} />
              <path d="M 250,115 L 150,205" className={styles.treePath} />
              <path d="M 250,115 L 350,205" className={styles.treePath} />
              <path d="M 150,205 L 250,295" className={styles.treePath} />
              <path d="M 350,205 L 250,295" className={styles.treePath} />

              {/* Node Items */}
              {nodes.map((node) => {
                let statusClass = '';
                if (node.status === 'completed') statusClass = styles.treeNodeCompleted;
                else if (node.status === 'active') statusClass = styles.treeNodeActive;

                return (
                  <g
                    key={node.id}
                    className={`${styles.treeNode} ${statusClass}`}
                    onClick={() => {
                      if (node.id <= 2) {
                        setActiveNode(node.id);
                      }
                    }}
                  >
                    <circle cx={node.x} cy={node.y} r="22" className={styles.treeNodeCircle} />
                    <text x={node.x} y={node.y + 4} className={styles.treeNodeText}>
                      {node.id}
                    </text>
                    {/* Node Tooltip Label on Hover */}
                    <title>{node.label} ({node.status.toUpperCase()})</title>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* IDE active code workbench */}
        <div className={styles.cardPanel}>
          <div className={styles.cardPanelHeader}>
            <h2 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2.5">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              Active Target Workbench
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span className={styles.cardHeaderAction} onClick={handleCopyCode}>
                {copiedCode ? '✓ Copied' : 'Copy Code'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                {getFilename().split('/').pop()}
              </span>
            </div>
          </div>

          <div className={styles.ideWrapper}>
            <div className={styles.ideHeader}>
              <div className={styles.ideWindowControls}>
                <span className={`${styles.dot} ${styles.dotRed}`} />
                <span className={`${styles.dot} ${styles.dotYellow}`} />
                <span className={`${styles.dot} ${styles.dotGreen}`} />
              </div>
              <span className={styles.ideFilename}>{getFilename()}</span>
            </div>

            <div className={styles.ideBody}>
              <div className={styles.ideGutter}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
              <div className={styles.ideCodeArea}>
                {getCodeSnippet()}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT DASHBOARD PANEL */}
      <div className={styles.dashboardRight}>
        
        {/* Daily Streak Tracker card */}
        <div className={styles.cardPanel}>
          <div className={styles.cardPanelHeader}>
            <h2 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2.5">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
              Daily Streaks Tracker
            </h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(48, 209, 88, 0.1)', border: '1px solid rgba(48, 209, 88, 0.25)', fontSize: '0.72rem', color: '#30d158', fontWeight: '700' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#30d158', display: 'inline-block' }} />
              Active Today
            </div>
          </div>

          <div style={{ padding: '0.5rem 0 1.25rem' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#ffffff', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              {streak} <span style={{ fontSize: '0.95rem', color: 'var(--accent-orange)', letterSpacing: '0.08em' }}>{streak === 1 ? 'DAY STREAK' : 'DAYS ACTIVE'}</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.35rem', lineHeight: '1.45' }}>
              {activeCourseId === 2 ? 'Complete database sharding tasks to unlock cache design nodes.' : 'Keep coding daily to unlock advanced System Architecture nodes.'}
            </p>
          </div>

          {/* 7-day Activity Cadence */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '0.75rem' }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
              const isToday = idx === ((new Date().getDay() + 6) % 7);
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.68rem', color: isToday ? 'var(--accent-orange)' : 'rgba(255,255,255,0.3)', fontWeight: '700' }}>{day}</span>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: isToday ? 'var(--accent-orange)' : 'rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    color: isToday ? '#000000' : 'rgba(255,255,255,0.4)',
                    fontWeight: '800'
                  }}>
                    {isToday ? '✓' : '·'}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Daily Status</span>
              <p style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', marginTop: '0.25rem' }}>Recorded</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cohort Rank</span>
              <p style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--accent-orange)', marginTop: '0.25rem' }}>{streak > 5 ? 'Top 10%' : 'Active Tier'}</p>
            </div>
          </div>
        </div>

        {/* Mentor Callback hotline card */}
        <div className={styles.cardPanel} style={{ background: 'radial-gradient(circle at top right, rgba(242, 85, 34, 0.08) 0%, transparent 75%), #08080a' }}>
          <h2 className={styles.cardTitle} style={{ marginBottom: '0.5rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            1-on-1 Mentorship Hotline
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
            Stuck on an active node? Schedule an immediate 15-minute callback with an expert workspace instructor.
          </p>

          <button 
            className={styles.onboardBtn} 
            style={{ width: '100%' }}
            onClick={() => {
              setHotlineTopic(activeCourseId === 2 ? (activeNode === 1 ? 'Nginx config upstream failure' : 'Sharding ring calculation bug') : (activeNode === 1 ? 'HTML/CSS Layout issue' : 'JavaScript DOM event issue'));
              setShowDrawer(true);
            }}
          >
            Book Callback Session
          </button>
        </div>

      </div>

      {/* Mentor Hotline slide-out Drawer overlay */}
      {showDrawer && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s ease' }}
          onClick={() => setShowDrawer(false)}
        >
          <div 
            style={{ width: '100%', maxWidth: '420px', height: '100vh', background: '#08080a', borderLeft: '1px solid rgba(255,255,255,0.08)', padding: '2.5rem', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', boxShadow: '-12px 0 40px rgba(0,0,0,0.8)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-orange)', boxShadow: '0 0 8px var(--accent-orange)' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>Hotline Schedule</h3>
              </div>
              <button 
                onClick={() => setShowDrawer(false)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', width: '30px', height: '30px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: '1.5', marginBottom: '2rem' }}>
              Confirm your workspace callback request. Mentors typically initiate voice session in under 15 minutes.
            </p>

            <form 
              onSubmit={handleSubmitCallback} 
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div className={styles.profileFormGroup}>
                <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Topic Focus</label>
                <input 
                  type="text" 
                  required
                  value={hotlineTopic}
                  onChange={(e) => setHotlineTopic(e.target.value)}
                  className={styles.profileInput}
                  disabled={submittingCallback}
                />
              </div>

              <div className={styles.profileFormGroup}>
                <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+91 98765 43210" 
                  required
                  value={hotlinePhone}
                  onChange={(e) => setHotlinePhone(e.target.value)}
                  className={styles.profileInput}
                  disabled={submittingCallback}
                />
              </div>

              <button 
                type="submit" 
                className={styles.onboardBtn}
                style={{ marginTop: '1.5rem', width: '100%' }}
                disabled={submittingCallback}
              >
                {submittingCallback ? 'Scheduling...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
