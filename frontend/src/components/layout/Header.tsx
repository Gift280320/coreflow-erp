import { useAuth } from '../../contexts/AuthContext';
import { Search, Bell, User, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';

export default function Header() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(false);

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 flex items-center justify-between">
      <div className="flex items-center flex-1">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setDark(!dark)}>
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm">{user?.firstName} {user?.lastName}</span>
          <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
        </div>
      </div>
    </header>
  );
}
