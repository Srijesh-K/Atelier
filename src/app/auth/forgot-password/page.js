'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { resetStudentPassword } from '../../actions';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await resetStudentPassword(email.trim(), phone.trim(), password);
      if (res && res.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Background layers */}
      <div className={styles.bgGrid} />
      <div className={styles.glow} />

      {/* Form card */}
      <div className={styles.card}>
        <div className={styles.badge}>PASSWORD RESET</div>
        <h1 className={styles.heading}>Reset Password</h1>
        <p className={styles.subtext}>
          Remember your credentials?{' '}
          <Link href="/auth/signin">Sign In</Link>
        </p>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <p style={{ color: '#34c759', fontSize: '0.95rem', background: 'rgba(52, 199, 89, 0.06)', border: '1px solid rgba(52, 199, 89, 0.15)', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
              Password updated successfully!
            </p>
            <Link href="/auth/signin" className={styles.submitBtn}>
              Back to Sign In
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            {error && (
              <p style={{ color: '#ff4d4d', fontSize: '0.8rem', background: 'rgba(255, 77, 77, 0.06)', border: '1px solid rgba(255, 77, 77, 0.15)', padding: '0.6rem 0.8rem', borderRadius: '4px', marginBottom: '1.2rem', fontFamily: 'monospace' }}>
                {error}
              </p>
            )}

            <div className={styles.fieldGroup}>
              {/* Email */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="forgot-email">
                  Email
                </label>
                <input
                  id="forgot-email"
                  className={styles.input}
                  type="email"
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Phone */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="forgot-phone">
                  Phone Number
                </label>
                <input
                  id="forgot-phone"
                  className={styles.input}
                  type="tel"
                  required
                  placeholder="+91 99999 99999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* New Password */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="forgot-password">
                  New Password
                </label>
                <input
                  id="forgot-password"
                  className={styles.input}
                  type="password"
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Confirm Password */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="forgot-confirm-password">
                  Confirm New Password
                </label>
                <input
                  id="forgot-confirm-password"
                  className={styles.input}
                  type="password"
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>
        )}

        {/* Card footer */}
        <p className={styles.cardFooter}>
          New to Atelier?{' '}
          <Link href="/auth/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
