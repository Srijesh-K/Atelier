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
import styles from '../../mentor.module.css';

export default function MentorCourseWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = parseInt(params.id, 10);

  const [mentor, setMentor] = useState(null);
  const [course, setCourse] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'live' | 'syllabus' | 'materials'
  const [loading, setLoading] = useState(true);

  // Tab 1: Students
  const [students, setStudents] = useState([]);

  // Tab 2: Live Classes
  const [sessions, setSessions] = useState([]);
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

  // Load Mentor and Authorize Course Access
  useEffect(() => {
    const profileStr = localStorage.getItem('mentorProfile');
    if (!profileStr) {
      router.push('/mentor/login');
      return;
    }

    try {
      const parsedMentor = JSON.parse(profileStr);
      setMentor(parsedMentor);

      getMentorCourses(parsedMentor.id).then(async (assigned) => {
        const hasAccess = (assigned || []).some((c) => c.id === courseId);
        if (!hasAccess) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        setAuthorized(true);

        // Fetch course details
        const allCourses = await getCourses();
        const currentCourse = allCourses.find((c) => c.id === courseId);
        setCourse(currentCourse);

        // Initial data fetch
        await reloadTabData(parsedMentor.id, activeTab);
      }).finally(() => setLoading(false));
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [courseId]);

  // Tab-specific data reload
  const reloadTabData = async (mentorId, tab) => {
    if (!mentorId) return;

    if (tab === 'students') {
      const data = await getCourseEnrolledStudents(mentorId, courseId);
      setStudents(data || []);
    } else if (tab === 'live') {
      const data = await getLiveSessions(courseId);
      setSessions(data || []);
    } else if (tab === 'syllabus') {
      const data = await getCourseSyllabus(courseId);
      setSyllabus(data || []);
    } else if (tab === 'materials') {
      const allMaterials = await getMaterials();
      const courseMats = (allMaterials || []).filter((m) => m.courseId === courseId);
      setMaterials(courseMats);
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
    if (!mentor) return;

    try {
      await createLiveSession({
        mentorId: mentor.id,
        courseId,
        title: scheduleForm.title,
        description: scheduleForm.description,
        meetingLink: scheduleForm.meetingLink,
        scheduledAt: scheduleForm.scheduledAt
      });

      setShowScheduleModal(false);
      setScheduleForm({ title: '', description: '', meetingLink: '', scheduledAt: '' });
      await reloadTabData(mentor.id, 'live');
    } catch (err) {
      alert('Error scheduling class: ' + err.message);
    }
  };

  const handleStartClass = async (sessionId) => {
    if (!mentor) return;
    try {
      await updateLiveSessionStatus(mentor.id, sessionId, 'live');
      await reloadTabData(mentor.id, 'live');
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
                  <a
                    href={liveSessionInProgress.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.82rem', color: 'var(--accent-orange)', fontWeight: '700', textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}
                  >
                    Open Meeting Room &rarr;
                  </a>
                )}
              </div>

              <button
                className={styles.primaryBtn}
                style={{ width: 'auto', background: '#ff3b30', borderColor: '#ff3b30', whiteSpace: 'nowrap' }}
                onClick={() => handleOpenEndModal(liveSessionInProgress)}
              >
                End Live Session
              </button>
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
                        <a
                          href={session.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--accent-orange)', fontSize: '0.82rem', fontWeight: '700', textDecoration: 'none' }}
                        >
                          Join Link &rarr;
                        </a>
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
                            onClick={() => handleStartClass(session.id)}
                          >
                            Start Class
                          </button>
                        )}
                        {session.status === 'live' && (
                          <button
                            className={styles.secondaryBtn}
                            style={{ color: '#ff3b30', borderColor: 'rgba(255, 59, 48, 0.3)' }}
                            onClick={() => handleOpenEndModal(session)}
                          >
                            End Class
                          </button>
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
                <label className={styles.label}>Meeting Link (Google Meet, Zoom)</label>
                <input
                  type="url"
                  required
                  className={styles.input}
                  placeholder="https://meet.google.com/xyz-abc-def"
                  value={scheduleForm.meetingLink}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                />
              </div>

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
                <button type="submit" className={styles.primaryBtn} style={{ width: 'auto' }}>
                  Save Schedule
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
    </div>
  );
}
