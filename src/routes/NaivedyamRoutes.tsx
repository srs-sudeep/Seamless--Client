import MainLayout from '@/layouts/MainLayout';
import lazyLoad from '@/lib/lazyLoad';
import { type RouteObject } from 'react-router-dom';

// Lazy load admin views
const VendorsManagement = lazyLoad(() => import('@/views/naivedyam/vendorsManagement'));
const StudentVendorManagement = lazyLoad(() => import('@/views/naivedyam/studentVendorManagement'));
const CreateVendor = lazyLoad(() => import('@/views/naivedyam/createVendors'));
const Menu = lazyLoad(() => import('@/views/naivedyam/Menu'));
const MealSessionPage = lazyLoad(() => import('@/views/naivedyam/mealSession'));
const VendorSessionPage = lazyLoad(() => import('@/views/naivedyam/vendorSession'));
const StudentTransactionPage = lazyLoad(() => import('@/views/naivedyam/studentTransaction'));
const CreateMealSession = lazyLoad(() => import('@/views/naivedyam/createMealSession'));
const MyMenuPage = lazyLoad(() => import('@/views/naivedyam/MyMenu'));
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
    {
      path: 'student-vendor-management',
      element: <StudentVendorManagement />,
    },
    {
      path: 'mess-menu',
      element: <Menu />,
    },
    {
      path: 'meal-session',
      element: <MealSessionPage />,
    },
    {
      path: 'vendor-session',
      element: <VendorSessionPage />,
    },
    {
      path: 'student-transaction',
      element: <StudentTransactionPage />,
    },
    {
      path: 'create-meal-session',
      element: <CreateMealSession />,
    },
    {
      path: 'my-menu',
      element: <MyMenuPage />,
    },
  ],
};

export default NaivedyamRoutes;
