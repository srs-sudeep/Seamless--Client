import { type UserRole } from '@/types';

export function getDashboardLink(role: UserRole | null | undefined) {
  const rolePaths: Record<string, string> = {
    default: '/',
    admin: '/dashboard/admin',
    faculty: '/dashboard/faculty',
    academics: '/dashboard/academics',
    student: '/dashboard/student',
    librarian: '/dashboard/librarian',
    medicalStaff: '/dashboard/medicalStaff',
    messAdmin: '/dashboard/messadmin',
    messVendor: '/dashboard/messvendor',
    doctor: '/dashboard/doctor',
  };

  return role && rolePaths[role] ? rolePaths[role] : '/';
}
