'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLightNavbar, setIsLightNavbar] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navPillsRef = useRef(null);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/courses' },
    { label: 'Bootcamp', href: '/#bootcamp' },
    { label: 'Request Callback', href: '/#callback' }
  ];

  // Dynamic active index based on route and scroll spy
  useEffect(() => {
    if (pathname !== '/') {
      const idx = navItems.findIndex((item) => item.href === pathname);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
      return;
    }

    // Scroll spy for homepage
    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 120; // offset for header

      // Near top? Home is active
      if (scrollPosition < 400) {
        setActiveIndex(0);
        return;
      }

      const sections = [
        { id: 'courses', index: 1 },
        { id: 'bootcamp', index: 2 },
        { id: 'callback', index: 3 }
      ];

      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveIndex(sec.index);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy);
    handleScrollSpy(); // Initial run

    return () => {
      window.removeEventListener('scroll', handleScrollSpy);
    };
  }, [pathname]);

  // Handle active sliding liquid indicator positioning
  useEffect(() => {
    const updateIndicator = () => {
      if (navPillsRef.current) {
        const activeEl = navPillsRef.current.querySelector(`.${styles.active}`);
        if (activeEl) {
          setIndicatorStyle({
            left: activeEl.offsetLeft,
            width: activeEl.offsetWidth,
            opacity: 1
          });
        }
      }
    };

    updateIndicator();
    const timer = setTimeout(updateIndicator, 100);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeIndex]);

  // Scroll handler for navbar hide/show on scroll
  useEffect(() => {
    const coursesEl = document.getElementById('courses');
    const communityEl = document.getElementById('community');
    const navbarHeight = 80;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > 120) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;

      // Dark vs Light sections theme switch
      let lightActive = false;
      [coursesEl, communityEl].forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= navbarHeight && rect.bottom >= navbarHeight) {
          lightActive = true;
        }
      });
      setIsLightNavbar(lightActive);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleMouseEnter = (e) => {
    const el = e.currentTarget;
    setIndicatorStyle({
      left: el.offsetLeft,
      width: el.offsetWidth,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    if (navPillsRef.current) {
      const activeEl = navPillsRef.current.querySelector(`.${styles.active}`);
      if (activeEl) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1
        });
      }
    }
  };

  const handleNavClick = (e, item, idx) => {
    if (item.href.startsWith('/#') && pathname === '/') {
      e.preventDefault();
      const targetId = item.href.substring(2);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
        setActiveIndex(idx);
        setIsMobileMenuOpen(false);
      }
    } else if (item.href === '/' && pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveIndex(0);
      setIsMobileMenuOpen(false);
    }
  };

  const headerClass = `${styles.header} ${isVisible ? styles.visible : styles.hidden} ${isScrolled ? styles.scrolled : ''} ${isLightNavbar ? styles.lightTheme : ''}`;

  return (
    <header className={headerClass}>
      <div className={styles.logo}>
        <img src="/logo.png" alt="Atelier Logo" className={styles.logoImg} />
        <div className={styles.logoText}>
          <span className={styles.brandName}>Atelier</span>
          <span className={styles.brandSub}>Coding School</span>
        </div>
      </div>
      
      <nav className={styles.nav}>
        <div ref={navPillsRef} className={styles.navPills} onMouseLeave={handleMouseLeave}>
          {/* Sliding Liquid Indicator */}
          <div className={styles.navIndicator} style={indicatorStyle} />
          
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className={`${styles.navLink} ${activeIndex === idx ? styles.active : ''}`}
              onMouseEnter={handleMouseEnter}
              onClick={(e) => handleNavClick(e, item, idx)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      
      <div className={styles.actions}>
        <Link href="/auth/signin" className={styles.signIn}>Sign In</Link>
      </div>

      {/* Mobile Menu Button */}
      <button 
        className={styles.mobileMenuBtn} 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle Menu"
      >
        <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.lineOpen : ''}`}></span>
        <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.lineOpen : ''}`}></span>
        <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.lineOpen : ''}`}></span>
      </button>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileOverlay} ${isMobileMenuOpen ? styles.overlayOpen : ''}`}>
        <div className={styles.mobileNavLinks}>
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className={`${styles.mobileNavLink} ${activeIndex === idx ? styles.mobileActive : ''}`}
              onClick={(e) => handleNavClick(e, item, idx)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/auth/signin" className={styles.mobileSignIn} onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
        </div>
      </div>
    </header>
  );
}
