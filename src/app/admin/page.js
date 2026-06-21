'use client';

import React, { useState, useEffect } from 'react';
import { 
  getStudents, saveStudent, deleteStudent,
  getCourses, saveCourse, deleteCourse,
  getSchedule, saveSchedule, deleteSchedule,
  getMaterials, saveMaterial, deleteMaterial,
  getCallbacks, resolveCallback, deleteCallback,
  getLecturers, saveLecturer, deleteLecturer,
  getTransactions, deleteTransaction
} from '../actions';
import styles from './admin.module.css';

export default function AdminConsole() {
  const [authorized, setAuthorized] = useState(false);
  const [securityKey, setSecurityKey] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Entity Tab: 'users' | 'courses' | 'live' | 'materials' | 'callbacks' | 'lecturers' | 'payments'
  const [activeTab, setActiveTab] = useState('users');

  // DB entities state
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [callbacks, setCallbacks] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [visitors, setVisitors] = useState(1420);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Modals visibility & data state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({});

  // Check sessionStorage for admin clearances
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isClear = sessionStorage.getItem('adminCleared');
      if (isClear === 'true') {
        setAuthorized(true);
      }
    }
  }, []);

  const loadData = async () => {
    setStudents(await getStudents());
    setCourses(await getCourses());
    setSchedule(await getSchedule());
    setMaterials(await getMaterials());
    setCallbacks(await getCallbacks());
    setLecturers(await getLecturers());
    setTransactions(await getTransactions());
  };

  // Fetch db lists
  useEffect(() => {
    if (!authorized) return;
    loadData();

    if (typeof window !== 'undefined') {
      const current = parseInt(localStorage.getItem('site_visitors') || '1420', 10);
      const sessionKey = sessionStorage.getItem('visitorCounted');
      if (!sessionKey) {
        localStorage.setItem('site_visitors', (current + 7).toString());
        sessionStorage.setItem('visitorCounted', 'true');
        setVisitors(current + 7);
      } else {
        setVisitors(current);
      }
    }

    window.addEventListener('courseChanged', loadData);
    return () => window.removeEventListener('courseChanged', loadData);
  }, [authorized]);

  const handleLogin = (e) => {
    e.preventDefault();
    const envKey = process.env.NEXT_PUBLIC_MASTER_SECURITY_KEY;
    const envPass = process.env.NEXT_PUBLIC_CLEARANCE_PASSWORD;
    if ((envKey && securityKey === envKey) || (envPass && securityKey === envPass)) {
      setAuthorized(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('adminCleared', 'true');
      }
    } else {
      setLoginError('Clearance denied: Invalid Security Key credentials.');
    }
  };

  const handleLogout = () => {
    setAuthorized(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('adminCleared');
    }
  };

  // Delete Entity
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this entity? This operation is permanent.')) return;

    try {
      if (activeTab === 'users') {
        await deleteStudent(id);
      } else if (activeTab === 'courses') {
        await deleteCourse(id);
      } else if (activeTab === 'live') {
        await deleteSchedule(id);
      } else if (activeTab === 'materials') {
        await deleteMaterial(id);
      } else if (activeTab === 'callbacks') {
        await deleteCallback(id);
      } else if (activeTab === 'lecturers') {
        await deleteLecturer(id);
      } else if (activeTab === 'payments') {
        await deleteTransaction(id);
      }
      
      // Sync list
      window.dispatchEvent(new Event('courseChanged'));
    } catch (err) {
      console.error(err);
      alert("Error deleting entity: " + err.message);
    }
  };

  // Open add/edit modal
  const openModal = (mode, entity = null) => {
    setModalMode(mode);
    if (mode === 'edit' && entity) {
      setEditId(entity.id);
      setFormData({ ...entity });
    } else {
      setEditId(null);
      // Initialize default inputs based on active tab
      if (activeTab === 'users') {
        setFormData({ name: '', email: '', phone: '', college: '', gradYear: '2026', xp: 0, streak: 0, enrolledCourses: '1' });
      } else if (activeTab === 'courses') {
        setFormData({ title: '', description: '', price: 'Rs. 5999', originalPrice: 'Rs. 11998', discount: '50% OFF', badges: 'Certified, support', image: '/images/course_cohort_2.png', instructorId: '1', duration: '12 Weeks', highlights: '', curriculumOverview: '' });
      } else if (activeTab === 'live') {
        setFormData({ courseId: '1', time: 'Today, 6:00 PM', title: '', type: 'Lecture' });
      } else if (activeTab === 'materials') {
        setFormData({ courseId: '1', title: '', assetsJson: '[]' });
      } else if (activeTab === 'lecturers') {
        setFormData({ name: '', email: '', expertise: '', bio: '' });
      }
    }
    setShowModal(true);
  };

  // Handle Input Changes inside modals
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit Modal details (Create / Update operations)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      if (activeTab === 'users') {
        const formattedUser = {
          ...formData,
          xp: parseInt(formData.xp || 0, 10),
          streak: parseInt(formData.streak || 0, 10),
          enrolledCourses: formData.enrolledCourses ? (typeof formData.enrolledCourses === 'string' ? formData.enrolledCourses.split(',').map(n => parseInt(n.trim(), 10)) : formData.enrolledCourses) : [1]
        };
        if (modalMode === 'edit') {
          formattedUser.id = editId;
        }
        await saveStudent(formattedUser);
      } else if (activeTab === 'courses') {
        const formattedCourse = {
          ...formData,
          badges: typeof formData.badges === 'string' ? formData.badges.split(',').map(s => s.trim()) : formData.badges,
          instructorId: parseInt(formData.instructorId || 1, 10),
          duration: formData.duration || null,
          highlights: formData.highlights || null,
          curriculumOverview: formData.curriculumOverview || null
        };
        if (modalMode === 'edit') {
          formattedCourse.id = editId;
        }
        await saveCourse(formattedCourse);
      } else if (activeTab === 'live') {
        const formattedLive = {
          ...formData,
          courseId: parseInt(formData.courseId, 10)
        };
        if (modalMode === 'edit') {
          formattedLive.id = editId;
        }
        await saveSchedule(formattedLive);
      } else if (activeTab === 'materials') {
        let assets = [];
        try {
          assets = JSON.parse(formData.assetsJson || '[]');
        } catch (e) {
          alert('Invalid JSON formatting for assets array. Using empty array.');
        }
        const formattedMaterial = {
          courseId: parseInt(formData.courseId, 10),
          title: formData.title,
          assets
        };
        if (modalMode === 'edit') {
          formattedMaterial.id = editId;
        }
        await saveMaterial(formattedMaterial);
      } else if (activeTab === 'lecturers') {
        const formattedLecturer = { ...formData };
        if (modalMode === 'edit') {
          formattedLecturer.id = editId;
        }
        await saveLecturer(formattedLecturer);
      }

      // Close modal and reload lists
      window.dispatchEvent(new Event('courseChanged'));
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Error saving entity: " + err.message);
    }
  };

  // Hotline callback operations
  const handleResolveCallback = async (id) => {
    try {
      await resolveCallback(id);
      window.dispatchEvent(new Event('courseChanged'));
    } catch (err) {
      console.error(err);
    }
  };

  // Filters logic
  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredSchedule = schedule.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredMaterials = materials.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCallbacks = callbacks.filter(c => c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || c.topic.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredLecturers = lecturers.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.expertise.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredTransactions = transactions.filter(t => t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || t.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()));

  // Dynamic stats calculations
  const activeEnrolledCount = students.filter(s => s.enrolledCourses && s.enrolledCourses.length > 0).length;
  const avgXP = students.length > 0 ? Math.round(students.reduce((acc, s) => acc + (s.xp || 0), 0) / students.length) : 0;

  // SECURITY INPUT GATE
  if (!authorized) {
    return (
      <div className={styles.gateWrapper}>
        <div className={styles.gateCard}>
          <div className={styles.gateHeader}>
            <h2 className={styles.gateTitle}>Atelier Terminal</h2>
            <p className={styles.gateSubtitle}>Secure Admin Authorization clearance</p>
          </div>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="ENTER SECURITY KEY" 
              required
              className={styles.gateInput}
              value={securityKey}
              onChange={(e) => setSecurityKey(e.target.value)}
            />
            {loginError && <p style={{ color: '#ff4d4d', fontSize: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>{loginError}</p>}
            <button type="submit" className={styles.gateBtn}>Authorize CLEARANCE</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminShell}>
      
      {/* Header bar */}
      <header className={styles.adminHeader}>
        <div className={styles.adminTitleBlock}>
          <img src="/logo.png" alt="Atelier" style={{ width: '28px', height: '28px' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '1.2rem' }}>Atelier Server Node</h2>
          <span className={styles.adminBadge}>Admin Console</span>
        </div>
        <button 
          onClick={handleLogout}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
        >
          Exit Session
        </button>
      </header>

      {/* Main Container */}
      <main className={styles.adminMain}>
        
        {/* Entity Tabs */}
        <div className={styles.tabRow}>
          <button className={`${styles.tabBtn} ${activeTab === 'users' ? styles.tabBtnActive : ''}`} onClick={() => { setActiveTab('users'); setSearchTerm(''); }}>Students ({students.length})</button>
          <button className={`${styles.tabBtn} ${activeTab === 'courses' ? styles.tabBtnActive : ''}`} onClick={() => { setActiveTab('courses'); setSearchTerm(''); }}>Courses ({courses.length})</button>
          <button className={`${styles.tabBtn} ${activeTab === 'live' ? styles.tabBtnActive : ''}`} onClick={() => { setActiveTab('live'); setSearchTerm(''); }}>Live Schedule ({schedule.length})</button>
          <button className={`${styles.tabBtn} ${activeTab === 'materials' ? styles.tabBtnActive : ''}`} onClick={() => { setActiveTab('materials'); setSearchTerm(''); }}>Materials ({materials.length})</button>
          <button className={`${styles.tabBtn} ${activeTab === 'callbacks' ? styles.tabBtnActive : ''}`} onClick={() => { setActiveTab('callbacks'); setSearchTerm(''); }}>Hotline Callback Logs ({callbacks.length})</button>
          <button className={`${styles.tabBtn} ${activeTab === 'lecturers' ? styles.tabBtnActive : ''}`} onClick={() => { setActiveTab('lecturers'); setSearchTerm(''); }}>Lecturers ({lecturers.length})</button>
          <button className={`${styles.tabBtn} ${activeTab === 'payments' ? styles.tabBtnActive : ''}`} onClick={() => { setActiveTab('payments'); setSearchTerm(''); }}>Payments ({transactions.length})</button>
        </div>

        {/* Dynamic Metric Gauges */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Active Database Students</span>
            <p className={styles.statValue}>{students.length}</p>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Cohorts Offered</span>
            <p className={styles.statValue}>{courses.length}</p>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Upcoming Streams Scheduled</span>
            <p className={styles.statValue}>{schedule.length}</p>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pending Callback Requests</span>
            <p className={styles.statValue} style={{ color: 'var(--accent-orange)' }}>{callbacks.filter(c => c.status === 'Pending').length}</p>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Registered Lecturers</span>
            <p className={styles.statValue}>{lecturers.length}</p>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Payments Logs</span>
            <p className={styles.statValue}>{transactions.length}</p>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Site Visitors</span>
            <p className={styles.statValue}>{visitors}</p>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Active Enrolled Students</span>
            <p className={styles.statValue}>{activeEnrolledCount}</p>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Average Student XP</span>
            <p className={styles.statValue}>{avgXP} XP</p>
          </div>
        </div>

        {/* Content Control Header */}
        <div className={styles.controlHeader}>
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`} 
            className={styles.searchBar}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {activeTab !== 'callbacks' && activeTab !== 'payments' && (
            <button 
              className={styles.gateBtn} 
              style={{ width: 'auto', padding: '0.5rem 1rem' }}
              onClick={() => openModal('add')}
            >
              + Create New Entity
            </button>
          )}
        </div>

        {/* Data Tables */}
        <div className={styles.tableWrapper}>
          
          {/* TAB 1: USERS ENTITIES */}
          {activeTab === 'users' && (
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>College Details</th>
                  <th>XP</th>
                  <th>Streak</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td style={{ fontWeight: '600' }}>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.college} ({s.gradYear})</td>
                    <td>{s.xp}</td>
                    <td style={{ color: 'var(--accent-orange)', fontWeight: '600' }}>{s.streak} Days</td>
                    <td>
                      <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => openModal('edit', s)}>Edit</button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>No student logs matching filters.</td></tr>}
              </tbody>
            </table>
          )}

          {/* TAB 2: COURSES ENTITIES */}
          {activeTab === 'courses' && (
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Discount</th>
                  <th>Badges</th>
                  <th>Enrolled Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td style={{ maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={c.title}>
                      <a href={`/admin/courses/${c.id}`} style={{ color: 'var(--accent-orange)', fontWeight: '600', textDecoration: 'underline' }}>
                        {c.title}
                      </a>
                    </td>
                    <td>{c.price || 'Free'}</td>
                    <td>{c.discount || 'N/A'}</td>
                    <td>{c.badges ? c.badges.join(', ') : ''}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {students.filter(s => s.enrolledCourses && s.enrolledCourses.includes(c.id)).map(s => (
                          <span key={s.id} className={styles.adminBadge} style={{ background: 'rgba(242, 85, 34, 0.08)', border: '1px solid rgba(242, 85, 34, 0.2)', color: 'var(--accent-orange)' }}>
                            {s.name}
                          </span>
                        ))}
                        {students.filter(s => s.enrolledCourses && s.enrolledCourses.includes(c.id)).length === 0 && (
                          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>No Enrolled Students</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => openModal('edit', c)}>Edit</button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredCourses.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>No cohort databases matching filters.</td></tr>}
              </tbody>
            </table>
          )}

          {/* TAB 3: LIVE SCHEDULE ENTITIES */}
          {activeTab === 'live' && (
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Course ID</th>
                  <th>Topic Title</th>
                  <th>Time Slot</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedule.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.courseId === 1 ? 'Cohort 3.0' : 'System Design'}</td>
                    <td style={{ fontWeight: '600' }}>{s.title}</td>
                    <td>{s.time}</td>
                    <td><span className={styles.adminBadge} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#ffffff' }}>{s.type}</span></td>
                    <td>
                      <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => openModal('edit', s)}>Edit</button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredSchedule.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>No live streams matching filters.</td></tr>}
              </tbody>
            </table>
          )}

          {/* TAB 4: MATERIALS */}
          {activeTab === 'materials' && (
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Course ID</th>
                  <th>Folder Module Name</th>
                  <th>Total Files</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.courseId === 1 ? 'Cohort 3.0' : 'System Design'}</td>
                    <td style={{ fontWeight: '600' }}>{m.title}</td>
                    <td>{m.assets ? m.assets.length : 0} Assets</td>
                    <td>
                      <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => openModal('edit', m)}>Edit</button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(m.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredMaterials.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>No resource folder matching filters.</td></tr>}
              </tbody>
            </table>
          )}

          {/* TAB 5: HOTLINE CALLBACK REQUEST LOGS */}
          {activeTab === 'callbacks' && (
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Phone</th>
                  <th>Topic Request</th>
                  <th>Submitted Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCallbacks.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td style={{ fontWeight: '600' }}>{c.studentName}</td>
                    <td>{c.phone}</td>
                    <td>{c.topic}</td>
                    <td>{c.time ? new Date(c.time).toLocaleTimeString() : 'Recent'}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${c.status === 'Pending' ? styles.statusPending : styles.statusResolved}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      {c.status === 'Pending' && (
                        <button className={`${styles.actionBtn} ${styles.resolveBtn}`} onClick={() => handleResolveCallback(c.id)}>Resolve</button>
                      )}
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredCallbacks.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>No callback submissions.</td></tr>}
              </tbody>
            </table>
          )}

          {/* TAB 6: LECTURERS ENTITIES */}
          {activeTab === 'lecturers' && (
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Expertise</th>
                  <th>Biography</th>
                  <th>Active Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLecturers.map((l) => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td>
                      <a href={`/admin/lecturers/${l.id}`} style={{ color: '#2ecc71', fontWeight: '600', textDecoration: 'underline' }}>
                        {l.name}
                      </a>
                    </td>
                    <td>{l.email}</td>
                    <td>{l.expertise}</td>
                    <td style={{ maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={l.bio}>{l.bio}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {students.filter(s => s.enrolledCourses && s.enrolledCourses.some(cId => courses.filter(c => c.instructorId === l.id).map(c => c.id).includes(cId))).map(s => (
                          <span key={s.id} className={styles.adminBadge} style={{ background: 'rgba(46, 204, 113, 0.08)', border: '1px solid rgba(46, 204, 113, 0.2)', color: '#2ecc71' }}>
                            {s.name}
                          </span>
                        ))}
                        {students.filter(s => s.enrolledCourses && s.enrolledCourses.some(cId => courses.filter(c => c.instructorId === l.id).map(c => c.id).includes(cId))).length === 0 && (
                          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>No Active Students</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => openModal('edit', l)}>Edit</button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(l.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredLecturers.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>No lecturer profiles matching filters.</td></tr>}
              </tbody>
            </table>
          )}

          {/* TAB 7: PAYMENTS ENTITIES */}
          {activeTab === 'payments' && (
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student Details</th>
                  <th>Course Title</th>
                  <th>Amount</th>
                  <th>Razorpay Order ID</th>
                  <th>Razorpay Payment ID</th>
                  <th>Date/Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td style={{ fontWeight: '600' }}>
                      <div>{t.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>ID: {t.studentId}</div>
                    </td>
                    <td style={{ maxWidth: '200px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={t.courseTitle}>
                      {t.courseTitle}
                    </td>
                    <td style={{ color: '#2ecc71', fontWeight: '600' }}>{t.amount}</td>
                    <td style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>
                      {t.razorpayOrderId || <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                    </td>
                    <td style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>
                      {t.razorpayPaymentId || <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                    </td>
                    <td>{t.timestamp ? new Date(t.timestamp).toLocaleString() : 'Recent'}</td>
                    <td>
                      <span className={styles.statusBadge} style={{ 
                        color: t.status === 'Verified' ? '#3b82f6' : '#2ecc71', 
                        background: t.status === 'Verified' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(46, 204, 113, 0.08)', 
                        border: t.status === 'Verified' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(46, 204, 113, 0.2)' 
                      }}>
                        {t.status || 'Success'}
                      </span>
                    </td>
                    <td>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(t.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && <tr><td colSpan="9" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>No payment logs matching filters.</td></tr>}
              </tbody>
            </table>
          )}

        </div>
      </main>

      {/* CREATE & EDIT FORM MODALS */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modalMode === 'edit' ? `Modify ${activeTab.slice(0, -1)} Entity` : `Create ${activeTab.slice(0, -1)} Log`}
              </h3>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className={styles.modalForm}>
              
              {/* TAB INPUTS: USERS */}
              {activeTab === 'users' && (
                <>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Student Name</label>
                    <input type="text" name="name" required className={styles.modalInput} value={formData.name || ''} onChange={handleFormChange} />
                  </div>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Email Address</label>
                    <input type="email" name="email" required className={styles.modalInput} value={formData.email || ''} onChange={handleFormChange} />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.profileFormGroup}>
                      <label className={styles.modalLabel}>Phone</label>
                      <input type="tel" name="phone" className={styles.modalInput} value={formData.phone || ''} onChange={handleFormChange} />
                    </div>
                    <div className={styles.profileFormGroup}>
                      <label className={styles.modalLabel}>Graduation Year</label>
                      <input type="number" name="gradYear" className={styles.modalInput} value={formData.gradYear || '2026'} onChange={handleFormChange} />
                    </div>
                  </div>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>College / Institution</label>
                    <input type="text" name="college" className={styles.modalInput} value={formData.college || ''} onChange={handleFormChange} />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.profileFormGroup}>
                      <label className={styles.modalLabel}>Streak Days</label>
                      <input type="number" name="streak" className={styles.modalInput} value={formData.streak || '0'} onChange={handleFormChange} />
                    </div>
                    <div className={styles.profileFormGroup}>
                      <label className={styles.modalLabel}>XP points</label>
                      <input type="number" name="xp" className={styles.modalInput} value={formData.xp || '0'} onChange={handleFormChange} />
                    </div>
                  </div>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Enrolled Course IDs (comma separated)</label>
                    <input type="text" name="enrolledCourses" className={styles.modalInput} placeholder="1, 2" value={formData.enrolledCourses || ''} onChange={handleFormChange} />
                  </div>
                </>
              )}

              {/* TAB INPUTS: COURSES */}
              {activeTab === 'courses' && (
                <>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Course Title</label>
                    <input type="text" name="title" required className={styles.modalInput} value={formData.title || ''} onChange={handleFormChange} />
                  </div>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Description</label>
                    <textarea name="description" required className={styles.modalTextarea} value={formData.description || ''} onChange={handleFormChange} />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.profileFormGroup}>
                      <label className={styles.modalLabel}>Price Tag</label>
                      <input type="text" name="price" className={styles.modalInput} value={formData.price || ''} onChange={handleFormChange} />
                    </div>
                    <div className={styles.profileFormGroup}>
                      <label className={styles.modalLabel}>Original Price (Slashed)</label>
                      <input type="text" name="originalPrice" className={styles.modalInput} value={formData.originalPrice || ''} onChange={handleFormChange} />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.profileFormGroup}>
                      <label className={styles.modalLabel}>Discount (e.g. 50% OFF)</label>
                      <input type="text" name="discount" className={styles.modalInput} value={formData.discount || ''} onChange={handleFormChange} />
                    </div>
                    <div className={styles.profileFormGroup}>
                      <label className={styles.modalLabel}>Duration (e.g. 12 Weeks)</label>
                      <input type="text" name="duration" className={styles.modalInput} placeholder="12 Weeks" value={formData.duration || ''} onChange={handleFormChange} />
                    </div>
                  </div>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Features/Badges (comma separated)</label>
                    <input type="text" name="badges" className={styles.modalInput} placeholder="Real Product, Certified, Support" value={formData.badges || ''} onChange={handleFormChange} />
                  </div>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Course Highlights (comma separated)</label>
                    <input type="text" name="highlights" className={styles.modalInput} placeholder="Live classes, Industry projects, 1:1 mentorship" value={formData.highlights || ''} onChange={handleFormChange} />
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.2rem' }}>Displayed as feature bullets on the course detail page</span>
                  </div>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Curriculum Overview</label>
                    <textarea name="curriculumOverview" className={styles.modalTextarea} placeholder="Week 1: Foundations & Setup\nWeek 2: Core Architecture\nWeek 3: Advanced Patterns..." value={formData.curriculumOverview || ''} onChange={handleFormChange} />
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.2rem' }}>Shown as curriculum roadmap on the course detail page</span>
                  </div>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Assigned Course Instructor (Lecturer)</label>
                    <select name="instructorId" className={styles.modalSelect} value={formData.instructorId || '1'} onChange={handleFormChange}>
                      {lecturers.map((l) => (
                        <option key={l.id} value={l.id}>{l.name} ({l.expertise})</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* TAB INPUTS: LIVE SCHEDULE */}
              {activeTab === 'live' && (
                <>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Session Topic Title</label>
                    <input type="text" name="title" required className={styles.modalInput} value={formData.title || ''} onChange={handleFormChange} />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.profileFormGroup}>
                      <label className={styles.modalLabel}>Associated Course</label>
                      <select name="courseId" className={styles.modalSelect} value={formData.courseId || ''} onChange={handleFormChange}>
                        <option value="">-- Select Course --</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.profileFormGroup}>
                      <label className={styles.modalLabel}>Session Type</label>
                      <select name="type" className={styles.modalSelect} value={formData.type || 'Lecture'} onChange={handleFormChange}>
                        <option value="Lecture">Lecture</option>
                        <option value="Lab">Coding Lab</option>
                        <option value="Review">Mentor Review</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Time Slot (e.g. Today, 6:00 PM)</label>
                    <input type="text" name="time" required className={styles.modalInput} value={formData.time || ''} onChange={handleFormChange} />
                  </div>
                </>
              )}

              {/* TAB INPUTS: MATERIALS */}
              {activeTab === 'materials' && (
                <>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Folder Module Title</label>
                    <input type="text" name="title" required className={styles.modalInput} value={formData.title || ''} onChange={handleFormChange} />
                  </div>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Associated Course</label>
                    <select name="courseId" className={styles.modalSelect} value={formData.courseId || ''} onChange={handleFormChange}>
                      <option value="">-- Select Course --</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Assets Array JSON</label>
                    <textarea 
                      name="assetsJson" 
                      required 
                      className={styles.modalTextarea} 
                      style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
                      value={formData.assetsJson || JSON.stringify(formData.assets || [], null, 2)} 
                      onChange={handleFormChange} 
                    />
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.2rem' }}>
                      {'Format: [{"name":"File.pdf","size":"1.2 MB","type":"pdf"}] (Types: pdf, zip, link, md)'}
                    </span>
                  </div>
                </>
              )}

              {/* TAB INPUTS: LECTURERS */}
              {activeTab === 'lecturers' && (
                <>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Lecturer Name</label>
                    <input type="text" name="name" required className={styles.modalInput} value={formData.name || ''} onChange={handleFormChange} />
                  </div>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Email Address</label>
                    <input type="email" name="email" required className={styles.modalInput} value={formData.email || ''} onChange={handleFormChange} />
                  </div>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Expertise Focus (e.g. Distributed Systems)</label>
                    <input type="text" name="expertise" required className={styles.modalInput} value={formData.expertise || ''} onChange={handleFormChange} />
                  </div>
                  <div className={styles.profileFormGroup}>
                    <label className={styles.modalLabel}>Lecturer Biography</label>
                    <textarea name="bio" required className={styles.modalTextarea} value={formData.bio || ''} onChange={handleFormChange} />
                  </div>
                </>
              )}

              <div className={styles.modalFooter}>
                <button type="button" className={styles.actionBtn} style={{ color: '#ffffff', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={styles.gateBtn} style={{ width: 'auto', padding: '0.5rem 1rem' }}>Commit Changes</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
