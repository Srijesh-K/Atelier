'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStudents, getCourses } from '../../actions';
import styles from '../dashboard.module.css';

export default function MyCoursesPage() {
  const router = useRouter();
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      const email = localStorage.getItem('loggedInStudentEmail');
      if (!email) return;
      const studentsList = await getStudents();
      const student = studentsList.find((s) => s.email.toLowerCase() === email.toLowerCase());
      const enrolledIds = student ? student.enrolledCourses || [] : [];

      const allCourses = await getCourses();
      const filtered = allCourses.filter((c) => enrolledIds.includes(c.id));
      setCoursesList(filtered);
      setLoading(false);
    };

    loadCourses();
    window.addEventListener('courseChanged', loadCourses);
    return () => window.removeEventListener('courseChanged', loadCourses);
  }, []);

  if (loading) {
    return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Loading workspace nodes...</div>;
  }

  return (
    <div className={styles.simplePageWrapper}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ffffff' }}>
        Your Active Workspace Cohorts
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2rem' }}>
        Select a purchased program below to access curriculum sandbox environments and assignments.
      </p>

      {coursesList.length === 0 ? (
        <div style={{ padding: '3rem', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '8px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            No active cohorts found in your workspace container.
          </p>
          <Link href="/dashboard/explore" className={styles.onboardBtn} style={{ textDecoration: 'none', display: 'inline-block' }}>
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className={styles.myCoursesGrid}>
          {coursesList.map((course) => {
            const status = "In Progress";
            const workspaceActiveText = "Workspace Sandbox Environment: Active";

            return (
              <div key={course.id} className={styles.courseDeckCard}>
                
                {/* Card Info Header */}
                <h3 className={styles.deckTitle}>
                  {course.title}
                </h3>
                <p className={styles.deckDesc}>
                  {course.description}
                </p>

                {/* Workspace Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.6rem 0.8rem', background: 'rgba(242, 85, 34, 0.03)', border: '1px solid rgba(242, 85, 34, 0.1)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-orange)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</span>
                  <span style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{status}</span>
                </div>

                {/* Active Workspace Node */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#34c759', borderRadius: '50%' }} />
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>
                    {workspaceActiveText}
                  </span>
                </div>

                {/* Action button */}
                <button 
                  className={styles.deckResumeBtn}
                  onClick={() => {
                    localStorage.setItem('activeCourseId', course.id.toString());
                    window.dispatchEvent(new Event('courseChanged'));
                    router.push('/dashboard');
                  }}
                >
                  Resume Learning Workspace
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
