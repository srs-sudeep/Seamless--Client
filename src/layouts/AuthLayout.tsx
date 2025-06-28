import { AppLogo } from '@/components';
import { ThemeSwitcher } from '@/theme';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex items-center justify-center min-h-screen from-violet-50 via-purple-50 to-indigo-50 dark:from-violet-950 relative overflow-hidden">
      {/* Background blur elements - only visible in dark mode */}
      {/* <div className="fixed -top-1/4 left-10 w-96 h-96 bg-primary/25 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed -top-1/3 -right-40 w-96 h-96 bg-primary/25 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed -bottom-1/4 right-0 w-96 h-96 bg-primary/25 rounded-full blur-3xl pointer-events-none"></div> */}

      {/* Theme switcher positioned in top corner */}
      <AppLogo />
      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitcher />
      </div>

      {/* Main container for all auth pages */}
      <div className="w-full max-w-5xl mx-4 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
        <Outlet />
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Recogx Init. All rights reserved.
      </div>
    </div>
  );
};

export default AuthLayout;
