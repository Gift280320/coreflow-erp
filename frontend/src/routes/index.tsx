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
import Login from '../components/auth/Login';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
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
          { path: '/budgets', element: <Budgets /> },
                            ],
      },
    ],
  },
]);



















