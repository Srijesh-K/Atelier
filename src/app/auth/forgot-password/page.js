'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { requestPasswordReset, verifyAndResetPassword } from '../../actions';
import styles from '../auth.module.css';

function getStrength(pw) {
  if (!pw) return { score: 0, label: '' };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score: s, label: labels[s] };
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: request code, 2: verify & reset, 3: success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);

  // Step 1: Request 6-digit code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await requestPasswordReset(email.trim());
      if (res && res.success) {
        if (res.code) {
          setDemoCode(res.code);
        }
        setStep(2);
      } else {
        setError(res?.error || "We couldn't process this request. Please check the email address and try again.");
      }
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('Server Components render') || msg.includes('digest')) {
        setError("No account found with this email address. Please check your spelling or sign up.");
      } else {
        setError(msg || "We couldn't process this request. Please check the email address and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code and update password
  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setError('');

    if (code.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter them.');
      return;
    }

    setLoading(true);

    try {
      const res = await verifyAndResetPassword(email.trim(), code.trim(), password);
      if (res && res.success) {
        setStep(3);
      } else {
        setError(res?.error || 'Invalid or expired verification code. Please try again.');
      }
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('Server Components render') || msg.includes('digest')) {
        setError('Invalid or expired verification code. Please try again.');
      } else {
        setError(msg || 'Invalid or expired verification code. Please try again.');
      }
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
        <div className={styles.badge}>
          {step === 1 ? 'PASSWORD RECOVERY' : step === 2 ? 'STEP 2 OF 2' : 'SUCCESS'}
        </div>

        {step === 1 && (
          <>
            <h1 className={styles.heading}>Forgot password?</h1>
            <p className={styles.subtext}>
              Enter your account email and we&apos;ll issue a 6-digit verification code to reset your password.
            </p>

            <form onSubmit={handleRequestCode}>
              {error && (
                <div className={styles.errorBanner}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className={styles.fieldGroup}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="forgot-email">
                    Account Email
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
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Sending Code...' : 'Send Verification Code'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className={styles.heading}>Reset your password</h1>
            <p className={styles.subtext}>
              We sent a verification code to <strong style={{ color: '#ffffff' }}>{email}</strong>.
            </p>

            {/* Developer / Demo convenience banner */}
            <div className={styles.infoBanner}>
              <span>Demo verification code:</span>
              <span className={styles.codeBadge}>{demoCode || '123456'}</span>
            </div>

            <form onSubmit={handleVerifyAndReset}>
              {error && (
                <div className={styles.errorBanner}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className={styles.fieldGroup}>
                {/* 6-digit Code */}
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="verification-code">
                    6-Digit Verification Code
                  </label>
                  <input
                    id="verification-code"
                    className={styles.codeInput}
                    type="text"
                    maxLength={6}
                    required
                    placeholder="••••••"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {/* New Password */}
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="new-password">
                    New Password
                  </label>
                  <div className={styles.passwordWrap}>
                    <input
                      id="new-password"
                      className={styles.input}
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {password && (
                    <>
                      <div className={styles.strengthBar}>
                        {[1, 2, 3, 4].map((i) => {
                          let cls = styles.strengthSegment;
                          if (strength.score >= i) {
                            if (strength.score <= 1) cls += ` ${styles.active}`;
                            else if (strength.score <= 2) cls += ` ${styles.medium}`;
                            else cls += ` ${styles.strong}`;
                          }
                          return <div key={i} className={cls} />;
                        })}
                      </div>
                      <p className={styles.strengthLabel}>{strength.label}</p>
                    </>
                  )}
                </div>

                {/* Confirm Password */}
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="confirm-password">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
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

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Updating Password...' : 'Save New Password'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.45)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  &larr; Change email
                </button>
                <button
                  type="button"
                  onClick={handleRequestCode}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-orange)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
                >
                  Resend code
                </button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(52, 199, 89, 0.12)', border: '1px solid rgba(52, 199, 89, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#5cdb7a' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className={styles.heading} style={{ marginBottom: '0.75rem' }}>Password updated!</h1>
            <p className={styles.subtext} style={{ marginBottom: '2rem' }}>
              Your account password has been successfully reset. You can now sign in with your new credentials.
            </p>
            <Link href="/auth/signin" className={styles.submitBtn}>
              Sign In Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        )}

        {/* Card footer */}
        {step !== 3 && (
          <p className={styles.cardFooter}>
            Remembered your password?{' '}
            <Link href="/auth/signin">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
