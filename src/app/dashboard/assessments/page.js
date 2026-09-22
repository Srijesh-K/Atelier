'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStudentAssessmentsAction } from '@/lib/assessments/actions';
import { getCourses } from '@/app/actions';
import styles from './assessments.module.css';

export default function StudentAssessmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [studentEmail, setStudentEmail] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('loggedInStudentEmail');
    if (!email) {
      router.push('/auth/signin?redirectTo=/dashboard/assessments');
      return;
    }
    setStudentEmail(email);

    async function loadData() {
      try {
        const allCourses = await getCourses();
        setCourses(allCourses || []);

        const data = await getStudentAssessmentsAction(email);
        setAssessments(data || []);
      } catch (err) {
        console.error('Error fetching student assessments:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const filteredAssessments = selectedCourseId === 'all'
    ? assessments
    : assessments.filter(a => String(a.course_id) === String(selectedCourseId));

  const getStatusBadge = (asst) => {
    const latest = asst.latest_attempt;
    if (!latest) {
      return <span className={`${styles.statusPill} ${styles.pillNotStarted}`}>Not Attempted</span>;
    }

    if (latest.status === 'in_progress') {
      return <span className={`${styles.statusPill} ${styles.pillInProgress}`}>In Progress</span>;
    }

    if (latest.status === 'submitted') {
      return <span className={`${styles.statusPill} ${styles.pillSubmitted}`}>Evaluating</span>;
    }

    if (latest.status === 'evaluated') {
      if (latest.passed) {
        return <span className={`${styles.statusPill} ${styles.pillPassed}`}>Passed ({latest.percentage}%)</span>;
      }
      return <span className={`${styles.statusPill} ${styles.pillFailed}`}>Failed ({latest.percentage}%)</span>;
    }

    return <span className={`${styles.statusPill} ${styles.pillNotStarted}`}>{latest.status}</span>;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Assessments & Evaluations</h1>
          <p className={styles.subtitle}>
            Comprehensive diagnostic evaluations, coding sandboxes, and milestone examinations for your enrolled courses.
          </p>
        </div>

        {courses.length > 1 && (
          <div className={styles.courseFilter}>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className={styles.selectInput}
            >
              <option value="all">All Enrolled Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 14 }}>Loading your course assessments...</p>
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <h3 className={styles.emptyTitle}>No Assessments Available</h3>
          <p className={styles.emptySubtitle}>
            There are no published assessments for your enrolled courses yet. Once mentors publish evaluations, they will appear here.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredAssessments.map((asst) => {
            const latest = asst.latest_attempt;
            const hasActive = asst.has_active_attempt;
            const canAttempt = hasActive || asst.attempts_remaining > 0;

            return (
              <div key={asst.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.courseBadge}>{asst.course_title}</span>
                  {getStatusBadge(asst)}
                </div>

                <h2 className={styles.cardTitle}>{asst.title}</h2>
                <p className={styles.cardDesc}>
                  {asst.description || 'Comprehensive evaluation covering multiple topics and formats.'}
                </p>

                <div className={styles.metaRow}>
                  <div className={styles.metaItem}>
                    <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{asst.duration_minutes} Mins</span>
                  </div>

                  <div className={styles.metaItem}>
                    <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <span>{asst.total_marks} Marks ({asst.passing_marks} to pass)</span>
                  </div>

                  <div className={styles.metaItem}>
                    <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    <span>{asst.question_count} Questions</span>
                  </div>

                  {asst.proctoring_enabled === 1 && (
                    <div className={styles.metaItem} style={{ color: '#fbbf24' }}>
                      <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span>Proctored</span>
                    </div>
                  )}
                </div>

                {latest && (
                  <div className={styles.attemptSummary}>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: 11 }}>Your Latest Result</div>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>
                        {latest.status === 'in_progress' ? (
                          'In Progress'
                        ) : latest.status === 'submitted' ? (
                          'Submitted for Grading'
                        ) : (
                          `${latest.total_score} / ${asst.total_marks} (${latest.percentage}%)`
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#94a3b8', fontSize: 11 }}>Attempts Left</div>
                      <div style={{ fontWeight: 600, color: asst.attempts_remaining > 0 ? '#34d399' : '#f87171' }}>
                        {asst.attempts_remaining} of {asst.max_attempts}
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.cardActions}>
                  {hasActive ? (
                    <Link
                      href={`/dashboard/assessments/${asst.id}`}
                      className={styles.btnPrimary}
                      style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                    >
                      Resume Assessment
                    </Link>
                  ) : canAttempt ? (
                    <Link
                      href={`/dashboard/assessments/${asst.id}`}
                      className={styles.btnPrimary}
                    >
                      {latest ? 'Retake Assessment' : 'Start Assessment'}
                    </Link>
                  ) : (
                    <button disabled className={styles.btnSecondary} style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                      No Attempts Remaining
                    </button>
                  )}

                  {latest && (
                    <Link
                      href={`/dashboard/assessments/${asst.id}?report=true`}
                      className={styles.btnSecondary}
                    >
                      View Report
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
