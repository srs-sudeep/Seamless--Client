import { login } from '@/api';
import { Button, HelmetWrapper, Input, Label, toast } from '@/components';
import { useAuthStore } from '@/store';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { loginAssets, logos } from '@/assets';

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
      <div className="lg:hidden flex flex-col items-center mt-6 space-y-2">
        <img src={loginAssets.iitBhilaiLogo} alt="IIT Bhilai Logo" className="w-12 h-auto" />
        <img
          src={logos.horizontal.light}
          alt="Logo Light"
          className="w-48 h-auto object-contain block dark:hidden"
        />
        <img
          src={logos.horizontal.dark}
          alt="Logo Dark"
          className="w-48 h-auto object-contain hidden dark:block"
        />
      </div>
      <div className="h-1/3 flex">
        {/* Left form side */}
        <div className="flex-1 flex items-center justify-center p-8 bg-card border-0">
          <div className="w-full max-w-md">
            {/* Logo/Brand section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent-foreground/10 mb-6 shadow-lg">
                <svg
                  className="w-8 h-8 text-background"
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
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
              <p className="text-muted-foreground text-sm">Sign in to your account to continue</p>
            </div>

            {/* Login card */}
            <div className="bg-sidebar/30 backdrop-blur-xl rounded-2xl shadow-xl p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ldapid" className="text-sm font-medium text-foreground">
                    LDAP ID
                  </Label>
                  <Input
                    id="ldapid"
                    type="text"
                    placeholder="Enter your LDAP ID"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="h-12 bg-background/50 border-secondary text-foreground placeholder:muted-foreground focus:border-primary rounded-xl transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      placeholder="Enter your password"
                      onChange={e => setPassword(e.target.value)}
                      className="h-12 bg-background/50 border-secondary text-foreground placeholder:muted-foreground focus:border-primary rounded-xl transition-all duration-200"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground hover:text-muted-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-primary/75 to-accent/35 hover:from-primary hover:to-primary-foreground/15 text-foreground font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-foreground rounded-full animate-spin" />
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

        {/* Right side - Image section */}
        <div className="hidden lg:flex flex-1 relative justify-center items-center overflow-hidden">
          {/* Background with modern clip-path */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/60 to-accent-foreground/10"
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

            {/* Main background image */}
            <div
              className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
              style={{
                backgroundImage: 'url("./images/Login/LoginImage.webp")',
              }}
            />
          </div>

          {/* Content overlay */}
          <div className="relative z-10 flex items-center justify-center p-12 text-background">
            <div className="text-center">
              <div className="mb-8">
                {/* Logo container with fixed dimensions */}
                <div className="relative mx-auto w-[25vw] h-[35vh] flex flex-col items-center justify-center space-y-4">
                  {/* IIT Bhilai logo (newly added) */}
                  <div className="flex flex-col items-center">
                    {/* IIT Bhilai Logo (common to both modes) */}
                    <img
                      src="./images/Login/IIT_Bhilai_Logo.svg"
                      alt="IIT Bhilai Logo"
                      className="w-36 h-auto mb-2 -mt-4"
                    />

                    {/* Horizontal Logo for Light Mode */}
                    <img
                      src={logos.horizontal.light}
                      alt="Logo"
                      className="w-72 h-auto object-contain block dark:hidden"
                    />

                    {/* Horizontal Logo for Dark Mode */}
                    <img
                      src={logos.horizontal.dark}
                      alt="Logo"
                      className="w-72 h-auto object-contain hidden dark:block"
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
