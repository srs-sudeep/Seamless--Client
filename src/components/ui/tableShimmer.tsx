import React from 'react';

interface TableShimmerProps {
  rows?: number;
  columns?: number;
  className?: string;
  showHeader?: boolean;
}

export const TableShimmer: React.FC<TableShimmerProps> = ({
  rows = 8,
  columns = 5,
  className = '',
  showHeader = true,
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="relative overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100">
        {/* Animated overlay shimmer */}
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        <div className="p-6 space-y-4">
          {/* Header Section */}
          {showHeader && (
            <div className="animate-pulse shimmer-element">
              <div className="flex items-center justify-between mb-6">
                <div className="h-8 bg-gray-200 rounded-lg w-48 shimmer-bg"></div>
                <div className="flex space-x-3">
                  <div className="h-10 bg-gray-200 rounded-lg w-24 shimmer-bg"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-20 shimmer-bg"></div>
                </div>
              </div>

              {/* Search/Filter Bar */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-10 bg-gray-200 rounded-lg flex-1 max-w-md shimmer-bg"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-32 shimmer-bg"></div>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            {/* Table Header */}
            <div className="bg-gray-50/80 border-b border-gray-200">
              <div
                className="grid gap-4 p-4"
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div key={`header-${colIndex}`} className="animate-pulse shimmer-element">
                    <div
                      className="h-4 bg-gray-300 rounded shimmer-bg transition-all duration-300"
                      style={{
                        width: `${60 + Math.random() * 30}%`,
                        animationDelay: `${colIndex * 150}ms`,
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                  key={`row-${rowIndex}`}
                  className="grid gap-4 p-4 hover:bg-gray-50/50 transition-all duration-500 shimmer-element"
                  style={{
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    animationDelay: `${rowIndex * 80}ms`,
                  }}
                >
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <div key={`cell-${rowIndex}-${colIndex}`} className="animate-pulse">
                      <div
                        className="h-4 bg-gray-200 rounded shimmer-bg transition-all duration-400"
                        style={{
                          width: `${40 + Math.random() * 50}%`,
                          animationDelay: `${(rowIndex * columns + colIndex) * 120}ms`,
                        }}
                      ></div>
                      {/* Occasionally add a second line for variety */}
                      {Math.random() > 0.7 && (
                        <div
                          className="h-3 bg-gray-200 rounded mt-2 shimmer-bg transition-all duration-400"
                          style={{
                            width: `${20 + Math.random() * 40}%`,
                            animationDelay: `${(rowIndex * columns + colIndex) * 120 + 300}ms`,
                          }}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Shimmer */}
          <div className="flex items-center justify-between pt-4 animate-pulse shimmer-element">
            <div className="h-5 bg-gray-200 rounded w-32 shimmer-bg"></div>
            <div className="flex space-x-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-8 bg-gray-200 rounded shimmer-bg transition-all duration-300"
                  style={{ animationDelay: `${i * 150}ms` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        @keyframes gentle-shimmer {
          0% {
            background-position: -200% 0;
            opacity: 0.6;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            background-position: 200% 0;
            opacity: 0.6;
          }
        }

        @keyframes soft-pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.002);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .shimmer-bg {
          background: linear-gradient(
            90deg,
            rgba(243, 244, 246, 0.8) 0%,
            rgba(229, 231, 235, 0.9) 25%,
            rgba(209, 213, 219, 1) 50%,
            rgba(229, 231, 235, 0.9) 75%,
            rgba(243, 244, 246, 0.8) 100%
          );
          background-size: 300% 100%;
          animation: gentle-shimmer 2.5s ease-in-out infinite;
        }

        .animate-pulse {
          animation: soft-pulse 2.5s ease-in-out infinite;
        }

        /* Smooth fade-in for elements */
        .shimmer-element {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(10px);
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
