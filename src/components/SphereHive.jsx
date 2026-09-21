'use client';

import React from 'react';
import Link from 'next/link';
import styles from './SphereHive.module.css';

export default function SphereHive() {
  const pillars = [
    {
      id: 1,
      tag: 'Flagship Events',
      title: 'Hackwise National Hackathons',
      description:
        'Our 24-hour national hackathon series brings together hundreds of student developers across colleges to build production AI systems, APIs, and SaaS applications under high-intensity sprint conditions.',
      badgeText: '24-Hour National Sprints',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      )
    },
    {
      id: 2,
      tag: 'Incubator Lab',
      title: 'Campus Startup Incubation',
      description:
        'Operating from our dedicated lab at KVGCE, we mentor student engineers from writing their first lines of code to building, deploying, and launching live SaaS products with real users.',
      badgeText: 'KVGCE Campus, Sullia',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
          <path d="M12 9V4s3.03.55 4 2c1.08 1.62 0 5 0 5"></path>
        </svg>
      )
    },
    {
      id: 3,
      tag: 'Developer Guild',
      title: 'Peer-to-Peer Tech Culture',
      description:
        'Zero passive lectures. We cultivate active peer collaboration across modern full-stack development, AI/ML engineering, DevOps pipelines, and real-world system architecture design.',
      badgeText: 'Production-First Learning',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="18" r="3"></circle>
          <circle cx="6" cy="6" r="3"></circle>
          <path d="M13 6h3a2 2 0 0 1 2 2v7"></path>
          <line x1="6" y1="9" x2="6" y2="21"></line>
        </svg>
      )
    }
  ];

  return (
    <section id="spherehive" className={styles.sectionContainer}>
      <div className={`${styles.container} container`}>
        {/* Centered Header matching other landing page sections */}
        <div className={styles.headerArea}>
          <div className={styles.badgeWrapper}>
            <span className={styles.badge}>SPHERE HIVE</span>
          </div>
          
          <h2 className={styles.mainTitle}>
            Bridging Classroom Theory &amp; <br />
            Real-World SaaS Execution.
          </h2>
          
          <p className={styles.subtitle}>
            Sphere Hive is a student-led tech community and startup incubator lab located at KVG College of Engineering (KVGCE) in Sullia, Karnataka. Building a high-performance culture of peer learning, software engineering, and product incubation.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className={styles.grid}>
          {pillars.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.iconBox}>{item.icon}</div>
                <span className={styles.cardTag}>{item.tag}</span>
              </div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDescription}>{item.description}</p>
              <div className={styles.cardFooter}>
                <span className={styles.highlightBadge}>{item.badgeText}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Incubator Affiliation & Connect Banner */}
        <div className={styles.incubatorBanner}>
          <div className={styles.bannerLeft}>
            <img
              src="/images/spherehive_logo.png"
              alt="Sphere Hive Emblem"
              className={styles.bannerLogo}
            />
            <div className={styles.bannerInfo}>
              <h4 className={styles.bannerTitle}>Sphere Hive Tech Incubator</h4>
              <p className={styles.bannerSubtitle}>
                Top Floor, MBA Block • KVG College of Engineering, Sullia, Karnataka
              </p>
            </div>
          </div>
          <Link href="/contact" className={styles.bannerBtn}>
            Connect with Incubator
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
