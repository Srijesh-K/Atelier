'use client';

import React, { useState, useEffect } from 'react';
import { getSchedule, getRecordings, getCourses, getLecturers } from '../../actions';
import styles from '../dashboard.module.css';

export default function LiveClassesPage({ activeCourseId = 1 }) {
  const [scheduleList, setScheduleList] = useState([]);
  const [recordingsList, setRecordingsList] = useState([]);
  const [currentLive, setCurrentLive] = useState({
    title: 'No upcoming live session',
    time: 'Check back later',
    cohort: 'Workspace Cohort',
    instructor: 'Atelier Advisor'
  });

  useEffect(() => {
    const loadLiveData = async () => {
      const allSchedule = await getSchedule();
      const filteredSchedule = allSchedule.filter((s) => s.courseId === activeCourseId);
      setScheduleList(filteredSchedule);

      const allRecordings = await getRecordings();
      const filteredRecordings = allRecordings.filter((r) => r.courseId === activeCourseId);
      setRecordingsList(filteredRecordings);

      // Resolve cohort title
      const allCourses = await getCourses();
      const activeCourse = allCourses.find((c) => c.id === activeCourseId);
      const cohortName = activeCourse ? (activeCourse.title.includes(':') ? activeCourse.title.split(':')[0] : activeCourse.title) : 'Active Cohort';

      // Resolve instructor details
      const allLecturers = await getLecturers();
      const instructorId = activeCourse ? activeCourse.instructorId || 1 : 1;
      const assignedLecturer = allLecturers.find((l) => l.id === instructorId) || allLecturers[0];
      const instructorName = assignedLecturer ? assignedLecturer.name : 'Sarthak Shrivas';

      // Find first schedule item as "current live"
      if (filteredSchedule.length > 0) {
        setCurrentLive({
          title: filteredSchedule[0].title,
          time: `Starts at ${filteredSchedule[0].time}`,
          cohort: cohortName,
          instructor: instructorName
        });
      } else {
        setCurrentLive({
          title: 'No upcoming sessions scheduled',
          time: 'Schedule empty',
          cohort: cohortName,
          instructor: 'N/A'
        });
      }
    };

    loadLiveData();
    window.addEventListener('courseChanged', loadLiveData);
    return () => window.removeEventListener('courseChanged', loadLiveData);
  }, [activeCourseId]);

  return (
    <div className={styles.simplePageWrapper}>
      
      {/* Live class callout banner */}
      <div className={styles.liveCalloutBanner}>
        <div className={styles.liveBannerInfo}>
          <div className={styles.liveBannerStatusRow}>
            <span className={styles.livePulsingBadge}>
              <span className={styles.livePulsingDot} />
              Live session
            </span>
            <span className={styles.liveBannerCountdown}>{currentLive.time}</span>
          </div>
          <h3 className={styles.liveBannerTitle}>
            {currentLive.title}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.35rem' }}>
            Instructor: {currentLive.instructor} • {currentLive.cohort}
          </p>
        </div>

        {scheduleList.length > 0 && (
          <button 
            className={styles.liveJoinBtn}
            onClick={() => window.open('https://zoom.us', '_blank')}
          >
            Join Session
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>
        )}
      </div>

      {/* Main split grid */}
      <div className={styles.liveContentSplit}>
        
        {/* Weekly schedule */}
        <div className={styles.cardPanel}>
          <h3 className={styles.cardTitle} style={{ marginBottom: '1.25rem' }}>
            Weekly Cohort Schedule
          </h3>

          <div className={styles.scheduleList}>
            {scheduleList.map((item) => (
              <div key={item.id} className={styles.scheduleItem}>
                <div className={styles.scheduleLeft}>
                  <span className={styles.scheduleTime}>{item.time}</span>
                  <span className={styles.scheduleTitle}>{item.title}</span>
                </div>
                <span className={styles.scheduleBadge}>{item.type}</span>
              </div>
            ))}
            {scheduleList.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', padding: '1rem 0' }}>No streams scheduled for this workspace container.</p>
            )}
          </div>
        </div>

        {/* Previous Session replays */}
        <div className={styles.cardPanel}>
          <h3 className={styles.cardTitle} style={{ marginBottom: '1.25rem' }}>
            Recorded Replays
          </h3>

          <div className={styles.replayGallery}>
            {recordingsList.map((rec) => (
              <div key={rec.id} className={styles.replayItem} onClick={() => alert('Launching video playback stream...')}>
                <div className={styles.replayThumbWrapper}>
                  <img src={rec.image} alt={rec.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                </div>
                <div className={styles.replayMeta}>
                  <span className={styles.replayTitle}>{rec.title}</span>
                  <span className={styles.replayDate}>{rec.date}</span>
                </div>
              </div>
            ))}
            {recordingsList.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', padding: '1rem 0' }}>No replay playbacks recorded yet.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
