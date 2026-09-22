import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '../legal.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://atelier.spherehive.com";

export const metadata = {
  title: 'Terms of Service | Atelier - A Sphere Hive Academy',
  description: 'Official Terms of Service, Student Honor Code, Intellectual Property Rights, and Cohort Enrollment Agreement for Atelier by Sphere Hive Academy.',
  keywords: [
    'Atelier terms of service',
    'Sphere Hive Academy terms',
    'student honor code',
    'coding cohort agreement',
    'intellectual property policy',
    'engineering school conditions'
  ],
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  openGraph: {
    title: 'Terms of Service | Atelier - A Sphere Hive Academy',
    description: 'Review the official terms of service, student honor code, and cohort enrollment agreement for Atelier by Sphere Hive Academy.',
    url: `${SITE_URL}/terms`,
    images: [`${SITE_URL}/og-banner.png`],
  },
};

const TOC_ITEMS = [
  { id: 'agreement', title: '1. Agreement & Operating Entity' },
  { id: 'eligibility', title: '2. Eligibility & Account Security' },
  { id: 'cohort-structure', title: '3. Cohorts, Live Classes & Mentorship' },
  { id: 'honor-code', title: '4. Student Honor Code & AI Policy' },
  { id: 'assessments', title: '5. Assessments & Proctoring Telemetry' },
  { id: 'ip-rights', title: '6. Intellectual Property & Project Ownership' },
  { id: 'tuition-payments', title: '7. Tuition, Payments & Taxes' },
  { id: 'career-disclaimer', title: '8. Career Support & Placement Disclaimer' },
  { id: 'termination', title: '9. Suspension & Termination' },
  { id: 'limitation-liability', title: '10. Limitation of Liability' },
  { id: 'governing-law', title: '11. Governing Law & Jurisdiction' },
  { id: 'grievance', title: '12. Grievance Officer & Contact' },
];

export default function TermsPage() {
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
              Legal &amp; Institutional Governance
            </span>
            <h1 className={styles.title}>Terms of Service</h1>
            <p className={styles.subtitle}>
              Clear, transparent rules governing your learning journey, cohort access, student code of conduct,
              and intellectual property rights at Atelier.
            </p>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <strong>Organization:</strong> Sphere Hive Academy (Sphere Hive Lab)
              </div>
              <span className={styles.metaDot} />
              <div className={styles.metaItem}>
                <strong>Jurisdiction:</strong> Karnataka, India
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
            <Link href="/terms" className={`${styles.navPill} ${styles.navPillActive}`}>
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className={styles.navPill}>
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className={styles.navPill}>
              Pricing &amp; Refund Policy
            </Link>
          </nav>

          {/* Two-Column Layout */}
          <div className={styles.layoutGrid}>
            {/* Sticky Sidebar Navigation */}
            <aside className={styles.sidebar}>
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
                <ul className={styles.tocList}>
                  {TOC_ITEMS.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} className={styles.tocLink}>
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.sidebarMetaCard}>
                <div className={styles.sidebarMetaTitle}>Institutional Notice</div>
                <div className={styles.sidebarMetaText}>
                  <strong>Sphere Hive Academy</strong> operates Atelier as a modern engineering apprenticeship
                  institute. All learning tracks are delivered with verified mentor supervision.
                </div>
                <div className={styles.sidebarMetaText}>
                  Need clarification on enrollment agreements?
                </div>
                <a href="mailto:spherehive@kvgce.ac.in" className={styles.helpBtn}>
                  Contact Legal Desk
                </a>
              </div>
            </aside>

            {/* Main Editorial Content */}
            <article className={styles.content}>
              {/* Section 1 */}
              <section id="agreement" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>01</span>
                  <h2 className={styles.sectionTitle}>Agreement &amp; Operating Entity</h2>
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
                  By using Atelier or enrolling in any cohort, you enter a binding legal agreement with Sphere Hive Academy.
                  These terms govern your access to our live classes, workbench, repositories, and community channels.
                </div>

                <p className={styles.paragraph}>
                  These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you
                  (&quot;Student&quot;, &quot;Learner&quot;, or &quot;User&quot;) and <strong>Sphere Hive Academy</strong> (&quot;Atelier&quot;,
                  &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), an engineering education initiative operated under Sphere Hive Lab,
                  headquartered at KVGCE Campus, Kurunjibhag, Sullia, Karnataka - 574327, India.
                </p>
                <p className={styles.paragraph}>
                  By visiting our website at <code>atelier.spherehive.com</code>, creating a student account, or purchasing enrollment in
                  any live cohort, workshop, or assessment, you acknowledge that you have read, understood, and agree to be bound by
                  these Terms, alongside our <Link href="/privacy-policy" style={{ color: 'var(--accent-orange)' }}>Privacy Policy</Link> and <Link href="/refund-policy" style={{ color: 'var(--accent-orange)' }}>Pricing &amp; Refund Policy</Link>.
                  If you do not agree to these terms in full, you must discontinue platform use immediately.
                </p>
              </section>

              {/* Section 2 */}
              <section id="eligibility" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>02</span>
                  <h2 className={styles.sectionTitle}>Eligibility &amp; Account Security</h2>
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
                  You must be at least 18 (or 16+ with parental consent). Your account is strictly for your personal use.
                  Sharing login credentials, reselling seats, or multi-accounting will result in immediate termination without refund.
                </div>

                <p className={styles.paragraph}>
                  <strong>Age Requirements:</strong> You must be at least 18 years of age to register for an Atelier cohort.
                  Learners between 16 and 18 years may enroll only with explicit verifiable consent from a parent or legal guardian.
                </p>
                <p className={styles.paragraph}>
                  <strong>Account Authenticity:</strong> You agree to provide true, accurate, and current information during
                  registration—including your legal name, university/college affiliation, verified contact number, and academic email.
                  Impersonating another person or creating fake profiles is grounds for permanent disqualification.
                </p>
                <p className={styles.paragraph}>
                  <strong>Single-User License &amp; Credential Protection:</strong> Every enrolled seat represents a single, non-transferable
                  license. You are responsible for safeguarding your login credentials (passwords, Google OAuth tokens, and GitHub SSH keys).
                  Atelier monitors concurrent logins and unusual IP geographically disjointed sessions. If credential sharing is detected,
                  we reserve the right to suspend the account pending an integrity review.
                </p>
              </section>

              {/* Section 3 */}
              <section id="cohort-structure" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>03</span>
                  <h2 className={styles.sectionTitle}>Cohorts, Live Classes &amp; Mentorship</h2>
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
                  We provide live interactive classes, recorded video archives, and 1:1 mentor bookings. If you miss a class,
                  recordings are available in your dashboard. Free cohort batch transfers are available for college exam or health emergencies.
                </div>

                <p className={styles.paragraph}>
                  <strong>Live Instruction &amp; Schedule:</strong> Atelier cohorts are delivered via live, real-time interactive lectures,
                  hands-on coding studios, and architecture design sessions. Cohort schedules are published in your student workbench.
                  Sphere Hive Academy reserves the right to reschedule lectures with prior notice in the event of instructor illness,
                  national holidays, or emergency technical disruptions.
                </p>
                <p className={styles.paragraph}>
                  <strong>Recorded Sessions:</strong> High-definition recordings of live sessions are typically uploaded to your student
                  portal within 12 hours of broadcast. Enrolled learners maintain access to their batch recordings throughout their enrollment
                  period and for an additional archival period specified during course enrollment.
                </p>
                <p className={styles.paragraph}>
                  <strong>1-on-1 Mentor Callbacks:</strong> Enrolled students in premium tracks are entitled to request 1-on-1 technical
                  consultations with industry mentors. To respect our mentors&apos; time, cancellations must be requested at least 4 hours
                  in advance. Repeated no-shows without notification may temporarily pause callback privileges.
                </p>
                <p className={styles.paragraph}>
                  <strong>Batch Transfers:</strong> If university examinations, medical reasons, or verifiable personal emergencies
                  prevent you from actively following your enrolled cohort, you may apply for a <em>one-time free batch transfer</em> to
                  the next immediate cohort of the same track.
                </p>
              </section>

              {/* Section 4 */}
              <section id="honor-code" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>04</span>
                  <h2 className={styles.sectionTitle}>Student Honor Code &amp; AI Policy</h2>
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
                  We encourage using AI tools (ChatGPT, Copilot) as learning aids, but copying whole codebases or claiming other
                  people&apos;s work as your own will disqualify you from certification. Harassment of faculty or peers has zero tolerance.
                </div>

                <p className={styles.paragraph}>
                  Atelier is built on an ethos of craftsmanship, curiosity, and rigorous engineering ethics. Every student agrees to
                  adhere strictly to our Academic Honor Code:
                </p>

                <ul className={styles.list}>
                  <li>
                    <strong>Authentic Authorship:</strong> All project code, repository commits, and capstone submissions must represent
                    your own intellectual effort or attributed collaboration in team assignments.
                  </li>
                  <li>
                    <strong>Responsible AI Usage:</strong> We actively teach modern engineers how to leverage LLMs and AI coding assistants.
                    Using AI to explain algorithms, suggest regex patterns, or debug errors is encouraged. However, blindly copy-pasting
                    entire generated modules without understanding their mechanics, or submitting unverified AI outputs for graded assessments,
                    violates the honor code.
                  </li>
                  <li>
                    <strong>No Plagiarism or Asset Piracy:</strong> Submitting projects downloaded from GitHub, cloning peer repositories
                    without architectural divergence, or redistributing closed-source cohort problem sets is strictly banned.
                  </li>
                  <li>
                    <strong>Respectful Community Conduct:</strong> Our live chats, Discord channels, and discussion threads must remain
                    professional, supportive, and inclusive. Harassment, discrimination, hate speech, bullying, solicitation, or vulgarity
                    results in instantaneous expulsion without appeal or refund.
                  </li>
                </ul>
              </section>

              {/* Section 5 */}
              <section id="assessments" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>05</span>
                  <h2 className={styles.sectionTitle}>Assessments &amp; Proctoring Telemetry</h2>
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
                  Our test platform evaluates your code real-time. During proctored assessments, tab-switching and window blurs are
                  logged to ensure fair peer rankings. Certification is awarded strictly on verifiable merit.
                </div>

                <p className={styles.paragraph}>
                  <strong>Assessment Evaluation:</strong> Graded checkpoints include algorithmic challenges, system architecture diagnostics,
                  SQL query benchmarks, and manual mentor reviews of GitHub pull requests.
                </p>
                <p className={styles.paragraph}>
                  <strong>Proctoring Telemetry:</strong> Certain critical diagnostic assessments feature lightweight client-side proctoring.
                  When taking a proctored assessment, the platform monitors window focus events, full-screen departures, and tab-switch counts.
                  Repeated tab switches are logged and may flag an attempt for human mentor review or disqualify an automated passing grade.
                </p>
                <p className={styles.paragraph}>
                  <strong>Certification Criteria:</strong> Official Atelier Completion Certificates are cryptographically verifiable
                  credentials issued only upon satisfying minimum attendance thresholds, passing required milestone assessments, and
                  defending your capstone project before faculty or mentor panels.
                </p>
              </section>

              {/* Section 6 */}
              <section id="ip-rights" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>06</span>
                  <h2 className={styles.sectionTitle}>Intellectual Property &amp; Project Ownership</h2>
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
                  You own 100% of the original software, code, and startups you build at Atelier. We own our curriculum, slide decks,
                  and platform code. We never claim equity or copyright over student applications.
                </div>

                <div className={styles.highlightGrid}>
                  <div className={styles.highlightCard}>
                    <div className={styles.highlightCardTitle}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Your Original Code = Your Property
                    </div>
                    <p className={styles.highlightCardText}>
                      Every line of custom software, full-stack web application, mobile app, or distributed system you create
                      during the cohort belongs 100% to you. You are free to open-source it, license it, or turn it into a commercial startup.
                    </p>
                  </div>

                  <div className={styles.highlightCard}>
                    <div className={styles.highlightCardTitle}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Atelier Curriculum Protection
                    </div>
                    <p className={styles.highlightCardText}>
                      Our slide decks, video lessons, course architectures, and proprietary assignment test suites are the intellectual
                      property of Sphere Hive Academy. Video recording, scraping, or re-selling cohort materials is strictly forbidden.
                    </p>
                  </div>
                </div>

                <p className={styles.paragraph}>
                  <strong>Showcase License:</strong> By submitting capstone projects to Atelier showcases or Demo Day, you grant Sphere Hive
                  Academy a non-exclusive, royalty-free license to feature your project name, demo screenshots, architecture diagrams,
                  and public GitHub link in our alumni portfolio, marketing reels, and hiring partner catalogs.
                </p>
              </section>

              {/* Section 7 */}
              <section id="tuition-payments" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>07</span>
                  <h2 className={styles.sectionTitle}>Tuition, Payments &amp; Taxes</h2>
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
                  Tuition fees are charged in Indian Rupees (INR) via Razorpay. Applicable GST is charged per Indian tax laws.
                  Eligible refund requests must be submitted within our transparent 7-day money-back window.
                </div>

                <p className={styles.paragraph}>
                  <strong>Pricing &amp; Currency:</strong> All cohort tuition fees are quoted in Indian Rupees (INR) unless otherwise
                  explicitly stated. Prices are subject to revision for upcoming batches; however, enrolled students will never face
                  fee increases for batches already purchased.
                </p>
                <p className={styles.paragraph}>
                  <strong>Payment Aggregator:</strong> All online transactions are processed through authorized, RBI-compliant payment
                  partners (Razorpay). Atelier does not store credit/debit card numbers, CVV codes, or net banking passwords on its servers.
                </p>
                <p className={styles.paragraph}>
                  <strong>Taxes &amp; Invoicing:</strong> Where applicable under Indian taxation laws, Goods and Services Tax (GST) is
                  calculated and levied. Tax invoices are generated electronically and delivered to your registered email address.
                </p>
                <p className={styles.paragraph}>
                  <strong>Refunds &amp; Cancellations:</strong> Detailed refund procedures, timelines, and non-refundable circumstances
                  are governed explicitly by our <Link href="/refund-policy" style={{ color: 'var(--accent-orange)' }}>Pricing &amp; Refund Policy</Link>, which offers a 7-day refund window from cohort commencement.
                </p>
              </section>

              {/* Section 8 */}
              <section id="career-disclaimer" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>08</span>
                  <h2 className={styles.sectionTitle}>Career Support &amp; Placement Disclaimer</h2>
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
                  We provide extensive career prep—resume audits, mock technical interviews, and hiring referrals.
                  We do NOT sell deceptive &quot;100% placement guarantees&quot;. Your career outcomes depend on your effort, skills, and industry hiring conditions.
                </div>

                <p className={styles.paragraph}>
                  Atelier is committed to radical honesty in tech education. We reject fraudulent marketing gimmicks such as &quot;guaranteed
                  jobs without effort&quot; or inflated placement statistics.
                </p>
                <p className={styles.paragraph}>
                  Our career support services include:
                </p>
                <ul className={styles.list}>
                  <li>1-on-1 resume and GitHub portfolio audits with senior engineers.</li>
                  <li>Live mock technical coding and system architecture interviews.</li>
                  <li>Referral introductions to our hiring network of tech startups and engineering enterprises.</li>
                  <li>Salary negotiation strategies and offer evaluation mentorship.</li>
                </ul>
                <p className={styles.paragraph}>
                  While over 90% of active, dedicated Atelier alumni successfully transition into software engineering roles, Sphere Hive
                  Academy does not guarantee employment, minimum CTC packages, or specific visa sponsorships. Employment offers are made
                  solely at the discretion of hiring companies based on your individual performance during their evaluation processes.
                </p>
              </section>

              {/* Section 9 */}
              <section id="termination" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>09</span>
                  <h2 className={styles.sectionTitle}>Suspension &amp; Termination</h2>
                </div>

                <p className={styles.paragraph}>
                  Sphere Hive Academy reserves the right to immediately suspend or permanently terminate your access to Atelier portals,
                  cohort livestreams, and community servers without refund if you:
                </p>
                <ul className={styles.list}>
                  <li>Commit severe academic dishonesty, hackathon plagiarism, or assessment tampering.</li>
                  <li>Engage in harassment, verbal abuse, hate speech, or stalking toward fellow students, mentors, or staff.</li>
                  <li>Attempt to disrupt platform infrastructure via unauthorized penetration testing, scraping, or DDoS attacks.</li>
                  <li>Distribute, resell, or publicly upload Atelier course curriculum, video recordings, or code solutions.</li>
                </ul>
                <p className={styles.paragraph}>
                  You may choose to delete your student account at any time from your profile settings, subject to the retention of
                  statutory transaction records as outlined in our Privacy Policy.
                </p>
              </section>

              {/* Section 10 */}
              <section id="limitation-liability" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>10</span>
                  <h2 className={styles.sectionTitle}>Limitation of Liability</h2>
                </div>

                <p className={styles.paragraph}>
                  To the maximum extent permitted under applicable law, Sphere Hive Academy, its directors, lecturers, mentors,
                  and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages—including
                  loss of profits, data, employment opportunities, or goodwill—arising from your use of or inability to access our services.
                </p>
                <p className={styles.paragraph}>
                  In no event shall Sphere Hive Academy&apos;s aggregate financial liability exceed the total tuition fee actually paid
                  by you for the specific cohort or service giving rise to the dispute in the twelve (12) months preceding the claim.
                </p>
              </section>

              {/* Section 11 */}
              <section id="governing-law" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>11</span>
                  <h2 className={styles.sectionTitle}>Governing Law &amp; Jurisdiction</h2>
                </div>

                <p className={styles.paragraph}>
                  These Terms shall be governed by, interpreted, and construed in accordance with the substantive laws of the
                  <strong>Republic of India</strong>, without regard to conflict of law principles.
                </p>
                <p className={styles.paragraph}>
                  Any dispute, controversy, or claim arising out of or relating to these Terms or your cohort enrollment that cannot be
                  resolved through amicable informal negotiation shall be submitted to the exclusive jurisdiction of the competent courts
                  located in <strong>Sullia / Mangaluru, Dakshina Kannada, Karnataka, India</strong>.
                </p>
              </section>

              {/* Section 12 */}
              <section id="grievance" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>12</span>
                  <h2 className={styles.sectionTitle}>Grievance Redressal &amp; Contact</h2>
                </div>

                <p className={styles.paragraph}>
                  In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules,
                  2021, Sphere Hive Academy has designated an official Grievance Redressal Officer to handle student inquiries, privacy requests,
                  and formal complaints.
                </p>

                <div className={styles.contactBox}>
                  <h4>Official Administration &amp; Grievance Office</h4>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    Sphere Hive Academy / Atelier Coding School<br />
                    Top Floor, MBA Block, KVGCE Campus, Kurunjibhag,<br />
                    Sullia, Dakshina Kannada, Karnataka - 574327, India
                  </p>

                  <div className={styles.contactGrid}>
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Grievance Officer</span>
                      <span className={styles.contactValue}>Prof. Legal &amp; Student Affairs</span>
                    </div>

                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Institutional Email</span>
                      <a href="mailto:spherehive@kvgce.ac.in" className={`${styles.contactValue} ${styles.contactLink}`}>
                        spherehive@kvgce.ac.in
                      </a>
                    </div>

                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Official Helpline</span>
                      <a href="tel:+917411288457" className={`${styles.contactValue} ${styles.contactLink}`}>
                        +91 7411288457
                      </a>
                    </div>

                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Response Window</span>
                      <span className={styles.contactValue}>Within 48 Working Hours</span>
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
