import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import StatsGrid from "../components/StatsGrid";
import CompanyLogos from "../components/CompanyLogos";
import Impact from "../components/Impact";
import Courses from "../components/Courses";
import Testimonials from "../components/Testimonials";
import Community from "../components/Community";
import Comparison from "../components/Comparison";
import SphereHive from "../components/SphereHive";
import Faq from "../components/Faq";
import TransformCTA from "../components/TransformCTA";
import Footer from "../components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://atelier.spherehive.com";

export const metadata = {
  title: "Atelier - A Sphere Hive Academy | Immersive Engineering Cohorts & Placement Prep",
  description: "Join India's premier engineering academy. Master Full-Stack Development, Distributed Systems, Cloud Architecture, and Generative AI through live cohorts, real-world microservices, and 1:1 mentorship.",
  keywords: [
    "Atelier",
    "Sphere Hive Academy",
    "Full-Stack cohort",
    "System Design cohort",
    "live coding classes",
    "software engineering bootcamp India",
    "placement guarantee cohort",
    "Next.js bootcamp",
    "MERN stack mastery",
    "tech careers"
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Atelier - A Sphere Hive Academy | Immersive Engineering Cohorts",
    description: "Build skills tech companies actually hire for. Live cohorts, production projects, and direct mentor code reviews.",
    url: SITE_URL,
    siteName: "Atelier - A Sphere Hive Academy",
    images: [
      {
        url: `${SITE_URL}/og-banner.png`,
        width: 1200,
        height: 630,
        alt: "Atelier Engineering Cohorts",
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main role="main" itemScope itemType="https://schema.org/WebPage">
        <Hero />
        <StatsGrid />
        <CompanyLogos />
        <Impact />
        <Courses />
        <Testimonials />
        <Comparison />
        <SphereHive />
        <Community />
        <Faq />
        <TransformCTA />
      </main>
      <Footer />
    </>
  );
}
