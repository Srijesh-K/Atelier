'use client';

import React, { useState, useEffect } from 'react';
import { getMaterials, getCourses } from '../../actions';
import styles from '../dashboard.module.css';

export default function MaterialsPage({ activeCourseId = 1, enrolledCourses = [] }) {
  const [materials, setMaterials] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [downloadingName, setDownloadingName] = useState(null);
  const [enrolledCount, setEnrolledCount] = useState(enrolledCourses.length);
  const [selectedCohortFilter, setSelectedCohortFilter] = useState('all');

  useEffect(() => {
    const loadMaterialsData = async () => {
      let enrolled = enrolledCourses;
      const profileStr = localStorage.getItem('studentProfile');
      if (profileStr) {
        try {
          const p = JSON.parse(profileStr);
          if (Array.isArray(p.enrolledCourses)) {
            enrolled = p.enrolledCourses;
            setEnrolledCount(p.enrolledCourses.length);
          }
        } catch (e) {}
      }

      if (enrolled.length === 0) {
        setMaterials([]);
        setCoursesList([]);
        return;
      }

      try {
        const [allMaterials, allCourses] = await Promise.all([
          getMaterials(),
          getCourses()
        ]);

        const filteredCourses = allCourses.filter((c) => enrolled.includes(c.id));
        setCoursesList(filteredCourses);

        // Keep only materials belonging to courses the student is enrolled in
        const studentMaterials = allMaterials.filter((m) => enrolled.includes(m.courseId));
        setMaterials(studentMaterials);
      } catch (err) {
        console.error('Error loading materials:', err);
      }
    };

    loadMaterialsData();
    window.addEventListener('courseChanged', loadMaterialsData);
    window.addEventListener('profileChanged', loadMaterialsData);
    return () => {
      window.removeEventListener('courseChanged', loadMaterialsData);
      window.removeEventListener('profileChanged', loadMaterialsData);
    };
  }, [activeCourseId]);

  const handleDownloadAsset = async (asset) => {
    if (!asset.fileId && !asset.url) {
      alert(`"${asset.name}" is currently being prepared. Check back shortly!`);
      return;
    }

    try {
      setDownloadingName(asset.name);
      const email = localStorage.getItem('loggedInStudentEmail') || '';
      const targetUrl = asset.url || `/api/files/${asset.fileId}`;
      const urlWithAuth = `${targetUrl}?download=1&email=${encodeURIComponent(email)}`;

      const res = await fetch(urlWithAuth);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Download failed: HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.download = asset.name;
      document.body.appendChild(tempLink);
      tempLink.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(tempLink);
    } catch (err) {
      console.error('Download asset error:', err);
      alert(`Error downloading ${asset.name}: ${err.message}`);
    } finally {
      setDownloadingName(null);
    }
  };

  const getAssetIcon = (type) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'zip':
        return '📦';
      case 'link':
        return '🔗';
      default:
        return '📝';
    }
  };

  if (enrolledCount === 0) {
    return (
      <div className={styles.simplePageWrapper}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ffffff' }}>
          Reference Materials & Assets
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2rem' }}>
          Browse and download course slideshows, project templates, cheatsheets, and source code assets.
        </p>

        <div style={{ padding: '3.5rem 2rem', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(242, 85, 34, 0.08)', border: '1px solid rgba(242, 85, 34, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: 'var(--accent-orange)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: '#ffffff', fontSize: '1.15rem', marginBottom: '0.5rem' }}>No Active Cohort Enrollment</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1.75rem', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto 1.75rem' }}>
            Reference materials, architectural blueprints, and starter repositories unlock when enrolled in a cohort track.
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

  // Filter folders by active tab
  const displayedFolders = selectedCohortFilter === 'all'
    ? materials
    : materials.filter((m) => String(m.courseId) === selectedCohortFilter);

  return (
    <div className={styles.simplePageWrapper}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ffffff' }}>
        Reference Materials & Assets
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.75rem' }}>
        Browse and download course slideshows, project templates, cheatsheets, and source code assets across your enrolled tracks.
      </p>

      {/* Cohort Tabs if multiple enrolled courses */}
      {coursesList.length > 1 && (
        <div className={styles.materialFilterTabs}>
          <button
            type="button"
            className={`${styles.materialFilterTab} ${selectedCohortFilter === 'all' ? styles.materialFilterTabActive : ''}`}
            onClick={() => setSelectedCohortFilter('all')}
          >
            All Tracks ({materials.length})
          </button>
          {coursesList.map((c) => {
            const count = materials.filter((m) => m.courseId === c.id).length;
            const isSelected = selectedCohortFilter === String(c.id);
            const rawTitle = c?.title || `Cohort #${c.id}`;
            const title = rawTitle.includes(':') ? rawTitle.split(':')[0].trim() : rawTitle;
            return (
              <button
                key={c.id}
                type="button"
                className={`${styles.materialFilterTab} ${isSelected ? styles.materialFilterTabActive : ''}`}
                onClick={() => setSelectedCohortFilter(String(c.id))}
              >
                {title} ({count})
              </button>
            );
          })}
        </div>
      )}

      <div className={styles.materialsGrid}>
        {displayedFolders.map((folder) => {
          const matchedCourse = coursesList.find((c) => c && Number(c.id) === Number(folder.courseId));
          const rawBadgeTitle = matchedCourse?.title || `Track #${folder.courseId}`;
          const courseBadgeTitle = rawBadgeTitle.includes(':') ? rawBadgeTitle.split(':')[0].trim() : rawBadgeTitle;

          return (
            <div key={folder.id} className={styles.materialFolderCard}>
              
              {/* Folder Header */}
              <div className={styles.folderHeader}>
                <svg className={styles.folderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0, flex: 1 }}>
                  {coursesList.length > 1 && (
                    <span className={styles.materialCourseBadge}>{courseBadgeTitle}</span>
                  )}
                  <h3 className={styles.folderTitle}>
                    {folder.title}
                  </h3>
                </div>
              </div>

              {/* Folder assets */}
              <div className={styles.folderAssetList}>
                {folder.assets && folder.assets.map((asset, idx) => {
                  const isDownloading = downloadingName === asset.name;
                  return (
                    <div 
                      key={idx} 
                      className={styles.assetLink}
                      onClick={() => handleDownloadAsset(asset)}
                      style={{ cursor: isDownloading ? 'wait' : 'pointer', opacity: isDownloading ? 0.7 : 1 }}
                      title={asset.name}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                        <span>{isDownloading ? '⏳' : getAssetIcon(asset.type)}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }} title={asset.name}>
                          {asset.name}
                        </span>
                      </span>
                      <span style={{ fontSize: '0.72rem', color: asset.fileId ? 'var(--accent-orange, #f25522)' : 'rgba(255,255,255,0.25)', fontWeight: '600', flexShrink: 0 }}>
                        {isDownloading ? 'Downloading...' : asset.size}
                      </span>
                    </div>
                  );
                })}
                {(!folder.assets || folder.assets.length === 0) && (
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)', padding: '0.5rem 0' }}>No assets in this module.</p>
                )}
              </div>

            </div>
          );
        })}
        {displayedFolders.length === 0 && (
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', padding: '1rem 0' }}>No files provisioned for this active track.</p>
        )}
      </div>
    </div>
  );
}
