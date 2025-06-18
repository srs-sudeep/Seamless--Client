import React, { Suspense, useState, useEffect } from 'react';

// Shimmer animation component
const ShimmerEffect = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10" />
  </div>
);

// Enhanced full-page skeleton with dark/light theme support
const LoadingFallback = () => (
  <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
    {/* Header Skeleton */}
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand Skeleton */}
          <div className="flex items-center space-x-4">
            <div className="relative h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg">
              <ShimmerEffect className="h-full w-full rounded-lg" />
            </div>
            <div className="relative h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded">
              <ShimmerEffect className="h-full w-full rounded" />
            </div>
          </div>

          {/* Navigation Skeleton */}
          <nav className="hidden md:flex space-x-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded">
                <ShimmerEffect className="h-full w-full rounded" />
              </div>
            ))}
          </nav>

          {/* Profile/Actions Skeleton */}
          <div className="flex items-center space-x-3">
            <div className="relative h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md">
              <ShimmerEffect className="h-full w-full rounded-md" />
            </div>
            <div className="relative h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full">
              <ShimmerEffect className="h-full w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* Main Content */}
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section Skeleton */}
      <section className="mb-12">
        <div className="text-center space-y-6">
          {/* "Seamless" Title Skeleton */}
          <div className="flex justify-center">
            <div className="relative">
              <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 bg-clip-text select-none">
                Seamless
              </h1>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/30 dark:via-gray-500/30 to-transparent animate-[shimmer_3s_infinite] -skew-x-12" />
            </div>
          </div>

          {/* Subtitle Skeleton */}
          <div className="space-y-3">
            <div className="relative h-6 w-96 max-w-full mx-auto bg-gray-200 dark:bg-gray-700 rounded">
              <ShimmerEffect className="h-full w-full rounded" />
            </div>
            <div className="relative h-6 w-80 max-w-full mx-auto bg-gray-200 dark:bg-gray-700 rounded">
              <ShimmerEffect className="h-full w-full rounded" />
            </div>
          </div>

          {/* CTA Buttons Skeleton */}
          <div className="flex justify-center space-x-4 pt-4">
            <div className="relative h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg">
              <ShimmerEffect className="h-full w-full rounded-lg" />
            </div>
            <div className="relative h-12 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg">
              <ShimmerEffect className="h-full w-full rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid Skeleton */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-4 border border-gray-200 dark:border-gray-700"
          >
            {/* Card Image Skeleton */}
            <div className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-lg">
              <ShimmerEffect className="h-full w-full rounded-lg" />
            </div>

            {/* Card Content Skeleton */}
            <div className="space-y-3">
              <div className="relative h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded">
                <ShimmerEffect className="h-full w-full rounded" />
              </div>
              <div className="space-y-2">
                <div className="relative h-4 w-full bg-gray-200 dark:bg-gray-700 rounded">
                  <ShimmerEffect className="h-full w-full rounded" />
                </div>
                <div className="relative h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded">
                  <ShimmerEffect className="h-full w-full rounded" />
                </div>
              </div>

              {/* Card Footer Skeleton */}
              <div className="flex justify-between items-center pt-2">
                <div className="relative h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded">
                  <ShimmerEffect className="h-full w-full rounded" />
                </div>
                <div className="relative h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md">
                  <ShimmerEffect className="h-full w-full rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Stats Section Skeleton */}
      <section className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="relative h-12 w-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded">
                <ShimmerEffect className="h-full w-full rounded" />
              </div>
              <div className="relative h-4 w-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded">
                <ShimmerEffect className="h-full w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>

    {/* Footer Skeleton */}
    <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="relative h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded">
                <ShimmerEffect className="h-full w-full rounded" />
              </div>
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="relative h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded">
                    <ShimmerEffect className="h-full w-full rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="relative h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded">
              <ShimmerEffect className="h-full w-full rounded" />
            </div>
            <div className="flex space-x-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="relative h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <ShimmerEffect className="h-full w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>

    {/* Custom CSS for shimmer animation */}
    <style>
      {`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}
    </style>
  </div>
);

/**
 * Wraps a lazy-loaded component with Suspense and shows skeleton for at least 5 seconds
 * @param Component - The lazy-loaded component
 * @returns The component wrapped with Suspense
 */
const Loadable = <P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>
) => {
  return (props: P) => {
    // const [showRealComponent, setShowRealComponent] = useState(false);

    // useEffect(() => {
    //   const timer = setTimeout(() => setShowRealComponent(true), 5000);
    //   return () => clearTimeout(timer);
    // }, []);

    // if (!showRealComponent) {
    //   return <LoadingFallback />;
    // }

    return (
      <Suspense fallback={<LoadingFallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
};

export { Loadable, LoadingFallback };
