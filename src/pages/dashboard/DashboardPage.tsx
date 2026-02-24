import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getOrders, getMedicines, getNotifications, saveNotifications } from '@/lib/storage';
import { Notification as AppNotification } from '@/types';
import { DashboardStats } from '@/types';
import { TrendingUp, Package, AlertTriangle, DollarSign, ShoppingBag, CheckCircle, Clock, Bell } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    monthlySales: 0,
    totalOrders: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    netProfit: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(getNotifications().slice(0, 5));

  useEffect(() => {
    const orders = getOrders();
    const medicines = getMedicines();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    const monthOrders = orders.filter(o => new Date(o.createdAt) >= thisMonth);

    setStats({
      todaySales: todayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      monthlySales: monthOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      totalOrders: orders.length,
      lowStockItems: medicines.filter(m => m.quantity > 0 && m.quantity < m.minStockLevel).length,
      outOfStockItems: medicines.filter(m => m.quantity === 0).length,
      netProfit: monthOrders.reduce((sum, o) => sum + o.totalAmount * 0.2, 0), // 20% profit margin
      pendingOrders: orders.filter(o => o.orderStatus === 'pending').length,
      completedOrders: orders.filter(o => o.orderStatus === 'completed').length
    });
  }, []);

  const markAsRead = (id: string) => {
    const allNotifications = getNotifications();
    const notification = allNotifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      saveNotifications(allNotifications);
      setNotifications(allNotifications.slice(0, 5));
    }
  };

  const statsCards = [
    {
      title: 'مبيعات اليوم',
      value: `${stats.todaySales.toFixed(0)} ج.م`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'مبيعات الشهر',
      value: `${stats.monthlySales.toFixed(0)} ج.م`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'إجمالي الطلبات',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'طلبات معلقة',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'طلبات مكتملة',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'مخزون منخفض',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'نفذ المخزون',
      value: stats.outOfStockItems,
      icon: Package,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'صافي الربح (تقديري)',
      value: `${stats.netProfit.toFixed(0)} ج.م`,
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">مرحباً محمد أحمد</h1>
          <p className="text-xl text-gray-600">مالك صيدلية الشفاء الحديثة</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Bell className="h-6 w-6" />
              التنبيهات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                    } cursor-pointer hover:shadow-md transition-shadow`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">{notification.title}</h4>
                        <p className="text-gray-700">{notification.message}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleString('ar-EG')}
                        </p>
                      </div>
                      {!notification.read && (
                        <Badge variant="default">جديد</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">لا توجد تنبيهات</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Alerts */}
        {(stats.lowStockItems > 0 || stats.outOfStockItems > 0) && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-xl text-orange-900">تنبيهات المخزون</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.outOfStockItems > 0 && (
                <p className="text-red-700 font-medium">
                  ⚠️ {stats.outOfStockItems} منتج نفذت كميته
                </p>
              )}
              {stats.lowStockItems > 0 && (
                <p className="text-orange-700 font-medium">
                  📦 {stats.lowStockItems} منتج كميته منخفضة
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
