import lazyLoad from '@/lib/lazyLoad';
import MainLayout from '@/layouts/MainLayout';

// Dashboard Pages
const AdminDashboard = lazyLoad(() => import('@/views/dashboard/AdminDashboard'));
import MessAdminDashboard from '@/views/dashboard/NaivedyamDashboard';
import MessVendorDashboard from '@/views/dashboard/MessVendorDashboard';
const LibrarianDashboard = lazyLoad(() => import('@/views/dashboard/LibrarianDashboard'));
const MedicalDashboard = lazyLoad(() => import('@/views/dashboard/MedicalDashboard'));
const StudentDashboard = lazyLoad(() => import('@/views/dashboard/StudentDashboard'));
const AcademicsDashboard = lazyLoad(() => import('@/views/dashboard/AcademicsDashboard'));
const FacultyDashboard = lazyLoad(() => import('@/views/dashboard/FacultyDashboard'));
const Profile = lazyLoad(() => import('@/views/dashboard/Profile'));

const DashboardRoutes = {
  path: 'dashboard',
  element: <MainLayout />,
  children: [
    {
      path: 'profile',
      element: <Profile />,
    },
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
      path: 'academics',
      element: <AcademicsDashboard />,
    },
    {
      path: 'faculty',
      element: <FacultyDashboard />,
    },
    {
      path: 'messadmin',
      element: <MessAdminDashboard />,
    },
    {
      path: 'messvendor',
      element: <MessVendorDashboard />,
    },
  ],
};

export default DashboardRoutes;
