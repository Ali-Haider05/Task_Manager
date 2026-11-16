import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-borderLight shadow-premium p-8 sm:p-10 animate-fade-in-scale">
        <div className="w-16 h-16 rounded-2xl bg-sage-light flex items-center justify-center text-forest mx-auto mb-5 border border-sage/30">
          <Compass className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold text-natural tracking-widest uppercase">
          Error 404
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal mt-1 mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-muted mb-8 leading-relaxed">
          The page or route you are looking for doesn't exist, has been moved, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-natural hover:bg-natural-hover text-white text-sm font-medium shadow-subtle transition-all active:scale-98"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
          <Link
            to="/tasks"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-borderLight text-charcoal text-sm font-medium hover:bg-ivory transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tasks</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
