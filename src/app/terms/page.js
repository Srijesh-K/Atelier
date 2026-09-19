import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '../legal.module.css';

export const metadata = {
  title: 'Terms and Conditions | Atelier Coding School',
  description: 'Terms of service and enrollment conditions for Atelier by Sphere Hive.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className={styles.legalPage}>
        <div className={styles.backgroundGrid} />
        <div className={styles.glowEffect} />

        <div className={styles.container}>
          <span className={styles.badge}>TERMS OF SERVICE</span>
          <h1 className={styles.title}>Terms &amp; Conditions</h1>
          <p className={styles.lastUpdated}>Last Updated: September 2026</p>

          <div className={styles.content}>
            <section>
              <h2 className={styles.sectionTitle}>1. Agreement to Terms</h2>
              <p className={styles.paragraph}>
                By accessing or registering for any cohort at Atelier Coding School (&quot;Atelier&quot;), operated under Sphere Hive Lab at KVG College of Engineering (KVGCE), Sullia, Karnataka, you agree to be bound by these Terms and Conditions.
              </p>
            </section>

            <section>
              <h2 className={styles.sectionTitle}>2. Program Enrollment &amp; Access</h2>
              <p className={styles.paragraph}>
                Enrollment in an Atelier cohort provides personal, non-transferable access to live sessions, recorded modules, coding workbenches, and community repositories. You agree not to distribute, pirate, or publicly re-host course materials without explicit written consent.
              </p>
            </section>

            <section>
              <h2 className={styles.sectionTitle}>3. Code of Conduct</h2>
              <p className={styles.paragraph}>
                Sphere Hive is an inclusive, merit-driven technical community. Harassment, plagiarism in hackathons, unauthorized tampering with shared servers, or disruptive behavior during live sessions will result in immediate termination of workspace privileges without refund.
              </p>
            </section>

            <section>
              <h2 className={styles.sectionTitle}>4. Certification &amp; Career Preparation</h2>
              <p className={styles.paragraph}>
                Atelier certificates are issued upon verifiable completion of required capstone modules and project deliverables. While our project-first curriculum is designed to equip learners with skills hiring teams demand, Atelier does not guarantee automated job placements without student effort and performance.
              </p>
            </section>

            <section>
              <h2 className={styles.sectionTitle}>5. Contact Details</h2>
              <div className={styles.contactBox}>
                <h4>Atelier Administration</h4>
                <p>Top Floor, MBA Block, KVGCE Campus, Sullia, DK, Karnataka - 574327</p>
                <p>Email: <a href="mailto:spherehive@kvgce.ac.in" style={{ color: 'var(--accent-orange)' }}>spherehive@kvgce.ac.in</a></p>
                <p>Official Helpline: +91 7411288457</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
