import { query } from "../utils/db-sql";

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://atelier.spherehive.com";
  const now = new Date().toISOString();

  // Static pages
  const staticPages = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/courses`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/auth/signin`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/auth/signup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dynamic course pages from the database
  let coursePages = [];
  try {
    const courses = await query("SELECT id FROM atelier_courses");
    coursePages = courses.map((course) => ({
      url: `${siteUrl}/courses/${course.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    }));
  } catch (e) {
    console.error("Sitemap: Failed to fetch courses:", e);
  }

  return [...staticPages, ...coursePages];
}
