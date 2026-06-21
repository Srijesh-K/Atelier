'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Courses.module.css';
import { getCourses } from '../app/actions';

export default function Courses() {
  const [coursesList, setCoursesList] = useState([]);

  useEffect(() => {
    const loadCourses = async () => {
      const allCourses = await getCourses();
      setCoursesList(allCourses);
    };
    loadCourses();
    window.addEventListener('courseChanged', loadCourses);
    return () => window.removeEventListener('courseChanged', loadCourses);
  }, []);

  const getFormattedBadges = (badges) => {
    if (!badges) return [];
    if (typeof badges[0] === 'object') return badges;
    return badges.map((badgeStr, idx) => {
      if (idx === 0) return { icon: 'clock', value: '7 Months', label: badgeStr };
      if (idx === 1) return { icon: 'ribbon', value: 'Yes', label: badgeStr };
      return { icon: 'phone', value: '24/7', label: badgeStr };
    });
  };

  const renderIcon = (name) => {
    switch (name) {
      case 'clock':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        );
      case 'ribbon':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        );
      case 'phone':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  const renderCardContent = (course) => {
    return (
      <>
        <h3 className={styles.courseTitle}>{course.title}</h3>
        <p className={styles.courseDescription}>{course.description}</p>
        
        <div className={styles.featuresList}>
          {getFormattedBadges(course.badges).map((badge, idx) => (
            <div key={idx} className={styles.featureItem}>
              <div className={styles.featureIcon}>{renderIcon(badge.icon)}</div>
              <div className={styles.featureText}>
                <span className={styles.featureValue}>{badge.value}</span>
                <span className={styles.featureLabel}>{badge.label}</span>
              </div>
            </div>
          ))}
        </div>

        {course.price && (
          <div className={styles.priceContainer}>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Price </span>
              <span className={styles.priceValue}>{course.price}</span>
              {course.originalPrice && (
                <span className={styles.originalPrice}>{course.originalPrice} (+GST)</span>
              )}
            </div>
          </div>
        )}

        {course.buttonText && (
          <Link href={`/courses/${course.id}`} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
            <button className={styles.checkCourseBtn}>
              {course.buttonText}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </Link>
        )}
      </>
    );
  };

  return (
    <section id="courses" className={styles.coursesSection}>
      <div className={`${styles.container} container`}>
        <div className={styles.headerArea}>
          <div className={styles.badgeWrapper}>
            <span className={styles.badge}>COURSES</span>
          </div>
          
          <h2 className={styles.mainTitle}>
            Not Sure Which Course Fits You? <br />
            Don't Worry, We're Here To Help.
          </h2>

          <button className={styles.exploreBtn}>
            Explore Courses
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

        <div className={styles.cardsList}>
          {coursesList.map((course, index) => {
            const isLeftImage = index % 2 === 0;
            const cardType = course.type || (index === 0 ? 'white' : index === 1 ? 'orange' : 'black');
            const cardClass = `${styles.courseCard} ${styles[`${cardType}Card`]}`;
            const displayBadgeText = course.badgeText || (index === 0 ? 'Real Product' : '');
            
            return (
              <div 
                key={course.id} 
                className={cardClass}
                style={{ 
                  top: `calc(120px + ${index * 30}px)`
                }}
              >
                {isLeftImage ? (
                  <>
                    <div className={styles.cardLeft}>
                      <img 
                        src={course.image} 
                        alt={course.title} 
                        className={styles.mentorImage} 
                      />
                      {displayBadgeText && (
                        <div className={styles.realProductBadge}>{displayBadgeText}</div>
                      )}
                    </div>
                    <div className={styles.cardRight}>
                      {renderCardContent(course)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.cardRight}>
                      {renderCardContent(course)}
                    </div>
                    <div className={styles.cardLeft}>
                      <img 
                        src={course.image} 
                        alt={course.title} 
                        className={styles.mentorImage} 
                      />
                      {course.badgeText && (
                        <div className={styles.realProductBadge}>{course.badgeText}</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
