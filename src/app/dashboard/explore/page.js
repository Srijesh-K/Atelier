'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStudents, getCourses, registerStudentToCourse } from '../../actions';
import styles from '@/app/courses/courses-page.module.css';

export default function DashboardExplorePage() {
  const router = useRouter();
  const [coursesList, setCoursesList] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [registeringId, setRegisteringId] = useState(null);

  const loadData = async () => {
    const email = localStorage.getItem('loggedInStudentEmail');
    if (!email) return;
    const studentsList = await getStudents();
    const student = studentsList.find((s) => s.email.toLowerCase() === email.toLowerCase());
    
    if (student) {
      setActiveStudent(student);
      setEnrolledIds(student.enrolledCourses || []);
    }

    const allCourses = await getCourses();
    setCoursesList(allCourses);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('courseChanged', loadData);
    return () => window.removeEventListener('courseChanged', loadData);
  }, []);

  const handleRegister = async (courseId, courseTitle) => {
    if (!activeStudent) {
      router.push('/auth/signin');
      return;
    }

    setRegisteringId(courseId);
    const targetCourse = coursesList.find(c => c.id === courseId) || {};
    const amountPaid = targetCourse.price || 'Rs. 5999';

    try {
      await registerStudentToCourse(activeStudent.id, courseId, amountPaid);

      // Update cached student profile with new enrolled courses
      const cached = localStorage.getItem('studentProfile');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const newEnrolled = Array.from(new Set([...(parsed.enrolledCourses || []), courseId]));
          parsed.enrolledCourses = newEnrolled;
          localStorage.setItem('studentProfile', JSON.stringify(parsed));
        } catch (e) {}
      }

      // Update active course selection
      localStorage.setItem('activeCourseId', courseId.toString());
      
      // Dispatch events
      window.dispatchEvent(new Event('profileChanged'));
      window.dispatchEvent(new Event('courseChanged'));

      // Direct navigate to My Courses to show the freshly added course
      router.push('/dashboard/my-courses');
    } catch (err) {
      console.error(err);
      alert('Error enrolling in cohort. Please try again.');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div style={{ padding: '2.25rem', maxWidth: '1440px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
        Explore New Cohort Paths
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', marginBottom: '2.5rem', lineHeight: '1.5' }}>
        Enroll in specialized tracks to expand your learning tech-tree, unlock specialized compilers, and attend live sessions.
      </p>

      {/* Catalog card grid */}
      <div className={styles.grid}>
        {coursesList.map((course) => {
          const isEnrolled = enrolledIds.includes(course.id);
          const badges = course.badges || [];

          return (
            <div key={course.id} className={styles.card} style={{ position: 'relative' }}>
              
              {/* Course Thumbnail Image with Status Indicators */}
              <div className={styles.imageWrapper}>
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className={styles.image} 
                />
                
                {isEnrolled ? (
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(10, 10, 12, 0.85)',
                    border: '1px solid rgba(48, 209, 88, 0.4)',
                    backdropFilter: 'blur(8px)',
                    color: '#30d158',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    zIndex: 10
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#30d158', boxShadow: '0 0 6px #30d158' }} />
                    ALREADY PURCHASED
                  </span>
                ) : (
                  <span className={styles.liveBadge}>
                    <span className={styles.liveDot} />
                    Live Cohort
                  </span>
                )}
              </div>

              {/* Pill badges */}
              <div className={styles.badgeList}>
                {isEnrolled && (
                  <span className={styles.cardBadge} style={{ background: 'rgba(48, 209, 88, 0.1)', color: '#30d158', borderColor: 'rgba(48, 209, 88, 0.3)', fontWeight: '700' }}>
                    ✓ Enrolled
                  </span>
                )}
                {badges.map((badge, idx) => (
                  <span key={idx} className={styles.cardBadge}>
                    {badge}
                  </span>
                ))}
              </div>

              {/* Course Title */}
              <h3 className={styles.courseTitle}>
                {course.title}
              </h3>

              {/* Price or Enrolled Status Banner */}
              {isEnrolled ? (
                <div style={{
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(48, 209, 88, 0.05)',
                  border: '1px solid rgba(48, 209, 88, 0.18)',
                  borderRadius: '6px',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.78rem', color: '#30d158', fontWeight: '700' }}>
                    ✓ Lifetime Cohort Unlocked
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: '700' }}>
                    Purchased
                  </span>
                </div>
              ) : (
                course.price ? (
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>Price</span>
                    <span className={styles.priceValue}>{course.price}</span>
                    {course.originalPrice && (
                      <span className={styles.originalPrice}>{course.originalPrice}</span>
                    )}
                    {course.discount && (
                      <span className={styles.discountBadge}>{course.discount}</span>
                    )}
                  </div>
                ) : (
                  <div className={styles.priceSpacer} />
                )
              )}

              {/* Action button */}
              {isEnrolled ? (
                <button 
                  className={styles.button}
                  style={{
                    background: 'rgba(242, 85, 34, 0.08)',
                    borderColor: 'var(--accent-orange)',
                    color: '#ffffff',
                    fontWeight: '800'
                  }}
                  onClick={() => {
                    localStorage.setItem('activeCourseId', course.id.toString());
                    window.dispatchEvent(new Event('courseChanged'));
                    router.push('/dashboard');
                  }}
                >
                  Open in Learning Workspace &rarr;
                </button>
              ) : (
                <button 
                  className={styles.button}
                  disabled={registeringId === course.id}
                  onClick={() => handleRegister(course.id, course.title)}
                >
                  {registeringId === course.id ? 'Provisioning...' : 'Enroll in Cohort'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
