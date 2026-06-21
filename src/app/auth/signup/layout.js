export const metadata = {
  title: "Create Your Account - Start Learning Today",
  description:
    "Join 1500+ students at Atelier Sphere Hive Academy. Create your free account to explore coding cohorts, live classes, and kickstart your tech career.",
  alternates: {
    canonical: "/auth/signup",
  },
  openGraph: {
    title: "Create Your Account - Join Atelier Sphere Hive Academy",
    description: "Join 1500+ students learning full-stack development, system design & more with live cohorts.",
    url: "/auth/signup",
    images: [{ url: "/og-banner.png", width: 1200, height: 630 }],
  },
};

export default function SignUpLayout({ children }) {
  return children;
}
