'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { saveContactInquiry } from '../actions';
import styles from './contact.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    department: 'Cohort Admissions',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const departments = [
    { id: 'Cohort Admissions', label: 'Cohort Admissions' },
    { id: 'Hackwise Hackathons', label: 'Hackwise Hackathons' },
    { id: 'Startup Incubation Lab', label: 'Startup Incubation' },
    { id: 'Enterprise Partnerships', label: 'College / Enterprise' },
    { id: 'Technical Support', label: 'General / Support' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleDepartmentSelect = (deptId) => {
    setFormData((prev) => ({ ...prev, department: deptId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please provide your name, email address, and message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await saveContactInquiry({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        subject: formData.subject.trim() || `${formData.department} Inquiry`,
        department: formData.department,
        message: formData.message.trim()
      });

      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        department: 'Cohort Admissions',
        message: ''
      });
    } catch (err) {
      console.error('Contact submission error:', err);
      setErrorMsg(err.message || 'Unable to submit your message. Please try again or reach out via email directly.');
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
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.badge}>
                <span className={styles.badgeDot} />
                GET IN TOUCH
              </div>
              <h1 className={styles.title}>
                Connect With <br />
                <span className={styles.outlineBox}>Sphere Hive</span> At KVGCE
              </h1>
              <p className={styles.subtitle}>
                Have questions regarding cohort roadmaps, scholarship evaluations, Hackwise national hackathons, campus incubation, or visiting our physical lab at KVGCE? Reach out directly below.
              </p>
            </div>

            {/* Asymmetric 2-Column Grid */}
            <div className={styles.contactGrid}>
              
              {/* Left Column: Unified Advisory Hub Dossier */}
              <div className={styles.leftColumn}>
                <div className={styles.unifiedHubCard}>
                  
                  {/* Direct Contact Channels */}
                  <div>
                    <div className={styles.hubSectionTitle}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      Direct Lines
                    </div>

                    <div className={styles.channelsList}>
                      {/* Phone / WhatsApp */}
                      <a href="tel:+917411288457" className={styles.channelItem}>
                        <div className={styles.channelIconWrap}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </div>
                        <div className={styles.channelMeta}>
                          <span className={styles.channelLabel}>Advisory Hotline & WhatsApp</span>
                          <span className={styles.channelValue}>+91 7411288457</span>
                        </div>
                      </a>

                      {/* Email */}
                      <a href="mailto:spherehive@kvgce.ac.in" className={styles.channelItem}>
                        <div className={styles.channelIconWrap}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </div>
                        <div className={styles.channelMeta}>
                          <span className={styles.channelLabel}>Official Academy Email</span>
                          <span className={styles.channelValue}>spherehive@kvgce.ac.in</span>
                        </div>
                      </a>
                    </div>

                    <div className={styles.operatingStatus}>
                      <span className={styles.statusDot} />
                      <span>Mon – Sat • 9:00 AM – 7:00 PM IST</span>
                    </div>
                  </div>

                  <div className={styles.hubDivider} />

                  {/* Physical Lab Coordinates */}
                  <div className={styles.locationBlock}>
                    <div className={styles.hubSectionTitle}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Physical Incubation Lab
                    </div>

                    <h3 className={styles.addressMain}>
                      Top Floor, MBA Block, KVGCE Campus
                    </h3>
                    <p className={styles.addressSub}>
                      Kurunjibhag, Sullia, Dakshina Kannada, Karnataka — 574327
                    </p>
                    <p className={styles.campusNote}>
                      Home to the Sphere Hive startup incubation labs, student builder workspaces, and Hackwise war rooms.
                    </p>
                  </div>

                  <div className={styles.hubDivider} />

                  {/* Social Community Handles */}
                  <div>
                    <div className={styles.hubSectionTitle}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                      Builder Network
                    </div>

                    <div className={styles.socialHandlesRow}>
                      <a href="https://instagram.com/spherehive" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                        Instagram
                      </a>

                      <a href="https://linkedin.com/company/spherehive" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                          <rect x="2" y="9" width="4" height="12" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                        LinkedIn
                      </a>

                      <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="9" cy="12" r="1" />
                          <circle cx="15" cy="12" r="1" />
                          <path d="M19.78 6.11A20.47 20.47 0 0 0 15 4.5l-.21.45A17.9 17.9 0 0 0 9.21 5L9 4.5a20.47 20.47 0 0 0-4.78 1.61A21 21 0 0 0 2 17.5a20.89 20.89 0 0 0 5.22 2.5l1-1.32a13 13 0 0 1-3.22-1.68l.21-.18A17.65 17.65 0 0 0 18.79 17l.21.18a13 13 0 0 1-3.22 1.68l1 1.32A20.89 20.89 0 0 0 22 17.5a21 21 0 0 0-2.22-11.39z" />
                        </svg>
                        Discord
                      </a>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Dispatch Form */}
              <div className={styles.formCard}>
                {isSuccess ? (
                  <div className={styles.successMessage}>
                    <div className={styles.successIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h3 className={styles.successTitle}>Message Dispatched</h3>
                    <p className={styles.successDesc}>
                      Your inquiry has been recorded into our admissions and mentorship portal. Our coordinators will review and reply to {formData.email || 'your email'} shortly.
                    </p>
                    <button onClick={() => setIsSuccess(false)} className={styles.resetBtn}>
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.formHeader}>
                      <h2 className={styles.formTitle}>Send Us A Message</h2>
                      <p className={styles.formSubtitle}>
                        Direct inquiry to admissions, hackathons, or incubation coordinators.
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

                      {/* Name */}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Your Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Mohammed Suhail"
                          className={styles.input}
                          required
                        />
                      </div>

                      {/* Email & Phone */}
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Email Address *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@domain.com"
                            className={styles.input}
                            required
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>WhatsApp / Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            className={styles.input}
                          />
                        </div>
                      </div>

                      {/* Department Track Pills */}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Department / Topic</label>
                        <div className={styles.topicPillsGrid}>
                          {departments.map((d) => (
                            <div
                              key={d.id}
                              onClick={() => handleDepartmentSelect(d.id)}
                              className={`${styles.topicPill} ${formData.department === d.id ? styles.topicPillActive : ''}`}
                            >
                              <span className={styles.topicRadioDot} />
                              <span>{d.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Subject */}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Subject (Optional)</label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="e.g. Question regarding installment schedule"
                          className={styles.input}
                        />
                      </div>

                      {/* Message */}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Your Message *</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us about your background, track preference, questions, or collaboration idea..."
                          className={styles.textarea}
                          required
                        />
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.submitBtn}
                      >
                        {isSubmitting ? (
                          <span>Sending Inquiry...</span>
                        ) : (
                          <>
                            <span>Send Message</span>
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
