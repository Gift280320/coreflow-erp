#!/bin/bash
set -e

echo "🚀 Setting up CoreFlow ERP RBAC System..."

# ============================================
# 1. CREATE USERS MANAGEMENT PAGE
# ============================================
echo "📄 Creating Users Management page..."
mkdir -p frontend/src/pages/Admin

cat > frontend/src/pages/Admin/Users.tsx << 'EOF'
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../lib/axios';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent } from '../../components/ui/card';

export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '', roleId: '', departmentId: '', isActive: true });
  const [error, setError] = useState('');

  const isAdmin = currentUser?.role?.name === 'SUPER_ADMIN' || currentUser?.role?.name === 'ADMIN';

  useEffect(() => { if (!isAdmin) return; fetchData(); }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes, deptsRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/roles'),
        axios.get('/api/departments'),
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setDepartments(deptsRes.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...formData, departmentId: formData.departmentId || null };
      if (editingUser) {
        await axios.put(`/api/users/${editingUser.id}`, payload);
      } else {
        await axios.post('/api/users', payload);
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) { setError(error.response?.data?.error || 'Failed to save user'); }
  };

  if (!isAdmin) return <div className="p-6 text-center"><Shield className="w-12 h-12 mx-auto text-gray-400 mb-3" /><h2 className="text-xl font-semibold">Access Denied</h2></div>;
  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">User Management</h1><p className="text-sm text-gray-500">Manage users, roles, and departments</p></div>
        <Button onClick={() => { setEditingUser(null); setFormData({ email: '', password: '', firstName: '', lastName: '', roleId: '', departmentId: '', isActive: true }); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell><span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{user.role?.name || 'No Role'}</span></TableCell>
                <TableCell>{user.department?.name || '-'}</TableCell>
                <TableCell><span className={`px-2 py-1 text-xs rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></TableCell>
                <TableCell>
                  <button onClick={() => { setEditingUser(user); setFormData({ email: user.email, password: '', firstName: user.firstName || '', lastName: user.lastName || '', roleId: user.role?.id || '', departmentId: user.department?.id || '', isActive: user.isActive }); setIsDialogOpen(true); }} className="p-1 hover:bg-gray-100 rounded"><Pencil className="w-4 h-4" /></button>
                  <button onClick={async () => { if (confirm('Delete this user?')) { await axios.delete(`/api/users/${user.id}`); fetchData(); } }} className="p-1 hover:bg-gray-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First Name</Label><Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required /></div>
              <div><Label>Last Name</Label><Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
            {!editingUser && <div><Label>Password</Label><Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required /></div>}
            <div><Label>Role</Label>
              <select value={formData.roleId} onChange={(e) => setFormData({...formData, roleId: e.target.value})} className="w-full border rounded-md px-3 py-2" required>
                <option value="">Select a role</option>
                {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </div>
            <div><Label>Department</Label>
              <select value={formData.departmentId} onChange={(e) => setFormData({...formData, departmentId: e.target.value})} className="w-full border rounded-md px-3 py-2">
                <option value="">None</option>
                {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Label>Active</Label>
              <button type="button" onClick={() => setFormData({...formData, isActive: !formData.isActive})} className={`w-12 h-6 rounded-full transition ${formData.isActive ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2"><button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">{editingUser ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
EOF

# ============================================
# 2. UPDATE ROUTES
# ============================================
echo "📄 Updating routes..."
cat > frontend/src/routes/index.tsx << 'EOF'
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Departments from '../pages/Departments';
import Employees from '../pages/Employees';
import LeaveTypes from '../pages/LeaveTypes';
import LeaveRequests from '../pages/LeaveRequests';
import Suppliers from '../pages/Suppliers';
import PurchaseRequests from '../pages/PurchaseRequests';
import PurchaseOrders from '../pages/PurchaseOrders';
import Products from '../pages/Products';
import Warehouses from '../pages/Warehouses';
import Stock from '../pages/Stock';
import Customers from '../pages/Customers';
import Invoices from '../pages/Invoices';
import Payments from '../pages/Payments';
import Accounts from '../pages/Accounts';
import Expenses from '../pages/Expenses';
import Budgets from '../pages/Budgets';
import Assets from '../pages/Assets';
import Reports from '../pages/Reports';
import Projects from '../pages/Projects';
import Settings from '../pages/Settings';
import UsersManagement from '../pages/Admin/Users';
import Login from '../pages/Login';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/', element: <ProtectedRoute />, children: [{ element: <MainLayout />, children: [
    { index: true, element: <Dashboard /> },
    { path: '/users', element: <Users /> },
    { path: '/departments', element: <Departments /> },
    { path: '/employees', element: <Employees /> },
    { path: '/leave-types', element: <LeaveTypes /> },
    { path: '/leave-requests', element: <LeaveRequests /> },
    { path: '/suppliers', element: <Suppliers /> },
    { path: '/purchase-requests', element: <PurchaseRequests /> },
    { path: '/purchase-orders', element: <PurchaseOrders /> },
    { path: '/products', element: <Products /> },
    { path: '/warehouses', element: <Warehouses /> },
    { path: '/stock', element: <Stock /> },
    { path: '/customers', element: <Customers /> },
    { path: '/invoices', element: <Invoices /> },
    { path: '/payments', element: <Payments /> },
    { path: '/accounts', element: <Accounts /> },
    { path: '/expenses', element: <Expenses /> },
    { path: '/budgets', element: <Budgets /> },
    { path: '/assets', element: <Assets /> },
    { path: '/reports', element: <Reports /> },
    { path: '/projects', element: <Projects /> },
    { path: '/settings', element: <Settings /> },
    { path: '/admin/users', element: <UsersManagement /> },
  ]}]},
]);
EOF

# ============================================
# 3. UPDATE SIDEBAR
# ============================================
echo "📄 Updating Sidebar..."
cat > frontend/src/components/layout/Sidebar.tsx << 'EOF'
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Calendar, Package, ShoppingCart, Warehouse, DollarSign, FolderKanban, Briefcase, Settings, ChevronDown, ChevronRight, LogOut, BarChart3, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const modules = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, items: [{ path: '/', label: 'Dashboard' }] },
  { id: 'people', label: 'People & HR', icon: Users, items: [{ path: '/employees', label: 'Employees' }, { path: '/departments', label: 'Departments' }, { path: '/leave-types', label: 'Leave Types' }, { path: '/leave-requests', label: 'Leave Requests' }] },
  { id: 'operations', label: 'Operations', icon: Package, items: [{ path: '/products', label: 'Products' }, { path: '/warehouses', label: 'Warehouses' }, { path: '/stock', label: 'Stock' }, { path: '/suppliers', label: 'Suppliers' }, { path: '/purchase-requests', label: 'Purchase Requests' }, { path: '/purchase-orders', label: 'Purchase Orders' }] },
  { id: 'finance', label: 'Finance', icon: DollarSign, items: [{ path: '/accounts', label: 'Accounts' }, { path: '/invoices', label: 'Invoices' }, { path: '/payments', label: 'Payments' }, { path: '/expenses', label: 'Expenses' }, { path: '/budgets', label: 'Budgets' }] },
  { id: 'customers', label: 'Customers', icon: Briefcase, items: [{ path: '/customers', label: 'Customers' }] },
  { id: 'projects', label: 'Projects & Work', icon: FolderKanban, items: [{ path: '/projects', label: 'Projects' }] },
  { id: 'management', label: 'Management', icon: BarChart3, items: [{ path: '/assets', label: 'Assets' }, { path: '/reports', label: 'Reports' }] },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [expandedModules, setExpandedModules] = useState(() => {
    const init = {};
    modules.forEach((module) => { if (module.items.some((item) => location.pathname === item.path)) init[module.id] = true; });
    if (Object.keys(init).length === 0) init['overview'] = true;
    return init;
  });
  const isAdmin = user?.role?.name === 'SUPER_ADMIN' || user?.role?.name === 'ADMIN';
  const adminModule = { id: 'admin', label: 'Administration', icon: Shield, items: [...(isAdmin ? [{ path: '/admin/users', label: 'User Management' }] : []), { path: '/settings', label: 'Settings' }] };
  const allModules = [...modules, adminModule];
  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-y-auto">
      <div className="flex items-center gap-2 px-4 h-16 border-b border-gray-200 dark:border-gray-800">
        <span className="text-2xl font-bold text-primary">CF</span>
        <div><h1 className="text-sm font-bold text-gray-900 dark:text-white">CoreFlow</h1><p className="text-[10px] text-gray-500 dark:text-gray-400">Enterprise Suite</p></div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {allModules.map((module) => {
          const active = module.items.some((item) => location.pathname === item.path);
          const expanded = expandedModules[module.id] ?? false;
          const Icon = module.icon;
          return (<div key={module.id} className="space-y-1">
            <button onClick={() => setExpandedModules((prev) => ({ ...prev, [module.id]: !prev[module.id] }))} className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800", active ? "text-primary bg-primary/10 dark:bg-primary/20" : "text-gray-700 dark:text-gray-300")}>
              <span className="flex items-center gap-3"><Icon className="w-4 h-4" /><span>{module.label}</span></span>
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expanded && <div className="ml-8 space-y-1">{module.items.map((item) => (<Link key={item.path} to={item.path} className={cn("block px-3 py-2 rounded-lg text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800", location.pathname === item.path ? "text-primary bg-primary/10 font-medium" : "text-gray-600 dark:text-gray-400")}>{item.label}</Link>))}</div>}
          </div>);
        })}
      </nav>
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <button onClick={() => logout()} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"><LogOut className="w-4 h-4" /><span>Sign Out</span></button>
      </div>
    </aside>
  );
}
EOF

# ============================================
# 4. UPDATE DASHBOARD
# ============================================
echo "📄 Updating Dashboard..."
cat > frontend/src/pages/Dashboard.tsx << 'EOF'
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../lib/axios';
import { TrendingUp, TrendingDown, Users, Package, DollarSign, ShoppingBag, AlertCircle, RefreshCw, Bell, Briefcase, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function cn(...classes) { return classes.filter(Boolean).join(' '); }

export default function Dashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isAdmin = user?.role?.name === 'SUPER_ADMIN' || user?.role?.name === 'ADMIN';
  const isAccountant = user?.role?.name === 'ACCOUNTANT';
  const isHR = user?.role?.name === 'HR_MANAGER';
  const isInventory = user?.role?.name === 'INVENTORY_MANAGER';
  const isProcurement = user?.role?.name === 'PROCUREMENT_OFFICER';
  const isSales = user?.role?.name === 'SALES_REP';

  const fetchDashboard = async () => {
    setLoading(true);
    try { const res = await axios.get(`/api/dashboard/overview?period=${period}`); setData(res.data); } 
    catch (error) { console.error('Dashboard error:', error); } 
    finally { setLoading(false); }
  };
  useEffect(() => { fetchDashboard(); }, [period]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  const { kpis, chartData, inventoryAlerts } = data || {};
  const getKPIs = () => {
    if (isAdmin || isAccountant) return [{ label: 'Revenue', value: `KSh ${kpis?.revenue?.toLocaleString() || 0}`, change: 12.5, trend: 'up', icon: DollarSign }, { label: 'Expenses', value: `KSh ${kpis?.expenses?.toLocaleString() || 0}`, change: 4.2, trend: 'down', icon: ShoppingBag }, { label: 'Profit', value: `KSh ${kpis?.profit?.toLocaleString() || 0}`, change: 18.7, trend: 'up', icon: TrendingUp }, { label: 'Employees', value: kpis?.activeUsers?.toLocaleString() || 0, change: 8.3, trend: 'up', icon: Users }];
    if (isHR) return [{ label: 'Employees', value: kpis?.activeUsers?.toLocaleString() || 0, change: 8.3, trend: 'up', icon: Users }];
    if (isInventory) return [{ label: 'Low Stock', value: inventoryAlerts?.[0]?.count || 0, change: 5.2, trend: 'down', icon: AlertCircle }, { label: 'Products', value: '8,762', change: 2.4, trend: 'up', icon: Package }];
    if (isProcurement) return [{ label: 'Pending Orders', value: inventoryAlerts?.[2]?.count || 0, change: 6.7, trend: 'up', icon: ShoppingBag }];
    if (isSales) return [{ label: 'Revenue', value: `KSh ${kpis?.revenue?.toLocaleString() || 0}`, change: 15.3, trend: 'up', icon: DollarSign }];
    return [];
  };
  const visibleKPIs = getKPIs();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">{new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {user?.firstName || 'Admin'} 👋</h1>
        <p className="text-sm text-gray-500">{user?.role?.name || 'User'} · Dashboard</p></div>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
          {['7d','30d','90d','1y'].map((p) => <button key={p} onClick={() => setPeriod(p)} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition", period === p ? "bg-white dark:bg-gray-700 shadow-sm" : "hover:bg-white/50")}>{p.toUpperCase()}</button>)}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleKPIs.map((kpi, idx) => { const Icon = kpi.icon; return (
          <div key={idx} className="bg-white dark:bg-gray-900/80 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between"><div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Icon className="w-4 h-4" /></div>
            <span className={cn("text-xs font-medium", kpi.trend === 'up' ? "text-green-500" : "text-red-500")}>{kpi.trend === 'up' ? '↑' : '↓'} {kpi.change}%</span></div>
            <p className="text-2xl font-bold mt-2">{kpi.value}</p><p className="text-sm text-gray-500">{kpi.label}</p>
          </div>
        )})}
      </div>
      {(isAdmin || isAccountant) && (
        <div className="bg-white dark:bg-gray-900/80 p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">Financial Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData || []}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="period" /><YAxis />
              <Tooltip formatter={(v) => `KSh ${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
EOF

echo ""
echo "✅ RBAC setup complete!"
echo ""
echo "🔑 Login with:"
echo "   superadmin@coreflow.com / Admin123!"
echo "   admin@coreflow.com / Admin123!"
echo "   accountant@coreflow.com / Account123!"
echo "   hr@coreflow.com / HR123!"
echo "   inventory@coreflow.com / Inventory123!"
echo "   procurement@coreflow.com / Procure123!"
echo "   sales@coreflow.com / Sales123!"
echo ""
echo "🚀 Restart your frontend: cd frontend && npm run dev"