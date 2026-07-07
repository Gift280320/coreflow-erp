import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Departments from '../pages/Departments';
import Employees from '../pages/Employees';
import LeaveTypes from '../pages/LeaveTypes';
import LeaveRequests from '../pages/LeaveRequests';
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
        ],
      },
    ],
  },
]);


