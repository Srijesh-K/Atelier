import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AboutClient from './AboutClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://atelier.spherehive.com';

export const metadata = {
  title: 'About Us | Where Dreams Transform Into Code — Atelier',
  description:
    'Discover the vision, craft, and mentors behind Atelier. India’s premier coding school redefining engineering education through production-grade cohorts and 1:1 elite mentorship.',
  keywords: [
    'About Atelier',
    'Atelier Coding School',
    'Sphere Hive Academy',
    'Tech Education India',
    'Coding Bootcamp Mentors',
    'Full Stack Mentors',
    'KVGCE Tech Incubation'
  ],
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: 'About Us | Where Dreams Transform Into Code — Atelier',
    description:
      'Discover the vision, craft, and mentors behind Atelier. Bridging raw ambition with enterprise engineering.',
    url: `${SITE_URL}/about`,
    siteName: 'Atelier - A Sphere Hive Academy',
    images: [
      {
        url: `${SITE_URL}/og-banner.png`,
        width: 1200,
        height: 630,
        alt: 'About Atelier - Where Dreams Transform Into Code',
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
