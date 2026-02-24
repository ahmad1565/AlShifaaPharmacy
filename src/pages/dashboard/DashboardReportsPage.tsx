import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getOrders, getMedicines } from '@/lib/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, Package, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardReportsPage() {
  const [period, setPeriod] = useState('month');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topMedicines, setTopMedicines] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrder: 0,
    lowStockCount: 0
  });

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    generateReports();
  }, [period]);

  const generateReports = () => {
    const orders = getOrders();
    const medicines = getMedicines();

    // Filter orders by period
    const now = new Date();
    let startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const filteredOrders = orders.filter(o => new Date(o.createdAt) >= startDate);

    // Sales stats
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = filteredOrders.length;
    const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setStats({
      totalRevenue,
      totalOrders,
      averageOrder,
      lowStockCount: medicines.filter(m => m.quantity < m.minStockLevel).length
    });

    // Sales by day/month
    const salesByDate: { [key: string]: number } = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt);
      let key: string;
      
      if (period === 'week') {
        key = date.toLocaleDateString('ar-EG', { weekday: 'short' });
      } else if (period === 'month') {
        key = date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
      } else {
        key = date.toLocaleDateString('ar-EG', { month: 'short' });
      }

      salesByDate[key] = (salesByDate[key] || 0) + order.totalAmount;
    });

    const salesChartData = Object.entries(salesByDate).map(([date, amount]) => ({
      date,
      amount: Math.round(amount)
    }));
    setSalesData(salesChartData);

    // Top selling medicines
    const medicineSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!medicineSales[item.medicineId]) {
          medicineSales[item.medicineId] = {
            name: item.medicineName,
            quantity: 0,
            revenue: 0
          };
        }
        medicineSales[item.medicineId].quantity += item.quantity;
        medicineSales[item.medicineId].revenue += item.subtotal;
      });
    });

    const topMeds = Object.values(medicineSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(med => ({
        name: med.name,
        value: Math.round(med.revenue)
      }));
    setTopMedicines(topMeds);

    // Payment methods distribution
    const paymentDist: { [key: string]: number } = {};
    filteredOrders.forEach(order => {
      paymentDist[order.paymentMethod] = (paymentDist[order.paymentMethod] || 0) + 1;
    });

    const paymentData = Object.entries(paymentDist).map(([method, count]) => ({
      name: method,
      value: count
    }));
    setPaymentMethods(paymentData);
  };

  const exportToPDF = () => {
    toast.success('جاري التصدير...', {
      description: 'سيتم تصدير التقرير إلى PDF'
    });
  };

  const exportToExcel = () => {
    toast.success('جاري التصدير...', {
      description: 'سيتم تصدير التقرير إلى Excel'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">التقارير والإحصائيات</h1>
          <div className="flex gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">آخر أسبوع</SelectItem>
                <SelectItem value="month">آخر شهر</SelectItem>
                <SelectItem value="year">آخر سنة</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportToPDF} className="gap-2">
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" onClick={exportToExcel} className="gap-2">
              <Download className="h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(0)} ج.م</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">عدد الطلبات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">متوسط الطلب</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageOrder.toFixed(0)} ج.م</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">مخزون منخفض</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowStockCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">مبيعات الفترة</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#22c55e" name="المبيعات (ج.م)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Medicines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">الأدوية الأكثر مبيعاً</CardTitle>
            </CardHeader>
            <CardContent>
              {topMedicines.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={topMedicines}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {topMedicines.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {topMedicines.map((med, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm text-gray-700">{med.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{med.value} ج.م</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500 py-8">لا توجد بيانات</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">طرق الدفع</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentMethods.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={paymentMethods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {paymentMethods.map((method, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm text-gray-700">{method.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{method.value} طلب</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500 py-8">لا توجد بيانات</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
