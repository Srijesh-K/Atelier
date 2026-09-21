'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authenticateOAuthStudent } from '../actions';
import styles from './auth.module.css';

export default function SocialAuthModal({ isOpen, provider, onClose, redirectTo = '/dashboard' }) {
  const router = useRouter();
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isGoogle = provider === 'google';
  const providerTitle = isGoogle ? 'Google' : 'GitHub';

  const demoAccounts = isGoogle ? [
    {
      name: 'Alex Rivera',
      email: 'alex.rivera@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      tag: 'Google Workspace'
    },
    {
      name: 'Sarah Chen',
      email: 'sarah.chen@google.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      tag: 'Google Account'
    }
  ] : [
    {
      name: 'OctoDev',
      email: 'octodev@github.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      tag: 'GitHub Verified'
    },
    {
      name: 'Marcus Vance',
      email: 'mvance-dev@users.noreply.github.com',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      tag: 'GitHub Pro'
    }
  ];

  const handleSelectAccount = async (account) => {
    setLoading(true);
    setError('');

    try {
      const student = await authenticateOAuthStudent({
        name: account.name,
        email: account.email,
        avatar: account.avatar || null,
        provider: provider || 'google'
      });

      if (student) {
        localStorage.setItem('loggedInStudentEmail', student.email);
        localStorage.setItem('studentProfile', JSON.stringify({
          name: student.name,
          email: student.email,
          phone: student.phone || '',
          college: student.college || 'Atelier University',
          gradYear: student.gradYear || '2026',
          bio: student.bio || `Enrolled via ${providerTitle} OAuth.`,
          github: student.github || '',
          linkedin: student.linkedin || '',
          portfolio: student.portfolio || '',
          skills: student.skills || ['React', 'Next.js', 'System Design']
        }));

        window.dispatchEvent(new Event('profileChanged'));
        window.dispatchEvent(new Event('courseChanged'));

        router.push(redirectTo);
      }
    } catch (err) {
      setError(err.message || `Failed to sign in with ${providerTitle}.`);
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    const name = customName.trim() || customEmail.split('@')[0];
    await handleSelectAccount({ name, email: customEmail.trim(), avatar: null });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleGroup}>
            {isGoogle ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            )}
            <span className={styles.modalTitle}>Continue with {providerTitle}</span>
          </div>
          <button type="button" className={styles.modalCloseBtn} onClick={onClose} aria-label="Close dialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <p className={styles.modalSubtext}>
          Choose a verified account below to instantly authenticate and access your Atelier workspace.
        </p>

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

        {/* Account selection list */}
        {!isCustom ? (
          <>
            <div className={styles.accountOptionList}>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  className={styles.accountOptionItem}
                  disabled={loading}
                  onClick={() => handleSelectAccount(acc)}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className={styles.accountOptionAvatar}>
                      {acc.name.charAt(0)}
                    </div>
                    <div>
                      <div className={styles.accountOptionName}>{acc.name}</div>
                      <div className={styles.accountOptionEmail}>{acc.email}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-orange)', fontWeight: 600 }}>
                    {acc.tag}
                  </span>
                </button>
              ))}
            </div>

            <div className={styles.modalDivider}>or enter details manually</div>

            <button
              type="button"
              className={styles.socialBtn}
              style={{ width: '100%', marginBottom: '1rem' }}
              onClick={() => setIsCustom(true)}
            >
              Use another {providerTitle} email
            </button>
          </>
        ) : (
          <form onSubmit={handleCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. Alex Rivera"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input
                className={styles.input}
                type="email"
                required
                placeholder={isGoogle ? 'you@gmail.com' : 'you@github.com'}
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className={styles.socialBtn}
                style={{ flex: 1 }}
                onClick={() => setIsCustom(false)}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                style={{ flex: 2 }}
                disabled={loading}
              >
                {loading ? 'Connecting...' : `Sign in with ${providerTitle}`}
              </button>
            </div>
          </form>
        )}

        {/* Live OAuth redirect fallback / developer note */}
        <div className={styles.oauthNote}>
          <strong>Production OAuth:</strong> To link a live {providerTitle} application, specify <code>{isGoogle ? 'GOOGLE_CLIENT_ID' : 'GITHUB_CLIENT_ID'}</code> in <code>.env.local</code>.
          <div style={{ marginTop: '0.5rem' }}>
            <a
              href={`/api/auth/${provider}?returnTo=${encodeURIComponent(redirectTo)}`}
              style={{ color: 'var(--accent-orange)', textDecoration: 'underline', fontWeight: 500 }}
            >
              Redirect to live {providerTitle} login &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
