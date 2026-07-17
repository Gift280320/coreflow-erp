import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 px-6 h-16 flex items-center justify-between bg-white dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">CoreFlow ERP</h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>
        <NotificationBell />
      </div>
    </header>
  );
}
