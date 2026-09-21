'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap/dist/gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import styles from './Impact.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Impact() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const ctx = gsap.context(() => {
      const getScrollAmount = () => {
        // Total horizontal distance to scroll so last card is fully visible with end padding
        const trackWidth = track.scrollWidth;
        const viewportWidth = window.innerWidth;
        const endPadding = viewportWidth < 768 ? 24 : 80;
        return -(trackWidth - viewportWidth + endPadding);
      };

      const tl = gsap.timeline({
        defaults: { ease: 'none' }
      });

      tl.to(track, {
        x: getScrollAmount,
        ease: 'none',
        duration: 1
      });

      // Subtle fade & scale on exit to seamlessly hand off to next section
      tl.to(track, {
        opacity: 0.85,
        scale: 0.98,
        ease: 'power1.out',
        duration: 0.12
      });

      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: () => {
          const distance = Math.abs(getScrollAmount());
          const extra = window.innerWidth < 768 ? window.innerHeight * 1.0 : window.innerHeight * 1.5;
          return `+=${distance + extra}`;
        },
        pin: true,
        animation: tl,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1
      });
    }, containerRef);

    // Touch swipe support for mobile: horizontal swipes move the cards smoothly
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouching = false;

    const onTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isTouching = true;
    };

    const onTouchMove = (e) => {
      if (!isTouching) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = touchStartX - currentX;
      const diffY = touchStartY - currentY;

      // If predominantly a horizontal gesture, translate swipe into vertical scroll distance with balanced damping
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
        window.scrollBy(0, diffX * 0.65);
        touchStartX = currentX;
        touchStartY = currentY;
      }
    };

    const onTouchEnd = () => {
      isTouching = false;
    };

    const trackEl = trackRef.current;
    if (trackEl) {
      trackEl.addEventListener('touchstart', onTouchStart, { passive: true });
      trackEl.addEventListener('touchmove', onTouchMove, { passive: true });
      trackEl.addEventListener('touchend', onTouchEnd, { passive: true });
      trackEl.addEventListener('touchcancel', onTouchEnd, { passive: true });
    }

    return () => {
      ctx.revert();
      if (trackEl) {
        trackEl.removeEventListener('touchstart', onTouchStart);
        trackEl.removeEventListener('touchmove', onTouchMove);
        trackEl.removeEventListener('touchend', onTouchEnd);
        trackEl.removeEventListener('touchcancel', onTouchEnd);
      }
    };
  }, []);

  const cards = [
    {
      id: 1,
      image: '/images/impact1.png',
      featured: true,
      title: 'Campus Hackathons & Summits',
      description: 'Bringing 24-hour national hackathons and developer summits directly to campus, empowering students to build production-grade software.'
    },
    {
      id: 2,
      image: '/images/impact2.png',
      featured: false,
      title: 'Practical Coding Sessions',
      description: 'Hands-on training, where students build real-world products and learn standard practices.'
    },
    {
      id: 3,
      image: '/images/impact3.png',
      featured: false,
      title: 'Mentor Support & Growth',
      description: 'Interact with industry professionals who guide you throughout your learning journey.'
    },
    {
      id: 4,
      image: '/images/impact4.png',
      featured: false,
      title: 'Campus Life & Community',
      description: 'Build a strong network with like-minded coders and grow together.'
    },
    {
      id: 5,
      image: '/images/impact5.png',
      featured: false,
      title: 'Start Earlier (PU Students)',
      description: 'Training Pre-University students to company engineering standards early, ensuring they build real software and stand out leaps ahead the moment they enter their Bachelor’s degree.'
    }
  ];

  return (
    <section ref={containerRef} className={styles.impactSection}>
      <div className={styles.stickyWrapper}>
        <div ref={headingRef} className={styles.headingArea}>
          <span className={styles.badge}>IMPACT</span>
          <h2 className={styles.title}>The Atelier Advantage</h2>
        </div>

        <div ref={trackRef} className={styles.horizontalTrack}>
          {cards.map((card) => (
            <div key={card.id} className={styles.impactCard}>
              <div className={styles.cardInner}>
                <img src={card.image} alt={card.title} className={styles.cardImage} />
                
                {/* Arrow indicator on top-right of card */}
                <div className={styles.arrowIndicator}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </div>

                {card.featured && (
                  <div className={styles.featuredBadge}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className={styles.featuredIcon}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Featured
                  </div>
                )}

                {/* Speaker Crown Doodle Overlay (specifically for card 1) */}
                {card.id === 1 && (
                  <svg className={styles.crownDoodle} viewBox="0 0 100 50">
                    <path d="M20 40 L30 15 L50 30 L70 15 L80 40 Z" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="30" cy="12" r="2.5" fill="#ffffff" />
                    <circle cx="50" cy="27" r="2.5" fill="#ffffff" />
                    <circle cx="70" cy="12" r="2.5" fill="#ffffff" />
                  </svg>
                )}

                <div className={styles.cardGradientOverlay}></div>
                <div className={styles.cardOrangeOverlay}></div>
                
                <div className={styles.cardTextContent}>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardDescription}>{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
