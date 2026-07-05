import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Package, DollarSign, ShoppingCart } from 'lucide-react';

const stats = [
  { title: 'Total Users', value: '1,234', icon: Users, color: 'bg-blue-500' },
  { title: 'Inventory Items', value: '8,762', icon: Package, color: 'bg-green-500' },
  { title: 'Revenue', value: '$45,678', icon: DollarSign, color: 'bg-purple-500' },
  { title: 'Orders', value: '312', icon: ShoppingCart, color: 'bg-orange-500' },
];

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.color} text-white`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
