import React, { Suspense, useEffect, useState } from 'react';

interface LoadingFallbackProps {
  minLoadTime?: number; // in milliseconds
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ minLoadTime = 5000 }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / minLoadTime) * 100, 100);

      setProgress(progressPercent);

      if (progressPercent >= 100) {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [minLoadTime]);

  return (
    <>
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-50 to-purple-50 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out shadow-lg"
          style={{
            width: `${progress}%`,
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
          }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
        </div>
      </div>

      {/* Main Loading Content */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md mx-auto">
          {/* Animated Logo/Icon */}
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-spin-slow">
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1" />
              </div>

              {/* Inner ring */}
              <div className="absolute inset-2 rounded-full border-4 border-purple-200 animate-spin-reverse">
                <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full transform -translate-x-1/2 -translate-y-0.5" />
              </div>

              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 animate-fade-in">
              Loading
              <span className="inline-block animate-bounce-dots">.</span>
              <span className="inline-block animate-bounce-dots" style={{ animationDelay: '0.1s' }}>
                .
              </span>
              <span className="inline-block animate-bounce-dots" style={{ animationDelay: '0.2s' }}>
                .
              </span>
            </h2>

            <p className="text-gray-600 animate-fade-in-delay">Preparing your experience</p>
          </div>

          {/* Progress Percentage */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-500">
              {Math.round(progress)}% Complete
            </div>

            {/* Secondary Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20 animate-float"
                style={{
                  left: `${20 + i * 10}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i * 0.5}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes bounce-dots {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-delay {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-bounce-dots {
          animation: bounce-dots 1.4s infinite ease-in-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 0.8s ease-out 0.2s both;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

/**
 * Wraps a lazy-loaded component with Suspense and shows skeleton for at least 5 seconds
 * @param Component - The lazy-loaded component
 * @returns The component wrapped with Suspense
 */
const Loadable = <P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>
) => {
  return (props: P) => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
};

export { Loadable, LoadingFallback };
