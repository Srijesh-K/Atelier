'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getStudentProfileByEmail, updateStudentProfile, updateStudentAvatar } from '../../actions';
import InitialsAvatar from '@/components/InitialsAvatar';
import styles from '../dashboard.module.css';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    degree: '',
    gradYear: '2026',
    bio: '',
    github: '',
    linkedin: '',
    portfolio: '',
    avatar: null,
    skills: ['React', 'Next.js', 'Node.js', 'System Design']
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [streak, setStreak] = useState(1);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Hydrate instantly from cache & load from database on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('studentProfile');
      if (cached) {
        const student = JSON.parse(cached);
        const profileObj = {
          name: student.name || '',
          email: student.email || '',
          phone: student.phone || '',
          college: student.college && !student.college.includes('Not specified') ? student.college : '',
          degree: student.degree || '',
          gradYear: student.gradYear || '2026',
          bio: student.bio && !student.bio.includes('Initialized workspace') ? student.bio : '',
          github: student.github || '',
          linkedin: student.linkedin || '',
          portfolio: student.portfolio || '',
          avatar: student.avatar || null,
          skills: student.skills && student.skills.length > 0 ? student.skills : ['React', 'Next.js', 'Node.js']
        };
        setProfile(profileObj);
        setFormData(profileObj);
        setStreak(student.streak || 1);
        setEnrolledCount(Array.isArray(student.enrolledCourses) ? student.enrolledCourses.length : 0);
      }
    } catch (e) {}

    const loadProfile = async () => {
      const email = localStorage.getItem('loggedInStudentEmail');
      if (!email) return;
      const student = await getStudentProfileByEmail(email);

      if (student) {
        const profileObj = {
          name: student.name || '',
          email: student.email || '',
          phone: student.phone || '',
          college: student.college && !student.college.includes('Not specified') ? student.college : '',
          degree: student.degree || '',
          gradYear: student.gradYear || '2026',
          bio: student.bio && !student.bio.includes('Initialized workspace') ? student.bio : '',
          github: student.github || '',
          linkedin: student.linkedin || '',
          portfolio: student.portfolio || '',
          avatar: student.avatar || null,
          skills: student.skills && student.skills.length > 0 ? student.skills : ['React', 'Next.js', 'Node.js']
        };
        setProfile(profileObj);
        setFormData(profileObj);
        setStreak(student.streak || 1);
        setEnrolledCount(Array.isArray(student.enrolledCourses) ? student.enrolledCourses.length : 0);
      }
    };
    
    loadProfile();
    window.addEventListener('profileChanged', loadProfile);
    return () => window.removeEventListener('profileChanged', loadProfile);
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (e.g. JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds the 50 MB limit.');
      return;
    }

    setUploadingAvatar(true);
    setStatusMessage('Uploading profile picture...');

    try {
      const email = localStorage.getItem('loggedInStudentEmail');
      const body = new FormData();
      body.append('file', file);
      body.append('category', 'avatar');
      if (email) body.append('userEmail', email);

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        headers: email ? { 'x-user-email': email } : {},
        body
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload avatar.');
      }

      const avatarUrl = data.file.url;
      const student = await getStudentProfileByEmail(email);
      if (student) {
        await updateStudentAvatar(student.id, avatarUrl);
      }

      // Update cached session profile avatar immediately
      const cached = localStorage.getItem('studentProfile');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          parsed.avatar = avatarUrl;
          localStorage.setItem('studentProfile', JSON.stringify(parsed));
        } catch (e) {}
      }

      setProfile(prev => ({ ...prev, avatar: avatarUrl }));
      setFormData(prev => ({ ...prev, avatar: avatarUrl }));
      setStatusMessage('Profile picture updated successfully!');
      setTimeout(() => setStatusMessage(''), 4000);
      window.dispatchEvent(new Event('profileChanged'));
    } catch (err) {
      console.error('Avatar upload error:', err);
      alert('Error uploading avatar: ' + err.message);
      setStatusMessage('');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };


  // Calculate actual Profile Completion Percentage (0-100%)
  const completionStats = useMemo(() => {
    const target = isEditing ? formData : profile;
    let score = 0;
    const missing = [];

    if (target.name && target.name.trim()) score += 10; else missing.push('Full Name');
    if (target.email && target.email.trim()) score += 10; else missing.push('Email Address');
    if (target.phone && target.phone.trim()) score += 10; else missing.push('Phone Number');
    if (target.college && target.college.trim()) score += 10; else missing.push('College / University');
    if (target.degree && target.degree.trim()) score += 10; else missing.push('Degree / Major');
    if (target.gradYear && target.gradYear.trim()) score += 10; else missing.push('Graduation Year');
    if (target.bio && target.bio.trim()) score += 10; else missing.push('Bio / Summary');
    if (target.github && target.github.trim()) score += 10; else missing.push('GitHub Link');
    if ((target.linkedin && target.linkedin.trim()) || (target.portfolio && target.portfolio.trim())) score += 10; else missing.push('LinkedIn or Portfolio');
    if (Array.isArray(target.skills) && target.skills.length >= 3) score += 10; else missing.push('Technical Skills (min 3)');

    return { score, missing };
  }, [profile, formData, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const skillName = newSkillInput.trim();
    if (!formData.skills.includes(skillName)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, skillName] }));
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    if (!isEditing) return;
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      const email = localStorage.getItem('loggedInStudentEmail');
      if (!email) return;
      const student = await getStudentProfileByEmail(email);
      
      if (student) {
        await updateStudentProfile(
          student.id,
          formData.name,
          formData.email,
          formData.phone,
          formData.college,
          formData.degree,
          formData.gradYear,
          formData.bio,
          formData.github,
          formData.linkedin,
          formData.portfolio,
          formData.skills
        );

        setProfile(formData);
        
        // Update cached session profile
        const cached = localStorage.getItem('studentProfile');
        let parsed = {};
        try { parsed = JSON.parse(cached || '{}'); } catch (err) {}
        localStorage.setItem('studentProfile', JSON.stringify({
          ...parsed,
          ...formData,
          streak: student.streak || streak || 1,
          enrolledCourses: student.enrolledCourses || []
        }));

        // Keep loggedInStudentEmail synced in case email changes
        if (formData.email && formData.email.toLowerCase() !== email.toLowerCase()) {
          localStorage.setItem('loggedInStudentEmail', formData.email.toLowerCase());
        }
        
        window.dispatchEvent(new Event('profileChanged'));
        window.dispatchEvent(new Event('courseChanged'));
        
        setIsEditing(false);
        setStatusMessage('Profile updated successfully.');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Error updating profile. Please try again.');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  return (
    <div className={styles.simplePageWrapper}>
      {statusMessage && (
        <div style={{ position: 'fixed', top: '5rem', right: '2rem', background: '#08080a', border: '1px solid var(--accent-orange)', padding: '0.85rem 1.25rem', borderRadius: '8px', color: '#ffffff', zIndex: 1000, boxShadow: '0 12px 36px rgba(0,0,0,0.8), 0 0 20px rgba(242, 85, 34, 0.2)', fontFamily: 'var(--font-heading)', fontSize: '0.85rem', animation: 'fadeIn 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ color: 'var(--accent-orange)' }}>◆</span>
          {statusMessage}
        </div>
      )}

      {/* Profile Completion Bar Banner */}
      <div style={{
        background: '#08080a',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: '14px',
        padding: '1.5rem 1.75rem',
        marginBottom: '1.75rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: '800', color: '#ffffff' }}>
              Profile Completion
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              background: completionStats.score === 100 ? 'rgba(48, 209, 88, 0.15)' : 'rgba(242, 85, 34, 0.12)',
              color: completionStats.score === 100 ? '#30d158' : 'var(--accent-orange)',
              border: `1px solid ${completionStats.score === 100 ? 'rgba(48, 209, 88, 0.3)' : 'rgba(242, 85, 34, 0.3)'}`
            }}>
              {completionStats.score}% Complete
            </span>
          </div>

          <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.45)', fontWeight: '500' }}>
            {completionStats.score === 100 ? '✓ Profile Complete' : `${completionStats.missing.length} field${completionStats.missing.length > 1 ? 's' : ''} remaining`}
          </span>
        </div>

        {/* Bar */}
        <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.75rem' }}>
          <div style={{
            height: '100%',
            width: `${completionStats.score}%`,
            background: completionStats.score === 100 
              ? 'linear-gradient(90deg, #30d158 0%, #34c759 100%)' 
              : 'linear-gradient(90deg, var(--accent-orange) 0%, #ff8c42 100%)',
            borderRadius: '10px',
            transition: 'width 0.4s ease'
          }} />
        </div>

        {/* Missing fields hints */}
        {completionStats.missing.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.35)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '700' }}>
              Suggestions:
            </span>
            {completionStats.missing.slice(0, 4).map((m, idx) => (
              <span key={idx} style={{ fontSize: '0.72rem', color: 'rgba(242, 85, 34, 0.85)', background: 'rgba(242, 85, 34, 0.05)', border: '1px solid rgba(242, 85, 34, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                + Add {m}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.profileContainer}>
        
        {/* Left Column: Avatar & Summary */}
        <div className={styles.cardPanel} style={{ height: 'fit-content' }}>
          <div className={styles.profileSidebarCard}>
            <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 1rem' }}>
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Student Profile Avatar"
                  className={styles.profileAvatarLarge}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <InitialsAvatar
                  name={profile.name || 'Student Builder'}
                  size={96}
                  fontSize={36}
                  className={styles.profileAvatarLarge}
                />
              )}
              <label
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  background: 'var(--accent-orange, #f25522)',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: uploadingAvatar ? 'wait' : 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  fontSize: '14px',
                  border: '2px solid #141416'
                }}
                title={uploadingAvatar ? 'Uploading...' : 'Upload new photo'}
              >
                {uploadingAvatar ? '⏳' : '📷'}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
            <h3 className={styles.profileNameLarge}>{profile.name || 'Student Builder'}</h3>
            <span className={styles.profileRoleBadge}>Premium Cohort</span>
            
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: '1.5', margin: '0 0 1.75rem 0' }}>
              {profile.bio || "Aspiring Software Engineer learning modern web architectures and systems."}
            </p>

            <div className={styles.profileStatRow}>
              <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>Daily Streak</span>
                <p style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--accent-orange)', marginTop: '0.25rem' }}>{streak} Days</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>Cohorts</span>
                <p style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff', marginTop: '0.25rem' }}>{enrolledCount} Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Details Form */}
        <div className={styles.cardPanel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 className={styles.cardTitle} style={{ marginBottom: '0.25rem' }}>Student Profile Details</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>
                Manage your credentials, educational background, portfolio, and active tech stack.
              </p>
            </div>
            {!isEditing && (
              <button 
                className={styles.onboardBtn}
                style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div className={styles.profileFormGrid}>
              
              {/* Full Name */}
              <div className={styles.profileFormGroup}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={isEditing ? formData.name : profile.name} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={styles.profileInput} 
                />
              </div>

              {/* Email Address */}
              <div className={styles.profileFormGroup}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={isEditing ? formData.email : profile.email} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={styles.profileInput} 
                />
              </div>

              {/* Phone Number */}
              <div className={styles.profileFormGroup}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="+91 98765 43210"
                  value={isEditing ? formData.phone : profile.phone} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={styles.profileInput} 
                />
              </div>

              {/* College / University */}
              <div className={styles.profileFormGroup}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>College / University</label>
                <input 
                  type="text" 
                  name="college" 
                  placeholder="e.g. National Institute of Technology"
                  value={isEditing ? formData.college : profile.college} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={styles.profileInput} 
                />
              </div>

              {/* Degree / Branch */}
              <div className={styles.profileFormGroup}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Degree / Major</label>
                <input 
                  type="text" 
                  name="degree" 
                  placeholder="e.g. B.Tech in Computer Science"
                  value={isEditing ? formData.degree : profile.degree} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={styles.profileInput} 
                />
              </div>

              {/* Graduation Year */}
              <div className={styles.profileFormGroup}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Graduation Year</label>
                <input 
                  type="number" 
                  name="gradYear" 
                  placeholder="2026"
                  value={isEditing ? formData.gradYear : profile.gradYear} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={styles.profileInput} 
                />
              </div>

              {/* Bio */}
              <div className={`${styles.profileFormGroup} ${styles.profileFullRow}`}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bio / Developer Summary</label>
                <textarea 
                  name="bio" 
                  placeholder="Tell us about your background, what you are building, and your engineering goals..."
                  value={isEditing ? formData.bio : profile.bio} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={styles.profileTextarea} 
                />
              </div>

              {/* GitHub */}
              <div className={styles.profileFormGroup}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>GitHub Profile</label>
                <input 
                  type="url" 
                  name="github" 
                  value={isEditing ? formData.github : profile.github} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="https://github.com/username"
                  className={styles.profileInput} 
                />
              </div>

              {/* LinkedIn */}
              <div className={styles.profileFormGroup}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>LinkedIn Profile</label>
                <input 
                  type="url" 
                  name="linkedin" 
                  value={isEditing ? formData.linkedin : profile.linkedin} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="https://linkedin.com/in/username"
                  className={styles.profileInput} 
                />
              </div>

              {/* Portfolio */}
              <div className={`${styles.profileFormGroup} ${styles.profileFullRow}`}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Personal Portfolio Website</label>
                <input 
                  type="url" 
                  name="portfolio" 
                  value={isEditing ? formData.portfolio : profile.portfolio} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="https://yourname.dev"
                  className={styles.profileInput} 
                />
              </div>

              {/* Core Skills */}
              <div className={`${styles.profileFormGroup} ${styles.profileFullRow}`} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Technical Stack & Skills</label>
                <div className={styles.profileSkillsList}>
                  {(isEditing ? formData.skills : profile.skills).map((skill, idx) => (
                    <span key={idx} className={styles.profileSkillTag} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {skill}
                      {isEditing && (
                        <span 
                          onClick={() => handleRemoveSkill(skill)}
                          style={{ cursor: 'pointer', opacity: 0.6, fontSize: '0.9rem', marginLeft: '2px' }}
                          title="Remove skill"
                        >
                          ×
                        </span>
                      )}
                    </span>
                  ))}
                </div>

                {isEditing && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', maxWidth: '380px' }}>
                    <input 
                      type="text"
                      placeholder="Add a new skill (e.g. Docker, Redis)"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      className={styles.profileInput}
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill(e);
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={handleAddSkill}
                      className={styles.onboardBtn}
                      style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.78rem' }}
                    >
                      + Add
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Save Actions */}
            {isEditing && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className={styles.onboardBtnDisabled}
                  style={{ width: 'auto', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                  onClick={() => {
                    setFormData({ ...profile });
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.onboardBtn}
                  style={{ width: 'auto', padding: '0.85rem 2rem' }}
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
