// routes/routeModuleMap.ts
import AdminRoutes from '@/routes/AdminRoutes';
import DashboardRoutes from './DashboardRoutes';
import DeviceRoutes from './DeviceRoutes';
import BodhikaRoutes from './BodhikaRoutes';
// import other module routes as needed

export const allRouteObjects = [
  AdminRoutes,
  DashboardRoutes,
  DeviceRoutes,
  BodhikaRoutes,
  // ...otherModuleRoutes,
];
