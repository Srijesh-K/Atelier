'use client';

import React, { useState, useEffect } from 'react';
import { getLiveSessions, getCourses } from '../../actions';
import LiveClassroom from '@/components/LiveClassroom';
import styles from './live.module.css';

export default function LiveClassesPage({ activeCourseId = 1 }) {
  const [sessions, setSessions] = useState([]);
  const [courseTitle, setCourseTitle] = useState('Active Cohort');
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [activeInAppRoom, setActiveInAppRoom] = useState(null);
  const [enrolledCount, setEnrolledCount] = useState(null);
  const [enrolledCourseObjs, setEnrolledCourseObjs] = useState([]);
  const [cohortFilter, setCohortFilter] = useState('all');

  const loadLiveData = async () => {
    try {
      // Get student identity
      const profileStr = localStorage.getItem('studentProfile');
      let enrolledCourses = [];
      if (profileStr) {
        try {
          const parsed = JSON.parse(profileStr);
          setStudent(parsed);
          if (Array.isArray(parsed.enrolledCourses)) {
            enrolledCourses = parsed.enrolledCourses;
          }
        } catch (e) {}
      }
      setEnrolledCount(enrolledCourses.length);

      if (enrolledCourses.length === 0) {
        setSessions([]);
        setLoading(false);
        return;
      }

      const storedCourseId = localStorage.getItem('activeCourseId');
      let courseIdToUse = storedCourseId ? parseInt(storedCourseId, 10) : activeCourseId;
      if (enrolledCourses.length > 0 && !enrolledCourses.includes(courseIdToUse)) {
        courseIdToUse = enrolledCourses[0];
      }

      // Get courses to resolve active cohort title
      const courses = await getCourses();
      const currentCourse = courses.find((c) => c.id === courseIdToUse);
      if (currentCourse) {
        setCourseTitle(currentCourse.title);
      }

      const matchedEnrolled = courses.filter((c) => enrolledCourses.includes(c.id));
      setEnrolledCourseObjs(matchedEnrolled);

      // Fetch real sessions for all student's enrolled courses from MySQL
      const liveSessions = await getLiveSessions(enrolledCourses);
      setSessions(liveSessions || []);
    } catch (err) {
      console.error('Failed to load live sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveData();

    // 25-second polling to reflect when mentor starts a class in real time
    const interval = setInterval(loadLiveData, 25000);
    window.addEventListener('courseChanged', loadLiveData);

    return () => {
      clearInterval(interval);
      window.removeEventListener('courseChanged', loadLiveData);
    };
  }, [activeCourseId]);

  // Filter sessions by selected cohort tab
  const filteredSessions = cohortFilter === 'all'
    ? sessions
    : sessions.filter((s) => (s.course_id || s.courseId) === Number(cohortFilter));

  const currentLiveSession = filteredSessions.find((s) => s.status === 'live') || (cohortFilter === 'all' ? sessions.find(s => s.status === 'live') : null);
  const scheduledSessions = filteredSessions.filter((s) => s.status === 'scheduled');
  const completedSessions = filteredSessions.filter((s) => s.status === 'completed' || s.recording_url || s.recordingUrl);

  // Cross-cohort alert: if currently filtering by one track, but another track has a live broadcast
  const outsideLiveSession = (cohortFilter !== 'all')
    ? sessions.find((s) => s.status === 'live' && (s.course_id || s.courseId) !== Number(cohortFilter))
    : null;

  // Helper: check if session is an embedded room
  const isEmbeddedSession = (link) => {
    if (!link) return true;
    const clean = String(link).toLowerCase().trim();
    if (clean.includes('zoom.us') || clean.includes('meet.google.com') || clean.includes('teams.microsoft.com') || clean.includes('youtube.com') || clean.includes('webex.com')) {
      return false;
    }
    return clean.includes('meet.jit.si') || clean.includes('atelier') || clean.startsWith('embedded:') || !clean.includes('http');
  };

  // Helper: safely resolve full URL
  const resolveMeetingUrl = (link, courseId = null) => {
    if (!link) return `https://meet.jit.si/atelier-cohort-${courseId || activeCourseId}-live`;
    let clean = String(link).trim();
    if (clean.startsWith('embedded:')) {
      clean = clean.replace('embedded:', '');
    }
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return clean;
    }
    if (clean.includes('.') && !clean.startsWith('atelier-')) {
      return `https://${clean}`;
    }
    return `https://meet.jit.si/${clean.replace(/[^a-zA-Z0-9-_]/g, '-')}`;
  };

  // Dedicated Join Handler
  const handleJoinClass = (session) => {
    if (!session) return;
    const link = session.meeting_link || session.meetingLink || '';
    if (isEmbeddedSession(link)) {
      setActiveInAppRoom(session);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      const targetUrl = resolveMeetingUrl(link, session.course_id || session.courseId);
      if (typeof window !== 'undefined') {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Format date helper
  const formatSessionTime = (dateStr) => {
    if (!dateStr) return 'TBA';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (!loading && enrolledCount === 0) {
    return (
      <div className={styles.pageWrapper}>
        <h2 className={styles.headerTitle}>Live Sessions & Cohort Syncs</h2>
        <p className={styles.headerSubtitle}>
          Join real-time lectures, live code reviews, and office hours with your mentors.
        </p>
        <div style={{ padding: '3.5rem 2rem', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', marginTop: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(242, 85, 34, 0.08)', border: '1px solid rgba(242, 85, 34, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: 'var(--accent-orange)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: '#ffffff', fontSize: '1.15rem', marginBottom: '0.5rem' }}>No Active Cohort Enrollment</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1.75rem', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto 1.75rem' }}>
            Live interactive lectures and mentor syncs are available to students enrolled in a cohort track.
          </p>
          <a href="/dashboard/explore" style={{
            background: 'var(--accent-orange, #f25522)',
            color: '#ffffff',
            padding: '0.85rem 2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Explore Cohort Catalog &rarr;
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.headerTitle}>Live Sessions & Cohort Syncs</h2>
      <p className={styles.headerSubtitle}>
        Join real-time lectures, live code reviews, and office hours with your mentors across your enrolled cohort tracks.
      </p>

      {/* Cross-Cohort Urgent Live Alert */}
      {outsideLiveSession && (
        <div className={styles.crossCohortAlert}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className={styles.liveTabDot} />
            <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#ff3b30' }}>
              LIVE BROADCAST: <strong>{outsideLiveSession.title}</strong> is live right now in <strong>{outsideLiveSession.courseTitle || outsideLiveSession.course_title}</strong>!
            </span>
          </div>
          <button
            className={styles.joinBtn}
            style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
            onClick={() => {
              setCohortFilter(String(outsideLiveSession.course_id || outsideLiveSession.courseId));
              handleJoinClass(outsideLiveSession);
            }}
          >
            Switch & Join Live Class &rarr;
          </button>
        </div>
      )}

      {/* Cohort Track Filter Tabs */}
      {enrolledCount > 1 && (
        <div className={styles.cohortFilterBar}>
          <span className={styles.cohortFilterLabel}>Enrolled Tracks:</span>
          <button
            type="button"
            className={`${styles.cohortFilterPill} ${cohortFilter === 'all' ? styles.cohortFilterPillActive : ''}`}
            onClick={() => setCohortFilter('all')}
          >
            All Tracks ({sessions.length})
          </button>
          {enrolledCourseObjs.map((c) => {
            const trackSessions = sessions.filter((s) => (s.course_id || s.courseId) === c.id);
            const isTrackLive = trackSessions.some((s) => s.status === 'live');
            const rawTitle = c?.title || `Cohort #${c.id}`;
            const cleanTitle = rawTitle.includes(':') ? rawTitle.split(':')[0].trim() : rawTitle;
            const isSelected = cohortFilter === String(c.id);
            return (
              <button
                key={c.id}
                type="button"
                className={`${styles.cohortFilterPill} ${isSelected ? styles.cohortFilterPillActive : ''}`}
                onClick={() => setCohortFilter(String(c.id))}
              >
                {isTrackLive && <span className={styles.liveTabDot} />}
                {cleanTitle} ({trackSessions.length})
              </button>
            );
          })}
        </div>
      )}

      {/* Active In-App Classroom View */}
      {activeInAppRoom && (
        <div style={{ marginBottom: '2.5rem' }}>
          <LiveClassroom
            roomName={activeInAppRoom.meeting_link || activeInAppRoom.meetingLink}
            user={{ name: student?.name || 'Student', email: student?.email }}
            isMentor={false}
            title={activeInAppRoom.title}
            cohortName={activeInAppRoom.courseTitle || activeInAppRoom.course_title || courseTitle}
            onClose={() => setActiveInAppRoom(null)}
          />
        </div>
      )}

      {/* Top Banner: LIVE NOW or NEXT UPCOMING or NO LIVE */}
      {!activeInAppRoom && currentLiveSession ? (
        <div className={styles.liveBanner}>
          <div className={styles.liveBannerInfo}>
            <div className={styles.statusRow}>
              <span className={styles.pulsingBadgeLive}>
                <span className={styles.pulsingDot} />
                Live Now
              </span>
              <span style={{ fontSize: '0.8rem', color: '#ff3b30', fontWeight: '700' }}>
                Broadcasting in progress
              </span>
            </div>
            <h3 className={styles.bannerTitle}>{currentLiveSession.title}</h3>
            {currentLiveSession.description && (
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
                {currentLiveSession.description}
              </p>
            )}
            <div className={styles.bannerMeta}>
              <span>Mentor: {currentLiveSession.mentor_name || currentLiveSession.mentorName || 'Assigned Instructor'}</span>
              <span>•</span>
              <span className={styles.cohortTag}>{currentLiveSession.courseTitle || currentLiveSession.course_title || courseTitle}</span>
              <span>•</span>
              <span style={{ color: '#30d158', fontWeight: '700' }}>Mic & Chat Active</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              className={styles.joinBtn}
              onClick={() => handleJoinClass(currentLiveSession)}
            >
              Join Live Classroom
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </button>
            <a
              href={resolveMeetingUrl(currentLiveSession.meeting_link || currentLiveSession.meetingLink, currentLiveSession.course_id || currentLiveSession.courseId)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.joinBtn} ${styles.joinBtnSecondary}`}
              style={{ fontSize: '0.8rem', padding: '0.55rem 1rem' }}
            >
              Open in Separate Tab &nearr;
            </a>
          </div>
        </div>
      ) : !activeInAppRoom && scheduledSessions.length > 0 ? (
        <div className={`${styles.liveBanner} ${styles.liveBannerScheduled}`}>
          <div className={styles.liveBannerInfo}>
            <div className={styles.statusRow}>
              <span className={styles.pulsingBadgeScheduled}>
                <span className={styles.pulsingDotBlue} />
                Next Scheduled Session
              </span>
              <span style={{ fontSize: '0.8rem', color: '#007aff', fontWeight: '700' }}>
                {formatSessionTime(scheduledSessions[0].scheduled_at || scheduledSessions[0].scheduledAt)}
              </span>
            </div>
            <h3 className={styles.bannerTitle}>{scheduledSessions[0].title}</h3>
            {scheduledSessions[0].description && (
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
                {scheduledSessions[0].description}
              </p>
            )}
            <div className={styles.bannerMeta}>
              <span>Mentor: {scheduledSessions[0].mentor_name || scheduledSessions[0].mentorName || 'Assigned Instructor'}</span>
              <span>•</span>
              <span className={styles.cohortTag}>{scheduledSessions[0].courseTitle || scheduledSessions[0].course_title || courseTitle}</span>
            </div>
          </div>

          {(scheduledSessions[0].meeting_link || scheduledSessions[0].meetingLink) ? (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className={styles.joinBtn}
                onClick={() => handleJoinClass(scheduledSessions[0])}
              >
                Join Classroom
              </button>
              <a
                href={resolveMeetingUrl(scheduledSessions[0].meeting_link || scheduledSessions[0].meetingLink, scheduledSessions[0].course_id || scheduledSessions[0].courseId)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.joinBtn} ${styles.joinBtnSecondary}`}
              >
                Open in Tab &nearr;
              </a>
            </div>
          ) : null}
        </div>
      ) : (
        <div className={styles.liveBannerEmpty}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.4rem' }}>
            No Live Sessions Currently Running
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            Your mentors will post upcoming scheduled cohort classes and office hours here.
          </p>
        </div>
      )}

      {/* Main split grid: Upcoming vs Replays */}
      <div className={styles.splitGrid}>
        {/* Scheduled Sessions */}
        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <span>Upcoming Cohort Schedule</span>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>
              {scheduledSessions.length} {scheduledSessions.length === 1 ? 'session' : 'sessions'}
            </span>
          </div>

          {scheduledSessions.length > 0 ? (
            <div>
              {scheduledSessions.map((session) => (
                <div key={session.id} className={styles.sessionCard}>
                  <div className={styles.sessionTop}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                      <span className={styles.cohortTag} style={{ width: 'fit-content' }}>
                        {session.courseTitle || session.course_title}
                      </span>
                      <div className={styles.sessionTitle}>{session.title}</div>
                    </div>
                    <span className={styles.sessionTimeBadge}>
                      {formatSessionTime(session.scheduled_at || session.scheduledAt)}
                    </span>
                  </div>

                  {session.description && (
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                      {session.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div className={styles.sessionMentor}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {session.mentor_name || session.mentorName || 'Mentor'}
                    </div>

                    {(session.meeting_link || session.meetingLink) && (
                      <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                        <button
                          onClick={() => handleJoinClass(session)}
                          style={{
                            background: 'rgba(242, 85, 34, 0.1)',
                            border: '1px solid rgba(242, 85, 34, 0.3)',
                            color: 'var(--accent-orange)',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '4px'
                          }}
                        >
                          Join In-App
                        </button>
                        <a
                          href={resolveMeetingUrl(session.meeting_link || session.meetingLink, session.course_id || session.courseId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
                        >
                          Direct Link &nearr;
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              No scheduled classes for this week in this track. Check back soon!
            </div>
          )}
        </div>

        {/* Recorded Replays */}
        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <span>Recorded Replays</span>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>
              {completedSessions.length} {completedSessions.length === 1 ? 'recording' : 'recordings'}
            </span>
          </div>

          {completedSessions.length > 0 ? (
            <div className={styles.replayGrid}>
              {completedSessions.map((rec) => (
                <div key={rec.id} className={styles.replayCard}>
                  <div className={styles.replayInfo}>
                    <span className={styles.cohortTag} style={{ marginBottom: '0.35rem', display: 'inline-block' }}>
                      {rec.courseTitle || rec.course_title}
                    </span>
                    <div className={styles.replayTitle}>{rec.title}</div>
                    <div className={styles.replayDate}>
                      {formatSessionTime(rec.scheduled_at || rec.scheduledAt)} • {rec.mentor_name || rec.mentorName || 'Mentor'}
                    </div>
                  </div>

                  {(rec.recording_url || rec.recordingUrl) ? (
                    <a
                      href={rec.recording_url || rec.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.watchBtn}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Watch
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                      Processing
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              No recorded session replays available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
