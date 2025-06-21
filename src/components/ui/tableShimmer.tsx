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
        {/* Global shimmer overlay */}
        <div className="absolute inset-0 shimmer-overlay"></div>

        <div className="p-6 space-y-4">
          {/* Header Section */}
          {showHeader && (
            <div className="shimmer-section" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-6">
                <div
                  className="shimmer-bar h-8 w-48 rounded-lg"
                  style={{ animationDelay: '0.3s' }}
                ></div>
                <div className="flex space-x-3">
                  <div
                    className="shimmer-bar h-10 w-24 rounded-lg"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                  <div
                    className="shimmer-bar h-10 w-20 rounded-lg"
                    style={{ animationDelay: '0.5s' }}
                  ></div>
                </div>
              </div>

              {/* Search/Filter Bar */}
              <div className="flex items-center space-x-4 mb-6">
                <div
                  className="shimmer-bar h-10 flex-1 max-w-md rounded-lg"
                  style={{ animationDelay: '0.6s' }}
                ></div>
                <div
                  className="shimmer-bar h-10 w-32 rounded-lg"
                  style={{ animationDelay: '0.7s' }}
                ></div>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div
            className="overflow-hidden rounded-lg border border-gray-200 shimmer-section"
            style={{ animationDelay: '0.8s' }}
          >
            {/* Table Header */}
            <div className="bg-gray-50/80 border-b border-gray-200">
              <div
                className="grid gap-4 p-4"
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div
                    key={`header-${colIndex}`}
                    className="shimmer-bar h-4 rounded"
                    style={{
                      width: `${60 + Math.random() * 30}%`,
                      animationDelay: `${0.9 + colIndex * 0.1}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                  key={`row-${rowIndex}`}
                  className="grid gap-4 p-4 hover:bg-gray-50/30 transition-all duration-700 shimmer-row"
                  style={{
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    animationDelay: `${1.2 + rowIndex * 0.15}s`,
                  }}
                >
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <div key={`cell-${rowIndex}-${colIndex}`} className="flex flex-col space-y-2">
                      <div
                        className="shimmer-bar h-4 rounded"
                        style={{
                          width: `${50 + Math.random() * 40}%`,
                          animationDelay: `${1.3 + rowIndex * 0.15 + colIndex * 0.05}s`,
                        }}
                      ></div>
                      {/* Occasionally add a second line for variety */}
                      {Math.random() > 0.6 && (
                        <div
                          className="shimmer-bar h-3 rounded"
                          style={{
                            width: `${25 + Math.random() * 35}%`,
                            animationDelay: `${1.5 + rowIndex * 0.15 + colIndex * 0.05}s`,
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
          <div
            className="flex items-center justify-between pt-4 shimmer-section"
            style={{ animationDelay: `${2 + rows * 0.1}s` }}
          >
            <div
              className="shimmer-bar h-5 w-32 rounded"
              style={{ animationDelay: `${2.1 + rows * 0.1}s` }}
            ></div>
            <div className="flex space-x-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="shimmer-bar h-8 w-8 rounded"
                  style={{ animationDelay: `${2.2 + rows * 0.1 + i * 0.1}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Smooth shimmer wave animation */
        @keyframes shimmerWave {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          20% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
          80% {
            opacity: 0.3;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        /* Gentle background shimmer */
        @keyframes gentleShimmer {
          0% {
            background-position: -300% 0;
            opacity: 0.4;
          }
          25% {
            opacity: 0.7;
          }
          50% {
            background-position: 0% 0;
            opacity: 0.8;
          }
          75% {
            opacity: 0.7;
          }
          100% {
            background-position: 300% 0;
            opacity: 0.4;
          }
        }

        /* Smooth fade in with subtle bounce */
        @keyframes smoothFadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          60% {
            opacity: 0.8;
            transform: translateY(-2px) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Row cascade animation */
        @keyframes cascadeFadeIn {
          0% {
            opacity: 0;
            transform: translateY(15px);
          }
          70% {
            opacity: 0.9;
            transform: translateY(-1px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Breathing pulse animation for bars */
        @keyframes breathingPulse {
          0%, 100% {
            opacity: 0.5;
            transform: scaleY(1) scaleX(1);
          }
          25% {
            opacity: 0.7;
            transform: scaleY(1.02) scaleX(1.005);
          }
          50% {
            opacity: 0.9;
            transform: scaleY(1.04) scaleX(1.01);
          }
          75% {
            opacity: 0.7;
            transform: scaleY(1.02) scaleX(1.005);
          }
        }

        /* Global shimmer overlay */
        .shimmer-overlay {
          background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 25%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0.1) 75%,
            transparent 100%
          );
          background-size: 400% 400%;
          animation: shimmerWave 4s ease-in-out infinite;
          pointer-events: none;
        }

        /* Individual shimmer bars */
        .shimmer-bar {
          background: linear-gradient(
            110deg,
            rgba(229, 231, 235, 0.6) 0%,
            rgba(209, 213, 219, 0.8) 20%,
            rgba(156, 163, 175, 0.9) 40%,
            rgba(209, 213, 219, 0.8) 60%,
            rgba(229, 231, 235, 0.6) 80%,
            rgba(243, 244, 246, 0.4) 100%
          );
          background-size: 400% 100%;
          animation: 
            gentleShimmer 3s ease-in-out infinite,
            breathingPulse 2.5s ease-in-out infinite,
            smoothFadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }

        /* Section animations */
        .shimmer-section {
          animation: smoothFadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }

        /* Row animations */
        .shimmer-row {
          animation: cascadeFadeIn 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          opacity: 0;
          transform: translateY(15px);
        }

        /* Staggered animation delays for natural loading feel */
        .shimmer-bar:nth-child(even) {
          animation-delay: 0.1s;
        }

        .shimmer-bar:nth-child(3n) {
          animation-delay: 0.2s;
        }

        /* Hover effects for interactive feel */
        .shimmer-row:hover .shimmer-bar {
          animation-duration: 2s;
          opacity: 0.9;
        }

        /* Responsive adjustments */
        @media (prefers-reduced-motion: reduce) {
          .shimmer-overlay,
          .shimmer-bar,
          .shimmer-section,
          .shimmer-row {
            animation-duration: 0.5s;
            animation-iteration-count: 1;
          }
        }
      `}</style>
    </div>
  );
};
