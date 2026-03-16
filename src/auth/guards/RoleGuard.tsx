import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { Role } from '@/src/auth/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
