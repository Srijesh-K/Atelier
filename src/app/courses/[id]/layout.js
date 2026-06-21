import { getCourseById } from '../../actions';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const courseId = parseInt(resolvedParams.id, 10);
  const course = await getCourseById(courseId);

  if (!course) {
    return {
      title: "Course Not Found",
      description: "The requested course could not be found in our catalog.",
    };
  }

  const title = `${course.title} — Enroll Now`;
  const description = course.description
    ? course.description.slice(0, 160)
    : `Learn ${course.title} with live classes, real-world projects, and expert mentorship at Atelier — A Sphere Hive Academy.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/courses/${courseId}`,
    },
    openGraph: {
      title: `${course.title} | Atelier — A Sphere Hive Academy`,
      description,
      url: `/courses/${courseId}`,
      images: [
        {
          url: course.image || "/og-banner.png",
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${course.title} | Atelier`,
      description,
      images: [course.image || "/og-banner.png"],
    },
  };
}

export default function CourseDetailLayout({ children }) {
  return children;
}
