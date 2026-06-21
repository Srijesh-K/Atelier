export const metadata = {
  title: "Explore Courses - Expert-Led Coding Cohorts",
  description:
    "Browse Atelier's catalog of live coding cohorts: full-stack development, system design, DSA, and more. Learn from industry veterans with hands-on projects and guaranteed placement support.",
  alternates: {
    canonical: "/courses",
  },
  openGraph: {
    title: "Explore Courses - Expert-Led Coding Cohorts | Atelier",
    description:
      "Browse live coding cohorts: full-stack development, system design, DSA & more. Hands-on projects, 1:1 mentorship, placement support.",
    url: "/courses",
    images: [{ url: "/og-banner.png", width: 1200, height: 630 }],
  },
};

export default function CoursesLayout({ children }) {
  return children;
}
