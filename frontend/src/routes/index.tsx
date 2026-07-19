import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
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
import RoleGuard from '../components/auth/RoleGuard';

const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  ACCOUNTANT: 'ACCOUNTANT',
  PROCUREMENT_OFFICER: 'PROCUREMENT_OFFICER',
  HR_MANAGER: 'HR_MANAGER',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  SALES_REP: 'SALES_REP',
};

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [{
      element: <MainLayout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: '/employees', element: <RoleGuard allowedRoles={[ROLES.HR_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}><Employees /></RoleGuard> },
        { path: '/departments', element: <RoleGuard allowedRoles={[ROLES.HR_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}><Departments /></RoleGuard> },
        { path: '/leave-types', element: <RoleGuard allowedRoles={[ROLES.HR_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}><LeaveTypes /></RoleGuard> },
        { path: '/leave-requests', element: <RoleGuard allowedRoles={[ROLES.HR_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}><LeaveRequests /></RoleGuard> },
        { path: '/products', element: <RoleGuard allowedRoles={[ROLES.INVENTORY_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}><Products /></RoleGuard> },
        { path: '/warehouses', element: <RoleGuard allowedRoles={[ROLES.INVENTORY_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}><Warehouses /></RoleGuard> },
        { path: '/stock', element: <RoleGuard allowedRoles={[ROLES.INVENTORY_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}><Stock /></RoleGuard> },
        { path: '/suppliers', element: <RoleGuard allowedRoles={[ROLES.PROCUREMENT_OFFICER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}><Suppliers /></RoleGuard> },
        { path: '/purchase-requests', element: <RoleGuard allowedRoles={[ROLES.PROCUREMENT_OFFICER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}><PurchaseRequests /></RoleGuard> },
        { path: '/purchase-orders', element: <RoleGuard allowedRoles={[ROLES.PROCUREMENT_OFFICER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}><PurchaseOrders /></RoleGuard> },
        { path: '/accounts', element: <RoleGuard allowedRoles={[ROLES.ACCOUNTANT, ROLES.ADMIN, ROLES.SUPER_ADMIN]}><Accounts /></RoleGuard> },
        { path: '/invoices', element: <RoleGuard allowedRoles={[ROLES.ACCOUNTANT, ROLES.ADMIN, ROLES.SUPER_ADMIN]}><Invoices /></RoleGuard> },
        { path: '/payments', element: <RoleGuard allowedRoles={[ROLES.ACCOUNTANT, ROLES.ADMIN, ROLES.SUPER_ADMIN]}><Payments /></RoleGuard> },
        { path: '/expenses', element: <RoleGuard allowedRoles={[ROLES.ACCOUNTANT, ROLES.ADMIN, ROLES.SUPER_ADMIN]}><Expenses /></RoleGuard> },
        { path: '/budgets', element: <RoleGuard allowedRoles={[ROLES.ACCOUNTANT, ROLES.ADMIN, ROLES.SUPER_ADMIN]}><Budgets /></RoleGuard> },
        { path: '/customers', element: <RoleGuard allowedRoles={[ROLES.SALES_REP, ROLES.ADMIN, ROLES.SUPER_ADMIN]}><Customers /></RoleGuard> },
        { path: '/users', element: <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}><Users /></RoleGuard> },
        { path: '/projects', element: <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}><Projects /></RoleGuard> },
        { path: '/assets', element: <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}><Assets /></RoleGuard> },
        { path: '/reports', element: <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}><Reports /></RoleGuard> },
        { path: '/admin/users', element: <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}><UsersManagement /></RoleGuard> },
        { path: '/settings', element: <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}><Settings /></RoleGuard> },
      ],
    }],
  },
]);
