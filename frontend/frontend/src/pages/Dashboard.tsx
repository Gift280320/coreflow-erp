import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <p className="text-gray-700 dark:text-gray-300">Welcome, {user?.firstName} {user?.lastName}!</p>
      <p className="text-gray-600 dark:text-gray-400">Role: {user?.role?.name}</p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">This is a temporary dashboard. Restore the full version once login works.</p>
    </div>
  );
}
