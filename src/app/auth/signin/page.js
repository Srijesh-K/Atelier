'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authenticateStudent } from '../../actions';
import SocialAuthModal from '../SocialAuthModal';
import styles from '../auth.module.css';

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/dashboard');

  // Social Auth Modal state
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialProvider, setSocialProvider] = useState('google');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const target = params.get('redirectTo');
      const urlError = params.get('error');
      const sandboxProvider = params.get('oauth_sandbox');

      if (target || urlError || sandboxProvider) {
        queueMicrotask(() => {
          if (target) setRedirectTo(target);
          if (urlError) setError(decodeURIComponent(urlError));
          if (sandboxProvider) {
            setSocialProvider(sandboxProvider);
            setSocialModalOpen(true);
          }
        });
      }
    }
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authenticateStudent(email.trim(), password);

      if (res && res.success !== false && (res.student || res.email)) {
        const student = res.student || res;
        localStorage.setItem('loggedInStudentEmail', student.email);
        localStorage.setItem('studentProfile', JSON.stringify({
          name: student.name,
          email: student.email,
          phone: student.phone || '',
          college: student.college || '',
          gradYear: student.gradYear || '',
          bio: student.bio || 'Aspiring Full Stack Engineer and AI enthusiast.',
          github: student.github || '',
          linkedin: student.linkedin || '',
          portfolio: student.portfolio || '',
          skills: student.skills || ['React', 'Next.js', 'Node.js', 'System Design'],
          avatar: student.avatar || null,
          enrolledCourses: student.enrolledCourses || [1]
        }));
        
        // Dispatch notifications
        window.dispatchEvent(new Event('profileChanged'));
        window.dispatchEvent(new Event('courseChanged'));
        
        router.push(redirectTo);
      } else {
        setError(res?.error || 'No account found with this email, or invalid credentials. Please check and try again.');
      }
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('Server Components render') || msg.includes('digest')) {
        setError('No account found with this email, or invalid credentials. Please check and try again.');
      } else {
        setError(msg || 'Unable to sign in. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openSocialAuth = (provider) => {
    setSocialProvider(provider);
    setSocialModalOpen(true);
  };

  return (
    <div className={styles.page}>
      {/* Background layers */}
      <div className={styles.bgGrid} />
      <div className={styles.glow} />

      {/* Form card */}
      <div className={styles.card}>
        <div className={styles.badge}>SECURE LOGIN</div>
        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.subtext}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup">Create one</Link>
        </p>

        <form onSubmit={handleSignIn}>
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
            {/* Email */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="signin-email">
                Email
              </label>
              <input
                id="signin-email"
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

            {/* Password */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="signin-password">
                Password
              </label>
              <div className={styles.passwordWrap}>
                <input
                  id="signin-password"
                  className={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Remember / Forgot */}
          <div className={styles.row}>
            <label className={styles.checkLabel}>
              <input type="checkbox" className={styles.checkbox} />
              Remember me
            </label>
            <Link href="/auth/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerLabel}>or continue with</span>
        </div>

        {/* Social buttons */}
        <div className={styles.socialRow}>
          <button
            type="button"
            className={styles.socialBtn}
            onClick={() => openSocialAuth('google')}
            title="Sign in with Google"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <button
            type="button"
            className={styles.socialBtn}
            onClick={() => openSocialAuth('github')}
            title="Sign in with GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            GitHub
          </button>
        </div>

        {/* Card footer */}
        <p className={styles.cardFooter}>
          New to Atelier?{' '}
          <Link href="/auth/signup">Create an account</Link>
        </p>
      </div>

      {/* Social Auth Sandbox Modal */}
      <SocialAuthModal
        isOpen={socialModalOpen}
        provider={socialProvider}
        onClose={() => setSocialModalOpen(false)}
        redirectTo={redirectTo}
      />
    </div>
  );
}
