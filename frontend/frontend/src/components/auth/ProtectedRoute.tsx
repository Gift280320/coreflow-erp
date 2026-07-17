import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  console.log('🔒 ProtectedRoute - user:', user, 'isLoading:', isLoading);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    console.log('🔒 No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('🔒 User authenticated, rendering outlet');
  return <Outlet />;
}
