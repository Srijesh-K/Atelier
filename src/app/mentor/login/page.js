'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mentorLogin, changeMentorPassword } from '@/app/actions';
import styles from '../mentor.module.css';

export default function MentorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forced password reset state
  const [showResetModal, setShowResetModal] = useState(false);
  const [tempMentor, setTempMentor] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetting, setResetting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await mentorLogin(email, password);

      if (!res.success) {
        setErrorMessage(res.error || 'Invalid email or password credentials.');
        return;
      }

      if (res.mustChangePassword) {
        // Mentor must reset temporary password before accessing workspace
        setTempMentor(res.mentor);
        setShowResetModal(true);
        return;
      }

      // Successful login
      localStorage.setItem('mentorSessionToken', res.token);
      localStorage.setItem('mentorProfile', JSON.stringify(res.mentor));
      router.push('/mentor');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Network error during login.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setResetError('');

    if (newPassword.length < 8) {
      setResetError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetting(true);

    try {
      const res = await changeMentorPassword(tempMentor.id, password, newPassword);

      if (!res.success) {
        setResetError(res.error || 'Failed to update password.');
        return;
      }

      // Automatically log the mentor in with new session token
      localStorage.setItem('mentorSessionToken', res.token);
      localStorage.setItem('mentorProfile', JSON.stringify(res.mentor));
      router.push('/mentor');
    } catch (err) {
      console.error(err);
      setResetError(err.message || 'Error updating password.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <img src="/logo.png" alt="Atelier" className={styles.loginLogo} />
          <h1 className={styles.loginTitle}>Atelier Mentor Portal</h1>
          <p className={styles.loginSubtitle}>Sign in to manage your cohorts, live sessions & syllabus</p>
        </div>

        {errorMessage && (
          <div className={styles.errorBanner}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              required
              className={styles.input}
              placeholder="mentor@atelier.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              required
              className={styles.input}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In as Mentor'}
          </button>
        </form>
      </div>

      {/* Forced Password Reset Modal */}
      {showResetModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Set New Secure Password</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem' }}>
              Welcome to the Atelier Mentor Portal. Because this is your initial sign-in, security policy requires you to replace your temporary password with a personal password.
            </p>

            {resetError && (
              <div className={styles.errorBanner}>
                {resetError}
              </div>
            )}

            <form onSubmit={handlePasswordChange}>
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

              <div className={styles.modalFooter}>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={resetting}
                >
                  {resetting ? 'Securing Account...' : 'Set Password & Enter Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
