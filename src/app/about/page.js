import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AboutClient from './AboutClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://atelier.spherehive.com';

export const metadata = {
  title: 'About Atelier | Where Raw Ambition Meets Engineering Craft',
  description:
    'Discover the story, philosophy, and engineering leadership behind Atelier — India’s premier software craftsmanship academy at the KVGCE incubation campus.',
  keywords: [
    'About Atelier',
    'Atelier Coding School',
    'Sphere Hive Academy',
    'Software Craftsmanship India',
    'Engineering Cohorts',
    'Full Stack Architecture',
    'KVGCE Tech Incubation',
    'Hackwise Hackathons'
  ],
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: 'About Atelier | Where Raw Ambition Meets Engineering Craft',
    description:
      'Discover Atelier: bridging raw ambition with production-grade engineering craft through live cohorts and 1:1 mentorship.',
    url: `${SITE_URL}/about`,
    siteName: 'Atelier - A Sphere Hive Academy',
    images: [
      {
        url: `${SITE_URL}/og-banner.png`,
        width: 1200,
        height: 630,
        alt: 'About Atelier - Where Raw Ambition Meets Engineering Craft',
      },
    ],
  },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main role="main">
        <AboutClient />
      </main>
      <Footer />
    </>
  );
}
