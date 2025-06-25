import MainLayout from '@/layouts/MainLayout';
import lazyLoad from '@/lib/lazyLoad';
import { type RouteObject } from 'react-router-dom';

// Lazy load admin views
const VendorsManagement = lazyLoad(() => import('@/views/naivedyam/vendorsManagement'));
const CreateVendor = lazyLoad(() => import('@/views/naivedyam/createVendors'));
const NaivedyamRoutes: RouteObject = {
  path: '/naivedyam',
  element: <MainLayout />,
  children: [
    {
      path: 'vendor-create',
      element: <CreateVendor />,
    },
    {
      path: 'vendors-management',
      element: <VendorsManagement />,
    },
  ],
};

export default NaivedyamRoutes;
