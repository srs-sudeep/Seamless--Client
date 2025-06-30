import { login } from '@/api';
import { Button, HelmetWrapper, Input, Label, toast } from '@/components';
import { useAuthStore } from '@/store';
import { useTheme } from '@/theme';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { logos } from '@/assets';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();
  const { theme } = useTheme();

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
      <div className="relative min-h-screen w-full flex items-center justify-center">
        {/* Top Bar */}

        {/* Login Card */}
        <div className="bg-foreground/60 p-10 rounded-lg shadow-2xl w-[400px] max-w-full mx-auto z-10 border border-border">
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
            <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">Welcome back</h1>
            <p className="text-white/80 text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 w-full">
            <div className="space-y-2 w-full">
              <Label htmlFor="ldapid" className="text-white">
                LDAP ID
              </Label>
              <Input
                id="ldapid"
                type="text"
                placeholder="Enter your LDAP ID"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/20 border-white/30 text-white placeholder:text-white/60"
              />
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <div className="relative w-full">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  placeholder="Enter your password"
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pr-12 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </HelmetWrapper>
  );
};

export default LoginPage;
