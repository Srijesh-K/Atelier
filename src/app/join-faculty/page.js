'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { saveFacultyApplication } from '../actions';
import styles from './faculty.module.css';

export default function JoinFacultyPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roleApplied: 'Lead Cohort Instructor',
    expertise: '',
    experienceYears: '5-8 Years',
    currentCompany: '',
    linkedin: '',
    github: '',
    portfolio: '',
    bio: '',
    courseProposal: '',
    availability: 'Weekend Masterclasses (Sat / Sun)'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Close modal on ESC key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFormOpen) {
        setIsFormOpen(false);
      }
    };
    if (isFormOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFormOpen]);

  const roles = [
    {
      id: 'Lead Cohort Instructor',
      label: 'Lead Cohort Instructor',
      commitment: '2-4 hrs/week • Weekend or Weekday Evenings',
      desc: 'Own core curriculum modules, direct live system architecture teardowns, and run production engineering sprints.'
    },
    {
      id: 'Industry Guest Lecturer',
      label: 'Specialized Guest Lecturer',
      commitment: 'Project-Based • 1-2 Sessions per Cohort',
      desc: 'Deliver high-impact 1-day deep-dives on specialized engineering domains: Kafka internals, eBPF, WebGPU, distributed caching, or LLM infrastructure.'
    },
    {
      id: 'Hackwise Hackathon Mentor & Jury',
      label: 'Hackwise Hackathon Mentor',
      commitment: 'Event-Based • 24-Hour Weekend Hackathons',
      desc: 'Mentor high-potential student teams during national hackathons, unblock system design bottlenecks, and evaluate final production demos.'
    },
    {
      id: 'Async Code Review Fellow',
      label: 'Architecture & Code Reviewer',
      commitment: '1-2 hrs/week • Completely Asynchronous',
      desc: 'Conduct rigorous GitHub pull request reviews, audit student repositories, and provide actionable architecture critiques asynchronously.'
    }
  ];

  const experienceOptions = [
    '2-4 Years',
    '5-8 Years',
    '8-12 Years',
    'Staff / Principal / Founder'
  ];

  const availabilityOptions = [
    'Weekend Masterclasses (Sat / Sun)',
    'Weekday Evenings (8:00 PM – 10:00 PM)',
    'Flexible / Project-Based',
    'Full-Time Visiting Faculty'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleRoleSelect = (roleId) => {
    setFormData((prev) => ({ ...prev, roleApplied: roleId }));
  };

  const handleExperienceSelect = (exp) => {
    setFormData((prev) => ({ ...prev, experienceYears: exp }));
  };

  const handleAvailabilitySelect = (avail) => {
    setFormData((prev) => ({ ...prev, availability: avail }));
  };

  const handleOpenFormWithRole = (roleId) => {
    handleRoleSelect(roleId);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.expertise.trim()) {
      setErrorMsg('Please complete all required fields (Name, Email, Phone, and Core Expertise).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await saveFacultyApplication({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        roleApplied: formData.roleApplied,
        expertise: formData.expertise.trim(),
        experienceYears: formData.experienceYears,
        currentCompany: formData.currentCompany.trim() || null,
        linkedin: formData.linkedin.trim() || null,
        github: formData.github.trim() || null,
        portfolio: formData.portfolio.trim() || null,
        bio: formData.bio.trim() || null,
        courseProposal: formData.courseProposal.trim() || null,
        availability: formData.availability
      });

      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        roleApplied: 'Lead Cohort Instructor',
        expertise: '',
        experienceYears: '5-8 Years',
        currentCompany: '',
        linkedin: '',
        github: '',
        portfolio: '',
        bio: '',
        courseProposal: '',
        availability: 'Weekend Masterclasses (Sat / Sun)'
      });
    } catch (err) {
      console.error('Faculty application error:', err);
      setErrorMsg(err.message || 'Unable to submit your application. Please try again or reach out to us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className={styles.pageWrapper}>
        <div className={styles.backgroundGrid} />
        <div className={styles.glowEffect} />

        {/* ─── Hero Section ─── */}
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                Lead The Apprenticeship. <br />
                <span className={styles.heroOutlineBox}>Join The Atelier Faculty</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Direct live architecture teardowns, review production code, and mentor high-potential builders. Built for senior engineers, tech leads, and founders who want to teach without administrative bureaucracy.
              </p>
              <div className={styles.heroActions}>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className={styles.heroPrimaryBtn}
                >
                  <span>Apply for Faculty Fellowship</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
                <a href="#what-is-fellowship" className={styles.heroSecondaryBtn}>
                  What is the Fellowship? ↓
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── What Is The Faculty Fellowship (Dark Architectural Section) ─── */}
        <section id="what-is-fellowship" className={styles.whatIsSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeaderCenter}>
              <span className={styles.sectionTag}>THE FELLOWSHIP MODEL</span>
              <h2 className={styles.sectionHeading}>What Is The Atelier Faculty Fellowship?</h2>
              <p className={styles.sectionSub}>
                A high-leverage teaching collective designed for active engineering practitioners, not academic lecturers.
              </p>
            </div>

            <div className={styles.pillarsGrid}>
              <div className={styles.pillarCard}>
                <div className={styles.pillarIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <h3 className={styles.pillarTitle}>Zero Slides. Real Systems Only.</h3>
                <p className={styles.pillarText}>
                  We reject academic slide decks and toy projects. Faculty Fellows guide cohorts through distributed systems design, live incident post-mortems, concurrency bottlenecks, and real Git pull requests.
                </p>
              </div>

              <div className={styles.pillarCard}>
                <div className={styles.pillarIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <h3 className={styles.pillarTitle}>Vetted, High-Signal Cohorts</h3>
                <p className={styles.pillarText}>
                  Zero passive spectators. Every student passes diagnostic evaluations before entering a cohort. You mentor ambitious builders who ship code daily, never beginners learning syntax basics.
                </p>
              </div>

              <div className={styles.pillarCard}>
                <div className={styles.pillarIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className={styles.pillarTitle}>Zero Bureaucracy, Pure Mentorship</h3>
                <p className={styles.pillarText}>
                  We eliminate attendance sheets, academic grading red tape, and administrative logistics. Atelier handles student infra, scheduling, and community operations so you focus 100% on mentoring.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Benefits of Joining (Signature Black & White / Light Section) ─── */}
        <section data-theme="light" className={styles.benefitsSectionLight}>
          <div className={styles.container}>
            <div className={styles.sectionHeaderCenter}>
              <span className={styles.sectionBadgeLight}>FELLOWSHIP BENEFITS</span>
              <h2 className={styles.sectionTitleLight}>Why Senior Engineers Mentor At Atelier</h2>
              <p className={styles.sectionSubLight}>
                Consulting-grade compensation, total technical autonomy, and direct access to high-potential engineering talent.
              </p>
            </div>

            <div className={styles.benefitsGrid}>
              <div className={styles.benefitCard}>
                <div className={styles.benefitHeader}>
                  <span className={styles.benefitNumber}>BENEFIT 01</span>
                  <div className={styles.benefitIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                </div>
                <h3 className={styles.benefitTitle}>Consulting-Grade Honorarium</h3>
                <p className={styles.benefitDesc}>
                  We value your real-world expertise. Fellows receive premium honorariums for live masterclasses, asynchronous code audits, and capstone jury sessions.
                </p>
              </div>

              <div className={styles.benefitCard}>
                <div className={styles.benefitHeader}>
                  <span className={styles.benefitNumber}>BENEFIT 02</span>
                  <div className={styles.benefitIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                </div>
                <h3 className={styles.benefitTitle}>Total Curriculum Autonomy</h3>
                <p className={styles.benefitDesc}>
                  No academic gatekeeping. You choose the tools, frameworks, and architecture patterns. Teach what you actually deploy in production—from Go and Rust to Kubernetes and AI model infrastructure.
                </p>
              </div>

              <div className={styles.benefitCard}>
                <div className={styles.benefitHeader}>
                  <span className={styles.benefitNumber}>BENEFIT 03</span>
                  <div className={styles.benefitIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                </div>
                <h3 className={styles.benefitTitle}>Direct Talent Discovery</h3>
                <p className={styles.benefitDesc}>
                  Work directly with the top 5% of emerging software engineers. Spot, evaluate, and scout high-potential builders for your own engineering teams months before they enter the public job market.
                </p>
              </div>

              <div className={styles.benefitCard}>
                <div className={styles.benefitHeader}>
                  <span className={styles.benefitNumber}>BENEFIT 04</span>
                  <div className={styles.benefitIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                </div>
                <h3 className={styles.benefitTitle}>Respect For Your Working Schedule</h3>
                <p className={styles.benefitDesc}>
                  Designed for full-time engineering leaders. Commit 2 to 4 hours per week with flexible engagement options—weekend deep dives, weekday evening teardowns, or async GitHub reviews.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Teaching Tracks Section (Dark) ─── */}
        <section className={styles.tracksSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeaderCenter}>
              <span className={styles.sectionTag}>ENGAGEMENT TRACKS</span>
              <h2 className={styles.sectionHeading}>Choose Your Teaching Track</h2>
              <p className={styles.sectionSub}>
                Select the engagement model that best aligns with your weekly bandwidth and technical domain.
              </p>
            </div>

            <div className={styles.tracksGrid}>
              {roles.map((r) => (
                <div key={r.id} className={styles.trackCard}>
                  <div className={styles.trackHeader}>
                    <div className={styles.trackMetaRow}>
                      <span className={styles.trackTag}>FELLOWSHIP TRACK</span>
                      <span className={styles.trackCommitment}>{r.commitment}</span>
                    </div>
                    <h3 className={styles.trackName}>{r.label}</h3>
                    <p className={styles.trackDesc}>{r.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenFormWithRole(r.id)}
                    className={styles.trackApplyBtn}
                  >
                    <span>Apply for this Track</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final CTA Section (Dark) ─── */}
        <section className={styles.finalCtaSection}>
          <div className={styles.container}>
            <div className={styles.ctaCard}>
              <h2 className={styles.ctaHeading}>Ready to Mentor The Next Wave of Software Engineers?</h2>
              <p className={styles.ctaSub}>
                Join fellow engineering leaders from top product companies and Sphere Hive Academy. Applications are reviewed by our Academic Board within 48 hours.
              </p>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className={styles.heroPrimaryBtn}
              >
                <span>Submit Fellowship Application</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* ─── Application Modal Drawer ─── */}
        {isFormOpen && (
          <div 
            className={styles.modalOverlay}
            onClick={() => setIsFormOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div 
              className={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleGroup}>
                  <h2 className={styles.modalTitle}>Apply For Atelier Fellowship</h2>
                  <p className={styles.modalSubtitle}>
                    Complete your engineering profile below. We review all applications within 48 hours.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className={styles.modalCloseBtn}
                  aria-label="Close application form"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {isSuccess ? (
                <div className={styles.successCard}>
                  <div className={styles.successIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className={styles.successTitle}>Application Received</h3>
                  <p className={styles.successDesc}>
                    Thank you for applying to the Atelier Faculty. Our Academic Board reviews mentor applications within 48 hours. If there is a strong track alignment, our program director will reach out to schedule an introductory conversation.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setIsFormOpen(false);
                    }}
                    className={styles.resetBtn}
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  {errorMsg && (
                    <div className={styles.errorMessage}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Section 1: Identity & Contact */}
                  <div className={styles.fieldSectionHeader}>
                    <span className={styles.fieldSectionIndex}>1</span>
                    <span className={styles.fieldSectionTitle}>Identity & Contact</span>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Vikramaditya Rao"
                        className={styles.input}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Professional Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="vikram@techfirm.com"
                        className={styles.input}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>WhatsApp / Contact Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className={styles.input}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Section 2: Experience & Domain */}
                  <div className={styles.fieldSectionHeader}>
                    <span className={styles.fieldSectionIndex}>2</span>
                    <span className={styles.fieldSectionTitle}>Experience & Domain</span>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Years of Experience</label>
                    <div className={styles.pillSelectorGrid}>
                      {experienceOptions.map((exp) => {
                        const isSelected = formData.experienceYears === exp;
                        return (
                          <div
                            key={exp}
                            onClick={() => handleExperienceSelect(exp)}
                            className={`${styles.selectorPill} ${isSelected ? styles.selectorPillActive : ''}`}
                          >
                            <span className={styles.selectorRadioDot} />
                            <span className={styles.selectorLabel}>{exp}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Current Company & Title</label>
                      <input
                        type="text"
                        name="currentCompany"
                        value={formData.currentCompany}
                        onChange={handleChange}
                        placeholder="e.g. Senior SDE at Razorpay / Founder"
                        className={styles.input}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Primary Tech Domain & Stack *</label>
                      <input
                        type="text"
                        name="expertise"
                        value={formData.expertise}
                        onChange={handleChange}
                        placeholder="e.g. Distributed Systems, Golang, Kafka, Next.js"
                        className={styles.input}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Section 3: Digital Presence & Profiles */}
                  <div className={styles.fieldSectionHeader}>
                    <span className={styles.fieldSectionIndex}>3</span>
                    <span className={styles.fieldSectionTitle}>Digital Presence</span>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>LinkedIn Profile URL *</label>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                        className={styles.input}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>GitHub / Portfolio / Tech Blog URL</label>
                      <input
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        placeholder="https://github.com/username"
                        className={styles.input}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Section 4: Teaching Track & Availability */}
                  <div className={styles.fieldSectionHeader}>
                    <span className={styles.fieldSectionIndex}>4</span>
                    <span className={styles.fieldSectionTitle}>Engagement Model</span>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Selected Fellowship Track</label>
                    <div className={styles.pillSelectorGridCols2}>
                      {roles.map((r) => {
                        const isSelected = formData.roleApplied === r.id;
                        return (
                          <div
                            key={r.id}
                            onClick={() => handleRoleSelect(r.id)}
                            className={`${styles.selectorPill} ${isSelected ? styles.selectorPillActive : ''}`}
                          >
                            <span className={styles.selectorRadioDot} />
                            <span className={styles.selectorLabel}>{r.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Preferred Availability</label>
                    <div className={styles.pillSelectorGridCols2}>
                      {availabilityOptions.map((opt) => {
                        const isSelected = formData.availability === opt;
                        return (
                          <div
                            key={opt}
                            onClick={() => handleAvailabilitySelect(opt)}
                            className={`${styles.selectorPill} ${isSelected ? styles.selectorPillActive : ''}`}
                          >
                            <span className={styles.selectorRadioDot} />
                            <span className={styles.selectorLabel}>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 5: Pedagogical Vision */}
                  <div className={styles.fieldSectionHeader}>
                    <span className={styles.fieldSectionIndex}>5</span>
                    <span className={styles.fieldSectionTitle}>Pedagogical Vision</span>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Brief Bio & Engineering Highlights</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Summarize your engineering journey, scale challenges solved, and prior mentoring or open source experience..."
                      className={styles.textarea}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Proposed Masterclass / Capstone Topic (Optional)</label>
                    <textarea
                      name="courseProposal"
                      value={formData.courseProposal}
                      onChange={handleChange}
                      placeholder="What real-world architecture teardown or hands-on system would you love to lead? (e.g. 'Building a High-Throughput Matching Engine in Go', 'Fine-Tuning Llama 3 for Production APIs')"
                      className={styles.textarea}
                      disabled={isSubmitting}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={styles.submitBtn}
                  >
                    {isSubmitting ? (
                      <span>Submitting Application...</span>
                    ) : (
                      <>
                        <span>Submit Faculty Application</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
