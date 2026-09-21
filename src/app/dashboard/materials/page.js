'use client';

import React, { useState, useEffect } from 'react';
import { getMaterials } from '../../actions';
import styles from '../dashboard.module.css';

export default function MaterialsPage({ activeCourseId = 1 }) {
  const [folders, setFolders] = useState([]);
  const [downloadingName, setDownloadingName] = useState(null);

  useEffect(() => {
    const loadMaterials = async () => {
      const allMaterials = await getMaterials();
      const filtered = allMaterials.filter((m) => m.courseId === activeCourseId);
      setFolders(filtered);
    };

    loadMaterials();
    window.addEventListener('courseChanged', loadMaterials);
    return () => window.removeEventListener('courseChanged', loadMaterials);
  }, [activeCourseId]);

  const handleDownloadAsset = async (asset) => {
    if (!asset.fileId && !asset.url) {
      alert(`Resource "${asset.name}" is a curriculum reference item. Upload genuine files via Admin Command Center.`);
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

  return (
    <div className={styles.simplePageWrapper}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ffffff' }}>
        Reference Materials & Assets
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2rem' }}>
        Browse and download course slideshows, project templates, cheatsheets, and repository assets securely powered by Telegram Storage.
      </p>

      <div className={styles.materialsGrid}>
        {folders.map((folder) => (
          <div key={folder.id} className={styles.materialFolderCard}>
            
            {/* Folder Header */}
            <div className={styles.folderHeader}>
              <svg className={styles.folderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <h3 className={styles.folderTitle}>
                {folder.title}
              </h3>
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
                    title={asset.fileId ? `Download ${asset.name} from Telegram storage` : asset.name}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{isDownloading ? '⏳' : getAssetIcon(asset.type)}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }} title={asset.name}>
                        {asset.name}
                      </span>
                    </span>
                    <span style={{ fontSize: '0.72rem', color: asset.fileId ? 'var(--accent-orange, #f25522)' : 'rgba(255,255,255,0.25)', fontWeight: '600' }}>
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
        ))}
        {folders.length === 0 && (
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', padding: '1rem 0' }}>No files provisioned for this active workspace module.</p>
        )}
      </div>
    </div>
  );
}
