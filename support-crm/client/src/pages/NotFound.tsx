import { Link } from "react-router-dom";

export const NotFound = () => (
  <div className="mx-auto max-w-xl px-4 py-16 text-center">
    <h1 className="text-3xl font-semibold text-ink">404</h1>
    <p className="mt-2 text-sm text-ink-secondary">This page does not exist.</p>
    <Link to="/dashboard" className="mt-4 inline-block text-sm text-accent hover:underline">
      Back to dashboard
    </Link>
  </div>
);
