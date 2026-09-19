import React from 'react';
import styles from './Testimonials.module.css';

export default function Testimonials() {
  const row1Testimonials = [
    {
      id: 'r1-1',
      name: 'Parth Gupta',
      role: 'Frontend Developer',
      rating: 4.8,
      content: 'Building production-grade web apps at Atelier by Sphere Hive has been an incredible experience! Mentors explain complex distributed state and modern architecture clearly, and the project sprints gave me immense confidence.',
      avatarType: 'letter',
      avatarVal: 'P',
      avatarBg: '#5c24b3'
    },
    {
      id: 'r1-2',
      name: 'Mohd Siraj',
      role: 'Full Stack Developer',
      rating: 4.6,
      content: 'The hands-on SaaS execution model is what sets Atelier apart. We do not just watch videos—we deploy real APIs, wire up databases, and review PRs just like an agile engineering team.',
      avatarType: 'image',
      avatarVal: '/images/avatar1.jpg'
    },
    {
      id: 'r1-3',
      name: 'Mukti Prasad',
      role: 'Software Engineer',
      rating: 4.7,
      content: 'Sphere Hive\'s peer ecosystem in the lab is top notch. The curriculum is continuously updated with Next.js, AI workflows, and system design. The mentors are always ready to guide you through code blocks.',
      avatarType: 'letter',
      avatarVal: 'M',
      avatarBg: '#16a085'
    },
    {
      id: 'r1-4',
      name: 'Alok Kumar',
      role: 'Backend Developer',
      rating: 4.9,
      content: 'The practical coding sessions and internal hackathons prepared me to handle real technical interviews with ease. A truly transformative learning and incubation journey.',
      avatarType: 'image',
      avatarVal: '/images/avatar4.jpg'
    }
  ];

  const row2Testimonials = [
    {
      id: 'r2-1',
      name: 'Akash Warade',
      role: 'Full Stack Builder',
      rating: 4.7,
      content: 'Being part of the Atelier Cohort while hacking at Sphere Hive gave me real-world engineering exposure. From relational databases to real-time WebSockets, the mentor guidance has been outstanding.',
      avatarType: 'image',
      avatarVal: '/images/avatar2.jpg'
    },
    {
      id: 'r2-2',
      name: 'Pragati Nayak',
      role: 'Junior Software Engineer',
      rating: 4.8,
      content: 'Sphere Hive is more than just courses—it is a supportive culture of ambitious student builders. Working in the lab on campus and shipping products together pushed my development skills to the next level.',
      avatarType: 'letter',
      avatarVal: 'P',
      avatarBg: '#6200ea'
    },
    {
      id: 'r2-3',
      name: 'Samarth Jain',
      role: 'AI & Cloud Enthusiast',
      rating: 4.9,
      content: 'The 24-hour Hackwise hackathon and Atelier sprints made me fall in love with engineering. Hands-down the most practical community hub for aspiring software engineers.',
      avatarType: 'image',
      avatarVal: '/images/avatar3.jpg'
    },
    {
      id: 'r2-4',
      name: 'Neha Sharma',
      role: 'Product Designer & Dev',
      rating: 4.8,
      content: 'The depth of content and mentor code reviews at Atelier are unmatched. It connects theory directly to production SaaS execution, exactly what companies look for.',
      avatarType: 'letter',
      avatarVal: 'N',
      avatarBg: '#c0392b'
    }
  ];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const decimal = rating % 1;
    const hasHalf = decimal >= 0.3 && decimal <= 0.7;
    const hasThreeQuarter = decimal > 0.7;
    const hasOneQuarter = decimal > 0 && decimal < 0.3;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <svg key={i} className={`${styles.starIcon} ${styles.starFilled}`} viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      } else if (i === fullStars + 1) {
        const gradId = `starGrad-${rating.toString().replace('.', '-')}-${i}`;
        let fillPercent = "0%";
        if (hasOneQuarter) fillPercent = "25%";
        else if (hasHalf) fillPercent = "50%";
        else if (hasThreeQuarter) fillPercent = "75%";
        
        stars.push(
          <svg key={i} className={styles.starIcon} viewBox="0 0 24 24">
            <defs>
              <linearGradient id={gradId}>
                <stop offset={fillPercent} stopColor="#ffb800" />
                <stop offset={fillPercent} stopColor="rgba(255, 255, 255, 0.12)" />
              </linearGradient>
            </defs>
            <polygon 
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" 
              fill={`url(#${gradId})`}
            />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className={`${styles.starIcon} ${styles.starEmpty}`} viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      }
    }
    return stars;
  };

  const renderCard = (t) => {
    return (
      <div key={t.id} className={styles.testimonialCard}>
        <div className={styles.cardHeader}>
          {t.avatarType === 'letter' ? (
            <div className={styles.letterAvatar} style={{ backgroundColor: t.avatarBg }}>
              {t.avatarVal}
            </div>
          ) : (
            <img src={t.avatarVal} alt={t.name} className={styles.imageAvatar} />
          )}
          <div className={styles.headerInfo}>
            <h4 className={styles.studentName}>{t.name}</h4>
            <span className={styles.studentRole}>{t.role}</span>
          </div>
        </div>
        
        <div className={styles.divider} />
        
        <div className={styles.ratingRow}>
          <span className={styles.ratingNum}>{t.rating.toFixed(1)}</span>
          <div className={styles.starsContainer}>
            {renderStars(t.rating)}
          </div>
        </div>

        <p className={styles.testimonialContent}>
          {t.content}
        </p>
      </div>
    );
  };

  return (
    <section className={styles.testimonialsSection}>
      <div className={`${styles.container} container`}>
        <div className={styles.headerArea}>
          <div className={styles.badgeWrapper}>
            <span className={styles.badge}>HEAR FROM OUR STUDENTS</span>
          </div>
          <h2 className={styles.mainTitle}>
            We Help Learners Become Industry-Ready Developers.
          </h2>
        </div>
      </div>

      {/* Row 1 Marquee (Scrolls Left) */}
      <div className={styles.marqueeRow}>
        <div className={`${styles.marqueeTrack} ${styles.trackLeft}`}>
          {row1Testimonials.map((t) => renderCard(t))}
          {row1Testimonials.map((t) => renderCard({ ...t, id: `${t.id}-dup1` }))}
          {row1Testimonials.map((t) => renderCard({ ...t, id: `${t.id}-dup2` }))}
        </div>
      </div>

      {/* Row 2 Marquee (Scrolls Right) */}
      <div className={styles.marqueeRow}>
        <div className={`${styles.marqueeTrack} ${styles.trackRight}`}>
          {row2Testimonials.map((t) => renderCard(t))}
          {row2Testimonials.map((t) => renderCard({ ...t, id: `${t.id}-dup1` }))}
          {row2Testimonials.map((t) => renderCard({ ...t, id: `${t.id}-dup2` }))}
        </div>
      </div>
    </section>
  );
}
