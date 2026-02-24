import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  total_amount: number;
  notes?: string;
  created_at: string;
}

interface OrderItem {
  medicine_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.order_status === statusFilter));
    }
  }, [statusFilter, orders]);

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setOrders(data);
      setFilteredOrders(data);
    }
  };

  const loadOrderItems = async (orderId: string) => {
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    
    if (data) {
      setOrderItems(data);
    }
  };

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order);
    await loadOrderItems(order.id);
    setDetailsOpen(true);
  };

  const handleConfirmPayment = async (orderId: string) => {
    try {
      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          order_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Get order items to deduct from inventory
      const { data: items } = await supabase
        .from('order_items')
        .select('medicine_id, quantity')
        .eq('order_id', orderId);

      if (items) {
        for (const item of items) {
          // Deduct from inventory
          const { data: medicine } = await supabase
            .from('medicines')
            .select('quantity')
            .eq('id', item.medicine_id)
            .single();

          if (medicine) {
            await supabase
              .from('medicines')
              .update({ quantity: medicine.quantity - item.quantity })
              .eq('id', item.medicine_id);
          }
        }
      }

      // Add notification
      await supabase
        .from('notifications')
        .insert({
          title: 'طلب مكتمل',
          message: `تم إتمام الطلب ${orderId.substring(0, 8).toUpperCase()} بنجاح`,
          type: 'success'
        });

      loadOrders();
      setDetailsOpen(false);
      toast.success('تم تأكيد الطلب', {
        description: 'تم خصم الكمية من المخزون تلقائياً'
      });
    } catch (error: any) {
      toast.error('حدث خطأ', { description: error.message });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;

    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'cancelled',
        order_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      toast.error('حدث خطأ', { description: error.message });
      return;
    }

    loadOrders();
    setDetailsOpen(false);
    toast.success('تم إلغاء الطلب');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />معلق</Badge>;
      case 'processing':
        return <Badge className="bg-blue-600 gap-1">قيد المعالجة</Badge>;
      case 'completed':
        return <Badge className="bg-green-600 gap-1"><CheckCircle className="h-3 w-3" />مكتمل</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />ملغي</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">في انتظار الدفع</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">مدفوع</Badge>;
      case 'failed':
        return <Badge variant="destructive">فشل</Badge>;
      case 'cancelled':
        return <Badge variant="outline">ملغي</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">الطلبات</h1>
          <div className="text-lg text-gray-600">
            إجمالي الطلبات: <span className="font-bold text-primary">{orders.length}</span>
          </div>
        </div>

        {/* Filter */}
        <div className="max-w-xs">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="حالة الطلب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الطلبات</SelectItem>
              <SelectItem value="pending">معلق</SelectItem>
              <SelectItem value="processing">قيد المعالجة</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-5 gap-6 items-center">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">رقم الطلب</p>
                      <p className="font-bold text-gray-900">{order.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">العميل</p>
                      <p className="font-bold text-gray-900">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{order.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">التاريخ</p>
                      <p className="font-bold text-gray-900">
                        {new Date(order.created_at).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">المبلغ</p>
                      <p className="text-2xl font-bold text-primary">{order.total_amount} ج.م</p>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(order.order_status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(order)}
                        className="gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        التفاصيل
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">لا توجد طلبات</p>
          </div>
        )}

        {/* Order Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">تفاصيل الطلب</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">رقم الطلب</p>
                    <p className="font-bold text-gray-900">{selectedOrder.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">التاريخ</p>
                    <p className="font-bold text-gray-900">
                      {new Date(selectedOrder.created_at).toLocaleString('ar-EG')}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-3">معلومات العميل</h3>
                  <div className="space-y-2">
                    <p><strong>الاسم:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>البريد:</strong> {selectedOrder.customer_email}</p>
                    <p><strong>الهاتف:</strong> {selectedOrder.customer_phone}</p>
                    <p><strong>العنوان:</strong> {selectedOrder.customer_address}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">المنتجات</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.medicine_name} × {item.quantity}
                        </span>
                        <span className="font-bold text-gray-900">{item.subtotal} ج.م</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>الإجمالي:</span>
                        <span className="text-primary">{selectedOrder.total_amount} ج.م</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">طريقة الدفع</p>
                    <Badge variant="secondary">{selectedOrder.payment_method}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">حالة الدفع</p>
                    {getPaymentStatusBadge(selectedOrder.payment_status)}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ملاحظات:</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedOrder.notes}</p>
                  </div>
                )}

                {selectedOrder.order_status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleConfirmPayment(selectedOrder.id)}
                      className="flex-1 gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      تأكيد الدفع وإتمام الطلب
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-destructive hover:text-destructive gap-2"
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                    >
                      <XCircle className="h-4 w-4" />
                      إلغاء الطلب
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
