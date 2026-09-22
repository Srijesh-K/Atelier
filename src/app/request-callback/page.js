'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { saveCallback } from '../actions';
import styles from './callback.module.css';

export default function RequestCallbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    topic: 'Full-Stack Development & Distributed Systems',
    preferredTime: 'Morning (10:00 AM – 1:00 PM)',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const tracks = [
    { id: 'Full-Stack Development & Distributed Systems', label: 'Full-Stack & Systems' },
    { id: 'Generative AI & Machine Learning Engineering', label: 'Generative AI & ML' },
    { id: 'Data Science & Cloud Architecture', label: 'Data & Cloud Architecture' },
    { id: 'Hackwise National Hackathons & Incubation', label: 'Hackathons & Incubation' },
    { id: 'Tech Career Switch & Placement Advisory', label: 'Career Switch & Placements' },
    { id: 'General Academic Consultation', label: 'General Program Advisory' }
  ];

  const timeSlots = [
    'Morning (10:00 AM – 1:00 PM)',
    'Afternoon (1:00 PM – 5:00 PM)',
    'Evening (5:00 PM – 8:30 PM)',
    'ASAP / Immediate'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleTrackSelect = (trackId) => {
    setFormData((prev) => ({ ...prev, topic: trackId }));
  };

  const handleSlotSelect = (slot) => {
    setFormData((prev) => ({ ...prev, preferredTime: slot }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg('Please enter your full name and WhatsApp / phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await saveCallback({
        studentName: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        preferredTime: formData.preferredTime,
        topic: formData.topic,
        notes: formData.notes.trim() || null,
        time: new Date().toISOString(),
        status: 'Pending'
      });

      setIsSuccess(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        topic: 'Full-Stack Development & Distributed Systems',
        preferredTime: 'Morning (10:00 AM – 1:00 PM)',
        notes: ''
      });
    } catch (err) {
      console.error('Callback request error:', err);
      setErrorMsg(err.message || 'Unable to schedule callback. Please try again or WhatsApp us directly.');
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
            {/* Page Header */}
            <div className={styles.header}>
              <div className={styles.badge}>
                DIRECT ADVISORY HOTLINE
              </div>
              <h1 className={styles.title}>
                Request A 1:1 <br />
                <span className={styles.outlineBox}>Advisory Callback</span>
              </h1>
              <p className={styles.subtitle}>
                Speak directly with senior engineers and program architects. We will evaluate your current skill level, walk through cohort curriculum breakdowns, and help plan your road to placement.
              </p>
            </div>

            {/* 2-Column Grid */}
            <div className={styles.callbackGrid}>
              
              {/* Left Column: Guarantees & Contacts */}
              <div className={styles.leftColumn}>
                
                {/* Advisory Process Card */}
                <div className={styles.infoCard}>
                  <div className={styles.cardHeaderRow}>
                    <span className={styles.cardHeaderLabel}>WHAT HAPPENS ON THE CALL</span>
                    <span className={styles.slaBadge}>&lt; 45 MIN SLA</span>
                  </div>

                  <div className={styles.stepsList}>
                    <div className={styles.stepItem}>
                      <div className={styles.stepNumber}>1</div>
                      <div className={styles.stepContent}>
                        <div className={styles.stepTitle}>Skill & Background Assessment</div>
                        <div className={styles.stepDesc}>
                          We evaluate your coding background, current projects, and career velocity to understand where you are.
                        </div>
                      </div>
                    </div>

                    <div className={styles.stepItem}>
                      <div className={styles.stepNumber}>2</div>
                      <div className={styles.stepContent}>
                        <div className={styles.stepTitle}>Curriculum & Milestone Mapping</div>
                        <div className={styles.stepDesc}>
                          Detailed walk-through of weekly sprints, live architecture teardowns, and capstone microservices.
                        </div>
                      </div>
                    </div>

                    <div className={styles.stepItem}>
                      <div className={styles.stepNumber}>3</div>
                      <div className={styles.stepContent}>
                        <div className={styles.stepTitle}>Zero-Pressure Career Clarity</div>
                        <div className={styles.stepDesc}>
                          Unbiased guidance on scholarships, fee payment plans, and whether Atelier is the right fit for your goals.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Connect Channels Card */}
                <div className={styles.infoCard}>
                  <div className={styles.cardHeaderRow}>
                    <span className={styles.cardHeaderLabel}>NEED RAPID ANSWERS?</span>
                  </div>

                  <div className={styles.channelsList}>
                    <a href="tel:+917411288457" className={styles.channelItem}>
                      <div className={styles.channelIconWrap}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                      <div className={styles.channelMeta}>
                        <span className={styles.channelLabel}>Advisory Direct Line</span>
                        <span className={styles.channelValue}>+91 7411288457</span>
                      </div>
                    </a>

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

                  <a 
                    href="https://wa.me/917411288457?text=Hi%20Atelier%20team,%20I%20would%20like%20to%20request%20a%20callback%20regarding%20cohorts" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.whatsappQuickBtn}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                    Message Directly On WhatsApp
                  </a>
                </div>

              </div>

              {/* Right Column: Callback Booking Form */}
              <div className={styles.formCard}>
                {isSuccess ? (
                  <div className={styles.successCard}>
                    <div className={styles.successIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <h2 className={styles.successTitle}>Callback Scheduled</h2>
                    <p className={styles.successDesc}>
                      Thank you! Your callback request has been prioritized in our admissions queue. An engineering advisor will reach out to you via WhatsApp / phone during your selected time window.
                    </p>
                    <button 
                      type="button" 
                      onClick={() => setIsSuccess(false)} 
                      className={styles.resetBtn}
                    >
                      Book Another Callback
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.formHeader}>
                      <h2 className={styles.formTitle}>Book An Advisory Session</h2>
                      <p className={styles.formSubtitle}>
                        Select your track of interest and preferred time. One of our mentors will connect with you.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                      {errorMsg && (
                        <div className={styles.errorMessage}>
                          {errorMsg}
                        </div>
                      )}

                      {/* Name & Phone */}
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Your Full Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Rahul Sharma"
                            className={styles.input}
                            required
                          />
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
                      </div>

                      {/* Email Address */}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Email Address (Optional)</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="rahul@example.com"
                          className={styles.input}
                        />
                      </div>

                      {/* Program Track Pills */}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Cohort / Focus Track</label>
                        <div className={styles.pillsGrid}>
                          {tracks.map((t) => (
                            <div
                              key={t.id}
                              onClick={() => handleTrackSelect(t.id)}
                              className={`${styles.pillItem} ${formData.topic === t.id ? styles.pillItemActive : ''}`}
                            >
                              <span className={styles.pillDot} />
                              <span className={styles.pillLabel}>{t.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Preferred Callback Time */}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Preferred Callback Time</label>
                        <div className={styles.slotsRow}>
                          {timeSlots.map((slot) => (
                            <button
                              type="button"
                              key={slot}
                              onClick={() => handleSlotSelect(slot)}
                              className={`${styles.slotBtn} ${formData.preferredTime === slot ? styles.slotBtnActive : ''}`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes / Questions */}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Questions or Current Tech Stack (Optional)</label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder="Tell us about your current college, projects you built, or specific questions about the cohort..."
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
                          <span>Scheduling Callback...</span>
                        ) : (
                          <>
                            Request Advisory Callback
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
