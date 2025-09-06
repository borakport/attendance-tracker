import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular', 
  width, 
  height, 
  lines = 1 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4',
    rectangular: 'h-20',
    circular: 'rounded-full'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} mb-2 last:mb-0`}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : '100%'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Specialized skeleton components
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton variant="text" className="mb-2" width="60%" />
          <Skeleton variant="text" className="mb-1" width="40%" height="2rem" />
          <Skeleton variant="text" width="50%" />
        </div>
        <Skeleton variant="circular" width="48px" height="48px" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton variant="text" className="mb-1" width="70%" />
          <Skeleton variant="text" width="50%" />
        </div>
        <Skeleton variant="text" width="20%" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>

      {/* Content Sections Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <Skeleton variant="text" width="40%" height="1.5rem" />
          </div>
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <TableRowSkeleton key={index} />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <Skeleton variant="text" width="40%" height="1.5rem" />
          </div>
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <TableRowSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
