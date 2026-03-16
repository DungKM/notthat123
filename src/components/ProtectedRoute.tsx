import React from 'react';
import { Navigate } from 'react-router-dom';
import { User } from '../types';
import { canAccess } from '../access';
import { getDefaultRoute } from '../routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  currentUser: User;
  requiredAccess: string;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  currentUser, 
  requiredAccess,
  redirectTo
}) => {
  if (!canAccess(currentUser, requiredAccess)) {
    const fallbackRoute = redirectTo ?? getDefaultRoute(currentUser.role);
    return <Navigate to={fallbackRoute} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
