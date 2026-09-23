'use client';

import React, { useEffect, useState } from 'react';

export default function LegalToc({ items, styles }) {
  const [activeId, setActiveId] = useState(items && items.length > 0 ? items[0].id : '');

  useEffect(() => {
    if (!items || items.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      for (let i = items.length - 1; i >= 0; i--) {
        const el = document.getElementById(items[i].id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (top <= scrollPosition) {
            setActiveId(items[i].id);
            return;
          }
        }
      }
      if (window.scrollY < 200) {
        setActiveId(items[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  return (
    <ul className={styles.tocList} data-lenis-prevent="true">
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`${styles.tocLink} ${isActive ? styles.tocLinkActive : ''}`}
            >
              {item.title}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
