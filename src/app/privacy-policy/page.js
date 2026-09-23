import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LegalToc from '@/components/LegalToc';
import styles from '../legal.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://atelier.spherehive.com";

export const metadata = {
  title: 'Privacy Policy | Atelier - A Sphere Hive Academy',
  description: 'Learn how Atelier by Sphere Hive Academy collects, protects, and handles personal data, academic progress, and transaction records under India\'s DPDP Act 2023 and global privacy standards.',
  keywords: [
    'Atelier privacy policy',
    'Sphere Hive Academy data protection',
    'student data privacy',
    'DPDP Act 2023 compliance',
    'educational data security',
    'Razorpay transaction privacy'
  ],
  alternates: {
    canonical: `${SITE_URL}/privacy-policy`,
  },
  openGraph: {
    title: 'Privacy Policy | Atelier - A Sphere Hive Academy',
    description: 'Read the official data protection and privacy policy for Atelier by Sphere Hive Academy.',
    url: `${SITE_URL}/privacy-policy`,
    images: [`${SITE_URL}/og-banner.png`],
  },
};

const TOC_ITEMS = [
  { id: 'commitment', title: '1. Introduction & DPDP Commitment' },
  { id: 'data-collected', title: '2. Information We Collect' },
  { id: 'data-usage', title: '3. Purpose & Lawful Processing' },
  { id: 'third-parties', title: '4. Third-Party Sub-Processors' },
  { id: 'cookies-storage', title: '5. Cookies & Local Storage' },
  { id: 'security', title: '6. Data Protection & Security Architecture' },
  { id: 'student-rights', title: '7. Your Rights Under Indian DPDP Act' },
  { id: 'data-retention', title: '8. Data Retention & Archival' },
  { id: 'children-privacy', title: '9. Age Restrictions & Minors' },
  { id: 'grievance-desk', title: '10. Data Protection Officer & Redressal' },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className={styles.legalPage}>
        <div className={styles.backgroundGrid} />
        <div className={styles.glowEffect} />

        <div className={styles.container}>
          {/* Hero Header */}
          <div className={styles.hero}>
            <span className={styles.badge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Student Privacy &amp; Data Safeguards
            </span>
            <h1 className={styles.title}>Privacy Policy</h1>
            <p className={styles.subtitle}>
              We believe your learning data belongs to you. Here is an honest, transparent breakdown of what data we
              collect, how it is safeguarded, and how you retain full control under Indian and international privacy laws.
            </p>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <strong>Organization:</strong> Sphere Hive Academy (Sphere Hive Lab)
              </div>
              <span className={styles.metaDot} />
              <div className={styles.metaItem}>
                <strong>Compliance:</strong> India DPDP Act 2023 &amp; IT Rules 2021
              </div>
              <span className={styles.metaDot} />
              <div className={styles.metaItem}>
                <strong>Effective Date:</strong> September 2026
              </div>
              <span className={styles.metaDot} />
              <div className={styles.metaItem}>
                <strong>Version:</strong> 2.4
              </div>
            </div>
          </div>

          {/* Quick Policy Switcher Tabs */}
          <nav className={styles.policyNav} aria-label="Legal Documents Navigation">
            <Link href="/terms" className={styles.navPill}>
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className={`${styles.navPill} ${styles.navPillActive}`}>
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className={styles.navPill}>
              Pricing &amp; Refund Policy
            </Link>
          </nav>

          {/* Two-Column Layout */}
          <div className={styles.layoutGrid}>
            {/* Sticky Sidebar Navigation */}
            <aside className={styles.sidebar} data-lenis-prevent="true">
              <div className={styles.tocCard}>
                <div className={styles.tocTitle}>
                  <span>Table of Contents</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </div>
                <LegalToc items={TOC_ITEMS} styles={styles} />
              </div>

              <div className={styles.sidebarMetaCard}>
                <div className={styles.sidebarMetaTitle}>Privacy Commitment</div>
                <div className={styles.sidebarMetaText}>
                  <strong>Zero Data Selling:</strong> Atelier never sells, rents, or trades your personal information or
                  portfolio data to third-party ad networks or brokers.
                </div>
                <div className={styles.sidebarMetaText}>
                  Want to export or delete your learning records?
                </div>
                <a href="mailto:spherehive@kvgce.ac.in" className={styles.helpBtn}>
                  Request Data Export / Removal
                </a>
              </div>
            </aside>

            {/* Main Editorial Content */}
            <article className={styles.content}>
              {/* Section 1 */}
              <section id="commitment" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>01</span>
                  <h2 className={styles.sectionTitle}>Introduction &amp; DPDP Commitment</h2>
                </div>

                <div className={styles.summaryBox}>
                  <div className={styles.summaryLabel}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Summary in Plain English
                  </div>
                  Sphere Hive Academy takes your privacy seriously. We comply with India&apos;s Digital Personal Data Protection
                  (DPDP) Act, 2023. We only collect what is strictly necessary to run your cohort, evaluate code, and issue certificates.
                </div>

                <p className={styles.paragraph}>
                  Atelier Coding School (&quot;Atelier&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operated under
                  <strong>Sphere Hive Academy</strong> (Sphere Hive Lab at KVG College of Engineering, Sullia, Karnataka - 574327, India),
                  respects your fundamental right to privacy.
                </p>
                <p className={styles.paragraph}>
                  This Privacy Policy describes how we collect, process, store, and protect your personal information when you access our
                  website at <code>atelier.spherehive.com</code>, register for student dashboards, attend live video streams, submit code
                  in our sandbox, take proctored assessments, or schedule 1-on-1 mentor callbacks.
                </p>
                <p className={styles.paragraph}>
                  We operate as a Data Fiduciary in strict compliance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>,
                  the <strong>Information Technology Act, 2000</strong>, the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>,
                  and international data transparency best practices.
                </p>
              </section>

              {/* Section 2 */}
              <section id="data-collected" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>02</span>
                  <h2 className={styles.sectionTitle}>Information We Collect</h2>
                </div>

                <div className={styles.summaryBox}>
                  <div className={styles.summaryLabel}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Summary in Plain English
                  </div>
                  We collect your profile details, GitHub/LinkedIn links, payment confirmation records from Razorpay, and your
                  learning telemetry (code progress, test scores). We never collect or store your raw bank details or card numbers.
                </div>

                <p className={styles.paragraph}>
                  We collect only the categories of personal data necessary to deliver high-quality technical education:
                </p>

                <div className={styles.tableWrapper}>
                  <table className={styles.legalTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '28%' }}>Category</th>
                        <th style={{ width: '42%' }}>Specific Data Points</th>
                        <th style={{ width: '30%' }}>Collection Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Identity &amp; Profile</strong></td>
                        <td>Full name, email address, mobile phone number, college/university name, degree program, graduation year, profile avatar.</td>
                        <td>Student authentication, batch cohort grouping, and verified graduation credential issuance.</td>
                      </tr>
                      <tr>
                        <td><strong>Portfolio &amp; GitHub</strong></td>
                        <td>GitHub username, LinkedIn profile URL, personal portfolio website, biography, technical skill tags.</td>
                        <td>Code review assignment, capstone project grading, and engineering showcase portfolios.</td>
                      </tr>
                      <tr>
                        <td><strong>Billing &amp; Payments</strong></td>
                        <td>Razorpay payment IDs, order numbers, transaction timestamp, payment status, GST billing invoice records.</td>
                        <td>Processing enrollment tuition and satisfying statutory Indian tax compliance obligations.</td>
                      </tr>
                      <tr>
                        <td><strong>Academic Telemetry</strong></td>
                        <td>Module completion progress, daily streak counts, XP scores, submitted code snippets, test scores, mentor notes.</td>
                        <td>Personalized roadmap progression, leaderboard tracking, and mentor review sessions.</td>
                      </tr>
                      <tr>
                        <td><strong>Proctoring Telemetry</strong></td>
                        <td>Tab switch counts, window blur timestamps, and fullscreen departure logs during active graded tests.</td>
                        <td>Ensuring fair, plagiarism-free assessment rankings for certification.</td>
                      </tr>
                      <tr>
                        <td><strong>Technical Logs</strong></td>
                        <td>IP address, browser type, operating system, and secure session tokens in browser localStorage.</td>
                        <td>Session persistence, fraud prevention, and platform security monitoring.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className={styles.paragraph}>
                  <strong>Card &amp; Banking Details Exclusion:</strong> All online payments are handled directly by Razorpay, an
                  RBI-authorized, PCI-DSS Level 1 certified payment aggregator. Atelier <em>never</em> captures, logs, or stores your
                  credit card numbers, debit card PINs, CVV codes, or net banking passwords.
                </p>
              </section>

              {/* Section 3 */}
              <section id="data-usage" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>03</span>
                  <h2 className={styles.sectionTitle}>Purpose &amp; Lawful Processing</h2>
                </div>

                <div className={styles.summaryBox}>
                  <div className={styles.summaryLabel}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Summary in Plain English
                  </div>
                  Your data is used strictly for running your courses, connecting you with mentors, issuing verified certificates,
                  and sending schedule updates. We do not use your information for spam or invasive ad targeting.
                </div>

                <p className={styles.paragraph}>
                  Under the DPDP Act 2023, we process personal data exclusively under legitimate educational uses and contract performance:
                </p>

                <ul className={styles.list}>
                  <li>
                    <strong>Provisioning Learning Workspaces:</strong> Enabling your student dashboard, live stream embeds (Jitsi / WebRTC),
                    reference material downloads, and Monaco-style code previews.
                  </li>
                  <li>
                    <strong>Mentor Callback Scheduling:</strong> Permitting our faculty and mentors to reach out for booked 1:1 technical
                    mentorship, portfolio reviews, and code debugging sessions.
                  </li>
                  <li>
                    <strong>Verified Credentials:</strong> Generating cryptographically signed, permanent verifiable certificates of
                    completion that you can link on LinkedIn and resume applications.
                  </li>
                  <li>
                    <strong>Integrity &amp; Anti-Cheating Enforcement:</strong> Detecting fraudulent multi-IP credential sharing and ensuring
                    assessment scores reflect genuine individual technical ability.
                  </li>
                  <li>
                    <strong>Transactional Communications:</strong> Sending fee receipts, lecture schedule updates, password resets, and critical
                    academic notifications via email or SMS.
                  </li>
                </ul>
              </section>

              {/* Section 4 */}
              <section id="third-parties" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>04</span>
                  <h2 className={styles.sectionTitle}>Third-Party Sub-Processors</h2>
                </div>

                <div className={styles.summaryBox}>
                  <div className={styles.summaryLabel}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Summary in Plain English
                  </div>
                  We partner only with vetted technical providers to run Atelier (Razorpay for payments, Google/GitHub for login,
                  and secure cloud servers). We will never sell or rent your data to ad networks or data brokers.
                </div>

                <p className={styles.paragraph}>
                  To provide our services, we share necessary data with trusted technical infrastructure providers under strict confidentiality
                  and data processing agreements:
                </p>

                <div className={styles.highlightGrid}>
                  <div className={styles.highlightCard}>
                    <div className={styles.highlightCardTitle}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2.5">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      Razorpay (Payments)
                    </div>
                    <p className={styles.highlightCardText}>
                      RBI-licensed payment gateway used to securely collect tuition fees, issue refunds, and generate GST invoices.
                      Compliant with PCI-DSS Level 1.
                    </p>
                  </div>

                  <div className={styles.highlightCard}>
                    <div className={styles.highlightCardTitle}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2.5">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      Google &amp; GitHub (OAuth)
                    </div>
                    <p className={styles.highlightCardText}>
                      Allows fast, secure one-click sign-in without creating new passwords. We only receive your verified email, name,
                      and public avatar.
                    </p>
                  </div>

                  <div className={styles.highlightCard}>
                    <div className={styles.highlightCardTitle}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2.5">
                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                        <line x1="6" y1="6" x2="6.01" y2="6" />
                        <line x1="6" y1="18" x2="6.01" y2="18" />
                      </svg>
                      Cloud &amp; Database Hosting
                    </div>
                    <p className={styles.highlightCardText}>
                      High-security cloud infrastructure hosting our relational databases, application servers, and encrypted media
                      storage facilities located in India.
                    </p>
                  </div>
                </div>

                <p className={styles.paragraph}>
                  <strong>No Commercial Data Selling:</strong> Sphere Hive Academy does not participate in programmatic ad exchanges,
                  cross-context behavioral targeting, or personal data sales. Your academic record and contact information are never
                  monetized.
                </p>
              </section>

              {/* Section 5 */}
              <section id="cookies-storage" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>05</span>
                  <h2 className={styles.sectionTitle}>Cookies &amp; Local Storage</h2>
                </div>

                <div className={styles.summaryBox}>
                  <div className={styles.summaryLabel}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Summary in Plain English
                  </div>
                  We use browser LocalStorage strictly for functional reasons—keeping you logged in and remembering your active
                  cohort track. We do not use third-party tracking cookies.
                </div>

                <p className={styles.paragraph}>
                  Unlike advertising-supported websites, Atelier does not deploy third-party advertising cookies or cross-domain tracking pixels.
                  We utilize standard, secure client-side browser <code>localStorage</code> solely for application functionality:
                </p>

                <div className={styles.tableWrapper}>
                  <table className={styles.legalTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '30%' }}>Storage Key</th>
                        <th style={{ width: '45%' }}>Function &amp; Stored Value</th>
                        <th style={{ width: '25%' }}>Persistence</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>loggedInStudentEmail</code></td>
                        <td>Stores the active student session identifier for seamless dashboard navigation across page reloads.</td>
                        <td>Until manual sign-out</td>
                      </tr>
                      <tr>
                        <td><code>studentProfile</code></td>
                        <td>Locally caches student avatar, display name, and enrolled cohort list for fast UI rendering without network lag.</td>
                        <td>Until profile update</td>
                      </tr>
                      <tr>
                        <td><code>activeCourseId</code></td>
                        <td>Remembers which cohort workbench track you are actively studying (e.g. Full-Stack vs System Design).</td>
                        <td>Session / Persistent</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className={styles.paragraph}>
                  You can clear your local storage at any time via your browser settings; doing so will simply log you out of the student dashboard.
                </p>
              </section>

              {/* Section 6 */}
              <section id="security" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>06</span>
                  <h2 className={styles.sectionTitle}>Data Protection &amp; Security Architecture</h2>
                </div>

                <div className={styles.summaryBox}>
                  <div className={styles.summaryLabel}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Summary in Plain English
                  </div>
                  Your passwords are cryptographically hashed, traffic is encrypted via HTTPS / TLS 1.3, and access to student
                  records is restricted to authorized faculty under strict access controls.
                </div>

                <p className={styles.paragraph}>
                  We implement robust technical and organizational safeguards complying with Rule 8 of the Information Technology Rules, 2011:
                </p>

                <ul className={styles.list}>
                  <li>
                    <strong>Encryption in Transit:</strong> All data exchanged between your browser and Atelier servers is encrypted
                    using Transport Layer Security (TLS 1.3) with modern cipher suites.
                  </li>
                  <li>
                    <strong>Password Security:</strong> Passwords are never stored in plaintext. They are salted and hashed using
                    computationally intensive cryptographic functions (bcrypt) resistant to brute-force and rainbow table attacks.
                  </li>
                  <li>
                    <strong>Role-Based Access Controls (RBAC):</strong> Only verified lecturers, mentors, and system administrators
                    possess authorized credentials to review student submissions, mentor notes, and enrollment logs.
                  </li>
                  <li>
                    <strong>Database Isolation:</strong> Production databases are secured behind private network firewalls with automated
                    daily snapshot backups and point-in-time recovery capabilities.
                  </li>
                </ul>
              </section>

              {/* Section 7 */}
              <section id="student-rights" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>07</span>
                  <h2 className={styles.sectionTitle}>Your Rights Under Indian DPDP Act</h2>
                </div>

                <div className={styles.summaryBox}>
                  <div className={styles.summaryLabel}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Summary in Plain English
                  </div>
                  You have the legal right to see the data we have about you, correct mistakes, download your project history,
                  or ask us to delete your account entirely.
                </div>

                <p className={styles.paragraph}>
                  As a student of Sphere Hive Academy, you possess clear statutory rights under Chapter III of the Digital Personal Data
                  Protection Act, 2023:
                </p>

                <ul className={styles.list}>
                  <li>
                    <strong>Right to Access &amp; Summary:</strong> You can view and download all your profile data, enrolled cohorts,
                    and learning analytics directly from your student dashboard settings.
                  </li>
                  <li>
                    <strong>Right to Correction &amp; Erasure:</strong> You can update inaccurate personal information (e.g. updated phone number,
                    grad year, or college name) or request complete deletion of your account.
                  </li>
                  <li>
                    <strong>Right of Grievance Redressal:</strong> You have the right to register formal privacy grievances with our designated
                    Data Protection Officer, who will investigate and respond within statutory deadlines.
                  </li>
                  <li>
                    <strong>Right to Nominate:</strong> You may nominate any individual who shall, in the event of death or incapacity,
                    exercise student rights on your behalf.
                  </li>
                </ul>
                <p className={styles.paragraph}>
                  To exercise any of these rights, email our Grievance Desk at <a href="mailto:spherehive@kvgce.ac.in" style={{ color: 'var(--accent-orange)' }}>spherehive@kvgce.ac.in</a> using your registered student email address.
                </p>
              </section>

              {/* Section 8 */}
              <section id="data-retention" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>08</span>
                  <h2 className={styles.sectionTitle}>Data Retention &amp; Archival</h2>
                </div>

                <p className={styles.paragraph}>
                  We retain personal data only for as long as necessary to fulfill the educational purposes for which it was collected:
                </p>
                <ul className={styles.list}>
                  <li>
                    <strong>Active Account Records:</strong> Kept active for the duration of your cohort learning track and alumni network membership.
                  </li>
                  <li>
                    <strong>Completion Certificates:</strong> Cryptographic certificate hashes and issuance metadata are archived indefinitely
                    so future employers can reliably verify your graduation credentials.
                  </li>
                  <li>
                    <strong>Financial &amp; Tax Compliance:</strong> In accordance with Indian Goods and Services Tax (GST) and Income Tax
                    statutory requirements, payment transaction logs, invoices, and refund records are preserved for a minimum of 7 years.
                  </li>
                </ul>
                <p className={styles.paragraph}>
                  Upon receiving a verified account deletion request, non-statutory personal identifiers, submitted code snippets, and
                  telemetry logs are permanently purged from active production servers within thirty (30) days.
                </p>
              </section>

              {/* Section 9 */}
              <section id="children-privacy" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>09</span>
                  <h2 className={styles.sectionTitle}>Age Restrictions &amp; Minors</h2>
                </div>

                <p className={styles.paragraph}>
                  Atelier is an advanced software engineering and systems architecture academy designed for undergraduate university
                  students, early-career engineers, and mature learners. We do not knowingly solicit or enroll individuals under 16 years of age.
                </p>
                <p className={styles.paragraph}>
                  If we discover that a learner under 16 has submitted personal information without verifiable parental or guardian consent,
                  we will promptly take steps to delete such data and terminate the account. Parents or guardians who believe their child has
                  registered without authorization can reach us at <a href="mailto:spherehive@kvgce.ac.in" style={{ color: 'var(--accent-orange)' }}>spherehive@kvgce.ac.in</a>.
                </p>
              </section>

              {/* Section 10 */}
              <section id="grievance-desk" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>10</span>
                  <h2 className={styles.sectionTitle}>Data Protection Officer &amp; Redressal</h2>
                </div>

                <p className={styles.paragraph}>
                  If you have any questions, concerns, or grievances regarding this Privacy Policy or our data handling practices, please contact
                  our designated Data Protection &amp; Grievance Redressal Officer:
                </p>

                <div className={styles.contactBox}>
                  <h4>Data Protection &amp; Privacy Grievance Office</h4>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    Sphere Hive Academy / Atelier Coding School<br />
                    Top Floor, MBA Block, KVGCE Campus, Kurunjibhag,<br />
                    Sullia, Dakshina Kannada, Karnataka - 574327, India
                  </p>

                  <div className={styles.contactGrid}>
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Officer Name</span>
                      <span className={styles.contactValue}>Prof. Data Protection &amp; Compliance</span>
                    </div>

                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Direct Email</span>
                      <a href="mailto:spherehive@kvgce.ac.in" className={`${styles.contactValue} ${styles.contactLink}`}>
                        spherehive@kvgce.ac.in
                      </a>
                    </div>

                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Institutional Helpline</span>
                      <a href="tel:+917411288457" className={`${styles.contactValue} ${styles.contactLink}`}>
                        +91 7411288457
                      </a>
                    </div>

                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Grievance Turnaround</span>
                      <span className={styles.contactValue}>Within 15 Business Days (Under DPDP Act)</span>
                    </div>
                  </div>
                </div>
              </section>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
