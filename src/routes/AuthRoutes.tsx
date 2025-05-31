import lazyLoad from '@/lib/lazyLoad';
import GuestGuard from '@/core/guards/GuestGuard';
import AuthLayout from '@/layouts/AuthLayout';

// Auth pages
const LoginPage = lazyLoad(() => import('@/views/auth/LoginPage'));
const ForgotPasswordPage = lazyLoad(() => import('@/views/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazyLoad(() => import('@/views/auth/ResetPasswordPage'));

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
    {
      path: 'forgot-password',
      element: (
        <GuestGuard>
          <ForgotPasswordPage />
        </GuestGuard>
      ),
    },
    {
      path: 'reset-password',
      element: (
        <GuestGuard>
          <ResetPasswordPage />
        </GuestGuard>
      ),
    },
  ],
};

export default AuthRoutes;
