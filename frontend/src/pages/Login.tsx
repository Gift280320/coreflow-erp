import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Moon, Sun, Building2, Users, Package, ShoppingCart, BarChart3, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';

const features = [
  { icon: Building2, label: 'HR & Payroll' },
  { icon: Users, label: 'CRM' },
  { icon: Package, label: 'Inventory' },
  { icon: ShoppingCart, label: 'Procurement' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: FileText, label: 'Finance' },
];

export default function Login() {
  const [email, setEmail] = useState('admin@coreflow.com');
  const [password, setPassword] = useState('Admin123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // System theme detection
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Listen for system theme changes
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/10 dark:bg-blue-800/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full flex flex-col lg:flex-row">
        {/* LEFT PANEL – Branding (fixed dark) */}
        <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900 p-12 flex-col justify-between min-h-screen">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <svg className="absolute top-10 right-10 w-32 h-32 text-white/5" viewBox="0 0 100 100">
              <polygon points="50,0 100,50 50,100 0,50" fill="currentColor" />
            </svg>
            <svg className="absolute bottom-20 left-20 w-24 h-24 text-white/5" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" fill="currentColor" />
            </svg>
            <svg className="absolute top-1/3 right-20 w-16 h-16 text-white/5" viewBox="0 0 100 100">
              <rect x="10" y="10" width="80" height="80" fill="currentColor" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <span className="text-3xl font-bold text-white">CF</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">CoreFlow ERP</h1>
                <p className="text-blue-200 text-sm font-light">Enterprise Platform</p>
              </div>
            </div>
            <div className="mt-12 max-w-md">
              <h2 className="text-4xl font-bold text-white leading-tight">
                One platform.<br />Every business operation.
              </h2>
              <p className="mt-4 text-blue-100/80 text-lg font-light">
                HR, Finance, Inventory, Procurement, Projects, and more.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-2 text-blue-100/90 hover:text-white hover:scale-105 transition cursor-default"
                whileHover={{ scale: 1.05 }}
              >
                <feature.icon className="w-4 h-4 text-blue-300" />
                <span className="text-xs font-medium">{feature.label}</span>
              </motion.div>
            ))}
          </div>

          <div className="relative z-10 text-blue-200/60 text-xs">
            © 2026 CoreFlow ERP. All rights reserved.
          </div>
        </div>

        {/* RIGHT PANEL – Login Card (theme-aware) */}
        <motion.div
          className="flex-1 flex items-center justify-center p-6 lg:p-12 min-h-screen"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            variants={itemVariants}
            className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/30 transition-all"
          >
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-block bg-primary/10 p-3 rounded-2xl">
                <span className="text-2xl font-bold text-primary">CoreFlow</span>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-gray-800 dark:text-white">
                Enterprise ERP
              </h2>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Sign in to continue to CoreFlow ERP
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@coreflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 transition pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm cursor-pointer text-gray-700 dark:text-gray-300">
                    Remember me
                  </Label>
                </div>
                <a href="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                  Forgot password?
                </a>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
                  <span>⚠</span> {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-primary transition-all shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Secured with 256‑bit encryption • © 2026 CoreFlow ERP
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}