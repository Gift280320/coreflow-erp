import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function RoleGuard({ children, allowedRoles, fallbackPath = '/dashboard' }: any) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.name;

  if (!allowedRoles.includes(userRole) && !allowedRoles.includes('*')) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
