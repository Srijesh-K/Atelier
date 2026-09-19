import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '../legal.module.css';

export const metadata = {
  title: 'Privacy Policy | Atelier Coding School',
  description: 'Privacy Policy and data protection terms for Atelier by Sphere Hive.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className={styles.legalPage}>
        <div className={styles.backgroundGrid} />
        <div className={styles.glowEffect} />

        <div className={styles.container}>
          <span className={styles.badge}>LEGAL & PRIVACY</span>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Last Updated: September 2026</p>

          <div className={styles.content}>
            <section>
              <h2 className={styles.sectionTitle}>1. Introduction</h2>
              <p className={styles.paragraph}>
                Atelier Coding School (&quot;Atelier&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), powered by Sphere Hive Lab at KVG College of Engineering, is committed to safeguarding your privacy. This policy outlines how we collect, process, and protect your personal information when you access our website, enroll in cohorts, and participate in community events.
              </p>
            </section>

            <section>
              <h2 className={styles.sectionTitle}>2. Information We Collect</h2>
              <p className={styles.paragraph}>We collect information that you provide directly to us, including:</p>
              <ul className={styles.list}>
                <li><strong>Account & Contact Data:</strong> Full name, email address, phone number, college or institution, and graduation year.</li>
                <li><strong>Profile & Portfolio Data:</strong> GitHub URL, LinkedIn profile, portfolio link, bio, and technical skills list.</li>
                <li><strong>Transaction Records:</strong> Razorpay payment identifiers, course registration receipts, and payment timestamps (we do not store credit card or banking secrets on our servers).</li>
                <li><strong>Learning Analytics:</strong> Course module progress, XP, streak counts, and attendance logs.</li>
              </ul>
            </section>

            <section>
              <h2 className={styles.sectionTitle}>3. How We Use Your Information</h2>
              <p className={styles.paragraph}>Your data is utilized strictly for:</p>
              <ul className={styles.list}>
                <li>Provisioning course curriculum, lecture links, and learning dashboard workspaces.</li>
                <li>Issuing verified certificates of completion detailing technical achievements.</li>
                <li>Processing secure course tuition payments via authorized payment gateways (Razorpay).</li>
                <li>Providing 24/7 dedicated mentor review and technical doubt resolution.</li>
              </ul>
            </section>

            <section>
              <h2 className={styles.sectionTitle}>4. Payment Processing & Security</h2>
              <p className={styles.paragraph}>
                All financial transactions are encrypted and processed through RBI-authorized payment aggregator partners (Razorpay). We adhere to industry-standard transport layer security (TLS) protocols to protect sensitive communications.
              </p>
            </section>

            <section>
              <h2 className={styles.sectionTitle}>5. Contact Us</h2>
              <div className={styles.contactBox}>
                <h4>Data Protection & Support</h4>
                <p>Sphere Hive Lab / Atelier Coding School</p>
                <p>Top Floor, MBA Block, KVGCE Campus, Kurunjibhag, Sullia, Karnataka - 574327</p>
                <p>Email: <a href="mailto:spherehive@kvgce.ac.in" style={{ color: 'var(--accent-orange)' }}>spherehive@kvgce.ac.in</a></p>
                <p>Phone: +91 7411288457</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
