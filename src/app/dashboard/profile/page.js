'use client';

import React, { useState, useEffect } from 'react';
import { getStudents, updateStudentProfile } from '../../actions';
import styles from '../dashboard.module.css';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Student Builder',
    email: '',
    phone: '',
    college: 'KVG College of Engineering',
    gradYear: '2027',
    bio: 'Student developer learning modern full stack engineering and system design at Sphere Hive.',
    github: '',
    linkedin: '',
    portfolio: '',
    skills: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'System Design']
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });
  const [statusMessage, setStatusMessage] = useState('');
  const [xp, setXp] = useState(100);
  const [streak, setStreak] = useState(1);

  // Load from database on mount
  useEffect(() => {
    const loadProfile = async () => {
      const email = localStorage.getItem('loggedInStudentEmail');
      if (!email) return;
      const studentsList = await getStudents();
      const student = studentsList.find((s) => s.email.toLowerCase() === email.toLowerCase());

      if (student) {
        const profileObj = {
          name: student.name || '',
          email: student.email || '',
          phone: student.phone || '',
          college: student.college || '',
          gradYear: student.gradYear || '',
          bio: student.bio || 'Aspiring Full Stack Engineer and AI enthusiast.',
          github: student.github || '',
          linkedin: student.linkedin || '',
          portfolio: student.portfolio || '',
          skills: student.skills || ['React', 'Next.js', 'Node.js', 'System Design']
        };
        setProfile(profileObj);
        setFormData(profileObj);
        setXp(student.xp || 0);
        setStreak(student.streak || 0);
      }
    };
    
    loadProfile();
    window.addEventListener('profileChanged', loadProfile);
    return () => window.removeEventListener('profileChanged', loadProfile);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      const email = localStorage.getItem('loggedInStudentEmail');
      if (!email) return;
      const studentsList = await getStudents();
      const student = studentsList.find((s) => s.email.toLowerCase() === email.toLowerCase());
      
      if (student) {
        await updateStudentProfile(
          student.id,
          formData.name,
          formData.email,
          formData.phone,
          formData.college,
          formData.gradYear,
          formData.bio,
          formData.github,
          formData.linkedin,
          formData.portfolio,
          formData.skills
        );

        setProfile(formData);
        localStorage.setItem('studentProfile', JSON.stringify(formData));

        // Keep loggedInStudentEmail synced in case email changes
        if (formData.email && formData.email.toLowerCase() !== email.toLowerCase()) {
          localStorage.setItem('loggedInStudentEmail', formData.email.toLowerCase());
        }
        
        // Dispatch event to sync username changes in the sidebar layout
        window.dispatchEvent(new Event('profileChanged'));
        window.dispatchEvent(new Event('courseChanged'));
        
        setIsEditing(false);
        setStatusMessage('Profile node updated successfully.');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Error updating profile.');
    }
  };

  return (
    <div className={styles.simplePageWrapper}>
      {statusMessage && (
        <div style={{ position: 'fixed', top: '2rem', right: '2rem', background: '#09090a', border: '1px solid var(--accent-orange)', padding: '1rem 1.5rem', borderRadius: '6px', color: '#ffffff', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontFamily: 'var(--font-heading)', fontSize: '0.85rem', animation: 'fadeIn 0.3s ease' }}>
          <span style={{ color: 'var(--accent-orange)', marginRight: '0.5rem' }}>◆</span>
          {statusMessage}
        </div>
      )}

      <div className={styles.profileContainer}>
        
        {/* Left Column: Avatar & Summary */}
        <div className={styles.cardPanel} style={{ height: 'fit-content' }}>
          <div className={styles.profileSidebarCard}>
            <img src="/images/avatar1.jpg" alt="Student Large Profile" className={styles.profileAvatarLarge} />
            <h3 className={styles.profileNameLarge}>{profile.name}</h3>
            <span className={styles.profileRoleBadge}>Premium Cohort</span>
            
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
              {profile.bio || "No bio added yet."}
            </p>

            <div className={styles.profileStatRow}>
              <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: '600' }}>XP Points</span>
                <p style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', marginTop: '0.2rem' }}>{xp}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: '600' }}>Day Streak</span>
                <p style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-orange)', marginTop: '0.2rem' }}>{streak} Days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Details Form */}
        <div className={styles.cardPanel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 className={styles.cardTitle} style={{ marginBottom: '0.25rem' }}>Student Profile Details</h3>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
                View and edit your workspace details, cohort credentials, and portfolio links.
              </p>
            </div>
            {!isEditing && (
              <button 
                className={styles.onboardBtn}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div className={styles.profileFormGrid}>
              
              {/* Name */}
              <div className={styles.profileFormGroup}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Full Name</label>
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

              {/* Email */}
              <div className={styles.profileFormGroup}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email Address</label>
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

              {/* Phone */}
              <div className={styles.profileFormGroup}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={isEditing ? formData.phone : profile.phone} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={styles.profileInput} 
                />
              </div>

              {/* College */}
              <div className={styles.profileFormGroup}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>College / University</label>
                <input 
                  type="text" 
                  name="college" 
                  value={isEditing ? formData.college : profile.college} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={styles.profileInput} 
                />
              </div>

              {/* Graduation Year */}
              <div className={styles.profileFormGroup}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Graduation Year</label>
                <input 
                  type="number" 
                  name="gradYear" 
                  value={isEditing ? formData.gradYear : profile.gradYear} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={styles.profileInput} 
                />
              </div>

              {/* Bio */}
              <div className={`${styles.profileFormGroup} ${styles.profileFullRow}`}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bio / Summary</label>
                <textarea 
                  name="bio" 
                  value={isEditing ? formData.bio : profile.bio} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={styles.profileTextarea} 
                />
              </div>

              {/* GitHub */}
              <div className={styles.profileFormGroup}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>GitHub Link</label>
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
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>LinkedIn Link</label>
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
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Portfolio Website</label>
                <input 
                  type="url" 
                  name="portfolio" 
                  value={isEditing ? formData.portfolio : profile.portfolio} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="https://portfolio.com"
                  className={styles.profileInput} 
                />
              </div>

              {/* Skills */}
              <div className={`${styles.profileFormGroup} ${styles.profileFullRow}`} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Core Skills Tags</label>
                <div className={styles.profileSkillsList}>
                  {profile.skills.map((skill, idx) => (
                    <span key={idx} className={styles.profileSkillTag}>{skill}</span>
                  ))}
                  {isEditing && (
                    <span 
                      style={{ fontSize: '0.75rem', background: 'rgba(242, 85, 34, 0.05)', border: '1px dashed rgba(242, 85, 34, 0.3)', color: 'var(--accent-orange)', padding: '0.3rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                      onClick={() => {
                        const newSkill = prompt('Enter a new skill tag:');
                        if (newSkill && newSkill.trim()) {
                          const updatedSkills = [...formData.skills, newSkill.trim()];
                          setFormData((prev) => ({ ...prev, skills: updatedSkills }));
                          setProfile((prev) => ({ ...prev, skills: updatedSkills }));
                        }
                      }}
                    >
                      + Add Skill
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* Save Buttons */}
            {isEditing && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className={styles.onboardBtnDisabled}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
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
