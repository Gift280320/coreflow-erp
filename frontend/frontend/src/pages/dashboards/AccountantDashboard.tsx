import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, CreditCard, TrendingUp, TrendingDown, Receipt } from 'lucide-react';

export default function AccountantDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finance Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.firstName}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <DollarSign className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold">KSh 1.2M</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <TrendingUp className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">KSh 450K</p>
          <p className="text-sm text-gray-500">Net Profit</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <TrendingDown className="w-6 h-6 text-red-500 mb-2" />
          <p className="text-2xl font-bold">KSh 750K</p>
          <p className="text-sm text-gray-500">Total Expenses</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <CreditCard className="w-6 h-6 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">23</p>
          <p className="text-sm text-gray-500">Pending Invoices</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">Recent Transactions</h2>
          <p className="text-gray-500">Transactions will appear here</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">Budget Status</h2>
          <p className="text-gray-500">Budget info will appear here</p>
        </div>
      </div>
    </div>
  );
}