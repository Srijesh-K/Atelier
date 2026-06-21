export const metadata = {
  title: "Reset Password — Account Recovery",
  description:
    "Forgot your Atelier account password? Reset it securely using your registered email and phone number.",
  alternates: {
    canonical: "/auth/forgot-password",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({ children }) {
  return children;
}
