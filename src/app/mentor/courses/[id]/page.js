'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getCourses,
  getMentorCourses,
  getCourseEnrolledStudents,
  getLiveSessions,
  createLiveSession,
  updateLiveSessionStatus,
  deleteLiveSession,
  getCourseSyllabus,
  saveCourseSyllabusModule,
  deleteCourseSyllabusModule,
  saveSyllabusTopic,
  deleteSyllabusTopic,
  getMaterials,
  saveMaterial,
  deleteMaterial
} from '@/app/actions';
import {
  getMentorCourseAssessments,
  getMentorAssessmentDetails,
  saveMentorCourseAssessment,
  deleteMentorCourseAssessment,
  getMentorQuestionBank,
  saveMentorQuestion,
  deleteMentorQuestion,
  linkQuestionToAssessmentMentor,
  unlinkQuestionFromAssessmentMentor,
  getMentorAssessmentResults,
  getMentorAttemptFullReview,
  gradeManualResponseMentor
} from '@/lib/assessments/actions';
import LiveClassroom from '@/components/LiveClassroom';
import styles from '../../mentor.module.css';

export default function MentorCourseWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const courseId = rawId ? parseInt(rawId, 10) : null;

  const [mentor, setMentor] = useState(null);
  const [course, setCourse] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'live' | 'syllabus' | 'materials'
  const [loading, setLoading] = useState(true);
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  // Tab 1: Students
  const [students, setStudents] = useState([]);

  // Tab 2: Live Classes
  const [sessions, setSessions] = useState([]);
  const [activeBroadcastSession, setActiveBroadcastSession] = useState(null);
  const [roomType, setRoomType] = useState('embedded'); // 'embedded' | 'external'
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    meetingLink: '',
    scheduledAt: ''
  });
  const [showEndModal, setShowEndModal] = useState(false);
  const [activeEndingSession, setActiveEndingSession] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState('');

  // Tab 3: Syllabus
  const [syllabus, setSyllabus] = useState([]);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleForm, setModuleForm] = useState({ id: null, title: '', orderIndex: 0 });
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicForm, setTopicForm] = useState({ id: null, moduleId: null, title: '', durationMinutes: 30, orderIndex: 0 });

  // Tab 4: Materials
  const [materials, setMaterials] = useState([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState({ id: null, title: '', assetsJson: '[]' });
  const [uploadingFile, setUploadingFile] = useState(false);

  // Tab 5: Assessments & Grading
  const [assessments, setAssessments] = useState([]);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({
    id: null,
    title: '',
    description: '',
    duration_minutes: 45,
    passing_marks: 20,
    max_attempts: 2,
    status: 'published',
    proctoring_enabled: 1
  });

  // Question Bank
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedAssessmentForQuestions, setSelectedAssessmentForQuestions] = useState(null);
  const [questionBank, setQuestionBank] = useState([]);
  const [questionForm, setQuestionForm] = useState({
    id: null,
    title: '',
    question_text: '',
    question_type: 'single_choice',
    marks: 2,
    negative_marks: 0,
    partial_credit: 0,
    options: [
      { option_text: '', is_correct: 1, explanation: '' },
      { option_text: '', is_correct: 0, explanation: '' }
    ],
    config_json: ''
  });

  // Results & Manual Grading
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedAssessmentForResults, setSelectedAssessmentForResults] = useState(null);
  const [assessmentAttempts, setAssessmentAttempts] = useState([]);
  const [gradingAttemptReview, setGradingAttemptReview] = useState(null);
  const [gradeInput, setGradeInput] = useState({ marks: 0, feedback: '' });
  const [activeGradingQuestionId, setActiveGradingQuestionId] = useState(null);

  // Load Mentor and Authorize Course Access
  useEffect(() => {
    if (!courseId || isNaN(courseId)) {
      return;
    }

    const profileStr = localStorage.getItem('mentorProfile');
    if (!profileStr) {
      router.push('/mentor/login');
      return;
    }

    try {
      const parsedMentor = JSON.parse(profileStr);
      setMentor(parsedMentor);

      getMentorCourses(parsedMentor.id).then(async (assigned) => {
        const isAdmin = parsedMentor.role === 'admin';
        const hasAccess = isAdmin || (assigned || []).some((c) => c.id === courseId);
        if (!hasAccess) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        setAuthorized(true);

        // Fetch course details
        const allCourses = await getCourses();
        const currentCourse = allCourses.find((c) => c.id === courseId);
        setCourse(currentCourse || null);

        // Initial data fetch
        await reloadTabData(parsedMentor.id, activeTab);
      }).catch((err) => {
        console.error("Authorization check failed:", err);
        setAuthorized(false);
      }).finally(() => setLoading(false));
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [courseId]);

  // Tab-specific data reload
  const reloadTabData = async (mentorId, tab) => {
    if (!mentorId || !courseId) return;

    try {
      if (tab === 'students') {
        const data = await getCourseEnrolledStudents(mentorId, courseId);
        const list = Array.isArray(data) ? data : (data?.students || []);
        setStudents(list);
      } else if (tab === 'live') {
        const data = await getLiveSessions(courseId);
        setSessions(Array.isArray(data) ? data : []);
      } else if (tab === 'syllabus') {
        const data = await getCourseSyllabus(courseId);
        setSyllabus(Array.isArray(data) ? data : []);
      } else if (tab === 'materials') {
        const allMaterials = await getMaterials();
        const courseMats = (allMaterials || []).filter((m) => m.courseId === courseId);
        setMaterials(courseMats);
      } else if (tab === 'assessments') {
        const data = await getMentorCourseAssessments(mentorId, courseId);
        setAssessments(Array.isArray(data) ? data : []);
      }
    } catch (tabErr) {
      console.error(`Error loading ${tab} data:`, tabErr);
    }
  };

  const handleTabSwitch = async (tab) => {
    setActiveTab(tab);
    if (mentor) {
      await reloadTabData(mentor.id, tab);
    }
  };

  // ─── LIVE CLASS ACTIONS ───
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!mentor) {
      alert('Please log in as mentor.');
      return;
    }
    if (!courseId) {
      alert('Invalid cohort course identifier.');
      return;
    }

    try {
      setSubmittingSchedule(true);
      const meetingLinkToUse = roomType === 'embedded'
        ? `https://meet.jit.si/atelier-live-cohort-${courseId}-${Date.now().toString(36)}`
        : scheduleForm.meetingLink;

      const res = await createLiveSession({
        mentorId: mentor.id,
        courseId,
        title: scheduleForm.title,
        description: scheduleForm.description,
        meetingLink: meetingLinkToUse,
        scheduledAt: scheduleForm.scheduledAt
      });

      if (res && res.success) {
        setShowScheduleModal(false);
        setScheduleForm({ title: '', description: '', meetingLink: '', scheduledAt: '' });
        setRoomType('embedded');
        await reloadTabData(mentor.id, 'live');
        alert('Live class scheduled successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Error scheduling class: ' + (err.message || 'Server error'));
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleStartClass = async (session) => {
    if (!mentor) return;
    try {
      await updateLiveSessionStatus(mentor.id, session.id, 'live');
      await reloadTabData(mentor.id, 'live');
      setActiveBroadcastSession({ ...session, status: 'live' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenEndModal = (session) => {
    setActiveEndingSession(session);
    setRecordingUrl(session.recording_url || '');
    setShowEndModal(true);
  };

  const handleEndClassSubmit = async (e) => {
    e.preventDefault();
    if (!mentor || !activeEndingSession) return;

    try {
      await updateLiveSessionStatus(mentor.id, activeEndingSession.id, 'completed', recordingUrl);
      if (activeBroadcastSession?.id === activeEndingSession.id) {
        setActiveBroadcastSession(null);
      }
      setShowEndModal(false);
      setActiveEndingSession(null);
      setRecordingUrl('');
      await reloadTabData(mentor.id, 'live');
    } catch (err) {
      alert('Error ending session: ' + err.message);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!mentor || !confirm('Are you sure you want to cancel and remove this session?')) return;
    try {
      await deleteLiveSession(mentor.id, sessionId);
      await reloadTabData(mentor.id, 'live');
    } catch (err) {
      alert('Error deleting session: ' + err.message);
    }
  };

  // ─── SYLLABUS ACTIONS ───
  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!mentor) return;

    try {
      await saveCourseSyllabusModule(mentor.id, courseId, moduleForm);
      setShowModuleModal(false);
      setModuleForm({ id: null, title: '', orderIndex: 0 });
      await reloadTabData(mentor.id, 'syllabus');
    } catch (err) {
      alert('Error saving syllabus module: ' + err.message);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!mentor || !confirm('Deleting this module will delete all topics inside it. Proceed?')) return;
    try {
      await deleteCourseSyllabusModule(mentor.id, courseId, moduleId);
      await reloadTabData(mentor.id, 'syllabus');
    } catch (err) {
      alert('Error deleting module: ' + err.message);
    }
  };

  const handleSaveTopic = async (e) => {
    e.preventDefault();
    if (!mentor) return;

    try {
      await saveSyllabusTopic(mentor.id, courseId, topicForm);
      setShowTopicModal(false);
      setTopicForm({ id: null, moduleId: null, title: '', durationMinutes: 30, orderIndex: 0 });
      await reloadTabData(mentor.id, 'syllabus');
    } catch (err) {
      alert('Error saving topic: ' + err.message);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!mentor || !confirm('Are you sure you want to delete this topic? Student progress records will be updated.')) return;
    try {
      await deleteSyllabusTopic(mentor.id, courseId, topicId);
      await reloadTabData(mentor.id, 'syllabus');
    } catch (err) {
      alert('Error deleting topic: ' + err.message);
    }
  };

  // ─── MATERIALS ACTIONS ───
  const handleMaterialFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds the 50 MB upload limit.');
      return;
    }

    setUploadingFile(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('category', 'material');
      body.append('courseId', courseId.toString());

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'x-admin-key': 'ARSHAD-SAMVRUDHI'
        },
        body
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload material asset.');
      }

      const sizeStr = file.size > 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : (file.size / 1024).toFixed(0) + ' KB';

      const ext = file.name.split('.').pop().toLowerCase();
      const assetType = ['pdf', 'zip', 'md', 'png', 'jpg', 'jpeg'].includes(ext) ? ext : 'doc';

      let currentAssets = [];
      try {
        currentAssets = JSON.parse(materialForm.assetsJson || '[]');
      } catch (err) {
        currentAssets = [];
      }

      currentAssets.push({
        name: file.name,
        size: sizeStr,
        type: assetType,
        fileId: data.file.id,
        url: data.file.url
      });

      setMaterialForm((prev) => ({
        ...prev,
        assetsJson: JSON.stringify(currentAssets, null, 2)
      }));

      alert(`File "${file.name}" uploaded successfully!`);
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    if (!mentor) return;

    try {
      let assets = [];
      try {
        assets = JSON.parse(materialForm.assetsJson || '[]');
      } catch (err) {
        alert('Invalid JSON formatting for assets array.');
        return;
      }

      await saveMaterial({
        id: materialForm.id,
        courseId,
        title: materialForm.title,
        assets
      });

      setShowMaterialModal(false);
      setMaterialForm({ id: null, title: '', assetsJson: '[]' });
      await reloadTabData(mentor.id, 'materials');
    } catch (err) {
      alert('Error saving material: ' + err.message);
    }
  };

  const handleDeleteMaterialItem = async (id) => {
    if (!confirm('Are you sure you want to delete this resource folder?')) return;
    try {
      await deleteMaterial(id);
      await reloadTabData(mentor.id, 'materials');
    } catch (err) {
      alert('Error deleting material: ' + err.message);
    }
  };

  // ─── ASSESSMENTS & GRADING ACTIONS ───
  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    if (!mentor || !courseId) return;

    try {
      await saveMentorCourseAssessment(mentor.id, courseId, assessmentForm);
      setShowAssessmentModal(false);
      setAssessmentForm({
        id: null,
        title: '',
        description: '',
        duration_minutes: 45,
        passing_marks: 20,
        max_attempts: 2,
        status: 'published',
        proctoring_enabled: 1
      });
      await reloadTabData(mentor.id, 'assessments');
    } catch (err) {
      alert('Error saving assessment: ' + err.message);
    }
  };

  const handleDeleteAssessment = async (asstId) => {
    if (!confirm('Are you sure you want to delete this assessment? All associated attempts will also be removed.')) return;
    try {
      await deleteMentorCourseAssessment(mentor.id, courseId, asstId);
      await reloadTabData(mentor.id, 'assessments');
    } catch (err) {
      alert('Error deleting assessment: ' + err.message);
    }
  };

  const handleOpenQuestionManager = async (asst) => {
    try {
      const details = await getMentorAssessmentDetails(mentor.id, courseId, asst.id);
      setSelectedAssessmentForQuestions(details);
      const bank = await getMentorQuestionBank(mentor.id, courseId);
      setQuestionBank(bank || []);
    } catch (err) {
      alert('Error loading question bank: ' + err.message);
    }
  };

  const handleToggleLinkQuestion = async (qId, isCurrentlyLinked) => {
    if (!selectedAssessmentForQuestions) return;
    try {
      if (isCurrentlyLinked) {
        await unlinkQuestionFromAssessmentMentor(mentor.id, courseId, selectedAssessmentForQuestions.id, qId);
      } else {
        await linkQuestionToAssessmentMentor(mentor.id, courseId, {
          assessment_id: selectedAssessmentForQuestions.id,
          question_id: qId,
          marks: 2
        });
      }
      const updated = await getMentorAssessmentDetails(mentor.id, courseId, selectedAssessmentForQuestions.id);
      setSelectedAssessmentForQuestions(updated);
      await reloadTabData(mentor.id, 'assessments');
    } catch (err) {
      alert('Error updating question link: ' + err.message);
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!mentor || !courseId) return;

    try {
      const res = await saveMentorQuestion(mentor.id, courseId, questionForm);
      if (selectedAssessmentForQuestions && res.id) {
        await linkQuestionToAssessmentMentor(mentor.id, courseId, {
          assessment_id: selectedAssessmentForQuestions.id,
          question_id: res.id,
          marks: questionForm.marks
        });
        const updated = await getMentorAssessmentDetails(mentor.id, courseId, selectedAssessmentForQuestions.id);
        setSelectedAssessmentForQuestions(updated);
      }
      setShowQuestionModal(false);
      const bank = await getMentorQuestionBank(mentor.id, courseId);
      setQuestionBank(bank || []);
      await reloadTabData(mentor.id, 'assessments');
    } catch (err) {
      alert('Error saving question: ' + err.message);
    }
  };

  const handleOpenResults = async (asst) => {
    try {
      setSelectedAssessmentForResults(asst);
      const results = await getMentorAssessmentResults(mentor.id, courseId, asst.id);
      setAssessmentAttempts(results || []);
      setShowResultsModal(true);
    } catch (err) {
      alert('Error loading results: ' + err.message);
    }
  };

  const handleOpenReviewAttempt = async (attempt) => {
    try {
      const review = await getMentorAttemptFullReview(mentor.id, courseId, attempt.id);
      setGradingAttemptReview(review);
    } catch (err) {
      alert('Error loading attempt review: ' + err.message);
    }
  };

  const handleSaveGrade = async (questionId) => {
    if (!gradingAttemptReview) return;
    try {
      await gradeManualResponseMentor(mentor.id, courseId, {
        attemptId: gradingAttemptReview.attempt.id,
        questionId,
        marksAwarded: gradeInput.marks,
        feedback: gradeInput.feedback
      });
      alert('Grade recorded successfully!');
      // Reload review
      const review = await getMentorAttemptFullReview(mentor.id, courseId, gradingAttemptReview.attempt.id);
      setGradingAttemptReview(review);
      // Reload results list
      const results = await getMentorAssessmentResults(mentor.id, courseId, selectedAssessmentForResults.id);
      setAssessmentAttempts(results || []);
      setActiveGradingQuestionId(null);
    } catch (err) {
      alert('Error saving grade: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.contentWrapper} style={{ color: 'rgba(255,255,255,0.4)' }}>
        Loading Cohort Workspace...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className={styles.contentWrapper}>
        <div className={styles.errorBanner} style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#ff3b30', marginBottom: '0.5rem' }}>
            Access Denied
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            You do not have mentor privileges for this cohort. If you believe this is a mistake, contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  const liveSessionInProgress = sessions.find((s) => s.status === 'live');

  return (
    <div className={styles.contentWrapper}>
      {/* Workspace Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--accent-orange)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
          Cohort Workspace
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.4rem' }}>
          {course?.title}
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          Manage enrolled students, broadcast live lecture sessions, structure syllabus modules, and provide assets.
        </p>
      </div>

      {/* Embedded Live Classroom Broadcast Studio for Mentor */}
      {activeBroadcastSession && (
        <div style={{ marginBottom: '2.5rem' }}>
          <LiveClassroom
            roomName={activeBroadcastSession.meeting_link || activeBroadcastSession.meetingLink}
            user={{ name: mentor?.name || 'Mentor', email: mentor?.email }}
            isMentor={true}
            title={activeBroadcastSession.title}
            cohortName={course?.title}
            onClose={() => setActiveBroadcastSession(null)}
          />
        </div>
      )}

      {/* 4 Tabs */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tabItem} ${activeTab === 'students' ? styles.tabItemActive : ''}`}
          onClick={() => handleTabSwitch('students')}
        >
          Enrolled Students ({students.length})
        </button>
        <button
          className={`${styles.tabItem} ${activeTab === 'live' ? styles.tabItemActive : ''}`}
          onClick={() => handleTabSwitch('live')}
        >
          Live Classes ({sessions.length})
        </button>
        <button
          className={`${styles.tabItem} ${activeTab === 'syllabus' ? styles.tabItemActive : ''}`}
          onClick={() => handleTabSwitch('syllabus')}
        >
          Syllabus Manager ({syllabus.length} Modules)
        </button>
        <button
          className={`${styles.tabItem} ${activeTab === 'materials' ? styles.tabItemActive : ''}`}
          onClick={() => handleTabSwitch('materials')}
        >
          Materials & Assets ({materials.length})
        </button>
        <button
          className={`${styles.tabItem} ${activeTab === 'assessments' ? styles.tabItemActive : ''}`}
          onClick={() => handleTabSwitch('assessments')}
        >
          Assessments & Grading ({assessments.length})
        </button>
      </div>

      {/* ─── TAB 1: ENROLLED STUDENTS ─── */}
      {activeTab === 'students' && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Enrolled Cohort Members</h2>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>
              Total: {students.length} students
            </span>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Contact</th>
                <th>College / Grad Year</th>
                <th>Enrolled On</th>
                <th>Curriculum Progress</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div style={{ fontWeight: '700', color: '#ffffff' }}>{student.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>ID: {student.id}</div>
                  </td>
                  <td>
                    <div>{student.email}</div>
                    {student.phone && (
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{student.phone}</div>
                    )}
                  </td>
                  <td>
                    {student.college || '—'} {student.gradYear ? `(${student.gradYear})` : ''}
                  </td>
                  <td>
                    {student.enrolled_at ? new Date(student.enrolled_at).toLocaleDateString() : 'Active'}
                  </td>
                  <td style={{ minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: '800', color: student.progressPct === 100 ? '#30d158' : '#ffffff' }}>
                        {student.progressPct}%
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                        {student.completedTopics} / {student.totalTopics} topics
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${student.progressPct}%`,
                          height: '100%',
                          background: student.progressPct === 100 ? '#30d158' : 'var(--accent-orange, #f25522)',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '2.5rem' }}>
                    No students currently enrolled in this cohort path.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── TAB 2: LIVE CLASSES ─── */}
      {activeTab === 'live' && (
        <div>
          {/* Active Live Session in Progress Card */}
          {liveSessionInProgress && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.15) 0%, rgba(10, 10, 12, 0.95) 100%)',
              border: '1px solid rgba(255, 59, 48, 0.4)',
              borderRadius: '12px',
              padding: '1.75rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 8px #ff3b30' }} />
                  <span style={{ color: '#ff3b30', fontSize: '0.74rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    BROADCAST IN PROGRESS
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#ffffff', margin: 0 }}>
                  {liveSessionInProgress.title}
                </h3>
                {liveSessionInProgress.description && (
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.35rem' }}>
                    {liveSessionInProgress.description}
                  </p>
                )}
                {liveSessionInProgress.meeting_link && (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#30d158', fontWeight: '700' }}>
                      ✓ Host Controls: Mute All, Screen Share & Live Chat Active
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  className={styles.primaryBtn}
                  style={{ width: 'auto', background: 'var(--accent-orange)', whiteSpace: 'nowrap' }}
                  onClick={() => setActiveBroadcastSession(liveSessionInProgress)}
                >
                  Enter Studio (Host)
                </button>
                <button
                  className={styles.secondaryBtn}
                  style={{ color: '#ff3b30', borderColor: 'rgba(255, 59, 48, 0.4)', whiteSpace: 'nowrap' }}
                  onClick={() => handleOpenEndModal(liveSessionInProgress)}
                >
                  End Live Session
                </button>
              </div>
            </div>
          )}

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Cohort Live Sessions</h2>
              <button
                className={styles.primaryBtn}
                style={{ width: 'auto', padding: '0.6rem 1.15rem' }}
                onClick={() => setShowScheduleModal(true)}
              >
                + Schedule Live Class
              </button>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Session Title</th>
                  <th>Scheduled Date & Time</th>
                  <th>Room Link</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#ffffff' }}>{session.title}</div>
                      {session.description && (
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', maxWidth: '280px' }}>
                          {session.description}
                        </div>
                      )}
                    </td>
                    <td>
                      {session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : 'TBA'}
                    </td>
                    <td>
                      {session.meeting_link ? (
                        <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
                          {session.meeting_link.includes('meet.jit.si') ? 'Atelier Classroom' : 'External URL'}
                        </span>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem' }}>None</span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          background: session.status === 'live' ? 'rgba(255, 59, 48, 0.15)' : session.status === 'completed' ? 'rgba(48, 209, 88, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                          color: session.status === 'live' ? '#ff3b30' : session.status === 'completed' ? '#30d158' : 'rgba(255,255,255,0.7)',
                          border: `1px solid ${session.status === 'live' ? 'rgba(255, 59, 48, 0.3)' : session.status === 'completed' ? 'rgba(48, 209, 88, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
                        }}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {session.status === 'scheduled' && (
                          <button
                            className={styles.secondaryBtn}
                            style={{ color: '#30d158', borderColor: 'rgba(48, 209, 88, 0.3)' }}
                            disabled={!!liveSessionInProgress}
                            title={liveSessionInProgress ? 'Another class is already live' : 'Start broadcasting'}
                            onClick={() => handleStartClass(session)}
                          >
                            Start Class
                          </button>
                        )}
                        {session.status === 'live' && (
                          <>
                            <button
                              className={styles.secondaryBtn}
                              style={{ color: 'var(--accent-orange)', borderColor: 'rgba(242, 85, 34, 0.4)', fontWeight: '700' }}
                              onClick={() => setActiveBroadcastSession(session)}
                            >
                              Studio (Host)
                            </button>
                            <button
                              className={styles.secondaryBtn}
                              style={{ color: '#ff3b30', borderColor: 'rgba(255, 59, 48, 0.3)' }}
                              onClick={() => handleOpenEndModal(session)}
                            >
                              End
                            </button>
                          </>
                        )}
                        {session.recording_url && (
                          <a
                            href={session.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.secondaryBtn}
                          >
                            Replay
                          </a>
                        )}
                        <button
                          className={styles.secondaryBtn}
                          style={{ color: '#ff453a' }}
                          onClick={() => handleDeleteSession(session.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '2.5rem' }}>
                      No live sessions scheduled yet for this cohort.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: SYLLABUS MANAGER ─── */}
      {activeTab === 'syllabus' && (
        <div>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Curriculum & Syllabus Modules</h2>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                  Modules and topics directly control student progress tracking across the dashboard.
                </p>
              </div>
              <button
                className={styles.primaryBtn}
                style={{ width: 'auto', padding: '0.6rem 1.15rem' }}
                onClick={() => {
                  setModuleForm({ id: null, title: '', orderIndex: syllabus.length + 1 });
                  setShowModuleModal(true);
                }}
              >
                + Add Module
              </button>
            </div>

            {syllabus.map((module) => (
              <div key={module.id} className={styles.moduleCard}>
                <div className={styles.moduleHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.74rem', background: 'rgba(242, 85, 34, 0.1)', color: '#f25522', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                      Module {module.order_index}
                    </span>
                    <span className={styles.moduleTitle}>{module.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                      ({(module.topics || []).length} topics)
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className={styles.secondaryBtn}
                      onClick={() => {
                        setTopicForm({
                          id: null,
                          moduleId: module.id,
                          title: '',
                          durationMinutes: 45,
                          orderIndex: (module.topics || []).length + 1
                        });
                        setShowTopicModal(true);
                      }}
                    >
                      + Add Topic
                    </button>
                    <button
                      className={styles.secondaryBtn}
                      onClick={() => {
                        setModuleForm({ id: module.id, title: module.title, orderIndex: module.order_index });
                        setShowModuleModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.secondaryBtn}
                      style={{ color: '#ff453a' }}
                      onClick={() => handleDeleteModule(module.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className={styles.topicList}>
                  {(module.topics || []).map((topic) => (
                    <div key={topic.id} className={styles.topicItem}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                          #{topic.order_index}
                        </span>
                        <span style={{ color: '#ffffff', fontWeight: '600' }}>{topic.title}</span>
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.04)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          {topic.duration_minutes} mins
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className={styles.secondaryBtn}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => {
                            setTopicForm({
                              id: topic.id,
                              moduleId: module.id,
                              title: topic.title,
                              durationMinutes: topic.duration_minutes,
                              orderIndex: topic.order_index
                            });
                            setShowTopicModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className={styles.secondaryBtn}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#ff453a' }}
                          onClick={() => handleDeleteTopic(topic.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {(module.topics || []).length === 0 && (
                    <div style={{ padding: '1rem 0', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>
                      No topics added to this module yet. Click "+ Add Topic" above.
                    </div>
                  )}
                </div>
              </div>
            ))}

            {syllabus.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'rgba(255,255,255,0.35)' }}>
                No syllabus modules created yet for this cohort.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 4: MATERIALS ─── */}
      {activeTab === 'materials' && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Course Resource Folders</h2>
            <button
              className={styles.primaryBtn}
              style={{ width: 'auto', padding: '0.6rem 1.15rem' }}
              onClick={() => {
                setMaterialForm({ id: null, title: '', assetsJson: '[]' });
                setShowMaterialModal(true);
              }}
            >
              + Create Resource Folder
            </button>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Folder Module Title</th>
                <th>Assets Count</th>
                <th>File Preview</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((mat) => (
                <tr key={mat.id}>
                  <td style={{ fontWeight: '700', color: '#ffffff' }}>{mat.title}</td>
                  <td>{(mat.assets || []).length} Files</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(mat.assets || []).map((asset, idx) => (
                        <a
                          key={idx}
                          href={asset.url || `/api/files/${asset.fileId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.72rem',
                            color: 'rgba(255,255,255,0.7)',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            padding: '0.2rem 0.45rem',
                            borderRadius: '4px',
                            textDecoration: 'none'
                          }}
                        >
                          📄 {asset.name} ({asset.size})
                        </a>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className={styles.secondaryBtn}
                        onClick={() => {
                          setMaterialForm({
                            id: mat.id,
                            title: mat.title,
                            assetsJson: JSON.stringify(mat.assets || [], null, 2)
                          });
                          setShowMaterialModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.secondaryBtn}
                        style={{ color: '#ff453a' }}
                        onClick={() => handleDeleteMaterialItem(mat.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '2.5rem' }}>
                    No resource folders uploaded for this cohort yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── TAB 5: ASSESSMENTS & EVALUATIONS ─── */}
      {activeTab === 'assessments' && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>Cohort Assessments & Evaluations</h2>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>
                Create multi-format diagnostics, manage questions, review code submissions, and grade answers.
              </span>
            </div>
            <button
              className={styles.primaryBtn}
              style={{ width: 'auto', padding: '0.6rem 1.15rem' }}
              onClick={() => {
                setAssessmentForm({
                  id: null,
                  title: '',
                  description: '',
                  duration_minutes: 45,
                  passing_marks: 20,
                  max_attempts: 2,
                  status: 'published',
                  proctoring_enabled: 1
                });
                setShowAssessmentModal(true);
              }}
            >
              + Create Assessment
            </button>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Assessment Title</th>
                <th>Duration & Marks</th>
                <th>Questions</th>
                <th>Submissions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((asst) => (
                <tr key={asst.id}>
                  <td>
                    <div style={{ fontWeight: '700', color: '#ffffff' }}>{asst.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {asst.description || 'Standard evaluation'}
                    </div>
                  </td>
                  <td>
                    <div>{asst.duration_minutes} Mins</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                      {asst.total_marks} Marks ({asst.passing_marks} to pass)
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleOpenQuestionManager(asst)}
                      style={{
                        background: 'rgba(99, 102, 241, 0.12)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        color: '#818cf8',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {asst.question_count || 0} Questions ⚙
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => handleOpenResults(asst)}
                      style={{
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34d399',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {asst.attempt_count || 0} Attempts 📊
                    </button>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: asst.status === 'published' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                        color: asst.status === 'published' ? '#34d399' : '#94a3b8'
                      }}
                    >
                      {asst.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className={styles.secondaryBtn}
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={() => {
                          setAssessmentForm({
                            id: asst.id,
                            title: asst.title,
                            description: asst.description || '',
                            duration_minutes: asst.duration_minutes,
                            passing_marks: asst.passing_marks,
                            max_attempts: asst.max_attempts,
                            status: asst.status,
                            proctoring_enabled: asst.proctoring_enabled
                          });
                          setShowAssessmentModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.secondaryBtn}
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#ff453a' }}
                        onClick={() => handleDeleteAssessment(asst.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {assessments.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '2.5rem' }}>
                    No assessments created for this cohort yet. Click "+ Create Assessment" above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── MODAL: SCHEDULE LIVE SESSION ─── */}
      {showScheduleModal && (
        <div className={styles.modalOverlay} onClick={() => setShowScheduleModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Schedule Cohort Live Session</h3>
              <button className={styles.modalClose} onClick={() => setShowScheduleModal(false)}>✕</button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Class Topic Title</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  placeholder="e.g. Distributed Caching with Redis & Raft"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description / Agenda (Optional)</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Overview of topics and questions covered..."
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Classroom Delivery Platform</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0.5rem 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: roomType === 'embedded' ? '#ffffff' : 'rgba(255,255,255,0.6)' }}>
                    <input
                      type="radio"
                      name="roomType"
                      checked={roomType === 'embedded'}
                      onChange={() => setRoomType('embedded')}
                    />
                    <span>Built-in Atelier Classroom (Jitsi Meet with Host Controls & Chat)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: roomType === 'external' ? '#ffffff' : 'rgba(255,255,255,0.6)' }}>
                    <input
                      type="radio"
                      name="roomType"
                      checked={roomType === 'external'}
                      onChange={() => setRoomType('external')}
                    />
                    <span>External Meeting Link (Zoom, Google Meet, Teams)</span>
                  </label>
                </div>
              </div>

              {roomType === 'embedded' ? (
                <div style={{ padding: '0.75rem', background: 'rgba(242, 85, 34, 0.08)', border: '1px solid rgba(242, 85, 34, 0.25)', borderRadius: '6px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.25rem' }}>
                  ✓ <strong>Native Classroom Enabled:</strong> Room will be automatically generated with Host privileges for you (Screen Share, Mute All, Kick Participant, Chat). Students can unmute to talk and ask doubts.
                </div>
              ) : (
                <div className={styles.formGroup}>
                  <label className={styles.label}>External Meeting Link (Google Meet, Zoom)</label>
                  <input
                    type="url"
                    required={roomType === 'external'}
                    className={styles.input}
                    placeholder="https://meet.google.com/xyz-abc-def"
                    value={scheduleForm.meetingLink}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className={styles.input}
                  value={scheduleForm.scheduledAt}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={submittingSchedule} className={styles.primaryBtn} style={{ width: 'auto' }}>
                  {submittingSchedule ? 'Scheduling Live Class...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: END LIVE SESSION ─── */}
      {showEndModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEndModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Conclude Live Session</h3>
              <button className={styles.modalClose} onClick={() => setShowEndModal(false)}>✕</button>
            </div>

            <form onSubmit={handleEndClassSubmit}>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem' }}>
                Ending this broadcast will change its status to Completed. You can optionally paste a recording link (e.g. YouTube Unlisted, Drive, or Loom) for student replays.
              </p>

              <div className={styles.formGroup}>
                <label className={styles.label}>Recorded Video Replay URL (Optional)</label>
                <input
                  type="url"
                  className={styles.input}
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={recordingUrl}
                  onChange={(e) => setRecordingUrl(e.target.value)}
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setShowEndModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} style={{ width: 'auto', background: '#ff3b30' }}>
                  End Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT SYLLABUS MODULE ─── */}
      {showModuleModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModuleModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {moduleForm.id ? 'Edit Syllabus Module' : 'Add Syllabus Module'}
              </h3>
              <button className={styles.modalClose} onClick={() => setShowModuleModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveModule}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Module Title</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  placeholder="e.g. Module 1: Core Networking & Protocols"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Sequence Index</label>
                <input
                  type="number"
                  required
                  className={styles.input}
                  value={moduleForm.orderIndex}
                  onChange={(e) => setModuleForm({ ...moduleForm, orderIndex: parseInt(e.target.value || 0, 10) })}
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setShowModuleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} style={{ width: 'auto' }}>
                  Commit Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT SYLLABUS TOPIC ─── */}
      {showTopicModal && (
        <div className={styles.modalOverlay} onClick={() => setShowTopicModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {topicForm.id ? 'Edit Topic' : 'Add Curriculum Topic'}
              </h3>
              <button className={styles.modalClose} onClick={() => setShowTopicModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveTopic}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Topic Title</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  placeholder="e.g. TCP Handshakes and Keep-Alive Tuning"
                  value={topicForm.title}
                  onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Estimated Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  className={styles.input}
                  value={topicForm.durationMinutes}
                  onChange={(e) => setTopicForm({ ...topicForm, durationMinutes: parseInt(e.target.value || 0, 10) })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Topic Order Index</label>
                <input
                  type="number"
                  required
                  className={styles.input}
                  value={topicForm.orderIndex}
                  onChange={(e) => setTopicForm({ ...topicForm, orderIndex: parseInt(e.target.value || 0, 10) })}
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setShowTopicModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} style={{ width: 'auto' }}>
                  Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT MATERIAL FOLDER ─── */}
      {showMaterialModal && (
        <div className={styles.modalOverlay} onClick={() => setShowMaterialModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {materialForm.id ? 'Edit Resource Folder' : 'Create Resource Folder'}
              </h3>
              <button className={styles.modalClose} onClick={() => setShowMaterialModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveMaterial}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Folder Title</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  placeholder="e.g. Week 1: Slides, Cheatsheets & Starter Repos"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label className={styles.label} style={{ margin: 0 }}>Assets JSON</label>
                  <label style={{
                    cursor: uploadingFile ? 'wait' : 'pointer',
                    color: 'var(--accent-orange, #f25522)',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    background: 'rgba(242, 85, 34, 0.1)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(242, 85, 34, 0.2)'
                  }}>
                    {uploadingFile ? '⏳ Uploading...' : '➕ Upload File'}
                    <input type="file" style={{ display: 'none' }} onChange={handleMaterialFileUpload} disabled={uploadingFile} />
                  </label>
                </div>

                <textarea
                  required
                  className={styles.textarea}
                  style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
                  value={materialForm.assetsJson}
                  onChange={(e) => setMaterialForm({ ...materialForm, assetsJson: e.target.value })}
                />
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.3rem', display: 'block' }}>
                  Click "➕ Upload File" above to automatically attach files to this folder.
                </span>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setShowMaterialModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} style={{ width: 'auto' }}>
                  Save Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE / EDIT ASSESSMENT ─── */}
      {showAssessmentModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAssessmentModal(false)}>
          <div className={styles.modalContent} style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {assessmentForm.id ? 'Edit Cohort Assessment' : 'Create Cohort Assessment'}
              </h3>
              <button className={styles.modalClose} onClick={() => setShowAssessmentModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveAssessment}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Cohort Course</label>
                <input
                  type="text"
                  disabled
                  className={styles.input}
                  value={course?.title || 'Selected Course'}
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Assessment Title</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  placeholder="e.g. Mid-Cohort Systems Architecture Diagnostic"
                  value={assessmentForm.title}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Outline syllabus coverage, rules, and expectations..."
                  value={assessmentForm.description}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Duration (Mins)</label>
                  <input
                    type="number"
                    required
                    className={styles.input}
                    value={assessmentForm.duration_minutes}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, duration_minutes: parseInt(e.target.value || 0, 10) })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Passing Marks</label>
                  <input
                    type="number"
                    required
                    className={styles.input}
                    value={assessmentForm.passing_marks}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, passing_marks: parseInt(e.target.value || 0, 10) })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Max Attempts</label>
                  <input
                    type="number"
                    required
                    className={styles.input}
                    value={assessmentForm.max_attempts}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, max_attempts: parseInt(e.target.value || 1, 10) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Status</label>
                  <select
                    className={styles.select}
                    value={assessmentForm.status}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, status: e.target.value })}
                  >
                    <option value="published">Published (Visible to Enrolled Students)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Proctoring Monitoring</label>
                  <select
                    className={styles.select}
                    value={assessmentForm.proctoring_enabled ? 1 : 0}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, proctoring_enabled: parseInt(e.target.value, 10) })}
                  >
                    <option value={1}>Enabled (Logs tab & window blurs)</option>
                    <option value={0}>Disabled</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setShowAssessmentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} style={{ width: 'auto' }}>
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: QUESTION MANAGER & QUESTION BANK ─── */}
      {selectedAssessmentForQuestions && (
        <div className={styles.modalOverlay} onClick={() => setSelectedAssessmentForQuestions(null)}>
          <div className={styles.modalContent} style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Questions Manager: {selectedAssessmentForQuestions.title}</h3>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
                  Total Marks: {selectedAssessmentForQuestions.total_marks} • Linked Questions: {(selectedAssessmentForQuestions.questions || []).length}
                </span>
              </div>
              <button className={styles.modalClose} onClick={() => setSelectedAssessmentForQuestions(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ color: '#ffffff', margin: 0, fontSize: '0.95rem' }}>Assessment Question Roster</h4>
              <button
                className={styles.primaryBtn}
                style={{ width: 'auto', padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                onClick={() => {
                  setQuestionForm({
                    id: null,
                    title: '',
                    question_text: '',
                    question_type: 'single_choice',
                    marks: 2,
                    negative_marks: 0,
                    partial_credit: 0,
                    options: [
                      { option_text: '', is_correct: 1, explanation: '' },
                      { option_text: '', is_correct: 0, explanation: '' }
                    ],
                    config_json: ''
                  });
                  setShowQuestionModal(true);
                }}
              >
                + Create New Question
              </button>
            </div>

            {/* Currently Linked Questions Table */}
            <table className={styles.table} style={{ marginBottom: '1.5rem' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Question Title & Text</th>
                  <th>Type</th>
                  <th>Marks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(selectedAssessmentForQuestions.questions || []).map((q, idx) => (
                  <tr key={q.id}>
                    <td style={{ color: '#6366f1', fontWeight: '700' }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#ffffff' }}>{q.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.question_text}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.74rem', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                        {q.question_type}
                      </span>
                    </td>
                    <td>{q.marks} Marks</td>
                    <td>
                      <button
                        className={styles.secondaryBtn}
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', color: '#ff453a' }}
                        onClick={() => handleToggleLinkQuestion(q.id, true)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {(selectedAssessmentForQuestions.questions || []).length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '1.5rem' }}>
                      No questions linked to this assessment yet. Choose from the bank below or create a new question.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Reusable Course Question Bank */}
            <h4 style={{ color: '#ffffff', margin: '1.5rem 0 0.8rem', fontSize: '0.95rem' }}>
              Available in Course Question Bank ({questionBank.length})
            </h4>
            <div style={{ maxHeight: '250px', overflowY: 'auto', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              {questionBank.map((bankQ) => {
                const isAlreadyLinked = (selectedAssessmentForQuestions.questions || []).some(item => item.id === bankQ.id);

                return (
                  <div key={bankQ.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '0.85rem' }}>{bankQ.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                        {bankQ.question_type} • {bankQ.marks} marks
                      </div>
                    </div>

                    <div>
                      {isAlreadyLinked ? (
                        <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '600' }}>✓ Linked</span>
                      ) : (
                        <button
                          className={styles.primaryBtn}
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', width: 'auto' }}
                          onClick={() => handleToggleLinkQuestion(bankQ.id, false)}
                        >
                          + Link to Assessment
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE QUESTION ─── */}
      {showQuestionModal && (
        <div className={styles.modalOverlay} onClick={() => setShowQuestionModal(false)}>
          <div className={styles.modalContent} style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add Question to Course Bank</h3>
              <button className={styles.modalClose} onClick={() => setShowQuestionModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveQuestion}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Question Type</label>
                <select
                  className={styles.select}
                  value={questionForm.question_type}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })}
                >
                  <option value="single_choice">Single-Choice MCQ</option>
                  <option value="multiple_choice">Multiple-Choice (Multi-Select)</option>
                  <option value="true_false">True / False</option>
                  <option value="fill_blank">Fill in the Blank</option>
                  <option value="numerical">Numerical Value</option>
                  <option value="matching">Matching Pairs</option>
                  <option value="ordering">Ordering / Sequence</option>
                  <option value="short_answer">Short Answer (Subjective)</option>
                  <option value="essay">Essay / Analysis (Subjective with Rubrics)</option>
                  <option value="coding">Interactive Coding (Monaco)</option>
                  <option value="debugging">Code Debugging</option>
                  <option value="sql">SQL Query (Isolated SQLite)</option>
                  <option value="code_output">Predict Code Output</option>
                  <option value="file_upload">Technical Artifact / File Upload</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Title / Headline</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  placeholder="e.g. React Server Components Rendering Model"
                  value={questionForm.title}
                  onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Question Prompt / Problem Description</label>
                <textarea
                  required
                  className={styles.textarea}
                  placeholder="Enter full technical prompt or scenario..."
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Marks Awarded</label>
                  <input
                    type="number"
                    required
                    className={styles.input}
                    value={questionForm.marks}
                    onChange={(e) => setQuestionForm({ ...questionForm, marks: parseInt(e.target.value || 1, 10) })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Negative Penalty (for incorrect)</label>
                  <input
                    type="number"
                    step="any"
                    className={styles.input}
                    value={questionForm.negative_marks}
                    onChange={(e) => setQuestionForm({ ...questionForm, negative_marks: parseFloat(e.target.value || 0) })}
                  />
                </div>
              </div>

              {/* Options for MCQ / Multiple Choice */}
              {['single_choice', 'multiple_choice'].includes(questionForm.question_type) && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Options (Check the correct answer)</label>
                  {questionForm.options.map((opt, optIdx) => (
                    <div key={optIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(opt.is_correct)}
                        onChange={(e) => {
                          const updated = [...questionForm.options];
                          if (questionForm.question_type === 'single_choice') {
                            updated.forEach((o, i) => o.is_correct = i === optIdx ? 1 : 0);
                          } else {
                            updated[optIdx].is_correct = e.target.checked ? 1 : 0;
                          }
                          setQuestionForm({ ...questionForm, options: updated });
                        }}
                      />
                      <input
                        type="text"
                        required
                        className={styles.input}
                        placeholder={`Option ${optIdx + 1} text`}
                        value={opt.option_text}
                        onChange={(e) => {
                          const updated = [...questionForm.options];
                          updated[optIdx].option_text = e.target.value;
                          setQuestionForm({ ...questionForm, options: updated });
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                    onClick={() => {
                      setQuestionForm({
                        ...questionForm,
                        options: [...questionForm.options, { option_text: '', is_correct: 0, explanation: '' }]
                      });
                    }}
                  >
                    + Add Option
                  </button>
                </div>
              )}

              {/* Config JSON for advanced types */}
              {['coding', 'debugging', 'sql', 'matching', 'ordering', 'numerical'].includes(questionForm.question_type) && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Specialized Config JSON (Starter code / schema / keys)</label>
                  <textarea
                    className={styles.textarea}
                    style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
                    placeholder='{"starterCode": "function solve() {}", "language": "javascript"}'
                    value={questionForm.config_json}
                    onChange={(e) => setQuestionForm({ ...questionForm, config_json: e.target.value })}
                  />
                </div>
              )}

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setShowQuestionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} style={{ width: 'auto' }}>
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: RESULTS & STUDENT SUBMISSIONS ─── */}
      {showResultsModal && selectedAssessmentForResults && (
        <div className={styles.modalOverlay} onClick={() => setShowResultsModal(false)}>
          <div className={styles.modalContent} style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Submissions: {selectedAssessmentForResults.title}</h3>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
                  Total Student Attempts: {assessmentAttempts.length}
                </span>
              </div>
              <button className={styles.modalClose} onClick={() => setShowResultsModal(false)}>✕</button>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Attempt</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Proctoring</th>
                  <th>Submitted At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assessmentAttempts.map((att) => (
                  <tr key={att.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#ffffff' }}>{att.student_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{att.student_email}</div>
                    </td>
                    <td>#{att.attempt_number}</td>
                    <td>
                      <strong style={{ color: att.passed ? '#34d399' : '#f87171' }}>
                        {att.total_score} ({att.percentage}%)
                      </strong>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: att.status === 'evaluated' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: att.status === 'evaluated' ? '#34d399' : '#fbbf24'
                        }}
                      >
                        {att.status === 'evaluated' ? (att.passed ? 'PASSED' : 'FAILED') : 'NEEDS GRADING'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: att.proctoring_flags > 0 ? '#fbbf24' : '#34d399' }}>
                        {att.proctoring_flags} Flags
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
                      {att.submitted_at ? new Date(att.submitted_at).toLocaleDateString() : 'In Progress'}
                    </td>
                    <td>
                      <button
                        className={styles.primaryBtn}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', width: 'auto' }}
                        onClick={() => handleOpenReviewAttempt(att)}
                      >
                        Review & Grade
                      </button>
                    </td>
                  </tr>
                ))}
                {assessmentAttempts.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '2rem' }}>
                      No student submissions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODAL: MANUAL GRADING ATTEMPT REVIEW ─── */}
      {gradingAttemptReview && (
        <div className={styles.modalOverlay} onClick={() => setGradingAttemptReview(null)}>
          <div className={styles.modalContent} style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  Reviewing Attempt: {gradingAttemptReview.attempt.student_name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
                  Current Score: {gradingAttemptReview.attempt.total_score} / {gradingAttemptReview.attempt.total_marks} ({gradingAttemptReview.attempt.percentage}%)
                </span>
              </div>
              <button className={styles.modalClose} onClick={() => setGradingAttemptReview(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(gradingAttemptReview.responses || []).map((resp, idx) => {
                const isManual = ['short_answer', 'essay', 'file_upload'].includes(resp.question_type);

                return (
                  <div key={resp.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', color: '#6366f1' }}>Q{idx + 1}.</span>
                        <span style={{ fontWeight: '600', color: '#ffffff' }}>{resp.question_title}</span>
                        <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                          {resp.question_type}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: resp.status === 'correct' ? '#34d399' : '#ffffff' }}>
                        {resp.marks_awarded} / {resp.max_marks} Marks
                      </div>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
                      {resp.question_text}
                    </div>

                    {/* Student Response Display */}
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '12px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', marginBottom: '4px' }}>STUDENT RESPONSE:</div>
                      {resp.response_data ? (
                        typeof resp.response_data === 'object' && resp.response_data.url ? (
                          <a href={resp.response_data.url} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecoration: 'underline' }}>
                            View Attached File: {resp.response_data.filename}
                          </a>
                        ) : (
                          <div style={{ whiteSpace: 'pre-wrap', color: '#ffffff' }}>
                            {typeof resp.response_data === 'object' ? JSON.stringify(resp.response_data, null, 2) : String(resp.response_data)}
                          </div>
                        )
                      ) : (
                        <em style={{ color: 'rgba(255,255,255,0.3)' }}>No response submitted</em>
                      )}
                    </div>

                    {/* Manual Grading Controls */}
                    {isManual && (
                      <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '12px', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#818cf8', marginBottom: '8px' }}>
                          Instructor Evaluation & Rubrics
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '10px', alignItems: 'center' }}>
                          <div>
                            <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>Marks Awarded</label>
                            <input
                              type="number"
                              step="any"
                              max={resp.max_marks}
                              className={styles.input}
                              style={{ padding: '0.4rem 0.6rem' }}
                              value={activeGradingQuestionId === resp.question_id ? gradeInput.marks : resp.marks_awarded}
                              onChange={(e) => {
                                setActiveGradingQuestionId(resp.question_id);
                                setGradeInput({ ...gradeInput, marks: parseFloat(e.target.value || 0) });
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>Feedback</label>
                            <input
                              type="text"
                              className={styles.input}
                              style={{ padding: '0.4rem 0.6rem' }}
                              placeholder="Constructive feedback for the student..."
                              value={activeGradingQuestionId === resp.question_id ? gradeInput.feedback : (resp.evaluator_feedback || '')}
                              onChange={(e) => {
                                setActiveGradingQuestionId(resp.question_id);
                                setGradeInput({ ...gradeInput, feedback: e.target.value });
                              }}
                            />
                          </div>

                          <button
                            type="button"
                            className={styles.primaryBtn}
                            style={{ width: 'auto', padding: '0.45rem 0.9rem', fontSize: '0.78rem', marginTop: '16px' }}
                            onClick={() => handleSaveGrade(resp.question_id)}
                          >
                            Save Score
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
