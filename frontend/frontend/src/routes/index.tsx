// Add imports for role dashboards
import HRDashboard from '../pages/dashboards/HRDashboard';
import AccountantDashboard from '../pages/dashboards/AccountantDashboard';
import InventoryDashboard from '../pages/dashboards/InventoryDashboard';
import ProcurementDashboard from '../pages/dashboards/ProcurementDashboard';
import SalesDashboard from '../pages/dashboards/SalesDashboard';

// Replace the dashboard route with:
{ 
  path: '/', 
  element: <Dashboard />,  // Admin dashboard for Super Admin & Admin
},
{ 
  path: '/dashboard/hr', 
  element: <RoleGuard allowedRoles={[ROLES.HR_MANAGER]}><HRDashboard /></RoleGuard> 
},
{ 
  path: '/dashboard/accountant', 
  element: <RoleGuard allowedRoles={[ROLES.ACCOUNTANT]}><AccountantDashboard /></RoleGuard> 
},
{ 
  path: '/dashboard/inventory', 
  element: <RoleGuard allowedRoles={[ROLES.INVENTORY_MANAGER]}><InventoryDashboard /></RoleGuard> 
},
{ 
  path: '/dashboard/procurement', 
  element: <RoleGuard allowedRoles={[ROLES.PROCUREMENT_OFFICER]}><ProcurementDashboard /></RoleGuard> 
},
{ 
  path: '/dashboard/sales', 
  element: <RoleGuard allowedRoles={[ROLES.SALES_REP]}><SalesDashboard /></RoleGuard> 
},