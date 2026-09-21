'use client';

import React, { useState, useEffect } from 'react';
import styles from './Community.module.css';

export default function Community() {
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
      }
    };
    if (selectedItem) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem]);

  const bentoItems = [
    {
      id: 1,
      image: '/images/hackathons/hackwise-sprint.jpg',
      fallbackImage: '/hackathon imgs/IMG-20250425-WA0120.jpg',
      badge: '24-HOUR SPRINT',
      title: 'High-Intensity AI Sprints',
      description: 'Overnight coding marathons where student squads brainstorm, architect, and ship functional MVPs non-stop.',
      event: 'Hackwise & Hack[AI]Thon Series',
      sizeClass: styles.tallCard
    },
    {
      id: 2,
      image: '/images/hackathons/hackwise-stage.jpg',
      fallbackImage: '/hackathon imgs/IMG-20250425-WA0013.jpg',
      badge: 'FLAGSHIP ARENA',
      title: 'KVGCE Hackwise National Stage',
      description: 'Our premier national-level hackathon bringing together hundreds of builders across top engineering institutions.',
      event: 'National 24H Hackathon',
      sizeClass: styles.squareCard1
    },
    {
      id: 3,
      image: '/images/hackathons/hackwise-community.jpg',
      fallbackImage: '/hackathon imgs/1775455268623 (1).jpg',
      badge: 'HACKER COHORT',
      title: 'Sphere Hive Developer Tribe',
      description: 'Organizers, industry mentors, faculty leaders, and passionate student builders united under one vibrant tech ecosystem.',
      event: 'Mentors & Community Meet',
      sizeClass: styles.squareCard2
    },
    {
      id: 4,
      image: '/images/hackathons/hackwise-grand-prize.jpg',
      fallbackImage: '/hackathon imgs/1775455269243.jpg',
      badge: '₹40,000 GRAND PRIZE',
      title: 'Hackwise 2.0 Champions',
      description: 'Rewarding elite engineering squads for building production-grade software solutions under sprint conditions.',
      event: 'Hackwise 2.0 Grand Winners',
      sizeClass: styles.squareCard3
    },
    {
      id: 5,
      image: '/images/hackathons/hackaithon-winners.jpg',
      fallbackImage: '/hackathon imgs/1775455267676.jpg',
      badge: 'HACK[AI]THON SERIES',
      title: 'Team Code Cortex & Laurels',
      description: 'Celebrating high-impact GenAI prototypes and API innovations with cash bounties, trophies, and career opportunities.',
      event: 'Category Winners & Bounties',
      sizeClass: styles.squareCard4
    }
  ];

  return (
    <section id="community" className={styles.communitySection}>
      <div className={`${styles.container} container`}>
        <div className={styles.headerArea}>
          <div className={styles.badgeWrapper}>
            <span className={styles.badge}>COMMUNITY &amp; HACKATHONS</span>
          </div>
          
          <h2 className={styles.mainTitle}>
            Powered by Hackwise &amp; Hack[AI]Thon: <br />
            Where Real Builders Ship Real Code.
          </h2>
          <p className={styles.subtitle}>
            Explore highlights from our 24-hour national hackathons, overnight AI build marathons, and the thriving student developer community at Sphere Hive.
          </p>
        </div>

        <div className={styles.bentoGrid}>
          {bentoItems.map((item) => (
            <div 
              key={item.id} 
              className={`${styles.bentoCard} ${item.sizeClass}`}
              onClick={() => setSelectedItem(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedItem(item);
                }
              }}
              aria-label={`View details for ${item.title}`}
            >
              <div className={styles.cardInner}>
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className={styles.cardImage} 
                  loading="lazy"
                  onError={(e) => {
                    // Fallback in case path fails
                    if (e.target.src !== item.fallbackImage) {
                      e.target.src = item.fallbackImage;
                    }
                  }}
                />
                
                {/* Expand Indicator */}
                <div className={styles.arrowIndicator} title="Expand photo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </div>

                {/* Overlays */}
                <div className={styles.cardGradientOverlay}></div>
                <div className={styles.cardOrangeOverlay}></div>

                {/* Card Text Content */}
                <div className={styles.cardTextContent}>
                  <span className={styles.cardBadge}>{item.badge}</span>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDescription}>{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Highlights / Stats Strip */}
        <div className={styles.statsStrip}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>24 Hours</span>
            <span className={styles.statLabel}>Non-Stop Sprints</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>₹1,00,000+</span>
            <span className={styles.statLabel}>Bounties &amp; Cash Prizes</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>500+</span>
            <span className={styles.statLabel}>Student Builders</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>50+</span>
            <span className={styles.statLabel}>Live MVPs Deployed</span>
          </div>
        </div>

        {/* Modal Lightbox for full photo inspect */}
        {selectedItem && (
          <div 
            className={styles.modalBackdrop}
            onClick={() => setSelectedItem(null)}
          >
            <div 
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className={styles.modalCloseBtn}
                onClick={() => setSelectedItem(null)}
                aria-label="Close dialog"
              >
                &times;
              </button>
              <div className={styles.modalImageWrapper}>
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.title} 
                  className={styles.modalImage} 
                />
              </div>
              <div className={styles.modalDetails}>
                <div className={styles.modalMetaRow}>
                  <span className={styles.modalBadge}>{selectedItem.badge}</span>
                  <span className={styles.modalEvent}>{selectedItem.event}</span>
                </div>
                <h3 className={styles.modalTitle}>{selectedItem.title}</h3>
                <p className={styles.modalDesc}>{selectedItem.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
