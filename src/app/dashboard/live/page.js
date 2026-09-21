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

  const loadLiveData = async () => {
    try {
      // Get student identity
      const profileStr = localStorage.getItem('studentProfile');
      if (profileStr) {
        try {
          setStudent(JSON.parse(profileStr));
        } catch (e) {}
      }

      const storedCourseId = localStorage.getItem('activeCourseId');
      const courseIdToUse = storedCourseId ? parseInt(storedCourseId, 10) : activeCourseId;

      // Get courses to resolve active cohort title
      const courses = await getCourses();
      const currentCourse = courses.find((c) => c.id === courseIdToUse);
      if (currentCourse) {
        setCourseTitle(currentCourse.title);
      }

      // Fetch real sessions from MySQL database
      const liveSessions = await getLiveSessions(courseIdToUse);
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

  // Filter sessions by status
  const currentLiveSession = sessions.find((s) => s.status === 'live');
  const scheduledSessions = sessions.filter((s) => s.status === 'scheduled');
  const completedSessions = sessions.filter((s) => s.status === 'completed' || s.recording_url);

  // Helper: check if session is an embedded room
  const isEmbeddedSession = (link) => {
    if (!link) return false;
    return link.includes('meet.jit.si') || link.includes('atelier-live') || link.startsWith('embedded:');
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

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.headerTitle}>Live Sessions & Cohort Syncs</h2>
      <p className={styles.headerSubtitle}>
        Join real-time lectures, live code reviews, and office hours with your mentors for {courseTitle}.
      </p>

      {/* Active In-App Classroom View */}
      {activeInAppRoom && (
        <div style={{ marginBottom: '2.5rem' }}>
          <LiveClassroom
            roomName={activeInAppRoom.meeting_link}
            user={{ name: student?.name || 'Student', email: student?.email }}
            isMentor={false}
            title={activeInAppRoom.title}
            cohortName={courseTitle}
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
              <span>Mentor: {currentLiveSession.mentor_name || 'Assigned Instructor'}</span>
              <span>•</span>
              <span>{courseTitle}</span>
              <span>•</span>
              <span style={{ color: '#30d158', fontWeight: '700' }}>Mic & Chat Active</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {isEmbeddedSession(currentLiveSession.meeting_link) ? (
              <button
                className={styles.joinBtn}
                onClick={() => setActiveInAppRoom(currentLiveSession)}
              >
                Join Live Classroom
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </button>
            ) : (
              <a
                href={currentLiveSession.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.joinBtn}
              >
                Join Live Class
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </a>
            )}
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
                {formatSessionTime(scheduledSessions[0].scheduled_at)}
              </span>
            </div>
            <h3 className={styles.bannerTitle}>{scheduledSessions[0].title}</h3>
            {scheduledSessions[0].description && (
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
                {scheduledSessions[0].description}
              </p>
            )}
            <div className={styles.bannerMeta}>
              <span>Mentor: {scheduledSessions[0].mentor_name || 'Assigned Instructor'}</span>
              <span>•</span>
              <span>{courseTitle}</span>
            </div>
          </div>

          {scheduledSessions[0].meeting_link ? (
            <a
              href={scheduledSessions[0].meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.joinBtn} ${styles.joinBtnSecondary}`}
            >
              Session Room
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          ) : null}
        </div>
      ) : (
        <div className={styles.liveBannerEmpty}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.4rem' }}>
            No Live Sessions Currently Running
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            Your mentor will post upcoming scheduled cohort classes and office hours here.
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
                    <div className={styles.sessionTitle}>{session.title}</div>
                    <span className={styles.sessionTimeBadge}>
                      {formatSessionTime(session.scheduled_at)}
                    </span>
                  </div>

                  {session.description && (
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                      {session.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <div className={styles.sessionMentor}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {session.mentor_name || 'Mentor'}
                    </div>

                    {session.meeting_link && (
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.78rem', color: 'var(--accent-orange)', fontWeight: '700', textDecoration: 'none' }}
                      >
                        Room Link &rarr;
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              No scheduled classes for this week. Check back soon!
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
                    <div className={styles.replayTitle}>{rec.title}</div>
                    <div className={styles.replayDate}>
                      {formatSessionTime(rec.scheduled_at)} • {rec.mentor_name || 'Mentor'}
                    </div>
                  </div>

                  {rec.recording_url ? (
                    <a
                      href={rec.recording_url}
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
