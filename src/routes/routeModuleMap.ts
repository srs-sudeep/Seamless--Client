// routes/routeModuleMap.ts
import AdminRoutes from '@/routes/AdminRoutes';
import DashboardRoutes from './DashboardRoutes';
import DeviceRoutes from './DeviceRoutes';
// import other module routes as needed

export const allRouteObjects = [
  AdminRoutes,
  DashboardRoutes,
  DeviceRoutes,
  // ...otherModuleRoutes,
];
