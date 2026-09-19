import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '../legal.module.css';

export const metadata = {
  title: 'Pricing & Refund Policy | Atelier Coding School',
  description: 'Pricing, Cancellation and Refund Policy for Atelier by Sphere Hive cohorts.',
};

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main className={styles.legalPage}>
        <div className={styles.backgroundGrid} />
        <div className={styles.glowEffect} />

        <div className={styles.container}>
          <span className={styles.badge}>CANCELLATION &amp; REFUND</span>
          <h1 className={styles.title}>Pricing &amp; Refund Policy</h1>
          <p className={styles.lastUpdated}>Last Updated: September 2026</p>

          <div className={styles.content}>
            <section>
              <h2 className={styles.sectionTitle}>1. Transparent Pricing</h2>
              <p className={styles.paragraph}>
                Atelier Coding School believes in transparent, accessible technical education without hidden fees. All course tuition fees listed on our website are inclusive of live cohort lectures, mentor code review sessions, downloadable workshop materials, and verified completion credentials.
              </p>
            </section>

            <section>
              <h2 className={styles.sectionTitle}>2. 7-Day Refund Window</h2>
              <p className={styles.paragraph}>
                We want you to feel confident in your learning investment. If you enroll in an Atelier cohort and find that the curriculum does not meet your expectations, you may request a <strong>100% refund within 7 days</strong> of cohort commencement or payment date, provided:
              </p>
              <ul className={styles.list}>
                <li>You have not consumed or downloaded more than 20% of the course modules.</li>
                <li>Your request is formally submitted via email to <a href="mailto:spherehive@kvgce.ac.in" style={{ color: 'var(--accent-orange)' }}>spherehive@kvgce.ac.in</a> with your registered email and payment ID.</li>
              </ul>
            </section>

            <section>
              <h2 className={styles.sectionTitle}>3. Processing of Refunds</h2>
              <p className={styles.paragraph}>
                Approved refunds are processed through our payment partner (Razorpay) back to the original payment source (UPI, Credit/Debit Card, or Net Banking) within <strong>5 to 7 working days</strong> in accordance with standard banking settlement cycles.
              </p>
            </section>

            <section>
              <h2 className={styles.sectionTitle}>4. Batch Transfers &amp; Pauses</h2>
              <p className={styles.paragraph}>
                If unexpected college examinations or medical emergencies prevent you from attending scheduled live sessions, you can request a <strong>free batch transfer</strong> to the subsequent cohort without paying additional fees.
              </p>
            </section>

            <section>
              <h2 className={styles.sectionTitle}>5. Contact Support</h2>
              <div className={styles.contactBox}>
                <h4>Billing &amp; Refund Support</h4>
                <p>Sphere Hive Lab / Atelier Academy</p>
                <p>Email: <a href="mailto:spherehive@kvgce.ac.in" style={{ color: 'var(--accent-orange)' }}>spherehive@kvgce.ac.in</a></p>
                <p>Helpline: +91 7411288457</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
