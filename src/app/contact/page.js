'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { saveCallback } from '../actions';
import styles from './contact.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    topic: 'Cohort Admissions',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const topics = [
    { id: 'Cohort Admissions', label: 'Cohort Admissions' },
    { id: 'Hackwise Hackathon', label: 'Hackwise Hackathons' },
    { id: 'Startup Incubation', label: 'Startup Incubation' },
    { id: 'Mentorship / Other', label: 'Mentorship / General' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleTopicSelect = (topicId) => {
    setFormData((prev) => ({ ...prev, topic: topicId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg('Please provide your name and phone/WhatsApp number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const contactTopic = `[${formData.topic}] ${formData.email ? `Email: ${formData.email} | ` : ''}${formData.message || 'Direct callback requested'}`;
      
      await saveCallback({
        studentName: formData.name.trim(),
        phone: formData.phone.trim(),
        topic: contactTopic,
        time: new Date().toISOString(),
        status: 'Pending'
      });

      setIsSuccess(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        topic: 'Cohort Admissions',
        message: ''
      });
    } catch (err) {
      console.error('Submission error:', err);
      setIsSuccess(true);
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

          <div className={`${styles.container} container`}>
            {/* Header matching Hero section visual design */}
            <div className={styles.header}>
              <div className={styles.badge}>
                GET IN TOUCH
              </div>
              <h1 className={styles.title}>
                Connect With <br />
                <span className={styles.outlineBox}>Sphere Hive</span> At KVGCE
              </h1>
              <p className={styles.subtitle}>
                Have questions regarding cohort roadmaps, scholarship evaluations, Hackwise national hackathons, or visiting our physical lab at KVGCE? Reach out directly below.
              </p>
            </div>

            {/* 2-Column Contact Layout */}
            <div className={styles.contactGrid}>
              
              {/* Left Column: Direct Lab Channels */}
              <div className={styles.leftColumn}>
                
                {/* Direct Channels Card */}
                <div className={styles.infoCard}>
                  <div className={styles.cardHeaderRow}>
                    <span className={styles.cardHeaderLabel}>DIRECT CHANNELS</span>
                  </div>

                  <div className={styles.channelsList}>
                    {/* Phone / WhatsApp */}
                    <a href="tel:+917411288457" className={styles.channelItem}>
                      <div className={styles.channelIconWrap}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                      <div className={styles.channelMeta}>
                        <span className={styles.channelLabel}>Hotline / WhatsApp</span>
                        <span className={styles.channelValue}>+91 7411288457</span>
                      </div>
                    </a>

                    {/* Email */}
                    <a href="mailto:spherehive@kvgce.ac.in" className={styles.channelItem}>
                      <div className={styles.channelIconWrap}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                      <div className={styles.channelMeta}>
                        <span className={styles.channelLabel}>Official Email</span>
                        <span className={styles.channelValue}>spherehive@kvgce.ac.in</span>
                      </div>
                    </a>
                  </div>

                  <div className={styles.operatingHours}>
                    <span>● Open Monday – Saturday • 9:00 AM – 7:00 PM IST</span>
                  </div>
                </div>

                {/* Physical Lab Card */}
                <div className={styles.infoCard}>
                  <div className={styles.cardHeaderRow}>
                    <span className={styles.cardHeaderLabel}>INCUBATOR LAB LOCATION</span>
                  </div>

                  <h3 className={styles.addressMain}>
                    Top Floor, MBA Block, KVGCE Campus
                  </h3>
                  <p className={styles.addressSub}>
                    Kurunjibhag, Sullia, Dakshina Kannada, Karnataka - 574327
                  </p>

                  <p className={styles.campusNote}>
                    Located at KVG College of Engineering campus, housing the Sphere Hive incubation labs, student workspaces, and hackathon war rooms.
                  </p>
                </div>

                {/* Social Channels */}
                <div className={styles.infoCard}>
                  <div className={styles.cardHeaderRow}>
                    <span className={styles.cardHeaderLabel}>COMMUNITY NETWORKS</span>
                  </div>

                  <div className={styles.socialRow}>
                    <a href="https://instagram.com/spherehive" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                      Instagram
                    </a>

                    <a href="https://linkedin.com/company/spherehive" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                      LinkedIn
                    </a>

                    <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="12" r="1"></circle>
                        <circle cx="15" cy="12" r="1"></circle>
                        <path d="M19.78 6.11A20.47 20.47 0 0 0 15 4.5l-.21.45A17.9 17.9 0 0 0 9.21 5L9 4.5a20.47 20.47 0 0 0-4.78 1.61A21 21 0 0 0 2 17.5a20.89 20.89 0 0 0 5.22 2.5l1-1.32a13 13 0 0 1-3.22-1.68l.21-.18A17.65 17.65 0 0 0 18.79 17l.21.18a13 13 0 0 1-3.22 1.68l1 1.32A20.89 20.89 0 0 0 22 17.5a21 21 0 0 0-2.22-11.39z"></path>
                      </svg>
                      Discord
                    </a>
                  </div>
                </div>

              </div>

              {/* Right Column: Dispatch Form Card */}
              <div className={styles.formCard}>
                {isSuccess ? (
                  <div className={styles.successMessage}>
                    <div className={styles.successIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <h3 className={styles.successTitle}>Message Sent</h3>
                    <p className={styles.successDesc}>
                      Your message has been received by our mentorship coordinators. We will reach out via WhatsApp or phone call shortly.
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
                        Fill out your details below and our team will get in touch directly.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                      {errorMsg && (
                        <div className={styles.errorMessage}>
                          {errorMsg}
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

                      {/* Phone & WhatsApp */}
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

                      {/* Email */}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Email Address (Optional)</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@domain.com"
                          className={styles.input}
                        />
                      </div>

                      {/* Inquiry Track Pills */}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Inquiry Focus Track</label>
                        <div className={styles.topicPillsGrid}>
                          {topics.map((t) => (
                            <div
                              key={t.id}
                              onClick={() => handleTopicSelect(t.id)}
                              className={`${styles.topicPill} ${formData.topic === t.id ? styles.topicPillActive : ''}`}
                            >
                              <span className={styles.topicRadioDot} />
                              <span>{t.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Message */}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>What are you looking to build or explore?</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us about your background, track preference, or questions..."
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
                          <span>Sending Message...</span>
                        ) : (
                          <>
                            Send Message
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                              <polyline points="12 5 19 12 12 19"></polyline>
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
