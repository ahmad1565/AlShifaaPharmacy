import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Bell, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser, logout } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  useEffect(() => {
    const updateCounts = async () => {
      // Cart count from localStorage
      const cart = localStorage.getItem('pharmacy_cart');
      if (cart) {
        const cartData = JSON.parse(cart);
        setCartCount(cartData.reduce((sum: number, item: any) => sum + item.quantity, 0));
      }
      
      // Notifications count from database (owner only)
      if (user && user.role === 'owner') {
        const { data } = await supabase
          .from('notifications')
          .select('id')
          .eq('read', false);
        
        if (data) {
          setUnreadNotifications(data.length);
        }
      }
    };

    updateCounts();
    const interval = setInterval(updateCounts, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">ش</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">صيدلية الشفاء</h1>
              <p className="text-xs text-gray-600">الحديثة</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-base font-medium text-gray-700 hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <Link to="/medicines" className="text-base font-medium text-gray-700 hover:text-primary transition-colors">
              الأدوية
            </Link>
            <Link to="/about" className="text-base font-medium text-gray-700 hover:text-primary transition-colors">
              من نحن
            </Link>
            <Link to="/contact" className="text-base font-medium text-gray-700 hover:text-primary transition-colors">
              اتصل بنا
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user && user.role === 'owner' && (
              <Link to="/dashboard" className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {!loading && (
              user ? (
                <div className="flex items-center gap-2">
                  {user.role === 'owner' && (
                    <Link to="/dashboard">
                      <Button size="sm" className="font-medium">
                        لوحة التحكم
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" size="sm" onClick={handleLogout} className="font-medium gap-2">
                    <LogOut className="h-4 w-4" />
                    تسجيل خروج
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button size="sm" className="font-medium gap-2">
                    <User className="h-4 w-4" />
                    تسجيل دخول
                  </Button>
                </Link>
              )
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-3">
              <Link
                to="/"
                className="text-base font-medium text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                الرئيسية
              </Link>
              <Link
                to="/medicines"
                className="text-base font-medium text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                الأدوية
              </Link>
              <Link
                to="/about"
                className="text-base font-medium text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                من نحن
              </Link>
              <Link
                to="/contact"
                className="text-base font-medium text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                اتصل بنا
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
