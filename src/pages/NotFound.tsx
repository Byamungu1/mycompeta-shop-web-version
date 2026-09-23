import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-sand-50 px-6 text-center">
      <p className="text-6xl font-jakarta-bold text-brand-500">404</p>
      <h1 className="mt-4 text-xl font-jakarta-semibold text-brand-900">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-sand-500">
        The page you are looking for doesn’t exist or has moved.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-md bg-brand-500 px-6 py-3 text-sm font-jakarta-bold text-sand-950 active:bg-brand-600"
      >
        Back to home
      </Link>
    </div>
  );
}
