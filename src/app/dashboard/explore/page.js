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
    if (!activeStudent) return;

    const targetCourse = coursesList.find(c => c.id === courseId) || {};
    const amountPaid = targetCourse.price || 'Rs. 5999';

    try {
      await registerStudentToCourse(activeStudent.id, courseId, amountPaid);

      // Update active course selection
      localStorage.setItem('activeCourseId', courseId.toString());
      
      // Dispatch events
      window.dispatchEvent(new Event('profileChanged'));
      window.dispatchEvent(new Event('courseChanged'));

      alert(`Successfully registered for ${courseTitle}! Loading workspace...`);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Error registering for cohort.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ffffff' }}>
        Explore New Cohort Paths
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2.5rem' }}>
        Enroll in specialized tracks to expand your curriculum map and unlock advanced tech-tree modules.
      </p>

      {/* Reusing catalog card grid styles */}
      <div className={styles.grid}>
        {coursesList.map((course) => {
          const isEnrolled = enrolledIds.includes(course.id);
          const badges = course.badges || [];

          return (
            <div key={course.id} className={styles.card}>
              

              {/* Course Thumbnail Image */}
              <div className={styles.imageWrapper}>
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className={styles.image} 
                />
                <span className={styles.liveBadge}>
                  <span className={styles.liveDot} />
                  Live
                </span>
              </div>

              {/* Pill badges */}
              <div className={styles.badgeList}>
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

              {/* Price Row / Spacer */}
              {course.price ? (
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
              )}

              {/* Action button */}
              {isEnrolled ? (
                <button 
                  className={styles.button}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
                  onClick={() => {
                    localStorage.setItem('activeCourseId', course.id.toString());
                    window.dispatchEvent(new Event('courseChanged'));
                    router.push('/dashboard');
                  }}
                >
                  Access Workspace
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              ) : (
                <button 
                  className={styles.button}
                  onClick={() => handleRegister(course.id, course.title)}
                >
                  Register for Cohort
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
