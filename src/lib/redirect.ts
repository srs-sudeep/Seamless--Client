import { type UserRole } from '@/types';

export function getDashboardLink(role: UserRole | null | undefined) {
  const rolePaths: Record<string, string> = {
    default: '/',
    admin: '/dashboard/admin',
    teacher: '/dashboard/teacher',
    academics: '/dashboard/academics',
    student: '/dashboard/student',
    librarian: '/dashboard/librarian',
    medical: '/dashboard/medical',
  };

  return role && rolePaths[role] ? rolePaths[role] : '/';
}
