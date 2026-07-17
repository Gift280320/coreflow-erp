import { useAuth } from '../../contexts/AuthContext';
import { ShoppingCart, Package, Truck, AlertCircle } from 'lucide-react';

export default function ProcurementDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Procurement Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.firstName}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <ShoppingCart className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">24</p>
          <p className="text-sm text-gray-500">Active Suppliers</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <Package className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold">12</p>
          <p className="text-sm text-gray-500">Open Orders</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <Truck className="w-6 h-6 text-orange-500 mb-2" />
          <p className="text-2xl font-bold">8</p>
          <p className="text-sm text-gray-500">Pending Deliveries</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
          <p className="text-2xl font-bold">4</p>
          <p className="text-sm text-gray-500">Urgent Requests</p>
        </div>
      </div>
    </div>
  );
}