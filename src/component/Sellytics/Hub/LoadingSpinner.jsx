import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <Loader2 className={`animate-spin text-emerald-600 ${sizeClasses[size]} ${className}`} />
  );
}

export function FullPageLoader({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <p className="text-slate-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

export function CardLoader() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    </div>
  );
}