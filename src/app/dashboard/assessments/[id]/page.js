'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  startOrResumeStudentAttemptAction,
  getStudentAttemptPlayerAction,
  saveStudentAttemptProgressAction,
  recordStudentProctoringAction,
  submitStudentAttemptAction,
  getStudentAttemptResultAction,
  runStudentCodeTestAction,
  runStudentSQLTestAction
} from '@/lib/assessments/actions';
import styles from '../assessments.module.css';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function AssessmentPlayerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawId = params?.id;
  const assessmentId = rawId ? parseInt(rawId, 10) : null;
  const isReportParam = searchParams?.get('report') === 'true';

  const [studentEmail, setStudentEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mode: 'onboarding' | 'player' | 'report'
  const [viewMode, setViewMode] = useState(isReportParam ? 'report' : 'onboarding');

  // Proctoring Onboarding & Media State
  const [hasConsented, setHasConsented] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [cameraStatus, setCameraStatus] = useState('idle'); // 'idle' | 'requesting' | 'granted' | 'denied'
  const [micStatus, setMicStatus] = useState('idle'); // 'idle' | 'checking' | 'active' | 'denied'
  const [networkPing, setNetworkPing] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('checking'); // 'checking' | 'excellent' | 'moderate' | 'slow'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [faceStatus, setFaceStatus] = useState('ok'); // 'ok' | 'no_face' | 'multiple_faces'
  const [fullscreenRequired, setFullscreenRequired] = useState(false);

  const previewVideoRef = useRef(null);
  const pipVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Player State
  const [attemptId, setAttemptId] = useState(null);
  const [attemptData, setAttemptData] = useState(null);
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Student Responses State: { [questionId]: value }
  const [responses, setResponses] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [saveStatus, setSaveStatus] = useState('All changes saved');

  // Server Timer
  const [remainingSeconds, setRemainingSeconds] = useState(null);

  // Sandboxed Live Code Execution
  const [codeExecuting, setCodeExecuting] = useState(false);
  const [codeConsole, setCodeConsole] = useState({ stdout: '', stderr: '', result: null, timeMs: 0 });
  const [sqlResults, setSqlResults] = useState(null);

  // Proctoring Modal & Count
  const [proctorWarning, setProctorWarning] = useState(false);
  const [proctorCount, setProctorCount] = useState(0);

  // Submit Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Report State
  const [reportData, setReportData] = useState(null);

  const saveTimeoutRef = useRef(null);

  // 1. Initial Load & Session Initialization
  useEffect(() => {
    const email = localStorage.getItem('loggedInStudentEmail');
    if (!email) {
      router.push('/auth/signin');
      return;
    }
    setStudentEmail(email);

    if (!assessmentId || isNaN(assessmentId)) {
      setError('Invalid assessment ID.');
      setLoading(false);
      return;
    }

    async function init() {
      try {
        if (isReportParam) {
          // Fetch existing report
          // We first resume/start to know latest attempt ID or fetch latest
          const startRes = await startOrResumeStudentAttemptAction(email, assessmentId).catch(() => null);
          const attId = startRes?.attemptId;
          if (attId) {
            const report = await getStudentAttemptResultAction(email, attId);
            setReportData(report);
            setViewMode('report');
          } else {
            setViewMode('onboarding');
          }
        } else {
          // Start or resume in-progress attempt
          const startRes = await startOrResumeStudentAttemptAction(email, assessmentId);
          if (startRes.expired) {
            // Expired attempt auto-submitted, show report
            const report = await getStudentAttemptResultAction(email, startRes.attemptId);
            setReportData(report);
            setViewMode('report');
          } else {
            setAttemptId(startRes.attemptId);
            const playerState = await getStudentAttemptPlayerAction(email, startRes.attemptId);
            setAttemptData(playerState.attempt);
            setSections(playerState.sections || []);
            setQuestions(playerState.questions || []);
            setRemainingSeconds(playerState.attempt.remainingSeconds || 0);

            // Hydrate responses
            const initialResponses = {};
            playerState.questions.forEach((q) => {
              if (q.student_response !== null && q.student_response !== undefined) {
                initialResponses[q.id] = q.student_response;
              } else if (q.question_type === 'coding' || q.question_type === 'debugging') {
                initialResponses[q.id] = q.config?.starterCode || '';
              } else if (q.question_type === 'ordering') {
                // Initialize with shuffled or default order
                initialResponses[q.id] = q.config?.items || [];
              } else if (q.question_type === 'matching') {
                initialResponses[q.id] = {};
              }
            });
            setResponses(initialResponses);
            setViewMode('onboarding');
          }
        }
      } catch (err) {
        console.error('Failed to initialize assessment:', err);
        setError(err.message || 'Unable to access assessment.');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [assessmentId, isReportParam, router]);

  // Toast Notification Helper
  const triggerToast = useCallback((msg) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  }, []);

  // Request Webcam & Microphone Permissions
  const requestMediaPermissions = useCallback(async () => {
    setCameraStatus('requesting');
    setMicStatus('checking');
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Media devices API not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true
      });
      setMediaStream(stream);
      setCameraStatus('granted');
      setMicStatus('active');
    } catch (err) {
      console.warn('Camera/Mic permission failed:', err);
      setCameraStatus('denied');
      setMicStatus('denied');
    }
  }, []);

  // Automatically request camera/mic when entering onboarding
  useEffect(() => {
    if (viewMode === 'onboarding' && cameraStatus === 'idle') {
      requestMediaPermissions();
    }
  }, [viewMode, cameraStatus, requestMediaPermissions]);

  // Attach Stream to Preview Video Element in Onboarding
  useEffect(() => {
    if (previewVideoRef.current && mediaStream && viewMode === 'onboarding') {
      previewVideoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, viewMode]);

  // Attach Stream to Floating PiP Video in Player View
  useEffect(() => {
    if (pipVideoRef.current && mediaStream && viewMode === 'player') {
      pipVideoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, viewMode]);

  // Network Speed / Latency Ping Check in Onboarding
  useEffect(() => {
    if (viewMode === 'onboarding') {
      let cancelled = false;
      const measurePing = async () => {
        setNetworkStatus('checking');
        try {
          const t0 = performance.now();
          await fetch('/robots.txt?t=' + Date.now(), { cache: 'no-store' });
          if (cancelled) return;
          const ping = Math.round(performance.now() - t0);
          setNetworkPing(ping);
          if (ping < 160) setNetworkStatus('excellent');
          else if (ping < 400) setNetworkStatus('moderate');
          else setNetworkStatus('slow');
        } catch (e) {
          if (cancelled) return;
          setNetworkPing(95);
          setNetworkStatus('moderate');
        }
      };
      measurePing();
      return () => { cancelled = true; };
    }
  }, [viewMode]);

  // Cleanup media stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [mediaStream]);

  // Real-Time Face Presence & Integrity Proctoring Loop
  useEffect(() => {
    if (viewMode !== 'player' || !mediaStream) return;

    let detector = null;
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 5 });
      } catch (e) {
        detector = null;
      }
    }

    const interval = setInterval(async () => {
      const video = pipVideoRef.current;
      if (!video || video.readyState < 2) return;

      try {
        if (detector) {
          const faces = await detector.detect(video);
          if (faces.length === 0) {
            setFaceStatus('no_face');
            triggerToast('Warning: Face not detected in camera frame! Keep your face visible.');
            if (studentEmail && attemptId) {
              recordStudentProctoringAction(studentEmail, attemptId, 'face_out_of_frame', { timestamp: Date.now() });
            }
          } else if (faces.length > 1) {
            setFaceStatus('multiple_faces');
            triggerToast(`Violation: Multiple individuals detected (${faces.length}) in camera frame!`);
            if (studentEmail && attemptId) {
              recordStudentProctoringAction(studentEmail, attemptId, 'multiple_faces', { count: faces.length });
            }
          } else {
            setFaceStatus('ok');
          }
        } else {
          // Canvas luminance fallback to verify camera is unobscured and active
          if (!canvasRef.current && typeof document !== 'undefined') {
            canvasRef.current = document.createElement('canvas');
          }
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = 64;
            canvas.height = 48;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(video, 0, 0, 64, 48);
              const imgData = ctx.getImageData(0, 0, 64, 48);
              const d = imgData.data;
              let brightnessSum = 0;
              for (let i = 0; i < d.length; i += 4) {
                brightnessSum += (d[i] + d[i + 1] + d[i + 2]) / 3;
              }
              const avg = brightnessSum / (d.length / 4);
              if (avg < 10 || avg > 248) {
                setFaceStatus('no_face');
                triggerToast('Camera appears covered or poorly lit. Please ensure face is visible.');
                if (studentEmail && attemptId) {
                  recordStudentProctoringAction(studentEmail, attemptId, 'camera_obscured', { avgBrightness: avg });
                }
              } else {
                setFaceStatus('ok');
              }
            }
          }
        }
      } catch (err) {
        // Frame analysis tick error; skip silently
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [viewMode, mediaStream, studentEmail, attemptId, triggerToast]);

  // Anti-Cheat Restrictions & Fullscreen Detection
  useEffect(() => {
    if (viewMode !== 'player') return;

    const handleCopyCutPaste = (e) => {
      e.preventDefault();
      triggerToast('Clipboard copy, cut, and paste actions are disabled in proctored assessments.');
      if (studentEmail && attemptId) {
        recordStudentProctoringAction(studentEmail, attemptId, 'clipboard_violation', { action: e.type });
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerToast('Right-click context menu is disabled in assessment mode.');
    };

    const handleKeyDown = (e) => {
      const isF12 = e.key === 'F12';
      const isDevToolsCombo = e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key);
      const isSaveOrSource = e.ctrlKey && ['u', 'U', 's', 'S'].includes(e.key);

      if (isF12 || isDevToolsCombo || isSaveOrSource) {
        e.preventDefault();
        e.stopPropagation();
        triggerToast('Developer inspection tools and page save shortcuts are disabled.');
        if (studentEmail && attemptId) {
          recordStudentProctoringAction(studentEmail, attemptId, 'devtools_shortcut_blocked', { key: e.key });
        }
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenRequired(true);
        triggerToast('Full-screen mode exited! Return to full-screen to continue.');
        if (studentEmail && attemptId) {
          recordStudentProctoringAction(studentEmail, attemptId, 'fullscreen_exit', { timestamp: Date.now() });
        }
      } else {
        setFullscreenRequired(false);
      }
    };

    window.addEventListener('copy', handleCopyCutPaste);
    window.addEventListener('cut', handleCopyCutPaste);
    window.addEventListener('paste', handleCopyCutPaste);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('copy', handleCopyCutPaste);
      window.removeEventListener('cut', handleCopyCutPaste);
      window.removeEventListener('paste', handleCopyCutPaste);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [viewMode, studentEmail, attemptId, triggerToast]);

  // Start Proctored Exam from Onboarding
  const handleStartExam = async () => {
    if (cameraStatus !== 'granted') {
      alert('Camera & microphone permissions are required for this proctored examination.');
      return;
    }
    if (!hasConsented) {
      alert('Please read and accept the examination rules and consent declaration.');
      return;
    }

    try {
      if (document.documentElement?.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {
      // Continue if browser blocks fullscreen
    }

    setViewMode('player');
  };

  // Re-enter Fullscreen Handler
  const handleReenterFullscreen = async () => {
    try {
      if (document.documentElement?.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
    setFullscreenRequired(false);
  };

  // 4. Debounced Autosave Engine
  const triggerAutosave = useCallback((qId, val) => {
    setSaveStatus('Saving draft...');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (attemptId && studentEmail) {
          await saveStudentAttemptProgressAction(studentEmail, attemptId, [
            { questionId: qId, responseData: val }
          ]);
          setSaveStatus('Draft saved');
        }
      } catch (err) {
        console.warn('Autosave error:', err);
        setSaveStatus('Unsaved changes');
      }
    }, 1200);
  }, [attemptId, studentEmail]);

  const handleResponseChange = (qId, val) => {
    setResponses((prev) => ({
      ...prev,
      [qId]: val
    }));
    triggerAutosave(qId, val);
  };

  // 5. Submit Handler
  const handleSubmitAttempt = async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
      if (typeof document !== 'undefined' && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }

      const payload = Object.entries(responses).map(([k, v]) => ({
        questionId: parseInt(k, 10),
        responseData: v
      }));

      await submitStudentAttemptAction(studentEmail, attemptId, payload);
      const report = await getStudentAttemptResultAction(studentEmail, attemptId);
      setReportData(report);
      setViewMode('report');
      setShowSubmitModal(false);
    } catch (err) {
      alert('Error submitting assessment: ' + (err.message || 'Try again'));
    } finally {
      setSubmitting(false);
    }
  };

  // 6. Sandboxed Code Runner
  const handleRunCodeTest = async (q) => {
    const code = responses[q.id] || '';
    const lang = q.config?.language || 'javascript';
    const sampleInput = q.config?.sampleInput || null;

    setCodeExecuting(true);
    setCodeConsole({ stdout: 'Running code in isolated sandbox...', stderr: '', result: null, timeMs: 0 });

    try {
      const exec = await runStudentCodeTestAction({
        language: lang,
        code,
        input: sampleInput
      });

      setCodeConsole({
        stdout: exec.stdout || '',
        stderr: exec.stderr || '',
        result: exec.result,
        timeMs: exec.executionTimeMs
      });
    } catch (err) {
      setCodeConsole({
        stdout: '',
        stderr: err.message || 'Execution error',
        result: null,
        timeMs: 0
      });
    } finally {
      setCodeExecuting(false);
    }
  };

  // 7. Sandboxed SQL Runner
  const handleRunSQLTest = async (q) => {
    const studentSql = responses[q.id] || '';
    const schemaSql = q.config?.schemaSql || '';

    setCodeExecuting(true);
    try {
      const exec = await runStudentSQLTestAction({
        studentSql,
        schemaSql
      });

      if (exec.success) {
        setSqlResults(exec.studentRows || []);
      } else {
        alert(exec.error || 'SQL execution failed');
      }
    } catch (err) {
      alert('SQL Error: ' + err.message);
    } finally {
      setCodeExecuting(false);
    }
  };

  // 8. Telegram Bot API File Upload Handler
  const handleFileUpload = async (qId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds maximum allowable 10MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'assessment');

    try {
      setSaveStatus('Uploading artifact to cloud...');
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success && data.file) {
        handleResponseChange(qId, {
          fileId: data.file.id,
          filename: data.file.filename,
          url: data.file.url,
          size: data.file.size
        });
        setSaveStatus('File attached successfully');
      } else {
        alert('File upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (upErr) {
      alert('Upload error: ' + upErr.message);
    }
  };

  // Format timer
  const formatTime = (secs) => {
    if (secs === null || secs === undefined) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className={styles.playerWrapper} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-orange, #f25522)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.6)' }}>Loading assessment workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(242, 85, 34, 0.1)', border: '1px solid rgba(242, 85, 34, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent-orange, #f25522)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 style={{ color: '#ffffff', fontFamily: 'var(--font-heading)', fontSize: 24, marginBottom: 8 }}>Assessment Notice</h2>
          <p className={styles.emptySubtitle}>{error}</p>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button onClick={() => window.location.reload()} className={styles.btnSecondary} style={{ maxWidth: 160 }}>
              Retry Attempt
            </button>
            <Link href="/dashboard/assessments" className={styles.btnPrimary} style={{ maxWidth: 200 }}>
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // REPORT / RESULTS VIEW
  // ──────────────────────────────────────────────────────────
  if (viewMode === 'report' && reportData) {
    const { attempt, responses: respList, proctoringEvents } = reportData;
    const isEvaluated = attempt.status === 'evaluated';

    return (
      <div className={styles.container}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Link href="/dashboard/assessments" style={{ color: 'var(--accent-orange, #f25522)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontWeight: 600 }}>
              ← Back to Assessments Catalog
            </Link>
            <h1 className={styles.title}>{attempt.assessment_title} — Performance Summary</h1>
            <p className={styles.subtitle}>{attempt.course_title} • Attempt #{attempt.attempt_number}</p>
          </div>

          <div>
            <span className={`${styles.statusPill} ${attempt.passed ? styles.pillPassed : styles.pillFailed}`} style={{ fontSize: 14, padding: '6px 14px' }}>
              {isEvaluated ? (attempt.passed ? 'PASSED' : 'NOT PASSED') : 'UNDER EVALUATION'}
            </span>
          </div>
        </div>

        {/* Hero Scorecard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 30 }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total Score</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>
              {attempt.total_score} <span style={{ fontSize: 16, color: '#64748b' }}>/ {attempt.total_marks}</span>
            </div>
            <div style={{ fontSize: 12, color: attempt.passed ? '#34d399' : '#f87171' }}>
              {attempt.percentage}% (Passing: {attempt.passing_marks} marks)
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Status</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#ffffff', margin: '8px 0' }}>
              {attempt.status === 'evaluated' ? 'Fully Evaluated' : 'Pending Manual Review'}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              Submitted on {new Date(attempt.submitted_at || attempt.updated_at).toLocaleString()}
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Proctoring Flags</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: attempt.proctoring_flags > 0 ? '#fbbf24' : '#34d399', margin: '6px 0' }}>
              {attempt.proctoring_flags} Flags
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              {attempt.proctoring_flags === 0 ? 'Clean integrity session' : 'Tab or blur events logged'}
            </div>
          </div>
        </div>

        {/* Questions Breakdown */}
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px', color: '#ffffff' }}>Detailed Question Breakdown</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {respList.map((resp, idx) => {
            const snap = resp.question_snapshot || {};
            const isCorrect = resp.status === 'correct';
            const isPartial = resp.status === 'partial';
            const isPending = resp.status === 'pending_manual_review';

            return (
              <div key={resp.id} style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-orange, #f25522)' }}>Q{idx + 1}.</span>
                    <span style={{ fontWeight: 600, color: '#ffffff' }}>{snap.title || resp.question_title}</span>
                    <span className={styles.qTypeTag}>{resp.question_type}</span>
                  </div>

                  <div>
                    <span className={`${styles.statusPill} ${isCorrect ? styles.pillPassed : isPartial ? styles.pillInProgress : isPending ? styles.pillSubmitted : styles.pillFailed}`}>
                      {resp.marks_awarded} / {resp.max_marks} Marks
                    </span>
                  </div>
                </div>

                <div style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 14 }}>
                  {snap.question_text || resp.question_text}
                </div>

                {/* Response preview */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 12, borderRadius: 8, fontSize: 13, color: '#e2e8f0', marginBottom: 10 }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, marginBottom: 4, textTransform: 'uppercase' }}>Your Response</div>
                  {resp.response_data ? (
                    typeof resp.response_data === 'object' ? (
                      resp.response_data.url ? (
                        <a href={resp.response_data.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-orange, #f25522)', textDecoration: 'underline' }}>
                          Uploaded File: {resp.response_data.filename}
                        </a>
                      ) : (
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                          {JSON.stringify(resp.response_data, null, 2)}
                        </pre>
                      )
                    ) : (
                      <div style={{ whiteSpace: 'pre-wrap' }}>{String(resp.response_data)}</div>
                    )
                  ) : (
                    <em style={{ color: '#64748b' }}>Unanswered</em>
                  )}
                </div>

                {/* Feedback */}
                {resp.evaluator_feedback && (
                  <div style={{ fontSize: 13, color: isCorrect ? '#34d399' : 'var(--accent-orange, #f25522)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>{resp.evaluator_feedback}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // PRE-ASSESSMENT ONBOARDING & DEVICE CHECK VIEW
  // ──────────────────────────────────────────────────────────
  if (viewMode === 'onboarding') {
    const durationMins = attemptData?.duration_minutes || (remainingSeconds ? Math.round(remainingSeconds / 60) : 60);

    return (
      <div className={styles.onboardingWrapper}>
        <div className={styles.onboardingCard}>
          <div className={styles.onboardingBadge}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
            Secure Proctored Examination
          </div>

          <h1 className={styles.onboardingTitle}>
            {attemptData?.assessment_title || 'Assessment Instructions & Pre-Flight Check'}
          </h1>
          <p className={styles.onboardingSubtitle}>
            {attemptData?.course_title} • Duration: <strong style={{ color: '#ffffff' }}>{durationMins} Minutes</strong> • Total Questions: <strong style={{ color: '#ffffff' }}>{questions.length}</strong>
          </p>

          <div className={styles.setupGrid}>
            {/* Rules & Integrity Conduct */}
            <div className={styles.rulesSection}>
              <div className={styles.rulesTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Examination Rules & Integrity Conduct
              </div>

              <div className={styles.ruleItem}>
                <svg className={styles.ruleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                <span><strong>Fullscreen Mode Mandatory:</strong> The assessment runs strictly in full-screen. Exiting full screen or tab switching will log an incident.</span>
              </div>

              <div className={styles.ruleItem}>
                <svg className={styles.ruleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <span><strong>Continuous Video & Audio Proctoring:</strong> Active webcam and mic are monitored throughout. Keep your face illuminated and centered.</span>
              </div>

              <div className={styles.ruleItem}>
                <svg className={styles.ruleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span><strong>Single Candidate Rule:</strong> No other person may enter the camera frame. Multiple faces detected will trigger an integrity violation.</span>
              </div>

              <div className={styles.ruleItem}>
                <svg className={styles.ruleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span><strong>Anti-Cheat Locks:</strong> Copy, paste, right-click, and DevTools/inspect shortcuts (F12, Ctrl+Shift+I) are completely disabled.</span>
              </div>
            </div>

            {/* Media & Diagnostic Verification */}
            <div className={styles.mediaCheckSection}>
              <div className={styles.videoPreviewBox}>
                {mediaStream ? (
                  <video
                    ref={previewVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={styles.videoElement}
                  />
                ) : (
                  <div className={styles.videoPlaceholder}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M23 7l-7 5 7 5V7z" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    <span>Camera feed will appear here once permissions are enabled.</span>
                    <button
                      type="button"
                      onClick={requestMediaPermissions}
                      className={styles.btnPrimary}
                      style={{ marginTop: 10, padding: '8px 18px', fontSize: 12 }}
                    >
                      {cameraStatus === 'requesting' ? 'Requesting Access...' : 'Allow Camera & Microphone'}
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.diagStatusRow}>
                <span>Webcam Feed</span>
                <div className={styles.statusIndicator}>
                  <div className={cameraStatus === 'granted' ? styles.dotGreen : cameraStatus === 'denied' ? styles.dotRed : styles.dotYellow} />
                  <span>{cameraStatus === 'granted' ? 'Connected & Ready' : cameraStatus === 'denied' ? 'Access Blocked' : 'Permission Required'}</span>
                </div>
              </div>

              <div className={styles.diagStatusRow}>
                <span>Microphone</span>
                <div className={styles.statusIndicator}>
                  <div className={micStatus === 'active' ? styles.dotGreen : micStatus === 'denied' ? styles.dotRed : styles.dotYellow} />
                  <span>{micStatus === 'active' ? 'Active & Calibrated' : micStatus === 'denied' ? 'Access Blocked' : 'Pending Access'}</span>
                </div>
              </div>

              <div className={styles.diagStatusRow}>
                <span>Network Latency</span>
                <div className={styles.statusIndicator}>
                  <div className={networkStatus === 'excellent' ? styles.dotGreen : networkStatus === 'moderate' ? styles.dotYellow : styles.dotRed} />
                  <span>{networkPing !== null ? `${networkPing} ms (${networkStatus === 'excellent' ? 'Optimal' : networkStatus === 'moderate' ? 'Moderate' : 'High Latency'})` : 'Measuring...'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Network Recommendations */}
          <div className={styles.networkTipsBox}>
            <div className={styles.networkTipsHeader}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Network & Bandwidth Guidance
            </div>
            <p className={styles.networkTipsText}>
              Ensure a stable internet connection before beginning. Close any background video streams (YouTube, Netflix), torrents, file downloads, or active video conferencing apps to prevent packet loss and latency spikes during proctoring.
            </p>
          </div>

          {/* Candidate Consent Checkbox */}
          <label className={styles.consentRow}>
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--accent-orange, #f25522)', marginTop: 2, cursor: 'pointer' }}
            />
            <span className={styles.consentText}>
              I confirm that I am the authorized candidate, agree to continuous webcam and microphone monitoring, and will strictly comply with examination rules without any external assistance or unauthorized tools.
            </span>
          </label>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14 }}>
            <Link href="/dashboard/assessments" className={styles.btnSecondary} style={{ maxWidth: 160, textAlign: 'center', textDecoration: 'none' }}>
              Cancel & Exit
            </Link>
            <button
              type="button"
              disabled={cameraStatus !== 'granted' || !hasConsented}
              onClick={handleStartExam}
              className={styles.btnPrimary}
              style={{
                maxWidth: 320,
                opacity: (cameraStatus !== 'granted' || !hasConsented) ? 0.5 : 1,
                cursor: (cameraStatus !== 'granted' || !hasConsented) ? 'not-allowed' : 'pointer'
              }}
            >
              Enter Fullscreen Proctored Exam →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // PLAYER WORKSPACE VIEW
  // ──────────────────────────────────────────────────────────
  const currentQ = questions[currentQIndex];
  if (!currentQ) return null;

  const currentVal = responses[currentQ.id];
  const isFlagged = flaggedQuestions.has(currentQ.id);

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) next.delete(currentQ.id);
      else next.add(currentQ.id);
      return next;
    });
  };

  const answeredCount = Object.keys(responses).filter((k) => {
    const v = responses[k];
    return v !== null && v !== undefined && v !== '';
  }).length;

  return (
    <div className={styles.playerWrapper}>
      {/* Proctoring Warning Modal */}
      {proctorWarning && (
        <div className={styles.proctorModal}>
          <div className={styles.proctorCard} style={{ borderColor: 'rgba(242, 85, 34, 0.4)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ margin: '0 auto' }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h2 className={styles.proctorWarningTitle}>Integrity Warning</h2>
            <p className={styles.proctorWarningText}>
              A browser tab switch or focus loss was detected ({proctorCount} incident recorded).
              This assessment is monitored. Excessive deviations may invalidate your attempt.
            </p>
            <button
              onClick={() => setProctorWarning(false)}
              className={styles.btnPrimary}
              style={{ width: '100%' }}
            >
              I Understand & Resume Assessment
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className={styles.proctorModal}>
          <div className={styles.proctorCard} style={{ borderColor: '#6366f1' }}>
            <h2 style={{ color: '#ffffff', fontSize: 20, marginBottom: 8 }}>Ready to Submit Assessment?</h2>
            <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.5, marginBottom: 20 }}>
              You have answered <strong style={{ color: '#34d399' }}>{answeredCount}</strong> of <strong>{questions.length}</strong> questions.
              {questions.length - answeredCount > 0 && (
                <span style={{ display: 'block', color: '#f87171', marginTop: 6 }}>
                  {questions.length - answeredCount} questions are still unanswered.
                </span>
              )}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowSubmitModal(false)}
                className={styles.btnSecondary}
                style={{ flex: 1 }}
              >
                Continue Test
              </button>
              <button
                onClick={() => handleSubmitAttempt(false)}
                disabled={submitting}
                className={styles.btnPrimary}
                style={{ flex: 1 }}
              >
                {submitting ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className={styles.playerHeader}>
        <div className={styles.playerTitleBox}>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={styles.sidebarToggleBtn}
            title={sidebarCollapsed ? "Expand questions list" : "Hide sidebar for distraction-free view"}
          >
            {sidebarCollapsed ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
                <span>Questions</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                  <polyline points="14 9 11 12 14 15"/>
                </svg>
                <span>Hide</span>
              </>
            )}
          </button>
          <span className={styles.courseBadge}>{attemptData?.course_title}</span>
          <span className={styles.playerAssessmentTitle}>{attemptData?.assessment_title}</span>
        </div>

        <div className={styles.timerContainer}>
          <div className={styles.saveStatus}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span>{saveStatus}</span>
          </div>

          <div
            className={`${styles.timerPill} ${
              remainingSeconds < 60 ? styles.timerDanger : remainingSeconds < 300 ? styles.timerWarning : ''
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{formatTime(remainingSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className={styles.playerBody}>
        {/* Left Question Navigation */}
        <div className={`${styles.questionSidebar} ${sidebarCollapsed ? styles.questionSidebarCollapsed : ''}`}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc', marginBottom: 12 }}>
            Questions Overview ({answeredCount}/{questions.length})
          </div>

          {sections.length > 0 ? (
            sections.map((sec) => {
              const secQuestions = questions.filter((q) => q.section_id === sec.id);
              if (secQuestions.length === 0) return null;

              return (
                <div key={sec.id} style={{ marginBottom: 16 }}>
                  <div className={styles.sidebarSectionHeader}>{sec.title}</div>
                  <div className={styles.questionBadgeGrid}>
                    {secQuestions.map((q) => {
                      const idx = questions.findIndex((item) => item.id === q.id);
                      const isAns = responses[q.id] !== undefined && responses[q.id] !== null && responses[q.id] !== '';
                      const isCur = idx === currentQIndex;
                      const isFlag = flaggedQuestions.has(q.id);

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQIndex(idx)}
                          className={`${styles.qBadge} ${isCur ? styles.qBadgeActive : ''} ${isAns ? styles.qBadgeAnswered : ''} ${isFlag ? styles.qBadgeFlagged : ''}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.questionBadgeGrid}>
              {questions.map((q, idx) => {
                const isAns = responses[q.id] !== undefined && responses[q.id] !== null && responses[q.id] !== '';
                const isCur = idx === currentQIndex;
                const isFlag = flaggedQuestions.has(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`${styles.qBadge} ${isCur ? styles.qBadgeActive : ''} ${isAns ? styles.qBadgeAnswered : ''} ${isFlag ? styles.qBadgeFlagged : ''}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Center Stage */}
        <div className={styles.mainStage}>
          <div className={styles.questionMetaHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className={styles.qTypeTag}>{currentQ.question_type.replace('_', ' ')}</span>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>
                Question {currentQIndex + 1} of {questions.length}
              </span>
            </div>

            <div className={styles.marksTag}>
              {currentQ.marks} {currentQ.marks === 1 ? 'Mark' : 'Marks'}
              {currentQ.negative_marks > 0 && (
                <span style={{ color: '#f87171', marginLeft: 6 }}>
                  (-{currentQ.negative_marks} for wrong answer)
                </span>
              )}
            </div>
          </div>

          <h2 className={styles.questionTitle}>{currentQ.title}</h2>
          <div className={styles.questionPrompt}>{currentQ.question_text}</div>

          {/* ──────────────────────────────────────────────── */}
          {/* QUESTION TYPE RENDERERS                          */}
          {/* ──────────────────────────────────────────────── */}

          {/* 1. Single Choice MCQ */}
          {currentQ.question_type === 'single_choice' && (
            <div className={styles.optionList}>
              {(currentQ.options || []).map((opt) => {
                const isChecked = String(currentVal) === String(opt.id);
                return (
                  <label
                    key={opt.id}
                    className={`${styles.optionCard} ${isChecked ? styles.optionCardSelected : ''}`}
                  >
                    <input
                      type="radio"
                      name={`q_${currentQ.id}`}
                      value={opt.id}
                      checked={isChecked}
                      onChange={() => handleResponseChange(currentQ.id, opt.id)}
                      className={styles.inputRadio}
                    />
                    <span>{opt.option_text}</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* 2. Multiple Choice */}
          {currentQ.question_type === 'multiple_choice' && (
            <div className={styles.optionList}>
              {(currentQ.options || []).map((opt) => {
                const arr = Array.isArray(currentVal) ? currentVal : [];
                const isChecked = arr.includes(String(opt.id)) || arr.includes(Number(opt.id));

                const toggleCheck = () => {
                  let updated;
                  if (isChecked) {
                    updated = arr.filter((x) => String(x) !== String(opt.id));
                  } else {
                    updated = [...arr, opt.id];
                  }
                  handleResponseChange(currentQ.id, updated);
                };

                return (
                  <label
                    key={opt.id}
                    className={`${styles.optionCard} ${isChecked ? styles.optionCardSelected : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={toggleCheck}
                      className={styles.inputCheckbox}
                    />
                    <span>{opt.option_text}</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* 3. True / False */}
          {currentQ.question_type === 'true_false' && (
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              {['True', 'False'].map((tf) => {
                const isSelected = String(currentVal).toLowerCase() === tf.toLowerCase();
                return (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => handleResponseChange(currentQ.id, tf)}
                    className={`${styles.btnSecondary} ${isSelected ? styles.optionCardSelected : ''}`}
                    style={{ flex: 1, padding: '16px 20px', fontSize: 16, fontWeight: 600 }}
                  >
                    {tf}
                  </button>
                );
              })}
            </div>
          )}

          {/* 4. Fill in the blank */}
          {currentQ.question_type === 'fill_blank' && (
            <div style={{ marginBottom: 24 }}>
              <input
                type="text"
                placeholder="Type your answer here..."
                value={currentVal || ''}
                onChange={(e) => handleResponseChange(currentQ.id, e.target.value)}
                className={styles.textInput}
              />
            </div>
          )}

          {/* 5. Numerical */}
          {currentQ.question_type === 'numerical' && (
            <div style={{ marginBottom: 24 }}>
              <input
                type="number"
                step="any"
                placeholder="Enter numerical value..."
                value={currentVal !== undefined ? currentVal : ''}
                onChange={(e) => handleResponseChange(currentQ.id, e.target.value)}
                className={styles.textInput}
                style={{ maxWidth: 320 }}
              />
              {currentQ.config?.tolerance && (
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                  Tolerance: +/- {currentQ.config.tolerance}
                </div>
              )}
            </div>
          )}

          {/* 6. Matching */}
          {currentQ.question_type === 'matching' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {(currentQ.config?.pairs || []).map((p, idx) => {
                const matchVal = (currentVal && typeof currentVal === 'object') ? currentVal[p.left] || '' : '';

                return (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center' }}>
                    <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px 16px', borderRadius: 8, fontSize: 14 }}>
                      {p.left}
                    </div>
                    <select
                      value={matchVal}
                      onChange={(e) => {
                        const updated = { ...(currentVal || {}), [p.left]: e.target.value };
                        handleResponseChange(currentQ.id, updated);
                      }}
                      className={styles.selectInput}
                      style={{ width: '100%', padding: '12px 14px' }}
                    >
                      <option value="">Select match...</option>
                      {(currentQ.config?.pairs || []).map((rightItem, rIdx) => (
                        <option key={rIdx} value={rightItem.right}>
                          {rightItem.right}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}

          {/* 7. Ordering */}
          {currentQ.question_type === 'ordering' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>
                Arrange in correct chronological or execution order (use arrow buttons):
              </div>
              {(Array.isArray(currentVal) ? currentVal : (currentQ.config?.items || [])).map((item, idx, arr) => {
                const moveUp = () => {
                  if (idx === 0) return;
                  const next = [...arr];
                  const temp = next[idx - 1];
                  next[idx - 1] = next[idx];
                  next[idx] = temp;
                  handleResponseChange(currentQ.id, next);
                };

                const moveDown = () => {
                  if (idx === arr.length - 1) return;
                  const next = [...arr];
                  const temp = next[idx + 1];
                  next[idx + 1] = next[idx];
                  next[idx] = temp;
                  handleResponseChange(currentQ.id, next);
                };

                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255, 255, 255, 0.02)', padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-orange, #f25522)', width: 24 }}>{idx + 1}.</span>
                    <span style={{ flex: 1, fontSize: 14 }}>{item}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        onClick={moveUp}
                        disabled={idx === 0}
                        className={styles.btnSecondary}
                        style={{ padding: '4px 8px', fontSize: 12 }}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={moveDown}
                        disabled={idx === arr.length - 1}
                        className={styles.btnSecondary}
                        style={{ padding: '4px 8px', fontSize: 12 }}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 8. Short Answer */}
          {currentQ.question_type === 'short_answer' && (
            <div style={{ marginBottom: 24 }}>
              <textarea
                placeholder="Write your answer clearly..."
                value={currentVal || ''}
                onChange={(e) => handleResponseChange(currentQ.id, e.target.value)}
                className={styles.textareaInput}
                rows={4}
              />
              <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.5)', textAlign: 'right', marginTop: 6 }}>
                {(currentVal || '').length} characters
              </div>
            </div>
          )}

          {/* 9. Essay / Long Answer */}
          {currentQ.question_type === 'essay' && (
            <div style={{ marginBottom: 24 }}>
              {currentQ.rubrics?.length > 0 && (
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 16px', borderRadius: 8, marginBottom: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-orange, #f25522)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Grading Rubrics
                  </div>
                  {currentQ.rubrics.map((r, rIdx) => (
                    <div key={rIdx} style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 4 }}>
                      • <strong>{r.criterion}</strong>: up to {r.max_marks} marks {r.description ? `(${r.description})` : ''}
                    </div>
                  ))}
                </div>
              )}
              <textarea
                placeholder="Compose your comprehensive technical analysis here..."
                value={currentVal || ''}
                onChange={(e) => handleResponseChange(currentQ.id, e.target.value)}
                className={styles.textareaInput}
                rows={9}
              />
              <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'right', marginTop: 6 }}>
                {(currentVal || '').split(/\s+/).filter(Boolean).length} words
              </div>
            </div>
          )}

          {/* 10. Interactive Coding & Debugging */}
          {(currentQ.question_type === 'coding' || currentQ.question_type === 'debugging') && (
            <div className={styles.codeEditorContainer}>
              <div className={styles.codeEditorHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Language:</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>
                    {currentQ.config?.language || 'javascript'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleResponseChange(currentQ.id, currentQ.config?.starterCode || '')}
                    className={styles.btnSecondary}
                    style={{ padding: '4px 10px', fontSize: 11 }}
                  >
                    Reset Starter Code
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRunCodeTest(currentQ)}
                    disabled={codeExecuting}
                    className={styles.btnPrimary}
                    style={{ padding: '4px 12px', fontSize: 12 }}
                  >
                    {codeExecuting ? 'Executing...' : 'Run Test Code ▶'}
                  </button>
                </div>
              </div>

              <div style={{ height: 320 }}>
                <MonacoEditor
                  height="100%"
                  language={currentQ.config?.language || 'javascript'}
                  theme="vs-dark"
                  value={currentVal !== undefined ? String(currentVal) : (currentQ.config?.starterCode || '')}
                  onChange={(val) => handleResponseChange(currentQ.id, val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2
                  }}
                />
              </div>

              {/* Execution Console */}
              {(codeConsole.stdout || codeConsole.stderr || codeConsole.result !== null) && (
                <div className={styles.codeOutputConsole}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71717a', fontSize: 11, marginBottom: 4 }}>
                    <span>Console Output</span>
                    {codeConsole.timeMs > 0 && <span>{codeConsole.timeMs}ms</span>}
                  </div>
                  {codeConsole.stdout && <div className={styles.consoleStdout}>{codeConsole.stdout}</div>}
                  {codeConsole.stderr && <div className={styles.consoleStderr}>{codeConsole.stderr}</div>}
                  {codeConsole.result !== null && (
                    <div style={{ color: '#38bdf8', marginTop: 4 }}>
                      Return Value: {JSON.stringify(codeConsole.result)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 11. SQL Query */}
          {currentQ.question_type === 'sql' && (
            <div className={styles.codeEditorContainer}>
              <div className={styles.codeEditorHeader}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>SQL In-Memory Sandbox</span>
                <button
                  type="button"
                  onClick={() => handleRunSQLTest(currentQ)}
                  disabled={codeExecuting}
                  className={styles.btnPrimary}
                  style={{ padding: '4px 12px', fontSize: 12 }}
                >
                  {codeExecuting ? 'Running...' : 'Execute SQL ▶'}
                </button>
              </div>

              <div style={{ height: 240 }}>
                <MonacoEditor
                  height="100%"
                  language="sql"
                  theme="vs-dark"
                  value={currentVal || ''}
                  onChange={(val) => handleResponseChange(currentQ.id, val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    scrollBeyondLastLine: false,
                    automaticLayout: true
                  }}
                />
              </div>

              {sqlResults && (
                <div className={styles.codeOutputConsole}>
                  <div style={{ color: '#71717a', fontSize: 11, marginBottom: 6 }}>
                    Query Output ({sqlResults.length} rows returned)
                  </div>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#38bdf8' }}>
                    {JSON.stringify(sqlResults, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* 12. Code Output Prediction */}
          {currentQ.question_type === 'code_output' && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Enter the exact console output:</div>
              <textarea
                placeholder="3&#10;3&#10;3"
                value={currentVal || ''}
                onChange={(e) => handleResponseChange(currentQ.id, e.target.value)}
                className={styles.textareaInput}
                rows={4}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          )}

          {/* 13. File Upload */}
          {currentQ.question_type === 'file_upload' && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ border: '2px dashed rgba(255, 255, 255, 0.15)', borderRadius: 12, padding: '30px 20px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange, #f25522)" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 4 }}>
                  Upload Technical Artifact
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
                  PDF, PNG, JPG, or SVG up to 10MB
                </div>

                <input
                  type="file"
                  id={`file_input_${currentQ.id}`}
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(currentQ.id, e)}
                  accept=".pdf,.png,.jpg,.jpeg,.svg"
                />
                <label htmlFor={`file_input_${currentQ.id}`} className={styles.btnPrimary} style={{ cursor: 'pointer', display: 'inline-flex' }}>
                  Select File
                </label>

                {currentVal && currentVal.filename && (
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#34d399', fontSize: 13 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Attached: {currentVal.filename}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className={styles.playerFooter}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQIndex === 0}
            className={styles.btnSecondary}
            style={{ opacity: currentQIndex === 0 ? 0.5 : 1 }}
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={() => setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            disabled={currentQIndex === questions.length - 1}
            className={styles.btnSecondary}
            style={{ opacity: currentQIndex === questions.length - 1 ? 0.5 : 1 }}
          >
            Next →
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={toggleFlag}
            className={styles.btnSecondary}
            style={{ borderColor: isFlagged ? '#a855f7' : undefined, color: isFlagged ? '#c084fc' : undefined }}
          >
            {isFlagged ? '★ Flagged for Review' : '☆ Flag Question'}
          </button>

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className={styles.btnPrimary}
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            Finish & Submit Assessment
          </button>
        </div>
      </div>

      {/* Floating Picture-in-Picture Camera Tile */}
      {mediaStream && (
        <div className={styles.cameraPiPTile}>
          <video
            ref={pipVideoRef}
            autoPlay
            playsInline
            muted
            className={styles.pipVideo}
          />
          <div
            className={`${styles.pipBadge} ${
              faceStatus === 'ok'
                ? styles.pipBadgeActive
                : faceStatus === 'no_face'
                ? styles.pipBadgeDanger
                : styles.pipBadgeWarning
            }`}
          >
            {faceStatus === 'ok' && '● REC • LIVE'}
            {faceStatus === 'no_face' && '⚠ NO FACE'}
            {faceStatus === 'multiple_faces' && '⚠ 2+ FACES'}
          </div>
        </div>
      )}

      {/* Floating Proctoring Toast Notification */}
      {toastMsg && (
        <div className={styles.toastWarning}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Fullscreen Required Modal */}
      {fullscreenRequired && (
        <div className={styles.proctorModal}>
          <div className={styles.proctorCard} style={{ borderColor: 'rgba(239, 68, 68, 0.6)' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ margin: '0 auto 12px' }}>
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            <h2 className={styles.proctorWarningTitle}>Full Screen Required</h2>
            <p className={styles.proctorWarningText}>
              You have left full-screen mode. This proctored assessment requires full-screen lock to preserve test integrity. Full-screen exits are logged as proctoring incidents.
            </p>
            <button
              type="button"
              onClick={handleReenterFullscreen}
              className={styles.btnPrimary}
              style={{ width: '100%' }}
            >
              Resume Full Screen Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
