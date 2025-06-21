import React, { Suspense } from 'react';

const LoadingFallback = () => {
  return (
    <div className="fixed top-0 left-0 w-full z-50">
      {/* Progress Bar Container */}
      <div className="h-1 bg-gray-200 relative overflow-hidden">
        {/* Main Progress Bar */}
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 relative"
          style={{
            width: '100%',
            animation: 'progressSlide 2s ease-in-out infinite',
          }}
        >
          {/* Turbo Effect at Front */}
          <div
            className="absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent via-white to-pink-300 opacity-80"
            style={{
              animation: 'turboGlow 1s ease-in-out infinite alternate',
              filter: 'blur(1px)',
            }}
          />

          {/* Additional Sparkle Effect */}
          <div
            className="absolute right-2 top-0 h-full w-2 bg-white opacity-90"
            style={{
              animation: 'sparkle 0.8s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style>
        {`
          @keyframes progressSlide {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0%); }
            100% { transform: translateX(100%); }
          }
          
          @keyframes turboGlow {
            0% { 
              opacity: 0.6;
              transform: scaleX(1);
            }
            100% { 
              opacity: 1;
              transform: scaleX(1.2);
            }
          }
          
          @keyframes sparkle {
            0%, 100% { 
              opacity: 0.9;
              transform: scaleY(1);
            }
            50% { 
              opacity: 0.4;
              transform: scaleY(0.6);
            }
          }
        `}
      </style>
    </div>
  );
};

/**

Wraps a lazy-loaded component with Suspense and shows skeleton for at least 5 seconds
@param Component - The lazy-loaded component
@returns The component wrapped with Suspense */ const Loadable = <P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>
) => {
  return (props: P) => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        {' '}
        <Component {...props} />{' '}
      </Suspense>
    );
  };
};

export { Loadable, LoadingFallback };
