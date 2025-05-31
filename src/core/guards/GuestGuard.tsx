import { FullPageLoader } from '@/components/ui/loading-spinner';
import { getDashboardLink } from '@/lib/redirect';
import { useAuthStore } from '@/store/useAuthStore';
import { Navigate } from 'react-router-dom';

const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, currentRole, loading } = useAuthStore();
  console.log('GuestGuard - isAuthenticated:', isAuthenticated);
  if (loading) {
    return <FullPageLoader />;
  }
  if (isAuthenticated && user) {
    if (currentRole) {
      return <Navigate to={getDashboardLink(currentRole)} replace />;
    }
    console.log(currentRole);
    const defaultPath =
      user.roles && user.roles.length > 0 ? getDashboardLink(user.roles[0]) || '/' : '/';

    return <Navigate to={defaultPath} replace />;
  }
  return <>{children}</>;
};

export default GuestGuard;
