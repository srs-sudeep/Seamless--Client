import lazyLoad from '@/lib/lazyLoad';
import GuestGuard from '@/core/guards/GuestGuard';
import AuthLayout from '@/layouts/AuthLayout';

// Auth pages
const LoginPage = lazyLoad(() => import('@/views/auth/LoginPage'));

const AuthRoutes = {
  path: '/',
  element: <AuthLayout />,
  children: [
    {
      path: 'login',
      element: (
        <GuestGuard>
          <LoginPage />
        </GuestGuard>
      ),
    },
  ],
};

export default AuthRoutes;
