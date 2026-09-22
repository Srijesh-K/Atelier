'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log client error for debugging
    console.error('Atelier Dashboard Client Exception:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '75vh',
        padding: '2rem',
        textAlign: 'center',
        background: '#070709',
        color: '#ffffff',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        margin: '1.5rem',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(242, 85, 34, 0.12)',
          border: '1px solid rgba(242, 85, 34, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f25522"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
          fontSize: '1.75rem',
          fontWeight: '800',
          marginBottom: '0.75rem',
          color: '#ffffff',
        }}
      >
        Workbench Temporarily Interrupted
      </h1>

      <p
        style={{
          color: 'rgba(255, 255, 255, 0.65)',
          maxWidth: '520px',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          marginBottom: '2rem',
        }}
      >
        We encountered a hiccup while synchronizing your workspace and cohort curriculum.
        Your learning progress, submissions, and code snippets remain safe and secure.
      </p>

      {error?.message && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '2rem',
            maxWidth: '600px',
            wordBreak: 'break-word',
          }}
        >
          {error.message}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          style={{
            background: 'linear-gradient(135deg, #f25522 0%, #ff6b3d 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '0.85rem 1.75rem',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '0.92rem',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(242, 85, 34, 0.35)',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          Reload Workspace
        </button>

        <Link
          href="/dashboard/explore"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '0.85rem 1.75rem',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '0.92rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
        >
          Browse Cohorts
        </Link>
      </div>
    </div>
  );
}
