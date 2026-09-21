'use client';

import React, { useState, useEffect } from 'react';
import { updateMentorProfile, changeMentorPassword } from '@/app/actions';
import InitialsAvatar from '@/components/InitialsAvatar';
import styles from '../mentor.module.css';

export default function MentorProfilePage() {
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [expertise, setExpertise] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const profileStr = localStorage.getItem('mentorProfile');
    if (profileStr) {
      try {
        const parsed = JSON.parse(profileStr);
        setMentor(parsed);
        setName(parsed.name || '');
        setPhone(parsed.phone || '');
        setExpertise(parsed.expertise || '');
        setBio(parsed.bio || '');
        setAvatar(parsed.avatar || null);
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Avatar size must be under 10 MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('category', 'avatar');

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'x-admin-key': 'ARSHAD-SAMVRUDHI'
        },
        body
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image.');
      }

      setAvatar(data.file.url);
    } catch (err) {
      console.error(err);
      alert('Avatar upload failed: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setSavingProfile(true);

    try {
      const res = await updateMentorProfile(mentor.id, {
        name,
        phone,
        expertise,
        bio,
        avatar
      });

      if (!res.success) {
        setProfileError(res.error || 'Failed to update profile.');
        return;
      }

      // Update local storage
      const updatedMentor = { ...mentor, name, phone, expertise, bio, avatar };
      setMentor(updatedMentor);
      localStorage.setItem('mentorProfile', JSON.stringify(updatedMentor));

      setProfileSuccess('Profile updated successfully!');
      window.dispatchEvent(new Event('mentorProfileChanged'));
    } catch (err) {
      setProfileError(err.message || 'Error updating profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setChangingPassword(true);

    try {
      const res = await changeMentorPassword(mentor.id, currentPassword, newPassword);

      if (!res.success) {
        setPasswordError(res.error || 'Failed to change password.');
        return;
      }

      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Error changing password.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.contentWrapper} style={{ color: 'rgba(255,255,255,0.4)' }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className={styles.contentWrapper}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.35rem' }}>
          Mentor Profile & Security
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          Manage your personal details, expertise focus, profile photo, and account credentials.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Profile Information Panel */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Profile Information</h2>
          </div>

          {profileSuccess && (
            <div style={{ background: 'rgba(48, 209, 88, 0.12)', border: '1px solid rgba(48, 209, 88, 0.3)', color: '#30d158', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '1.25rem' }}>
              {profileSuccess}
            </div>
          )}

          {profileError && (
            <div className={styles.errorBanner}>
              {profileError}
            </div>
          )}

          {/* Avatar Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.15)' }}
              />
            ) : (
              <InitialsAvatar name={name || 'Mentor'} size={68} />
            )}

            <div>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.95rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: uploadingAvatar ? 'wait' : 'pointer'
                }}
              >
                {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar(null)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', cursor: 'pointer', marginLeft: '0.75rem' }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input
                type="text"
                required
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                className={styles.input}
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                value={mentor?.email || ''}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Phone Number</label>
              <input
                type="tel"
                className={styles.input}
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Expertise Focus</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Distributed Systems, Rust & Kernel Dev"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Biography</label>
              <textarea
                className={styles.textarea}
                placeholder="A short description of your background and domain expertise..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className={styles.primaryBtn}
              style={{ width: 'auto' }}
              disabled={savingProfile}
            >
              {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Panel */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Change Password</h2>
          </div>

          {passwordSuccess && (
            <div style={{ background: 'rgba(48, 209, 88, 0.12)', border: '1px solid rgba(48, 209, 88, 0.3)', color: '#30d158', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '1.25rem' }}>
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className={styles.errorBanner}>
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Current Password</label>
              <input
                type="password"
                required
                className={styles.input}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>New Password</label>
              <input
                type="password"
                required
                className={styles.input}
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Confirm New Password</label>
              <input
                type="password"
                required
                className={styles.input}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className={styles.primaryBtn}
              style={{ width: 'auto' }}
              disabled={changingPassword}
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
