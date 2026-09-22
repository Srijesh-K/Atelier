'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStudentProfileByEmail, getCourses, getStudentCourseProgress } from '../../actions';
import styles from '../dashboard.module.css';

export default function MyCoursesPage() {
  const router = useRouter();
  const [coursesList, setCoursesList] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      const email = localStorage.getItem('loggedInStudentEmail');
      if (!email) {
        setLoading(false);
        return;
      }

      try {
        const [student, allCourses] = await Promise.all([
          getStudentProfileByEmail(email),
          getCourses()
        ]);

        const enrolledIds = student ? student.enrolledCourses || [] : [];
        const filtered = allCourses.filter((c) => enrolledIds.includes(c.id));
        setCoursesList(filtered);

        // Compute mathematical progress in parallel for each enrolled course
        if (student && student.id && filtered.length > 0) {
          const progressResults = await Promise.all(
            filtered.map(async (c) => ({
              id: c.id,
              stats: await getStudentCourseProgress(student.id, c.id)
            }))
          );
          const pMap = {};
          for (const item of progressResults) {
            pMap[item.id] = item.stats;
          }
          setProgressMap(pMap);
        }
      } catch (err) {
        console.error('Error loading enrolled courses:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
    window.addEventListener('courseChanged', loadCourses);
    return () => window.removeEventListener('courseChanged', loadCourses);
  }, []);

  if (loading) {
    return (
      <div className={styles.simplePageWrapper}>
        <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className={styles.dropdownActiveDot} />
          <span>Loading your courses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.simplePageWrapper}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
        My Enrolled Courses
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', marginBottom: '2.25rem', lineHeight: '1.5' }}>
        Select an enrolled course below to access your curriculum roadmap, reference materials, and live classes.
      </p>

      {coursesList.length === 0 ? (
        <div style={{ padding: '3.5rem 2rem', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(242, 85, 34, 0.08)', border: '1px solid rgba(242, 85, 34, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: 'var(--accent-orange)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: '#ffffff', fontSize: '1.15rem', marginBottom: '0.5rem' }}>No Enrolled Courses Found</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1.75rem', fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto 1.75rem' }}>
            You have not enrolled in any courses yet. Explore the catalog to get started.
          </p>
          <Link href="/dashboard/explore" className={styles.onboardBtn} style={{ textDecoration: 'none', display: 'inline-flex', width: 'auto', padding: '0.85rem 2rem' }}>
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className={styles.myCoursesGrid}>
          {coursesList.map((course) => {
            const progressData = progressMap[course.id] || { percentage: 0, completed: 0, total: 0 };
            const isCompleted = progressData.percentage === 100 && progressData.total > 0;

            return (
              <div key={course.id} className={styles.courseDeckCard}>
                
                {/* Card Info Header */}
                <h3 className={styles.deckTitle}>
                  {course.title}
                </h3>
                <p className={styles.deckDesc}>
                  {course.description}
                </p>

                {/* Progress bar */}
                <div className={styles.progressContainer}>
                  <div className={styles.progressBarLabelRow}>
                    <span>
                      Curriculum Progress {progressData.total > 0 ? `(${progressData.completed} of ${progressData.total} topics)` : ''}
                    </span>
                    <span className={styles.progressPercent}>{progressData.percentage}%</span>
                  </div>
                  <div className={styles.progressBarWrapper}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ 
                        width: `${progressData.percentage}%`,
                        background: isCompleted ? 'linear-gradient(90deg, #30d158, #34c759)' : undefined
                      }} 
                    />
                  </div>
                </div>

                {/* Workspace Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.65rem 0.85rem', background: isCompleted ? 'rgba(48, 209, 88, 0.06)' : 'rgba(242, 85, 34, 0.04)', border: isCompleted ? '1px solid rgba(48, 209, 88, 0.25)' : '1px solid rgba(242, 85, 34, 0.15)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: isCompleted ? '#30d158' : 'var(--accent-orange)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</span>
                  <span style={{ fontSize: '0.72rem', color: isCompleted ? '#30d158' : '#ffffff', fontWeight: '800', textTransform: 'uppercase', background: isCompleted ? 'rgba(48, 209, 88, 0.12)' : 'rgba(255,255,255,0.06)', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
                    {isCompleted ? 'Completed ✓' : 'In Progress'}
                  </span>
                </div>

                {/* Active Sandbox Environment */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                  <span style={{ width: '7px', height: '7px', backgroundColor: '#30d158', borderRadius: '50%', boxShadow: '0 0 8px #30d158' }} />
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
                    Workspace Sandbox: Active
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
