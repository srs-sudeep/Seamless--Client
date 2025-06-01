import { Navigate } from 'react-router-dom';
import lazyLoad from '@/lib/lazyLoad';
import MainLayout from '@/layouts/MainLayout';

// Library pages
const LibrarianDashboard = lazyLoad(() => import('@/views/dashboard/LibrarianDashboard'));
const LibraryRoutes = {
  path: 'library',
  element: <MainLayout />,
  children: [
    {
      path: '',
      element: <Navigate to="/library/dashboard" replace />,
    },
    {
      path: 'dashboard',
      element: <LibrarianDashboard />,
    },
  ],
};

export default LibraryRoutes;
