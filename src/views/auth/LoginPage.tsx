import { login } from '@/api';
import { Button, HelmetWrapper, Input, Label, toast } from '@/components';
import { useAuthStore } from '@/store';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <HelmetWrapper title="Login | Seamless">
      <div className="flex flex-col md:flex-row ">
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
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                placeholder="Password"
                onChange={e => setPassword(e.target.value)}
                className="bg-gray-100 dark:bg-white/10 border-0 text-gray-800 dark:text-white"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Right side */}
        <div className="hidden md:block w-1/2 relative">
          <div
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%)',
              backgroundImage: 'url("./LoginImage.webp")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black opacity-50"></div>
          </div>
          <div className="relative z-10 flex h-full items-center justify-center p-8">
            <div className="text-left max-w-xs text-white">
              <h1 className="text-4xl font-bold mb-4">Welcome.</h1>
              <p className="text-gray-300 text-sm opacity-80">
                Log in to access your dashboard and manage your resources in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </HelmetWrapper>
  );
};

export default LoginPage;
