'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminSecurityGuard({ children }) {
  const [isStudent, setIsStudent] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    try {
      const email = localStorage.getItem('loggedInStudentEmail');
      if (email) {
        setIsStudent(true);
        setStudentEmail(email);
      } else {
        setIsStudent(false);
      }
    } catch (e) {
      setIsStudent(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const handleStudentLogout = () => {
    try {
      localStorage.removeItem('loggedInStudentEmail');
      localStorage.removeItem('studentProfile');
      localStorage.removeItem('activeCourseId');
      localStorage.removeItem('currentCourseId');
      window.dispatchEvent(new Event('profileChanged'));
      window.dispatchEvent(new Event('authChanged'));
    } catch (e) {}
    setIsStudent(false);
    setStudentEmail('');
    window.location.reload();
  };

  // During initial hydration check, show minimal placeholder
  if (isChecking) {
    return (
      <div style={{ minHeight: '100vh', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-orange, #f25522)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // If a student account is logged in, strictly block access to all admin routes
  if (isStudent) {
    return (
      <div className={styles.gateWrapper}>
        <div className={styles.gateCard} style={{ maxWidth: '480px', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#ef4444'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#ef4444',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '3px 10px',
              borderRadius: '20px',
              marginBottom: '0.85rem'
            }}>
              Security Protocol • Access Restricted
            </div>

            <h2 className={styles.gateTitle} style={{ color: '#ffffff', fontSize: '1.4rem' }}>
              Admin Route Blocked
            </h2>
            <p className={styles.gateSubtitle} style={{ textTransform: 'none', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6, marginTop: '0.75rem' }}>
              You are currently logged in with a student account (<strong style={{ color: '#ffffff' }}>{studentEmail}</strong>). Student accounts are restricted from accessing administrative console routes.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Link 
              href="/dashboard" 
              className={styles.gateBtn}
              style={{ textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <span>← Return to Student Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={handleStudentLogout}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'rgba(255, 255, 255, 0.75)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign Out of Student Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
