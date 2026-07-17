import { useAuth } from '../../contexts/AuthContext';
import { Users, DollarSign, TrendingUp, ShoppingBag } from 'lucide-react';

export default function SalesDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sales Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.firstName}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <Users className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">156</p>
          <p className="text-sm text-gray-500">Active Customers</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <DollarSign className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold">KSh 450K</p>
          <p className="text-sm text-gray-500">Monthly Sales</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <TrendingUp className="w-6 h-6 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">12%</p>
          <p className="text-sm text-gray-500">Growth Rate</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <ShoppingBag className="w-6 h-6 text-orange-500 mb-2" />
          <p className="text-2xl font-bold">34</p>
          <p className="text-sm text-gray-500">Pending Orders</p>
        </div>
      </div>
    </div>
  );
}