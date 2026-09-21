'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMentorCourses, getLiveSessions, getCourseEnrolledStudents } from '@/app/actions';
import styles from './mentor.module.css';

export default function MentorDashboardPage() {
  const [mentor, setMentor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profileStr = localStorage.getItem('mentorProfile');
    if (!profileStr) return;

    try {
      const parsed = JSON.parse(profileStr);
      setMentor(parsed);

      // Load mentor's courses
      getMentorCourses(parsed.id).then(async (assigned) => {
        setCourses(assigned || []);

        // Count enrolled students across all assigned courses
        let studentCount = 0;
        for (const c of assigned || []) {
          const students = await getCourseEnrolledStudents(parsed.id, c.id);
          studentCount += (students || []).length;
        }
        setTotalStudents(studentCount);

        // Load live sessions
        const allSessions = await getLiveSessions();
        const mentorSessions = (allSessions || []).filter(
          (s) => s.mentor_id === parsed.id || (assigned || []).some((c) => c.id === s.course_id)
        );
        setLiveSessions(mentorSessions);
      }).finally(() => setLoading(false));
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, []);

  const activeLiveSession = liveSessions.find((s) => s.status === 'live');
  const upcomingSessions = liveSessions.filter((s) => s.status === 'scheduled');

  if (loading) {
    return (
      <div className={styles.contentWrapper} style={{ color: 'rgba(255,255,255,0.4)' }}>
        Loading mentor metrics...
      </div>
    );
  }

  return (
    <div className={styles.contentWrapper}>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.4rem' }}>
          Welcome back, {mentor?.name || 'Mentor'}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)' }}>
          Manage your cohorts, monitor student curriculum progress, start live streams, and maintain syllabus topics.
        </p>
      </div>

      {/* Active Live Broadcast Alert if any */}
      {activeLiveSession && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.15) 0%, rgba(10, 10, 12, 0.9) 100%)',
          border: '1px solid rgba(255, 59, 48, 0.4)',
          borderRadius: '12px',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 8px #ff3b30' }} />
              <span style={{ color: '#ff3b30', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                You Have an Active Live Broadcast
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>
              {activeLiveSession.title}
            </h3>
          </div>

          <Link
            href={`/mentor/courses/${activeLiveSession.course_id}`}
            className={styles.secondaryBtn}
            style={{ background: '#ff3b30', borderColor: '#ff3b30', color: '#ffffff' }}
          >
            Manage Broadcast &rarr;
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Assigned Cohorts</span>
          <div className={styles.statValue}>{courses.length}</div>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Enrolled Students</span>
          <div className={styles.statValue}>{totalStudents}</div>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Scheduled Live Sessions</span>
          <div className={styles.statValue}>{upcomingSessions.length}</div>
        </div>
      </div>

      {/* Cohorts Grid */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Your Assigned Cohorts</h2>
        </div>

        {courses.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {courses.map((course) => (
              <div
                key={course.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
                    {course.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                    {course.description || 'Full cohort curriculum, live mentoring, and project reviews.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-orange)', fontWeight: '700' }}>
                    Instructor Access
                  </span>
                  <Link
                    href={`/mentor/courses/${course.id}`}
                    className={styles.secondaryBtn}
                  >
                    Open Workspace &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem' }}>
            No cohorts have been assigned to your mentor account yet. Please contact the administrator.
          </div>
        )}
      </div>

      {/* Upcoming Live Classes Panel */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Upcoming Scheduled Classes</h2>
        </div>

        {upcomingSessions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', color: '#ffffff', marginBottom: '0.2rem' }}>
                    {session.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(session.scheduled_at).toLocaleString()}
                  </div>
                </div>

                <Link
                  href={`/mentor/courses/${session.course_id}`}
                  className={styles.secondaryBtn}
                >
                  Manage &rarr;
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            No upcoming sessions scheduled. You can schedule new classes in your cohort workspace.
          </div>
        )}
      </div>
    </div>
  );
}
