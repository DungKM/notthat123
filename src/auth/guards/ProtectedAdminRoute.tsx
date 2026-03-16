import React from 'react';
import { AuthGuard } from './AuthGuard';
import { RoleGuard } from './RoleGuard';
import { Role } from '../types';
import AdminLayout from '@/src/layouts/AdminLayout';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  roles?: Role[];
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children, roles }) => {
  const content = roles ? (
    <RoleGuard allowedRoles={roles}>{children}</RoleGuard>
  ) : (
    children
  );

  return (
    <AuthGuard>
      <AdminLayout>
        {content}
      </AdminLayout>
    </AuthGuard>
  );
};
