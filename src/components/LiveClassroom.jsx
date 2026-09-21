'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * High-fidelity Native Live Classroom powered by Jitsi Meet External API
 * - Mentors get Host/Moderator controls: Screen Share, Mute All, Kick Student, Chat.
 * - Students get Attendee controls: Unmute to talk & ask doubts, Raise Hand, Chat, View Screen Share.
 */
export default function LiveClassroom({
  roomName,
  user = {},
  isMentor = false,
  title = 'Cohort Live Classroom',
  cohortName = 'Atelier Track',
  onClose
}) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapperRef = useRef(null);

  // Clean room name from URL if full URL is passed
  const cleanRoomName = (roomName || 'atelier-live-session')
    .replace(/^https?:\/\/meet\.jit\.si\//i, '')
    .replace(/^embedded:/i, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-');

  useEffect(() => {
    let isMounted = true;

    // Dynamically load Jitsi Meet script if not yet present
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          return resolve(window.JitsiMeetExternalAPI);
        }

        const existingScript = document.getElementById('jitsi-external-api-script');
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve(window.JitsiMeetExternalAPI));
          existingScript.addEventListener('error', (e) => reject(e));
          return;
        }

        const script = document.createElement('script');
        script.id = 'jitsi-external-api-script';
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => resolve(window.JitsiMeetExternalAPI);
        script.onerror = (e) => reject(e);
        document.body.appendChild(script);
      });
    };

    loadJitsiScript()
      .then((JitsiAPI) => {
        if (!isMounted || !containerRef.current) return;

        // Mentor Toolbar: full host capabilities (Mute All, Screen Share, Kick, Chat)
        // Student Toolbar: microphone talk, chat, raise hand, camera
        const toolbarButtons = isMentor
          ? [
              'microphone',
              'camera',
              'desktop', // Screen sharing
              'chat', // Real-time chat space
              'raisehand',
              'tileview',
              'mute-everyone', // Host Mute All
              'participants-pane', // Manage / Kick attendees
              'security',
              'settings',
              'hangup'
            ]
          : [
              'microphone', // Unmute to talk and ask doubts
              'camera',
              'chat', // Real-time chat space
              'raisehand', // Raise hand to ask doubt
              'tileview',
              'hangup'
            ];

        const options = {
          roomName: cleanRoomName,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: user?.name || (isMentor ? 'Mentor' : 'Student'),
            email: user?.email || undefined
          },
          configOverwrite: {
            startWithAudioMuted: !isMentor, // Students start muted to keep classroom orderly
            startWithVideoMuted: !isMentor,
            disableKick: false, // Mentor host can kick disruptive attendees
            prejoinPageEnabled: false, // Jump straight into the classroom
            enableLobby: false,
            toolbarButtons,
            channelLastN: -1,
            enableWelcomePage: false,
            enableClosePage: false,
            disableThirdPartyRequests: true,
            defaultRemoteDisplayName: 'Atelier Learner',
            readOnlyName: true
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_ALWAYS_VISIBLE: true,
            HIDE_INVITE_MORE_HEADER: true
          }
        };

        const api = new JitsiAPI('meet.jit.si', options);
        apiRef.current = api;
        setLoading(false);

        api.addListener('videoConferenceLeft', () => {
          if (onClose) onClose();
        });

        api.addListener('readyToClose', () => {
          if (onClose) onClose();
        });
      })
      .catch((err) => {
        console.error('Failed to load Jitsi Meet API:', err);
        setError('Could not connect to live classroom server. Please check your internet connection.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch (e) {}
        apiRef.current = null;
      }
    };
  }, [cleanRoomName, isMentor, user?.name, user?.email]);

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : '750px',
        maxHeight: '90vh',
        background: '#040406',
        borderRadius: isFullscreen ? '0' : '14px',
        border: isFullscreen ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85)',
        zIndex: isFullscreen ? 9999 : 50
      }}
    >
      {/* Classroom Control Bar Header */}
      <div
        style={{
          padding: '0.85rem 1.5rem',
          background: '#09090c',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: isMentor ? 'rgba(242, 85, 34, 0.18)' : 'rgba(255, 59, 48, 0.18)',
              border: `1px solid ${isMentor ? 'rgba(242, 85, 34, 0.4)' : 'rgba(255, 59, 48, 0.4)'}`,
              color: isMentor ? '#f25522' : '#ff3b30',
              fontSize: '0.72rem',
              fontWeight: '800',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              whiteSpace: 'nowrap'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: isMentor ? '#f25522' : '#ff3b30',
                boxShadow: `0 0 6px ${isMentor ? '#f25522' : '#ff3b30'}`
              }}
            />
            {isMentor ? 'Host (Moderator)' : 'Live Classroom'}
          </span>

          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h4
              style={{
                margin: 0,
                fontSize: '0.95rem',
                fontWeight: '800',
                color: '#ffffff',
                fontFamily: 'var(--font-heading)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {title}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
              {cohortName} • {isMentor ? 'You have Host controls (Mute All, Screen Share, Kick)' : 'Unmute mic to ask doubts • Chat open'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: '#ff3b30',
                border: 'none',
                color: '#ffffff',
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isMentor ? 'Exit Studio' : 'Leave Classroom'}
            </button>
          )}
        </div>
      </div>

      {/* Embedded Video Area */}
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#040406',
              zIndex: 10,
              color: 'rgba(255,255,255,0.7)',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '3px solid rgba(242, 85, 34, 0.2)',
                borderTopColor: 'var(--accent-orange, #f25522)',
                animation: 'spin 1s linear infinite'
              }}
            />
            <p style={{ fontSize: '0.88rem', margin: 0 }}>
              Connecting to secure encrypted live classroom...
            </p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#040406',
              padding: '2rem',
              textAlign: 'center',
              color: '#ff453a'
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Classroom Connection Error</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', maxWidth: '400px', marginBottom: '1.25rem' }}>
              {error}
            </p>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Return to Dashboard
              </button>
            )}
          </div>
        )}

        {/* Jitsi Meet Mount Point */}
        <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '500px' }} />
      </div>
    </div>
  );
}
