import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Package,
  ShoppingCart,
  Warehouse,
  DollarSign,
  FolderKanban,
  Briefcase,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  BarChart3,
  Shield,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const getModules = (role: string) => {
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const isHR = role === 'HR_MANAGER';
  const isAccountant = role === 'ACCOUNTANT';
  const isInventory = role === 'INVENTORY_MANAGER';
  const isProcurement = role === 'PROCUREMENT_OFFICER';
  const isSales = role === 'SALES_REP';

  const modules = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, items: [{ path: '/', label: 'Dashboard' }] },
  ];

  if (isAdmin || isHR) {
    modules.push({
      id: 'people',
      label: 'People & HR',
      icon: Users,
      items: [
        { path: '/employees', label: 'Employees' },
        { path: '/departments', label: 'Departments' },
        { path: '/leave-types', label: 'Leave Types' },
        { path: '/leave-requests', label: 'Leave Requests' },
      ],
    });
  }

  if (isAdmin || isInventory || isProcurement) {
    const items: any[] = [];
    if (isAdmin || isInventory) {
      items.push({ path: '/products', label: 'Products' });
      items.push({ path: '/warehouses', label: 'Warehouses' });
      items.push({ path: '/stock', label: 'Stock' });
    }
    if (isAdmin || isProcurement) {
      items.push({ path: '/suppliers', label: 'Suppliers' });
      items.push({ path: '/purchase-requests', label: 'Purchase Requests' });
      items.push({ path: '/purchase-orders', label: 'Purchase Orders' });
    }
    modules.push({ id: 'operations', label: 'Operations', icon: Package, items });
  }

  if (isAdmin || isAccountant) {
    modules.push({
      id: 'finance',
      label: 'Finance',
      icon: DollarSign,
      items: [
        { path: '/accounts', label: 'Accounts' },
        { path: '/invoices', label: 'Invoices' },
        { path: '/payments', label: 'Payments' },
        { path: '/expenses', label: 'Expenses' },
        { path: '/budgets', label: 'Budgets' },
      ],
    });
  }

  if (isAdmin || isSales) {
    modules.push({
      id: 'customers',
      label: 'Customers',
      icon: Briefcase,
      items: [{ path: '/customers', label: 'Customers' }],
    });
  }

  if (isAdmin) {
    modules.push({
      id: 'projects',
      label: 'Projects & Work',
      icon: FolderKanban,
      items: [{ path: '/projects', label: 'Projects' }],
    });
    modules.push({
      id: 'management',
      label: 'Management',
      icon: BarChart3,
      items: [
        { path: '/assets', label: 'Assets' },
        { path: '/reports', label: 'Reports' },
      ],
    });
    modules.push({
      id: 'admin',
      label: 'Administration',
      icon: Shield,
      items: [
        { path: '/admin/users', label: 'User Management' },
        { path: '/settings', label: 'Settings' },
      ],
    });
  }

  return modules;
};

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const role = user?.role?.name || 'VIEWER';
  const modules = getModules(role);

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    modules.forEach((module) => {
      const isActive = module.items.some((item) => location.pathname === item.path);
      if (isActive) init[module.id] = true;
    });
    if (Object.keys(init).length === 0) init['overview'] = true;
    return init;
  });

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isItemActive = (path: string) => location.pathname === path;
  const isModuleActive = (module: typeof modules[0]) =>
    module.items.some((item) => location.pathname === item.path);

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-y-auto transition-colors duration-200">
      <div className="flex items-center gap-2 px-4 h-16 border-b border-gray-200 dark:border-gray-800">
        <span className="text-2xl font-bold text-primary">CF</span>
        <div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">CoreFlow</h1>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Enterprise Suite</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {modules.map((module) => {
          const active = isModuleActive(module);
          const expanded = expandedModules[module.id] ?? false;
          const Icon = module.icon;
          return (
            <div key={module.id} className="space-y-1">
              <button
                onClick={() => toggleModule(module.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  active ? "text-primary bg-primary/10 dark:bg-primary/20" : "text-gray-700 dark:text-gray-300"
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{module.label}</span>
                </span>
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {expanded && (
                <div className="ml-8 space-y-1">
                  {module.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "block px-3 py-2 rounded-lg text-sm transition",
                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                        location.pathname === item.path
                          ? "text-primary bg-primary/10 font-medium"
                          : "text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
