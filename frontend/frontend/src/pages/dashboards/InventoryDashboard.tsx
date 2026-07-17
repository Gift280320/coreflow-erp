import { useAuth } from '../../contexts/AuthContext';
import { Package, Warehouse, AlertCircle, ShoppingCart } from 'lucide-react';

export default function InventoryDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.firstName}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <Package className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">8,762</p>
          <p className="text-sm text-gray-500">Total Products</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <Warehouse className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold">4</p>
          <p className="text-sm text-gray-500">Warehouses</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <AlertCircle className="w-6 h-6 text-orange-500 mb-2" />
          <p className="text-2xl font-bold">12</p>
          <p className="text-sm text-gray-500">Low Stock Items</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <ShoppingCart className="w-6 h-6 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">8</p>
          <p className="text-sm text-gray-500">Pending Orders</p>
        </div>
      </div>
    </div>
  );
}