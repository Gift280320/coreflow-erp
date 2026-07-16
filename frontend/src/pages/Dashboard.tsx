import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../lib/axios';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  DollarSign,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Dashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/dashboard/overview?period=${period}`);
        setData(res.data);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [period]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, chartData, recentActivity, inventoryAlerts, projectProgress } = data || {};

  const kpiCards = kpis ? [
    { label: 'Total Revenue', value: `KSh ${kpis.revenue.toLocaleString()}`, change: 12.5, trend: 'up' },
    { label: 'Expenses', value: `KSh ${kpis.expenses.toLocaleString()}`, change: 4.2, trend: 'down' },
    { label: 'Net Profit', value: `KSh ${kpis.profit.toLocaleString()}`, change: 18.7, trend: 'up' },
    { label: 'Active Users', value: kpis.activeUsers.toLocaleString(), change: 8.3, trend: 'up' },
  ] : [];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting}, {user?.firstName || 'Admin'} 
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Here's what's happening across your organization today.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['7d', '30d', '90d', '1y'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition",
                  period === p
                    ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                    : "hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-gray-900/80 backdrop-blur-xl p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.label}</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</span>
              <span className={cn(
                "text-xs font-medium flex items-center gap-1",
                kpi.trend === 'up' ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
              )}>
                {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}% vs last month
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">Revenue</button>
              <button className="text-xs px-3 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Expenses</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
              <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                formatter={(value: number) => `KSh ${value.toLocaleString()}`}
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {(recentActivity || []).map((activity: any) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="mt-0.5 text-blue-500 dark:text-blue-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{activity.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(activity.time).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-primary hover:underline flex items-center gap-1">
            View all activity <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Inventory Alerts</h3>
            <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full">Critical</span>
          </div>
          <div className="space-y-3">
            {(inventoryAlerts || []).map((alert: any) => (
              <div key={alert.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{alert.name}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{alert.count}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-primary hover:underline flex items-center gap-1">
            View Inventory <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Project Progress</h3>
          <div className="space-y-4">
            {(projectProgress || []).map((project: any) => (
              <div key={project.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{project.name}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{project.progress}%</span>
                </div>
                <div className="mt-1 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-primary hover:underline flex items-center gap-1">
            View Projects <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
