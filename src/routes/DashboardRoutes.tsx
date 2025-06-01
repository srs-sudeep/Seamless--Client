import lazyLoad from '@/lib/lazyLoad';
import MainLayout from '@/layouts/MainLayout';

// Dashboard Pages
const AdminDashboard = lazyLoad(() => import('@/views/dashboard/AdminDashboard'));
const LibrarianDashboard = lazyLoad(() => import('@/views/dashboard/LibrarianDashboard'));
const MedicalDashboard = lazyLoad(() => import('@/views/dashboard/MedicalDashboard'));
const StudentDashboard = lazyLoad(() => import('@/views/dashboard/StudentDashboard'));
const TeacherDashboard = lazyLoad(() => import('@/views/dashboard/TeacherDashboard'));

const DashboardRoutes = {
  path: 'dashboard',
  element: <MainLayout />,
  children: [
    {
      path: 'admin',
      element: <AdminDashboard />,
    },
    {
      path: 'library',
      element: <LibrarianDashboard />,
    },
    {
      path: 'medical',
      element: <MedicalDashboard />,
    },
    {
      path: 'student',
      element: <StudentDashboard />,
    },
    {
      path: 'teacher',
      element: <TeacherDashboard />,
    },
  ],
};

export default DashboardRoutes;
