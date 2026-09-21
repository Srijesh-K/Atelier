import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://atelier.spherehive.com";

export const metadata = {
  title: "Engineering Cohorts & Programs | Full-Stack, System Design, AI",
  description: "Explore immersive software engineering cohorts at Atelier. Master full-stack architectures, high-throughput system design, microservices, and AI engineering through production projects and live mentor syncs.",
  keywords: [
    "coding cohorts",
    "full stack cohort",
    "system design track",
    "AI engineering bootcamp",
    "live coding classes",
    "software engineering courses",
    "Atelier cohorts",
    "Sphere Hive Academy"
  ],
  alternates: {
    canonical: `${SITE_URL}/courses`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/courses`,
    siteName: "Atelier - A Sphere Hive Academy",
    title: "Engineering Cohorts & Specialization Tracks | Atelier",
    description: "Production-grade coding cohorts in Full-Stack, System Design, and AI. Live mentorship and verified project reviews.",
    images: [
      {
        url: `${SITE_URL}/og-banner.png`,
        width: 1200,
        height: 630,
        alt: "Atelier Engineering Cohorts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineering Cohorts & Specialization Tracks | Atelier",
    description: "Production-grade coding cohorts in Full-Stack, System Design, and AI. Live mentorship and verified project reviews.",
    images: [`${SITE_URL}/og-banner.png`],
  },
};

export default function CoursesLayout({ children }) {
  return children;
}
