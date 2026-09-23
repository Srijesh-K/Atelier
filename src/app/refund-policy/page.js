import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LegalToc from '@/components/LegalToc';
import styles from '../legal.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://atelier.spherehive.com";

export const metadata = {
  title: 'Pricing, Cancellation & Refund Policy | Atelier - A Sphere Hive Academy',
  description: 'Learn about Atelier course enrollment fees, our transparent 7-day money-back guarantee, free batch transfers, and Razorpay payment settlement policies.',
  keywords: [
    'Atelier refund policy',
    'Sphere Hive Academy pricing',
    'course cancellation terms',
    'coding cohort money back guarantee',
    'batch transfer policy',
    'Razorpay payment settlement'
  ],
  alternates: {
    canonical: `${SITE_URL}/refund-policy`,
  },
  openGraph: {
    title: 'Pricing & Refund Policy | Atelier - A Sphere Hive Academy',
    description: 'Review our transparent 7-day money-back guarantee, free batch transfers, and Razorpay transaction settlement policies.',
    url: `${SITE_URL}/refund-policy`,
    images: [`${SITE_URL}/og-banner.png`],
  },
};

const TOC_ITEMS = [
  { id: 'transparent-pricing', title: '1. Transparent All-Inclusive Tuition' },
  { id: 'money-back-window', title: '2. 7-Day Money-Back Guarantee' },
  { id: 'refund-eligibility', title: '3. Eligibility & Fair Use Conditions' },
  { id: 'settlement-timeline', title: '4. Razorpay Settlement & Timelines' },
  { id: 'batch-transfers', title: '5. Free Academic Batch Transfers' },
  { id: 'disputes-chargebacks', title: '6. Chargebacks & Inquiries' },
  { id: 'billing-support', title: '7. Billing & Refund Desk Contact' },
];

export default function RefundPolicyPage() {
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
              Consumer Trust &amp; Fee Safeguards
            </span>
            <h1 className={styles.title}>Pricing &amp; Refund Policy</h1>
            <p className={styles.subtitle}>
              No hidden fees, no deceptive fine print. Explore our 7-day money-back guarantee, batch postponement options,
              and transparent Razorpay refund settlements.
            </p>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <strong>Organization:</strong> Sphere Hive Academy (Sphere Hive Lab)
              </div>
              <span className={styles.metaDot} />
              <div className={styles.metaItem}>
                <strong>Payment Partner:</strong> Razorpay (PCI-DSS Level 1)
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
            <Link href="/privacy-policy" className={styles.navPill}>
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className={`${styles.navPill} ${styles.navPillActive}`}>
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
                <div className={styles.sidebarMetaTitle}>Money-Back Guarantee</div>
                <div className={styles.sidebarMetaText}>
                  <strong>100% Risk-Free:</strong> You can attend the first week of live sessions and inspect the curriculum.
                  If it does not fit your goals, get a full refund within 7 days.
                </div>
                <div className={styles.sidebarMetaText}>
                  Questions about batch transfers or payments?
                </div>
                <a href="mailto:spherehive@kvgce.ac.in" className={styles.helpBtn}>
                  Contact Billing Desk
                </a>
              </div>
            </aside>

            {/* Main Editorial Content */}
            <article className={styles.content}>
              {/* Section 1 */}
              <section id="transparent-pricing" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>01</span>
                  <h2 className={styles.sectionTitle}>Transparent All-Inclusive Tuition</h2>
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
                  What you see is what you pay. Our tuition covers all live lectures, mentor reviews, workshop materials,
                  assessments, and verifiable certificates. Zero hidden examination or certification surcharges.
                </div>

                <p className={styles.paragraph}>
                  Atelier Coding School believes in radical transparency. Every fee listed across our course catalog represents the
                  complete, all-inclusive tuition for the duration of that cohort track.
                </p>
                <p className={styles.paragraph}>
                  Your tuition fee covers:
                </p>
                <ul className={styles.list}>
                  <li>Complete access to all live interactive cohort lectures and weekend architectural deep dives.</li>
                  <li>Permanent access to recorded lectures throughout your active enrollment and archival review periods.</li>
                  <li>1-on-1 scheduled mentor code reviews, portfolio audits, and career guidance sessions.</li>
                  <li>Browser-based interactive workbench access, diagnostics, and milestone assessments.</li>
                  <li>Official cryptographically signed completion certificate and alumni community membership.</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section id="money-back-window" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>02</span>
                  <h2 className={styles.sectionTitle}>7-Day Money-Back Guarantee</h2>
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
                  You have 7 calendar days from your payment date or the first day of live cohort classes to evaluate the program.
                  If it is not the right fit, we will refund 100% of your tuition fee.
                </div>

                <p className={styles.paragraph}>
                  We want you to enroll with absolute confidence. If you join an Atelier cohort and determine that the teaching pace,
                  curriculum depth, or schedule does not align with your expectations, you are entitled to a <strong>100% refund of the tuition paid</strong>.
                </p>
                <p className={styles.paragraph}>
                  The 7-day refund window commences from whichever date is later:
                </p>
                <ul className={styles.list}>
                  <li>The official start date of the first live class session of your enrolled cohort; or</li>
                  <li>The timestamp of your successful tuition payment (for students enrolling right as the batch begins).</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section id="refund-eligibility" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>03</span>
                  <h2 className={styles.sectionTitle}>Eligibility &amp; Fair Use Conditions</h2>
                </div>

                <p className={styles.paragraph}>
                  To protect our mentors and prevent curriculum scraping or bad-faith resource piracy, full refund approval is subject to the following reasonable conditions:
                </p>

                <ul className={styles.list}>
                  <li>
                    <strong>Submission Deadline:</strong> Your refund request must be formally submitted via email to <a href="mailto:spherehive@kvgce.ac.in" style={{ color: 'var(--accent-orange)' }}>spherehive@kvgce.ac.in</a> before 11:59 PM IST on the 7th calendar day.
                  </li>
                  <li>
                    <strong>Fair Consumption Limit:</strong> You must not have consumed or downloaded more than 20% of the course curriculum materials or attended more than two (2) live lecture sessions.
                  </li>
                  <li>
                    <strong>Verification Details:</strong> The email must originate from your registered student account email address and include your payment transaction identifier (Razorpay Payment ID).
                  </li>
                </ul>

                <p className={styles.paragraph}>
                  Refund requests submitted after the 7-day window has elapsed cannot be processed; however, learners experiencing unexpected personal circumstances are always eligible for our free batch transfer policy outlined below.
                </p>
              </section>

              {/* Section 4 */}
              <section id="settlement-timeline" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>04</span>
                  <h2 className={styles.sectionTitle}>Razorpay Settlement &amp; Timelines</h2>
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
                  Once approved, refunds are credited directly back to your original payment method (UPI, credit/debit card, or net banking)
                  within 5 to 7 business days per standard Indian banking settlement cycles.
                </div>

                <p className={styles.paragraph}>
                  All approved refunds are initiated directly through our payment partner, Razorpay. Funds are returned to the original payment source:
                </p>

                <div className={styles.highlightGrid}>
                  <div className={styles.highlightCard}>
                    <div className={styles.highlightCardTitle}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      UPI Payments (GPay, PhonePe, Paytm)
                    </div>
                    <p className={styles.highlightCardText}>
                      Typically settles within <strong>24 to 48 hours</strong> directly back into your linked bank account.
                    </p>
                  </div>

                  <div className={styles.highlightCard}>
                    <div className={styles.highlightCardTitle}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2.5">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      Debit &amp; Credit Cards
                    </div>
                    <p className={styles.highlightCardText}>
                      Reflected on your card statement within <strong>5 to 7 working days</strong>, depending on your issuing bank&apos;s cycle.
                    </p>
                  </div>

                  <div className={styles.highlightCard}>
                    <div className={styles.highlightCardTitle}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2.5">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                      Net Banking &amp; IMPS
                    </div>
                    <p className={styles.highlightCardText}>
                      Processed via RBI clearing networks within <strong>3 to 5 business days</strong> directly to the remitting bank account.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 5 */}
              <section id="batch-transfers" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>05</span>
                  <h2 className={styles.sectionTitle}>Free Academic Batch Transfers</h2>
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
                  Life happens. If college exams, family duties, or illness interrupt your cohort, you can pause your seat and
                  transfer to the very next cohort of the same track completely free of charge.
                </div>

                <p className={styles.paragraph}>
                  We understand that engineering students face heavy semester examination schedules, final-year project submissions,
                  and unexpected health challenges. You should never have to lose your learning investment due to academic conflicts.
                </p>
                <p className={styles.paragraph}>
                  Under our <strong>Flexible Batch Postponement Policy</strong>:
                </p>
                <ul className={styles.list}>
                  <li>Every student is entitled to <em>one (1) free batch transfer</em> to the subsequent cohort of the same track.</li>
                  <li>Your completed modules and progress will be carried forward or reset upon your preference.</li>
                  <li>Batch transfer requests should be submitted at least 48 hours before the start of the new cohort batch.</li>
                </ul>
              </section>

              {/* Section 6 */}
              <section id="disputes-chargebacks" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>06</span>
                  <h2 className={styles.sectionTitle}>Chargebacks &amp; Inquiries</h2>
                </div>

                <p className={styles.paragraph}>
                  If you notice an unfamiliar charge or duplicate billing, we strongly encourage you to contact our billing team first
                  before initiating a payment dispute with your bank or credit card provider.
                </p>
                <p className={styles.paragraph}>
                  We resolve billing inquiries, inadvertent double charges, or invoice discrepancies within <strong>24 to 48 business hours</strong>.
                  Initiating an unwarranted chargeback without contacting our support desk may lead to automated suspension of student dashboard
                  access during the banking review period.
                </p>
              </section>

              {/* Section 7 */}
              <section id="billing-support" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>07</span>
                  <h2 className={styles.sectionTitle}>Billing &amp; Refund Desk Contact</h2>
                </div>

                <p className={styles.paragraph}>
                  For all refund requests, payment receipt duplicates, GST invoice inquiries, or batch transfer applications,
                  please reach out directly to our dedicated finance desk:
                </p>

                <div className={styles.contactBox}>
                  <h4>Atelier Finance &amp; Fee Redressal Desk</h4>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    Sphere Hive Academy / Atelier Coding School<br />
                    Top Floor, MBA Block, KVGCE Campus, Kurunjibhag,<br />
                    Sullia, Dakshina Kannada, Karnataka - 574327, India
                  </p>

                  <div className={styles.contactGrid}>
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Billing Desk Email</span>
                      <a href="mailto:spherehive@kvgce.ac.in" className={`${styles.contactValue} ${styles.contactLink}`}>
                        spherehive@kvgce.ac.in
                      </a>
                    </div>

                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Official Phone / Helpline</span>
                      <a href="tel:+917411288457" className={`${styles.contactValue} ${styles.contactLink}`}>
                        +91 7411288457
                      </a>
                    </div>

                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Processing Hours</span>
                      <span className={styles.contactValue}>Monday – Saturday, 9:00 AM – 6:00 PM IST</span>
                    </div>

                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Response Guarantee</span>
                      <span className={styles.contactValue}>Written Confirmation within 24 Hours</span>
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
