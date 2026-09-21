'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getMentorCourses } from '@/app/actions';
import InitialsAvatar from '@/components/InitialsAvatar';
import styles from './mentor.module.css';

export default function MentorLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mentor, setMentor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === '/mentor/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('mentorSessionToken');
    const profileStr = localStorage.getItem('mentorProfile');

    if (!token || !profileStr) {
      router.push('/mentor/login');
      return;
    }

    try {
      const parsed = JSON.parse(profileStr);
      setMentor(parsed);

      getMentorCourses(parsed.id)
        .then((assigned) => setCourses(assigned || []))
        .catch((err) => console.error('Failed to fetch mentor courses:', err))
        .finally(() => setLoading(false));
    } catch (e) {
      router.push('/mentor/login');
    }
  }, [pathname, isLoginPage]);

  // Handle mentor sign out
  const handleSignOut = () => {
    localStorage.removeItem('mentorSessionToken');
    localStorage.removeItem('mentorProfile');
    router.push('/mentor/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>
        Loading Mentor Workspace...
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <img src="/logo.png" alt="Atelier" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <div>
            <div className={styles.brandName}>Atelier</div>
            <div className={styles.brandRole}>Mentor Portal</div>
          </div>
        </div>

        <nav className={styles.sidebarSection}>
          <Link
            href="/mentor"
            className={`${styles.navLink} ${pathname === '/mentor' ? styles.navLinkActive : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </Link>

          <Link
            href="/mentor/profile"
            className={`${styles.navLink} ${pathname === '/mentor/profile' ? styles.navLinkActive : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile & Settings
          </Link>

          <div className={styles.sidebarLabel}>Assigned Cohorts</div>
          {courses.map((course) => {
            const isActive = pathname === `/mentor/courses/${course.id}`;
            const shortTitle = course.title.includes(':') ? course.title.split(':')[0] : course.title;

            return (
              <Link
                key={course.id}
                href={`/mentor/courses/${course.id}`}
                className={`${styles.sidebarCourseItem} ${isActive ? styles.sidebarCourseActive : ''}`}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {shortTitle}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
                  &rarr;
                </span>
              </Link>
            );
          })}

          {courses.length === 0 && (
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', padding: '0.5rem 0.85rem' }}>
              No cohorts assigned yet. Contact administrator.
            </span>
          )}
        </nav>

        {/* Sidebar Footer / Mentor Identity */}
        <div className={styles.sidebarFooter}>
          <div className={styles.mentorRow}>
            {mentor?.avatar ? (
              <img src={mentor.avatar} alt={mentor.name} className={styles.mentorAvatar} />
            ) : (
              <InitialsAvatar name={mentor?.name || 'Mentor'} size={34} />
            )}
            <div className={styles.mentorInfo}>
              <div className={styles.mentorName}>{mentor?.name}</div>
              <div className={styles.mentorEmail}>{mentor?.email}</div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className={styles.logoutBtn}
            title="Sign Out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
