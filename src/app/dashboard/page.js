'use client';

import React, { useState, useEffect } from 'react';
import { getStudents, saveCallback } from '../actions';
import styles from './dashboard.module.css';

export default function StudentDashboard({ activeCourseId = 1 }) {
  const [activeNode, setActiveNode] = useState(2); // Node 2 is active by default
  const [showDrawer, setShowDrawer] = useState(false);
  const [streak, setStreak] = useState(1);
  const [studentName, setStudentName] = useState('Student Builder');
  
  // Form input states
  const [hotlineTopic, setHotlineTopic] = useState('');
  const [hotlinePhone, setHotlinePhone] = useState('');

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

  // Curriculum node tree details based on selected course
  const nodes = activeCourseId === 2 ? [
    { id: 1, label: 'Load Balancers & CDN', x: 250, y: 30, status: 'completed' },
    { id: 2, label: 'Database Partitioning', x: 250, y: 110, status: 'active' },
    { id: 3, label: 'Caching (Redis/Memcached)', x: 150, y: 200, status: 'locked' },
    { id: 4, label: 'Message Queues (Kafka)', x: 350, y: 200, status: 'locked' },
    { id: 5, label: 'Microservices Mesh', x: 250, y: 290, status: 'locked' }
  ] : [
    { id: 1, label: 'HTML/CSS Basics', x: 250, y: 30, status: 'completed' },
    { id: 2, label: 'JavaScript & DOM', x: 250, y: 110, status: 'active' },
    { id: 3, label: 'Database Schemes', x: 150, y: 200, status: 'locked' },
    { id: 4, label: 'API Development', x: 350, y: 200, status: 'locked' },
    { id: 5, label: 'System Design Root', x: 250, y: 290, status: 'locked' }
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

  return (
    <div className={styles.bentoContainer}>
      
      {/* LEFT DASHBOARD PANEL */}
      <div className={styles.dashboardLeft}>
        
        {/* Tech Tree curriculum Map */}
        <div className={styles.cardPanel}>
          <div className={styles.cardPanelHeader}>
            <h2 className={styles.cardTitle}>
              Curriculum Tech-Tree
            </h2>
            <span className={styles.cardHeaderAction} onClick={() => setActiveNode(2)}>
              Reset View
            </span>
          </div>

          <div className={styles.techTreeContainer}>
            <svg className={styles.treeSvg} viewBox="0 0 500 350">
              {/* Connection Paths */}
              <path d="M 250,30 L 250,110" className={styles.treePathActive} />
              <path d="M 250,110 L 150,200" className={styles.treePath} />
              <path d="M 250,110 L 350,200" className={styles.treePath} />
              <path d="M 150,200 L 250,290" className={styles.treePath} />
              <path d="M 350,200 L 250,290" className={styles.treePath} />

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
              Active Target Workbench
            </h2>
            <span className={styles.cardHeaderAction}>
              {getFilename().split('/').pop()}
            </span>
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
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
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
        
        {/* Streak XP summary card */}
        <div className={styles.cardPanel}>
          <div className={styles.cardPanelHeader}>
            <h2 className={styles.cardTitle}>
              Daily Streaks Tracker
            </h2>
          </div>

          <div style={{ padding: '0.5rem 0 1.5rem' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
              {streak} <span style={{ fontSize: '1rem', color: 'var(--accent-orange)' }}>DAYS ACTIVE</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
              {activeCourseId === 2 ? 'Complete database sharding tasks to unlock cache design nodes.' : 'Keep coding daily to unlock System Design nodes.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Daily Goal</span>
              <p style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff', marginTop: '0.25rem' }}>100%</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rank</span>
              <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-orange)', marginTop: '0.25rem' }}>{streak > 5 ? '#124' : '#612'}</p>
            </div>
          </div>
        </div>

        {/* Mentor Callback hotline card */}
        <div className={styles.cardPanel} style={{ background: 'radial-gradient(circle at top right, rgba(242, 85, 34, 0.05) 0%, transparent 80%), #09090a' }}>
          <h2 className={styles.cardTitle} style={{ marginBottom: '0.5rem' }}>
            1-on-1 Mentorship Hotline
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
            Stuck on a node? Instantly schedule a callback request with an expert workspace instructor.
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
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}
          onClick={() => setShowDrawer(false)}
        >
          <div 
            style={{ width: '100%', maxWidth: '400px', height: '100vh', background: '#09090a', borderLeft: '1px solid rgba(255,255,255,0.08)', padding: '2.5rem', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>Hotline Schedule</h3>
              <button 
                onClick={() => setShowDrawer(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5', marginBottom: '2rem' }}>
              Confirm your workspace callback request. Instructors typically respond in under 15 minutes.
            </p>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const cbData = {
                  studentName: studentName,
                  phone: hotlinePhone,
                  topic: hotlineTopic,
                  status: 'Pending'
                };
                await saveCallback(cbData);
                window.dispatchEvent(new Event('courseChanged'));
                setShowDrawer(false);
                alert(`Callback logged successfully! Instructors will call you at ${hotlinePhone} shortly.`);
              }} 
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Topic Focus</label>
                <input 
                  type="text" 
                  required
                  value={hotlineTopic}
                  onChange={(e) => setHotlineTopic(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+91 98765 43210" 
                  required
                  value={hotlinePhone}
                  onChange={(e) => setHotlinePhone(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <button 
                type="submit" 
                className={styles.onboardBtn}
                style={{ marginTop: '1.5rem', width: '100%' }}
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
