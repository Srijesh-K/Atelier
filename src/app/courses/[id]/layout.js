import React from 'react';
import { getCourseById } from '@/app/actions';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://atelier.spherehive.com";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const courseId = parseInt(resolvedParams.id, 10);
  const course = await getCourseById(courseId);

  if (!course) {
    return {
      title: "Course Track Not Found | Atelier",
      description: "The requested cohort track is not available.",
      robots: { index: false }
    };
  }

  const title = `${course.title} | Atelier Cohort`;
  const description = course.subtitle || course.description || `Enroll in ${course.title}. Live sessions, real-world engineering projects, and direct mentor reviews.`;
  const image = course.image?.startsWith('http') ? course.image : `${SITE_URL}${course.image || '/og-banner.png'}`;
  const canonicalUrl = `${SITE_URL}/courses/${courseId}`;

  return {
    title,
    description,
    keywords: [
      course.title,
      ...(course.badges || []),
      "live coding cohort",
      "software engineering track",
      "coding bootcamp",
      "Atelier Academy"
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      locale: "en_IN",
      url: canonicalUrl,
      siteName: "Atelier - A Sphere Hive Academy",
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function CourseDetailLayout({ children, params }) {
  const resolvedParams = await params;
  const courseId = parseInt(resolvedParams.id, 10);
  const course = await getCourseById(courseId);

  // JSON-LD Structured Data for Course Schema
  const courseJsonLd = course ? {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description || course.subtitle,
    "provider": {
      "@type": "Organization",
      "name": "Atelier - A Sphere Hive Academy",
      "sameAs": SITE_URL
    },
    "image": course.image?.startsWith('http') ? course.image : `${SITE_URL}${course.image || '/og-banner.png'}`,
    "offers": {
      "@type": "Offer",
      "price": course.price ? course.price.replace(/[^0-9]/g, '') : "0",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "category": "Paid"
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "Online",
      "courseWorkload": course.duration || "12 Weeks"
    }
  } : null;

  return (
    <>
      {courseJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
        />
      )}
      {children}
    </>
  );
}
