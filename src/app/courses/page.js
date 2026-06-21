'use client';

import React, { useState, useEffect } from 'react';
import { getCourses } from '../actions';
import Navbar from '@/components/Navbar';
import Comparison from '@/components/Comparison';
import Faq from '@/components/Faq';
import Footer from '@/components/Footer';
import styles from './courses-page.module.css';

export default function CoursesPage() {
  const [coursesList, setCoursesList] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await getCourses();
      setCoursesList(data);
    }
    load();
  }, []);

  return (
    <>
      {/* Brand Navbar */}
      <Navbar />

      <main>
        {/* Courses Hero & Grid Section */}
        <section className={styles.pageSection}>
          <div className={styles.backgroundGrid} />
          <div className={styles.glowEffect} />

          <div className={`${styles.container} container`}>
            {/* Courses Page Header Section */}
            <div className={styles.badge}>
              COURSES
            </div>
            
            <h1 className={styles.title}>
              Level Up Your Coding Skills With <br />
              Expert-Led Courses
            </h1>

            {/* Courses Grid */}
            <div className={styles.grid}>
              {coursesList.map((course) => (
                <div key={course.id} className={styles.card}>
                  
                  {/* Mac style Window bar dots */}
                  <div className={styles.windowBar}>
                    <span className={`${styles.dot} ${styles.dotRed}`} />
                    <span className={`${styles.dot} ${styles.dotYellow}`} />
                    <span className={`${styles.dot} ${styles.dotGreen}`} />
                  </div>

                  {/* Course Thumbnail Image */}
                  <div className={styles.imageWrapper}>
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      className={styles.image} 
                    />
                    <span className={styles.liveBadge}>
                      <span className={styles.liveDot} />
                      Live
                    </span>
                  </div>

                  {/* Pill badges */}
                  <div className={styles.badgeList}>
                    {course.badges.map((badge, idx) => (
                      <span key={idx} className={styles.cardBadge}>
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Course Title */}
                  <h3 className={styles.courseTitle}>
                    {course.title}
                  </h3>

                  {/* Price Row / Spacer */}
                  {course.price ? (
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>Price</span>
                      <span className={styles.priceValue}>{course.price}</span>
                      {course.originalPrice && (
                        <span className={styles.originalPrice}>{course.originalPrice}</span>
                      )}
                      {course.discount && (
                        <span className={styles.discountBadge}>{course.discount}</span>
                      )}
                    </div>
                  ) : (
                    <div className={styles.priceSpacer} />
                  )}

                  {/* Action button */}
                  <button className={styles.button}>
                    Check Course
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>

                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Comparison section from landing page */}
        <Comparison />

        {/* FAQ section from landing page */}
        <Faq />
      </main>

      {/* Footer from landing page */}
      <Footer />
    </>
  );
}
