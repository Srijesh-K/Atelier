'use client';

import React from 'react';

/**
 * Deterministic color palette for initials avatar backgrounds
 */
const PALETTES = [
  { bg: 'rgba(242, 85, 34, 0.16)', border: 'rgba(242, 85, 34, 0.45)', text: '#f25522' },
  { bg: 'rgba(52, 199, 89, 0.16)', border: 'rgba(52, 199, 89, 0.45)', text: '#34c759' },
  { bg: 'rgba(10, 132, 255, 0.16)', border: 'rgba(10, 132, 255, 0.45)', text: '#0a84ff' },
  { bg: 'rgba(191, 90, 242, 0.16)', border: 'rgba(191, 90, 242, 0.45)', text: '#bf5af2' },
  { bg: 'rgba(255, 159, 10, 0.16)', border: 'rgba(255, 159, 10, 0.45)', text: '#ff9f0a' },
  { bg: 'rgba(100, 210, 255, 0.16)', border: 'rgba(100, 210, 255, 0.45)', text: '#64d2ff' }
];

export function getInitials(name) {
  if (!name || typeof name !== 'string') return 'U';
  const clean = name.trim().replace(/^(mr|ms|mrs|dr|prof)\.?\s+/i, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getColorForName(name) {
  if (!name) return PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}

export default function InitialsAvatar({
  name = 'User',
  size = 36,
  fontSize,
  className = '',
  style = {}
}) {
  const initials = getInitials(name);
  const color = getColorForName(name);
  const calcFontSize = fontSize || Math.round(size * 0.4);

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: '50%',
        background: color.bg,
        border: `1.5px solid ${color.border}`,
        color: color.text,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-heading, sans-serif)',
        fontWeight: 800,
        fontSize: `${calcFontSize}px`,
        letterSpacing: '0.04em',
        userSelect: 'none',
        flexShrink: 0,
        boxShadow: `0 0 12px ${color.border}`,
        ...style
      }}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
