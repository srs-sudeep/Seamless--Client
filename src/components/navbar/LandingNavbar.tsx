import React, { useState } from 'react';
import { Button, AppLogo, Sheet, SheetContent, SheetTrigger } from '@/components';
import { Link } from 'react-router-dom';
import { Menu, ArrowRight, LogOut } from 'lucide-react';
import { ThemeSwitcher } from '@/theme';
import { useAuthStore } from '@/store';
import { getDashboardLink } from '@/lib/redirect';
const navLinks = [
  { name: 'About us', href: 'about' },
  { name: 'Contact us', href: 'contact' },
  { name: 'Privacy Policies', href: 'privacy' },
  { name: 'Terms', href: 'terms' },
  { name: 'Support', href: 'support' },
];

export const LandingNavbar = () => {
  const { isAuthenticated, currentRole, logout } = useAuthStore();
  const [scroll, setScroll] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all bg-white dark:bg-black duration-300${
        scroll ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm' : ''
      }`}
    >
      <div className="container flex items-center justify-between py-4 ">
        <button className="cursor-pointer">
          <Link to="/">
            <AppLogo horizontal className="w-32 md:w-48" />
          </Link>
        </button>

        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map(link => (
            <a
              key={link.name}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="pt-6 flex justify-center">
                <div className="relative group">
                  <h2 className="text-base font-normal text-center tracking-wide">
                    <span className="inline-block px-2 py-1 text-gray-900 dark:text-gray-100 relative overflow-hidden transition-all duration-500 ease-out hover:text-gray-700 dark:hover:text-gray-300">
                      {link.name}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 group-hover:w-full transition-all duration-700 ease-out"></span>
                    </span>
                  </h2>
                </div>
              </div>
            </a>
          ))}
          {!isAuthenticated ? (
            <div className="space-x-2">
              <Button asChild size="lg" className="px-8 text-lg h-12">
                <Link to="/login" className="gap-2">
                  Login <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              {/* Dashboard Button */}
              <Button
                asChild
                className="flex-1 h-10 text-base rounded-md bg-black hover:bg-gray-800 text-white transition-colors duration-200 shadow-sm gap-2 dark:bg-white dark:text-black "
              >
                <Link to={getDashboardLink(currentRole)} className="flex items-center">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              {/* Logout Button */}
              <Button
                className="flex-1 h-10 text-base rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 shadow-sm gap-2 flex items-center justify-center"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </div>
          )}

          <ThemeSwitcher />
        </nav>
        <div className="gap-2 block md:hidden items-center">
          <ThemeSwitcher />
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-6">
                {navLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-4 flex flex-col space-y-2">
                  <Button variant="outline">Login</Button>
                  <Button>Get Started</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
