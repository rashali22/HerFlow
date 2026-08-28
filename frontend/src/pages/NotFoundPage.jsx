import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">🌸</div>
      <h1 className="text-4xl font-extrabold text-primary mb-2">404</h1>
      <p className="text-lg font-bold text-gray-700 mb-2">Page Not Found</p>
      <p className="text-xs text-gray-500 max-w-sm mb-6">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-full text-xs shadow-md transition flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
}
