'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap/dist/gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import styles from './about.module.css';

export default function AboutClient() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const heroRef = useRef(null);
  const missionRef = useRef(null);
  const showcaseRef = useRef(null);
  const visionRef = useRef(null);
  const teamRef = useRef(null);
  const leadersRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Hero Reveal Animation
      gsap.fromTo(
        heroRef.current.querySelectorAll(`.${styles.sectionBadge}, .${styles.heroTitle}, .${styles.heroSubtitle}, .${styles.heroActions}`),
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out'
        }
      );

      // 2. Mission Statement & Cinema Showcase
      if (missionRef.current) {
        gsap.fromTo(
          missionRef.current.querySelectorAll(`.${styles.sectionBadge}, .${styles.missionText}, .${styles.visionButton}`),
          { opacity: 0, y: 30 },
          {
            scrollTrigger: {
              trigger: missionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none'
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power2.out'
          }
        );
      }

      // Cinema Display Frame 3D entrance
      if (showcaseRef.current) {
        gsap.fromTo(
          showcaseRef.current,
          { opacity: 0, y: 50, scale: 0.94 },
          {
            scrollTrigger: {
              trigger: showcaseRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none'
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out'
          }
        );
      }

      // 3. Vision Cards Staggered Reveal
      if (visionRef.current) {
        const cards = visionRef.current.querySelectorAll(`.${styles.visionCard}`);
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            scrollTrigger: {
              trigger: visionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none'
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.18,
            ease: 'power2.out'
          }
        );
      }

      // 4. Team Split Animation
      if (teamRef.current) {
        gsap.fromTo(
          teamRef.current.querySelector(`.${styles.teamLeftContent}`),
          { opacity: 0, x: -40 },
          {
            scrollTrigger: {
              trigger: teamRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none'
            },
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: 'power3.out'
          }
        );

        gsap.fromTo(
          teamRef.current.querySelector(`.${styles.teamRightImageWrap}`),
          { opacity: 0, x: 40, scale: 0.96 },
          {
            scrollTrigger: {
              trigger: teamRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none'
            },
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.9,
            ease: 'power3.out'
          }
        );
      }

      // 5. Leaders Tilted Cards Floating & Reveal
      if (leadersRef.current) {
        const leaderCards = leadersRef.current.querySelectorAll(`.${styles.tiltedCard}`);
        gsap.fromTo(
          leaderCards,
          { opacity: 0, y: 50, scale: 0.92 },
          {
            scrollTrigger: {
              trigger: leadersRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none'
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.22,
            ease: 'power3.out'
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const logos = [
    {
      name: 'Amazon',
      svg: (
        <svg viewBox="0 0 100 32" className={styles.logoSvg}>
          <text x="5" y="20" fontFamily="var(--font-heading)" fontSize="18" fontWeight="800">amazon</text>
          <path d="M8,26 Q30,34 55,26" stroke="#f25522" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      )
    },
    {
      name: 'Walmart',
      svg: (
        <svg viewBox="0 0 120 32" className={styles.logoSvg}>
          <text x="5" y="22" fontFamily="var(--font-heading)" fontSize="18" fontWeight="800">Walmart</text>
          <g transform="translate(94, 16) scale(0.6)">
            <line x1="0" y1="-12" x2="0" y2="12" stroke="#f25522" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="-10" y1="-6" x2="10" y2="6" stroke="#f25522" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="-10" y1="6" x2="10" y2="-6" stroke="#f25522" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        </svg>
      )
    },
    {
      name: 'OpenAI',
      svg: (
        <svg viewBox="0 0 110 32" className={styles.logoSvg}>
          <text x="5" y="21" fontFamily="var(--font-heading)" fontSize="17" fontWeight="700">OpenAI</text>
        </svg>
      )
    },
    {
      name: 'Google',
      svg: (
        <svg viewBox="0 0 95 32" className={styles.logoSvg}>
          <text x="5" y="22" fontFamily="var(--font-heading)" fontSize="18" fontWeight="700">Google</text>
        </svg>
      )
    },
    {
      name: 'Microsoft',
      svg: (
        <svg viewBox="0 0 125 32" className={styles.logoSvg}>
          <g transform="translate(5, 7)">
            <rect x="0" y="0" width="8" height="8" fill="#f25522" />
            <rect x="10" y="0" width="8" height="8" fill="#ffffff" opacity="0.8" />
            <rect x="0" y="10" width="8" height="8" fill="#ffffff" opacity="0.8" />
            <rect x="10" y="10" width="8" height="8" fill="#f25522" />
          </g>
          <text x="30" y="21" fontFamily="var(--font-heading)" fontSize="16" fontWeight="600">Microsoft</text>
        </svg>
      )
    },
    {
      name: 'Razorpay',
      svg: (
        <svg viewBox="0 0 120 32" className={styles.logoSvg}>
          <polygon points="12,4 4,28 16,14 26,14" fill="#f25522" />
          <text x="32" y="22" fontFamily="var(--font-heading)" fontSize="17" fontWeight="800">Razorpay</text>
        </svg>
      )
    },
    {
      name: 'TCS',
      svg: (
        <svg viewBox="0 0 80 32" className={styles.logoSvg}>
          <text x="5" y="23" fontFamily="var(--font-heading)" fontSize="20" fontWeight="900">TCS</text>
        </svg>
      )
    },
    {
      name: 'Sphere Hive',
      svg: (
        <svg viewBox="0 0 140 32" className={styles.logoSvg}>
          <circle cx="14" cy="16" r="8" fill="#f25522" opacity="0.3" />
          <circle cx="14" cy="16" r="4" fill="#f25522" />
          <text x="30" y="21" fontFamily="var(--font-heading)" fontSize="16" fontWeight="700">Sphere Hive</text>
        </svg>
      )
    }
  ];

  const marqueeList = [...logos, ...logos, ...logos];

  return (
    <div className={styles.pageContainer}>
      {/* ==========================================================
          1. HERO SECTION
          ========================================================== */}
      <section ref={heroRef} className={styles.heroSection}>
        <div className={styles.heroSpotlight} />
        <div className={styles.heroBeamLeft} />
        <div className={styles.heroBeamRight} />
        <div className={styles.heroGridBg} />

        <div className={styles.heroContent}>
          <div className={styles.sectionBadge}>
            <span className={styles.badgeDot} />
            WHO WE ARE
          </div>

          <h1 className={styles.heroTitle}>
            Where Dreams
            <span className={styles.heroTitleGradient}>Transform Into Code</span>
          </h1>

          <p className={styles.heroSubtitle}>
            A collective of passionate engineers, builders, and mentors redefining tech education.
            We bridge the gap between academic theory and enterprise engineering through rigorous,
            production-grade cohorts.
          </p>

          <div className={styles.heroActions}>
            <Link href="/courses" className={styles.primaryCta}>
              Explore Cohorts
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

            <a
              href="#mission"
              onClick={(e) => scrollToSection(e, 'mission')}
              className={styles.secondaryCta}
            >
              Our Philosophy
            </a>
          </div>
        </div>
      </section>

      {/* ==========================================================
          2. LOGOS MARQUEE (WHERE ALUMNI BUILD)
          ========================================================== */}
      <div className={styles.logosSection}>
        <div className={styles.logosTrack}>
          {marqueeList.map((item, idx) => (
            <div key={idx} className={styles.logoItem} title={item.name}>
              {item.svg}
            </div>
          ))}
        </div>
      </div>

      {/* ==========================================================
          3. MISSION STATEMENT & CINEMA SHOWCASE
          ========================================================== */}
      <section id="mission" ref={missionRef} className={styles.missionSection}>
        <div className={styles.missionContent}>
          <div className={styles.sectionBadge}>
            <span className={styles.badgeDot} />
            OUR MISSION
          </div>

          <p className={styles.missionText}>
            At <span className={styles.missionHighlight}>Atelier</span>, we believe in thinking big.
            Our mission is to spark the mindset of engineering excellence in tech education by building
            a vibrant global network of skilled craftspeople and problem-solvers.
          </p>

          <a
            href="#vision"
            onClick={(e) => scrollToSection(e, 'vision')}
            className={styles.visionButton}
          >
            Our Vision ↓
          </a>

          {/* Cinema Frame Screen Showcase */}
          <div ref={showcaseRef} className={styles.showcaseFrameWrap}>
            <div className={styles.showcaseFrameGlow} />

            <div className={styles.showcaseFrame}>
              {/* Metallic Window Top Bar */}
              <div className={styles.showcaseHeader}>
                <div className={styles.windowControls}>
                  <span className={`${styles.windowDot} ${styles.windowDotClose}`} />
                  <span className={`${styles.windowDot} ${styles.windowDotMin}`} />
                  <span className={`${styles.windowDot} ${styles.windowDotMax}`} />
                </div>

                <div className={styles.frameBrandLockup}>
                  <img src="/logo.png" alt="Atelier" className={styles.frameMiniLogo} />
                  <span>ATELIER • CRAFT & CODE</span>
                </div>

                <div className={styles.frameNavLinks}>
                  <span>PHILOSOPHY</span>
                  <span>CURRICULUM</span>
                  <span>COMMUNITY</span>
                </div>
              </div>

              {/* Showcase Body Screen */}
              <div className={styles.showcaseScreen}>
                <img
                  src="/images/hackathons/hackwise-stage.jpg"
                  alt="Atelier Engineering Craft"
                  className={styles.showcaseScreenImage}
                />
                <div className={styles.showcaseScreenOverlay} />

                <div className={styles.showcaseScreenContent}>
                  <h2 className={styles.showcaseTitleGod}>THE ART OF CODE</h2>
                  <p className={styles.showcaseSubGod}>WHERE RIGOR MEETS INVENTIVENESS</p>
                </div>

                {/* Bottom Left Frame Info */}
                <div className={styles.showcaseMetaLeft}>
                  <span>EST. 2024 • SPHERE HIVE</span>
                </div>

                {/* Interactive Play Button */}
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className={styles.showcasePlayTrigger}
                  aria-label="Watch Atelier Vision Reel"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          4. VISION OF THE BRAND (3 CARDS)
          ========================================================== */}
      <section id="vision" ref={visionRef} className={styles.visionSection}>
        <div className={styles.visionHeader}>
          <div className={styles.sectionBadge}>
            <span className={styles.badgeDot} />
            OUR PILLARS
          </div>
          <h2 className={styles.visionTitle}>Vision Of The Brand</h2>
          <p className={styles.visionSubtitle}>
            To inspire, mentor, and cultivate the upcoming generation of software artists and distributed
            systems engineers who build resilient technology for the real world.
          </p>
        </div>

        <div className={styles.visionCardsGrid}>
          {/* Card 1 */}
          <div className={styles.visionCard}>
            <div>
              <div className={styles.visionCardTop}>
                <div className={styles.visionCardIconBadge}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <span className={styles.visionCardNumber}>01</span>
              </div>
              <h3 className={styles.visionCardTitle}>Practical Mastery Over Theory</h3>
              <p className={styles.visionCardDesc}>
                We do not teach syntax in a vacuum. Every cohort member designs distributed architectures, writes
                production-level pull requests, and deploys scalable microservices to the cloud.
              </p>
            </div>
            <div className={styles.visionCardBottom}>
              <Link href="/courses" className={styles.visionCardLink}>Learn More</Link>
              <div className={styles.arrowCircleBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className={styles.visionCard}>
            <div>
              <div className={styles.visionCardTop}>
                <div className={styles.visionCardIconBadge}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span className={styles.visionCardNumber}>02</span>
              </div>
              <h3 className={styles.visionCardTitle}>Direct Industry Mentorship</h3>
              <p className={styles.visionCardDesc}>
                Learn directly alongside engineering leaders from top tech companies. 1:1 code reviews,
                architectural teardowns, and continuous feedback simulate real enterprise sprint dynamics.
              </p>
            </div>
            <div className={styles.visionCardBottom}>
              <Link href="/join-faculty" className={styles.visionCardLink}>Learn More</Link>
              <div className={styles.arrowCircleBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className={styles.visionCard}>
            <div>
              <div className={styles.visionCardTop}>
                <div className={styles.visionCardIconBadge}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="12 8 8 12 12 16 16 12 12 8" />
                  </svg>
                </div>
                <span className={styles.visionCardNumber}>03</span>
              </div>
              <h3 className={styles.visionCardTitle}>High-Impact Career Launchpad</h3>
              <p className={styles.visionCardDesc}>
                From our national Hackwise hackathons to our incubation labs and direct hiring referrals,
                we provide an end-to-end launchpad for engineers aiming for top-tier roles.
              </p>
            </div>
            <div className={styles.visionCardBottom}>
              <Link href="/contact" className={styles.visionCardLink}>Learn More</Link>
              <div className={styles.arrowCircleBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          5. THE PEOPLE WHO MAKE ATELIER A TEAM (SPLIT)
          ========================================================== */}
      <section ref={teamRef} className={styles.teamSection}>
        <div className={styles.teamAmbientGlow} />

        <div className={styles.teamGrid}>
          <div className={styles.teamLeftContent}>
            <h2 className={styles.teamTitle}>
              The People Who Make <br />
              <span className={styles.teamTitleHighlight}>Atelier A Team</span>
            </h2>

            <p className={styles.teamParagraph}>
              Behind every cohort, line of review feedback, and breakthrough moment is a dedicated collective
              of engineers, researchers, and educators who believe engineering craft cannot be taught by pre-recorded slides alone.
            </p>

            <p className={styles.teamParagraph}>
              From late-night debugging marathons in the MBA block labs to war-room hackathons and mock whiteboard gauntlets,
              our team works hand-in-hand with every student to make mastery inevitable.
            </p>

            <div className={styles.teamStatsPills}>
              <div className={styles.teamStatItem}>
                <span className={styles.teamStatValue}>50+</span>
                <span className={styles.teamStatLabel}>Mentors & Staff</span>
              </div>
              <div className={styles.teamStatItem}>
                <span className={styles.teamStatValue}>1,500+</span>
                <span className={styles.teamStatLabel}>Engineers Mentored</span>
              </div>
              <div className={styles.teamStatItem}>
                <span className={styles.teamStatValue}>94%</span>
                <span className={styles.teamStatLabel}>Placement Success</span>
              </div>
            </div>
          </div>

          <div className={styles.teamRightImageWrap}>
            <img
              src="/images/hackathons/hackwise-community.jpg"
              alt="The Atelier Community & Mentors"
              className={styles.teamImage}
            />
          </div>
        </div>
      </section>

      {/* ==========================================================
          6. THE LEADERS BEHIND THE CODE (SIGNATURE TILTED CARDS)
          ========================================================== */}
      <section ref={leadersRef} className={styles.leadersSection}>
        <div className={styles.leadersHeader}>
          <div className={styles.sectionBadge}>
            <span className={styles.badgeDot} />
            LEADERSHIP
          </div>
          <h2 className={styles.leadersTitle}>The Leaders Behind The Code</h2>
          <p className={styles.leadersSubtitle}>
            The engineers, instructors, and system architects guiding your journey from foundation to production.
          </p>
        </div>

        <div className={styles.tiltedCardsContainer}>
          <div className={styles.leadersGlowOrb} />

          {/* Tilted Card 1: Top Left */}
          <div className={`${styles.tiltedCard} ${styles.tiltedCard1}`}>
            <div className={styles.tiltedCardImageWrap}>
              <img
                src="/images/campus_speaker.png"
                alt="Mohammed Suhail"
                className={styles.tiltedCardImg}
              />
              <div className={styles.tiltedCardOverlay} />
            </div>
            <div className={styles.tiltedCardMeta}>
              <div>
                <h4 className={styles.tiltedCardName}>Mohammed Suhail</h4>
                <p className={styles.tiltedCardRole}>Founder & Head of Curriculum</p>
              </div>
              <div className={styles.tiltedCardBadge} title="Verified Lead Mentor">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tilted Card 2: Center Right */}
          <div className={`${styles.tiltedCard} ${styles.tiltedCard2}`}>
            <div className={styles.tiltedCardImageWrap}>
              <img
                src="/images/course_mentor_30.png"
                alt="Arshad Muhammad"
                className={styles.tiltedCardImg}
              />
              <div className={styles.tiltedCardOverlay} />
            </div>
            <div className={styles.tiltedCardMeta}>
              <div>
                <h4 className={styles.tiltedCardName}>Arshad Muhammad</h4>
                <p className={styles.tiltedCardRole}>Co-Founder & Technical Architect</p>
              </div>
              <div className={styles.tiltedCardBadge} title="Verified Lead Mentor">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tilted Card 3: Bottom Left */}
          <div className={`${styles.tiltedCard} ${styles.tiltedCard3}`}>
            <div className={styles.tiltedCardImageWrap}>
              <img
                src="/images/avatar2.jpg"
                alt="Akash Verma"
                className={styles.tiltedCardImg}
              />
              <div className={styles.tiltedCardOverlay} />
            </div>
            <div className={styles.tiltedCardMeta}>
              <div>
                <h4 className={styles.tiltedCardName}>Akash Verma</h4>
                <p className={styles.tiltedCardRole}>Principal Systems Mentor</p>
              </div>
              <div className={styles.tiltedCardBadge} title="Verified Lead Mentor">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          7. GIANT OUTLINE WATERMARK
          ========================================================== */}
      <section className={styles.watermarkSection}>
        <span className={styles.giantOutlineText}>
          ATELIER
        </span>
      </section>

      {/* ==========================================================
          CINEMA SHOWCASE MODAL
          ========================================================== */}
      {isVideoModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsVideoModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className={styles.modalCloseBtn}
              aria-label="Close modal"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Atelier Vision Film"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
