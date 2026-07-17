import { useAuth } from '../../contexts/AuthContext';
import { Users, Calendar, Clock, FileText } from 'lucide-react';

export default function HRDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">HR Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.firstName}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <Users className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">124</p>
          <p className="text-sm text-gray-500">Total Employees</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <Calendar className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold">8</p>
          <p className="text-sm text-gray-500">Leave Requests</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <Clock className="w-6 h-6 text-orange-500 mb-2" />
          <p className="text-2xl font-bold">12</p>
          <p className="text-sm text-gray-500">Pending Approvals</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <FileText className="w-6 h-6 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">3</p>
          <p className="text-sm text-gray-500">New Hires</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="font-semibold mb-4">Recent Leave Requests</h2>
        <p className="text-gray-500">Leave requests will appear here</p>
      </div>
    </div>
  );
}