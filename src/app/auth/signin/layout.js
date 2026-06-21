export const metadata = {
  title: "Sign In — Access Your Learning Workspace",
  description:
    "Log in to your Atelier Sphere Hive account to access your courses, live classes, materials, and personalized learning dashboard.",
  alternates: {
    canonical: "/auth/signin",
  },
  openGraph: {
    title: "Sign In to Atelier — A Sphere Hive Academy",
    description: "Access your personalized learning workspace, live classes, and course materials.",
    url: "/auth/signin",
    images: [{ url: "/og-banner.png", width: 1200, height: 630 }],
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignInLayout({ children }) {
  return children;
}
