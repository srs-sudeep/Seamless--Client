import { login } from '@/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();
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
        description: error?.response?.data?.message || error.message || 'Invalid credentials',
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
    <div className="flex flex-col md:flex-row">
      {/* Left form side */}
      <div className="w-full md:w-1/2 p-8 relative">
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
            IO
          </div>
        </div>

        <div className="flex justify-center mb-6 mt-12">
          <div className="w-20 h-20 rounded-full border-2 border-purple-500 flex items-center justify-center text-purple-500 dark:text-purple-400">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="ldapid">Ldap Id</Label>
            <Input
              id="ldapid"
              type="text"
              placeholder="Enter your Ldap Id"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-gray-100 dark:bg-white/10 border-0 text-gray-800 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-sm text-purple-600 dark:text-purple-300">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-gray-100 dark:bg-white/10 border-0 text-gray-800 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={checked => setRememberMe(!!checked)}
              className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal text-gray-600 dark:text-gray-300"
            >
              Remember me
            </Label>
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-purple-600 dark:text-purple-400">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-800 via-purple-700 to-indigo-800 items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 opacity-80">
            <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="gradient" gradientTransform="rotate(45)">
                  <stop offset="0%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <path
                fill="url(#gradient)"
                d="M220.6,-306.1C288,-270.9,345.3,-214.6,366.4,-147.8C387.5,-81,372.3,-3.8,351.2,66.3C330.1,136.4,303.1,199.3,260.7,246.8C218.3,294.2,160.6,326.2,101.4,339.8C42.1,353.5,-18.7,348.7,-76,329.6C-133.4,310.4,-187.2,276.9,-232.7,233C-278.1,189.1,-315.1,134.8,-338.6,72.6C-362.1,10.4,-372.1,-59.5,-351.9,-120.4C-331.7,-181.3,-281.2,-233.2,-223,-272.5C-164.8,-311.8,-98.9,-338.4,-30.4,-344.9C38.1,-351.4,153.3,-341.3,220.6,-306.1Z"
                transform="translate(250 250) scale(0.5)"
              />
            </svg>
          </div>
        </div>
        <div className="z-10 text-left max-w-xs">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome.</h1>
          <p className="text-gray-300 text-sm opacity-80">
            Log in to access your dashboard and manage your resources in one place.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
