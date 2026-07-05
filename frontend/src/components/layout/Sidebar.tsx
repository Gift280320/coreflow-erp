import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Building, Package, ShoppingCart, FileText, Settings } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Users', icon: Users, path: '/users' },
  { name: 'Departments', icon: Building, path: '/departments' },
  { name: 'Inventory', icon: Package, path: '/inventory' },
  { name: 'Procurement', icon: ShoppingCart, path: '/procurement' },
  { name: 'Reports', icon: FileText, path: '/reports' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <span className="text-2xl font-bold text-primary">CoreFlow</span>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
