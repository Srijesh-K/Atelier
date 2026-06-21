import Link from 'next/link';
import './auth-global.css';

export const metadata = {
  title: 'Atelier — Account',
  description: 'Sign in or create your Atelier Coding School account.',
};

export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      {/* Shared brand mark — links back to home */}
      <header className="auth-header">
        <Link href="/" className="auth-logo-link">
          <img src="/logo.png" alt="Atelier Logo" className="auth-logo-img" />
          <div className="auth-logo-text">
            <span className="auth-brand-name">Atelier</span>
            <span className="auth-brand-sub">Coding School</span>
          </div>
        </Link>
      </header>

      {children}
    </div>
  );
}
