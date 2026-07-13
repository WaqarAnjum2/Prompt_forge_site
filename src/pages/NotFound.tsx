import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-hero font-display font-bold mb-4">404</h1>
      <p className="text-ink-soft mb-8">This page doesn't exist or has moved.</p>
      <Link to="/" className="pill-btn-primary">Back to home</Link>
    </div>
  );
}
