'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { saveFacultyApplication } from '../actions';
import styles from './faculty.module.css';

export default function JoinFacultyPage() {
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
    availability: 'Weekend Masterclasses'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const roles = [
    { id: 'Lead Cohort Instructor', label: 'Lead Cohort Instructor', desc: 'Own full modules, project teardowns, and architecture sprints.' },
    { id: 'Industry Guest Lecturer', label: 'Specialized Guest Lecturer', desc: 'Deliver 1-day deep-dives on high-impact tech topics.' },
    { id: 'Hackathon Mentor & Jury', label: 'Hackwise Hackathon Mentor', desc: 'Coach builders during 24-hour national hackathons.' },
    { id: 'Async Code Review Fellow', label: 'Architecture & Code Reviewer', desc: 'Review real student Git repos and PRs asynchronously.' }
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
        availability: 'Weekend Masterclasses'
      });
    } catch (err) {
      console.error('Faculty application error:', err);
      setErrorMsg(err.message || 'Unable to submit your application. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main>
        <section className={styles.pageSection}>
          <div className={styles.backgroundGrid} />
          <div className={styles.glowEffect} />

          <div className={styles.container}>
            {/* Hero Header */}
            <div className={styles.header}>
              <div className={styles.badge}>
                <span className={styles.badgeDot} />
                FACULTY & FELLOWSHIP ADMISSIONS
              </div>
              <h1 className={styles.title}>
                Join The <br />
                <span className={styles.outlineBox}>Atelier Industry Faculty</span>
              </h1>
              <p className={styles.subtitle}>
                Shape the next generation of software engineers. Lead live cohorts, direct real-world architecture teardowns, and mentor high-potential builders alongside senior tech leaders.
              </p>
            </div>

            {/* Metric Highlights Banner */}
            <div className={styles.metricsBar}>
              <div className={styles.metricItem}>
                <span className={styles.metricNumber}>500+</span>
                <span className={styles.metricLabel}>Active Builders</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricNumber}>100%</span>
                <span className={styles.metricLabel}>Production Sprints</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricNumber}>24 Hr</span>
                <span className={styles.metricLabel}>National Hackathons</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricNumber}>Top 1%</span>
                <span className={styles.metricLabel}>Industry Honorarium</span>
              </div>
            </div>

            {/* Why Lead Bento Section */}
            <div className={styles.whySection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionHeading}>Why Industry Leaders Teach At Atelier</h2>
                <p className={styles.sectionSub}>We eliminate administrative bureaucracy and give you complete pedagogical freedom.</p>
              </div>

              <div className={styles.bentoGrid}>
                {/* Bento 1 */}
                <div className={styles.bentoCard}>
                  <div className={styles.bentoIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <h3 className={styles.bentoTitle}>Vetted, Passionate Builders</h3>
                  <p className={styles.bentoText}>
                    Zero passive observers. Every student goes through entrance evaluations, ensuring your cohorts are packed with driven engineers who ship code daily.
                  </p>
                </div>

                {/* Bento 2 */}
                <div className={styles.bentoCard}>
                  <div className={styles.bentoIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  </div>
                  <h3 className={styles.bentoTitle}>Curriculum Autonomy</h3>
                  <p className={styles.bentoText}>
                    Build the real-world microservices, distributed architectures, and modern stacks that you actually use in production at top tech firms.
                  </p>
                </div>

                {/* Bento 3 */}
                <div className={styles.bentoCard}>
                  <div className={styles.bentoIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <h3 className={styles.bentoTitle}>Competitive Honorarium</h3>
                  <p className={styles.bentoText}>
                    Earn premium consulting-grade compensation for your masterclasses, code review marathons, and capstone evaluations.
                  </p>
                </div>
              </div>
            </div>

            {/* Fellowship Tracks Section */}
            <div className={styles.tracksSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionHeading}>Choose Your Teaching Track</h2>
                <p className={styles.sectionSub}>Flexible engagement models tailored for working senior engineers.</p>
              </div>

              <div className={styles.tracksGrid}>
                {roles.map((r) => {
                  const isSelected = formData.roleApplied === r.id;
                  return (
                    <div 
                      key={r.id} 
                      className={`${styles.trackCard} ${isSelected ? styles.trackCardActive : ''}`}
                      onClick={() => handleRoleSelect(r.id)}
                    >
                      <div>
                        <div className={styles.trackTagRow}>
                          <span className={styles.trackTag}>Track</span>
                          <span className={styles.trackIndicator} />
                        </div>
                        <h4 className={styles.trackName}>{r.label}</h4>
                      </div>
                      <p className={styles.trackDesc}>{r.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Application Form Section */}
            <div className={styles.formSection}>
              <div className={styles.formCard}>
                {isSuccess ? (
                  <div className={styles.successCard}>
                    <div className={styles.successIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h2 className={styles.successTitle}>Application Submitted</h2>
                    <p className={styles.successDesc}>
                      Thank you for applying to join the Atelier Faculty. Our Academic Board reviews all mentor applications within 48 hours. If there is a strong track alignment, our program director will reach out to schedule an introductory conversation.
                    </p>
                    <button 
                      type="button" 
                      onClick={() => setIsSuccess(false)} 
                      className={styles.resetBtn}
                    >
                      Submit Another Application
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.formHeader}>
                      <h2 className={styles.formTitle}>Apply As Industry Faculty</h2>
                      <p className={styles.formSubtitle}>
                        Complete the application below with your technical profile and teaching preferences.
                      </p>
                    </div>

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
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>WhatsApp / Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className={styles.input}
                          required
                        />
                      </div>

                      {/* Section 2: Experience & Domain */}
                      <div className={styles.fieldSectionHeader}>
                        <span className={styles.fieldSectionIndex}>2</span>
                        <span className={styles.fieldSectionTitle}>Experience & Domain</span>
                      </div>

                      {/* Experience Level Pills */}
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

                      {/* Current Company & Core Expertise */}
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

                      {/* Availability Pills */}
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

                      {/* Bio */}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Brief Bio & Career Highlights</label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder="Summarize your engineering journey, key scale challenges solved, and prior mentoring or open source experience..."
                          className={styles.textarea}
                        />
                      </div>

                      {/* Course / Workshop Proposal */}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Proposed Masterclass / Capstone Topic (Optional)</label>
                        <textarea
                          name="courseProposal"
                          value={formData.courseProposal}
                          onChange={handleChange}
                          placeholder="What real-world architecture teardown or hands-on system would you love to lead? (e.g. 'Building a High-Throughput Matching Engine in Go', 'Fine-Tuning Llama 3 for Production APIs')"
                          className={styles.textarea}
                        />
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.submitBtn}
                      >
                        {isSubmitting ? (
                          <span>Submitting Faculty Application...</span>
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
                  </>
                )}
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
