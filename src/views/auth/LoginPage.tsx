import { login } from '@/api';
import { Button, HelmetWrapper, Input, Label, toast } from '@/components';
import { useAuthStore } from '@/store';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: data => {
      setAuth(data);
      toast({
        title: 'Success',
        description: 'You have successfully logged in',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Login Failed',
        description: error?.response?.data?.detail || error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    },
  });

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    mutation.mutate({ ldapid: email, password });
  };

  return (
    <HelmetWrapper title="Login | Seamless">
      {/* Top-level layout with flex-col on mobile, row on desktop */}
      <div className="flex flex-col lg:flex-row">
        {/* Left side (form section) */}
        <div className="flex-1 flex flex-col items-center justify-start p-8">
          {/* Mobile/Tablet Logo (top center) */}
          <div className="w-full flex lg:hidden justify-center mt-6 mb-4">
            <img
              src="./LogoHorizontal.svg"
              alt="Logo"
              className="w-[50vw] h-auto object-contain block dark:hidden"
            />
            <img
              src="./WhiteLogoHorizontal.svg"
              alt="Logo"
              className="w-[50vw] h-auto object-contain hidden dark:block"
            />
          </div>

          <div className="w-full max-w-md">
            {/* Logo/Brand section (desktop header text) */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome back
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Sign in to your account to continue
              </p>
            </div>

            {/* Login form card */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="ldapid"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    LDAP ID
                  </Label>
                  <Input
                    id="ldapid"
                    type="text"
                    placeholder="Enter your LDAP ID"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="h-12 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      placeholder="Enter your password"
                      onChange={e => setPassword(e.target.value)}
                      className="h-12 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl pr-12 transition-all duration-200"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Right side - Image and desktop logo */}
        <div className="hidden lg:flex flex-1 relative justify-center items-center overflow-hidden">
          {/* Background */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-400 to-indigo-800"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 15% 100%)',
            }}
          >
            {/* Overlay pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
              style={{
                backgroundImage: 'url("./LoginImage.webp")',
              }}
            />
          </div>

          {/* Desktop logo */}
          <div className="relative z-10 flex items-center justify-center p-12 text-white">
            <div className="text-center">
              <div className="mb-8">
                <div className="relative mx-auto w-[25vw] h-[35vh] flex flex-col items-center justify-center space-y-4">
                  <div className="flex flex-col items-center">
                    <img
                      src="./IIT_Bhilai_Logo.svg"
                      alt="IIT Bhilai Logo"
                      className="w-[12vw] h-auto mb-2 -mt-4"
                    />
                    <img
                      src="./LogoHorizontal.svg"
                      alt="Logo"
                      className="w-[25vw] h-[20vh] object-contain block dark:hidden"
                    />
                    <img
                      src="./WhiteLogoHorizontal.svg"
                      alt="Logo"
                      className="w-[25vw] h-[20vh] object-contain hidden dark:block"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HelmetWrapper>
  );
};

export default LoginPage;
