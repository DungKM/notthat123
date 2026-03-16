
import { Role, User } from './types';

export const canAccess = (user: User | undefined, permission: string) => {
  if (!user) return false;

  const role = user.role;

  switch (permission) {
    case 'admin':
      return role === Role.DIRECTOR;
    case 'director':
      return role === Role.DIRECTOR;
    case 'all':
      return true;
    case 'project_access':
      return [Role.DIRECTOR, Role.SITE_MANAGER].includes(role);
    case 'staff':
      return role === Role.STAFF;
    case 'accountant':
      return [Role.ACCOUNTANT].includes(role);
    case 'sales':
      return [Role.DIRECTOR].includes(role);
    case 'NHAN_VIEN':
      return true; // Everyone can see personal staff info
    case 'site_manager':
      return [Role.DIRECTOR, Role.SITE_MANAGER].includes(role);
    case 'project_edit':
      return [Role.DIRECTOR, Role.SITE_MANAGER].includes(role);
    case 'attendance_all':
      return [Role.DIRECTOR, Role.ACCOUNTANT].includes(role);
    default:
      return false;
  }
};
