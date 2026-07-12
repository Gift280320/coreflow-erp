import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building,
  UserCog,
  Calendar,
  FileText,
  ShoppingCart,
  Package,
  DollarSign,
  Settings,
  Clock,
  Box,
  CreditCard,
  Wallet,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Users', icon: Users, path: '/users' },
  { name: 'Departments', icon: Building, path: '/departments' },
  { name: 'Employees', icon: UserCog, path: '/employees' },
  { name: 'Leave Types', icon: Calendar, path: '/leave-types' },
  { name: 'Leave Requests', icon: FileText, path: '/leave-requests' },
  { name: 'Suppliers', icon: ShoppingCart, path: '/suppliers' },
  { name: 'Purchase Requests', icon: FileText, path: '/purchase-requests' },
  { name: 'Purchase Orders', icon: ShoppingCart, path: '/purchase-orders' },
  { name: 'Products', icon: Package, path: '/products' },
  { name: 'Warehouses', icon: Building, path: '/warehouses' },
  { name: 'Stock', icon: Box, path: '/stock' },
  { name: 'Customers', icon: Users, path: '/customers' },
  { name: 'Invoices', icon: FileText, path: '/invoices' },
  { name: 'Payments', icon: CreditCard, path: '/payments' },
  { name: 'Accounts', icon: Wallet, path: '/accounts' },
  { name: 'Expenses', icon: DollarSign, path: '/expenses' },
  { name: 'Budgets', icon: DollarSign, path: '/budgets' },
  { name: 'Assets', icon: Package, path: '/assets' },
  { name: 'Reports', icon: FileText, path: '/reports' },
  { name: 'Projects', icon: FileText, path: '/projects' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col overflow-y-auto">
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
