import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://atelier.spherehive.com";

export const metadata = {
  title: "Contact Admissions & Mentorship | Atelier - Sphere Hive Academy",
  description: "Get in touch with the Atelier admissions team. Inquire about upcoming live cohorts, admissions criteria, custom scholarship assistance, and enterprise mentorship tracks.",
  keywords: [
    "Atelier contact",
    "coding school admissions",
    "bootcamp counseling",
    "Sphere Hive Academy support",
    "cohort admissions helpline"
  ],
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/contact`,
    siteName: "Atelier - A Sphere Hive Academy",
    title: "Contact Admissions & Mentorship | Atelier",
    description: "Connect with our program advisors for cohort counseling, schedules, and scholarship queries.",
    images: [`${SITE_URL}/og-banner.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Admissions & Mentorship | Atelier",
    description: "Connect with our program advisors for cohort counseling, schedules, and scholarship queries.",
    images: [`${SITE_URL}/og-banner.png`],
  },
};

export default function ContactLayout({ children }) {
  return children;
}
