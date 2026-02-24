import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Truck, 
  ShoppingBag, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';
import { logout } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { path: '/dashboard/medicines', icon: Package, label: 'الأدوية' },
    { path: '/dashboard/customers', icon: Users, label: 'العملاء' },
    { path: '/dashboard/suppliers', icon: Truck, label: 'الموردين' },
    { path: '/dashboard/orders', icon: ShoppingBag, label: 'الطلبات' },
    { path: '/dashboard/reports', icon: BarChart3, label: 'التقارير' },
    { path: '/dashboard/settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">ش</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">صيدلية الشفاء</h1>
              <p className="text-xs text-gray-600">لوحة التحكم</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 mb-2 text-base ${
                    isActive ? '' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-destructive hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            تسجيل خروج
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
