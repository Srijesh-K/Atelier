'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CheckoutModal from '@/components/CheckoutModal';
import { getCourseById, getLecturers, getMaterials, getStudents } from '../../actions';
import styles from './course-detail.module.css';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = parseInt(params.id, 10);

  const [course, setCourse] = useState(null);
  const [instructor, setInstructor] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [student, setStudent] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!courseId) return;

      try {
        const cData = await getCourseById(courseId);
        if (!cData) {
          setLoading(false);
          return;
        }
        setCourse(cData);

        // Fetch instructor details
        const lecturersList = await getLecturers();
        const inst = lecturersList.find((l) => l.id === cData.instructorId);
        setInstructor(inst || { name: 'Expert Mentor', expertise: 'Full Stack & Scaling', bio: 'Industry veteran and workspace advisor.' });

        // Fetch syllabus folder materials
        const allMaterials = await getMaterials();
        const syllabus = allMaterials.filter((m) => m.courseId === courseId);
        setMaterials(syllabus);

        // Fetch student credentials & enrollment status
        const email = localStorage.getItem('loggedInStudentEmail');
        if (email) {
          const studentsList = await getStudents();
          const activeStudent = studentsList.find((s) => s.email.toLowerCase() === email.toLowerCase());
          if (activeStudent) {
            setStudent(activeStudent);
            const enrolled = activeStudent.enrolledCourses || [];
            setIsEnrolled(enrolled.includes(courseId));
          }
        }
      } catch (err) {
        console.error("Error loading course details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [courseId]);

  const handleEnrollClick = () => {
    if (!student) {
      // Redirect to secure signin and pass dynamic redirectTo param
      router.push(`/auth/signin?redirectTo=/courses/${courseId}`);
      return;
    }
    setShowCheckout(true);
  };

  const handleAccessWorkspace = () => {
    localStorage.setItem('activeCourseId', courseId.toString());
    window.dispatchEvent(new Event('courseChanged'));
    router.push('/dashboard');
  };

  const handlePaymentSuccess = async () => {
    setIsEnrolled(true);
    setShowCheckout(false);
    
    // Sync local storage profile
    if (student) {
      const studentsList = await getStudents();
      const updatedStudent = studentsList.find((s) => s.id === student.id);
      if (updatedStudent) {
        localStorage.setItem('studentProfile', JSON.stringify({
          name: updatedStudent.name,
          email: updatedStudent.email,
          phone: updatedStudent.phone || '',
          college: updatedStudent.college || '',
          gradYear: updatedStudent.gradYear || '',
          bio: updatedStudent.bio || '',
          github: updatedStudent.github || '',
          linkedin: updatedStudent.linkedin || '',
          portfolio: updatedStudent.portfolio || '',
          skills: updatedStudent.skills || []
        }));
      }
    }
    
    localStorage.setItem('activeCourseId', courseId.toString());
    window.dispatchEvent(new Event('profileChanged'));
    window.dispatchEvent(new Event('courseChanged'));
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className={styles.pageSection} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.backgroundGrid} />
          <div className={styles.glowEffect} />
          <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-heading)' }}>Fetching course credentials...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <main className={styles.pageSection} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.backgroundGrid} />
          <div className={styles.glowEffect} />
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#ffffff', fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>Course Workspace Not Found</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2rem' }}>The requested program key does not exist in our active catalog.</p>
            <button className={styles.actionBtn} onClick={() => router.push('/courses')}>Back to Catalog</button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className={styles.pageSection}>
        <div className={styles.backgroundGrid} />
        <div className={styles.glowEffect} />

        <div className={`${styles.container} container`}>
          <div className={styles.badge}>COHORT WORKSPACE</div>
          <h1 className={styles.title}>{course.title}</h1>
          <p className={styles.desc}>{course.description}</p>

          {/* Duration and badges row */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {course.duration && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', background: 'rgba(242, 85, 34, 0.06)', border: '1px solid rgba(242, 85, 34, 0.2)', borderRadius: '4px', color: 'var(--accent-orange)', fontSize: '0.78rem', fontWeight: 600 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                {course.duration}
              </span>
            )}
            {course.badges && course.badges.map((badge, i) => (
              <span key={i} style={{ padding: '0.3rem 0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 600 }}>
                {badge}
              </span>
            ))}
          </div>

          <div className={styles.grid}>
            
            {/* Left Column: Syllabus details and Lecturer info */}
            <div className={styles.mainCol}>
              
              {/* Syllabus folders listing */}
              <div className={styles.cardPanel}>
                <h3 className={styles.cardTitle}>Syllabus Directory Nodes</h3>
                <div className={styles.syllabusList}>
                  {materials.length === 0 ? (
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>No modules added yet to this workspace catalog.</div>
                  ) : (
                    materials.map((module) => (
                      <div key={module.id} className={styles.syllabusItem}>
                        <div className={styles.moduleHeader}>
                          <h4 className={styles.moduleTitle}>{module.title}</h4>
                          <span className={styles.assetsCount}>
                            {module.assets ? module.assets.length : 0} Assets
                          </span>
                        </div>
                        {module.assets && module.assets.map((asset, index) => (
                          <div key={index} className={styles.assetRow}>
                            <svg className={styles.assetIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span>{asset.name} ({asset.size})</span>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Curriculum Overview */}
              {course.curriculumOverview && (
                <div className={styles.cardPanel}>
                  <h3 className={styles.cardTitle}>Curriculum Roadmap</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {course.curriculumOverview.split('\n').filter(line => line.trim()).map((line, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.65rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, minWidth: 24, background: 'rgba(242, 85, 34, 0.06)', border: '1px solid rgba(242, 85, 34, 0.15)', borderRadius: '4px', color: 'var(--accent-orange)', fontSize: '0.7rem', fontWeight: 700 }}>{i + 1}</span>
                        <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{line.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Highlights */}
              {course.highlights && (
                <div className={styles.cardPanel}>
                  <h3 className={styles.cardTitle}>What You'll Get</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    {course.highlights.split(',').filter(h => h.trim()).map((highlight, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16, color: 'var(--accent-orange)', flexShrink: 0 }}>
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{highlight.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructor/Lecturer Card */}
              <div className={styles.cardPanel}>
                <h3 className={styles.cardTitle}>Assigned Mentor Node</h3>
                <div className={styles.lecturerCard}>
                  <img src="/images/avatar1.jpg" alt={instructor.name} className={styles.avatar} />
                  <div style={{ flex: 1 }}>
                    <h4 className={styles.lecturerName}>{instructor.name}</h4>
                    <span className={styles.lecturerExp}>{instructor.expertise}</span>
                    <p className={styles.lecturerBio}>{instructor.bio}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Pricing & Purchase Widget */}
            <div className={styles.sideCol}>
              <div className={styles.cardPanel}>
                <h3 className={styles.cardTitle} style={{ border: 'none', marginBottom: '0.5rem', paddingBottom: 0 }}>Enrollment Portal</h3>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05rem', display: 'block', marginBottom: '1.25rem' }}>Limited seats remaining</span>

                <div className={styles.pricingRow}>
                  <span className={styles.price}>{course.price}</span>
                  {course.originalPrice && (
                    <>
                      <span className={styles.originalPrice}>{course.originalPrice}</span>
                      <span className={styles.discount}>{course.discount || 'Special Offer'}</span>
                    </>
                  )}
                </div>

                <div className={styles.featuresGrid}>
                  <div className={styles.featureItem}>
                    <svg className={styles.featureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Full lifetime sandbox playground access</span>
                  </div>
                  <div className={styles.featureItem}>
                    <svg className={styles.featureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Verified certification of completion</span>
                  </div>
                  <div className={styles.featureItem}>
                    <svg className={styles.featureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>24/7 dedicated mentor review hotline</span>
                  </div>
                </div>

                {isEnrolled ? (
                  <button className={`${styles.actionBtn} ${styles.actionBtnSolid}`} onClick={handleAccessWorkspace}>
                    Access Sandbox Workspace
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '16px', height: '16px' }}>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                ) : (
                  <button className={`${styles.actionBtn} ${styles.actionBtnSolid}`} onClick={handleEnrollClick}>
                    {student ? 'Enroll In Cohort' : 'Sign In to Buy'}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '16px', height: '16px' }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </button>
                )}

              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />

      {/* Razorpay Payment Gateway Overlay */}
      {showCheckout && (
        <CheckoutModal 
          course={course}
          student={student}
          onClose={() => setShowCheckout(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
