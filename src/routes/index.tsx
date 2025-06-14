import { FullPageLoader } from '@/components/ui/loading-spinner';
import AuthGuard from '@/core/guards/AuthGuard';
import { useAvailableRoutes } from '@/hooks/useAvailableRoutes.hook';
import { filterNestedRoutesByAvailable } from '@/lib/filterRoutes';
import AuthRoutes from '@/routes/AuthRoutes';
import ErrorRoutes from '@/routes/ErrorRoutes';
import LandingRoutes from '@/routes/LandingRoutes';
import { allRouteObjects } from '@/routes/routeModuleMap';
import { useRoutes } from 'react-router-dom';

const Router = () => {
  const { availableRoutes, isLoading } = useAvailableRoutes();
  const filteredRoutes = filterNestedRoutesByAvailable(allRouteObjects, availableRoutes);

  const routes = useRoutes([
    LandingRoutes,
    AuthRoutes,
    {
      element: <AuthGuard />,
      children: filteredRoutes,
    },
    ...filteredRoutes,
    ...ErrorRoutes,
  ]);
  if (isLoading) {
    return <FullPageLoader />;
  }
  return routes;
};

export default Router;
