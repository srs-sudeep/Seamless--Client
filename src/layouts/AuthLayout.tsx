import { AppLogo } from '@/components';
import { ThemeSwitcher } from '@/theme';
import { Outlet } from 'react-router-dom';
import { useTheme } from '@/theme';
import { loginAssets } from '@/assets';

const AuthLayout = () => {
  const { theme } = useTheme();
  const backgroundImage = theme === 'dark' ? loginAssets.loginImageDark : loginAssets.loginImage;

  return (
    <div className="relative flex items-center justify-center w-screen h-screen min-h-screen overflow-hidden">
      {/* Background image */}
      <div
        className="fixed inset-0 w-screen h-screen bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />
      {/* Background overlay */}
      <div className="fixed inset-0 w-screen h-screen bg-black/40 dark:bg-white/10 -z-5 pointer-events-none" />
      {/* Top left horizontal logo */}
      <div className="absolute top-4 left-4 z-10">
        <AppLogo horizontal />
      </div>
      {/* Top right theme switcher */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitcher />
      </div>
      {/* Main container for all auth pages - removed outer box */}
      <Outlet />
      {/* Footer */}
      <div className="absolute bottom-4 text-center text-sm text-gray-500 dark:text-gray-400 w-full">
        &copy; {new Date().getFullYear()} Recogx Init. All rights reserved.
      </div>
    </div>
  );
};

export default AuthLayout;
