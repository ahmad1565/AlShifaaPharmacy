import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';
import { ShoppingBag, CreditCard } from 'lucide-react';

interface CartItem {
  medicine: {
    id: string;
    name_ar: string;
    name_en: string;
    price: number;
    quantity: number;
  };
  quantity: number;
}

interface PaymentGateway {
  id: string;
  name: string;
  type: string;
  account_name?: string;
  account_number?: string;
  payment_url?: string;
  instructions?: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    paymentMethod: ''
  });

  useEffect(() => {
    loadUser();
    loadCart();
    loadPaymentGateways();
  }, []);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData(prev => ({
        ...prev,
        name: currentUser.name,
        email: currentUser.email
      }));
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('pharmacy_cart');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      if (cartData.length === 0) {
        navigate('/cart');
      }
      setCart(cartData);
    } else {
      navigate('/cart');
    }
  };

  const loadPaymentGateways = async () => {
    const { data } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('enabled', true)
      .order('created_at');
    
    if (data) {
      setPaymentGateways(data);
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);
  };

  const handlePaymentMethodChange = (gatewayId: string) => {
    setFormData({ ...formData, paymentMethod: gatewayId });
    const gateway = paymentGateways.find(g => g.id === gatewayId);
    setSelectedGateway(gateway || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.paymentMethod) {
      toast.error('يرجى اختيار طريقة الدفع');
      return;
    }

    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Check stock availability
      for (const item of cart) {
        const { data: medicine } = await supabase
          .from('medicines')
          .select('quantity')
          .eq('id', item.medicine.id)
          .single();

        if (!medicine || medicine.quantity < item.quantity) {
          toast.error(`الكمية غير كافية من ${item.medicine.name_ar}`);
          setLoading(false);
          return;
        }
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_address: formData.address,
          payment_gateway_id: formData.paymentMethod,
          payment_method: selectedGateway?.name || 'غير محدد',
          payment_status: 'pending',
          order_status: 'pending',
          total_amount: getTotalPrice(),
          notes: formData.notes
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        medicine_id: item.medicine.id,
        medicine_name: item.medicine.name_ar,
        quantity: item.quantity,
        price: item.medicine.price,
        subtotal: item.medicine.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Add notification for owner
      await supabase
        .from('notifications')
        .insert({
          title: 'طلب جديد',
          message: `طلب جديد من ${formData.name} بقيمة ${getTotalPrice()} ج.م`,
          type: 'info'
        });

      // Send email to customer
      try {
        await supabase.functions.invoke('send-order-email', {
          body: {
            customerEmail: formData.email,
            customerName: formData.name,
            orderId: order.id,
            orderItems: cart.map(item => ({
              medicineName: item.medicine.name_ar,
              quantity: item.quantity,
              price: item.medicine.price,
              subtotal: item.medicine.price * item.quantity
            })),
            totalAmount: getTotalPrice(),
            paymentMethod: selectedGateway?.name || 'غير محدد',
            paymentGatewayInfo: selectedGateway ? {
              name: selectedGateway.name,
              accountName: selectedGateway.account_name,
              accountNumber: selectedGateway.account_number,
              paymentUrl: selectedGateway.payment_url,
              instructions: selectedGateway.instructions
            } : undefined,
            customerAddress: formData.address,
            customerPhone: formData.phone,
            notes: formData.notes
          }
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't block order creation if email fails
      }

      // Clear cart
      localStorage.removeItem('pharmacy_cart');

      toast.success('تم إرسال الطلب بنجاح! 🎉', {
        description: 'تحقق من بريدك الإلكتروني للحصول على تفاصيل الطلب ومعلومات الدفع'
      });

      // Show payment details modal
      if (selectedGateway && selectedGateway.type !== 'cod') {
        setTimeout(() => {
          let paymentInfo = `طريقة الدفع: ${selectedGateway.name}\n\n`;
          
          if (selectedGateway.account_name) {
            paymentInfo += `اسم الحساب: ${selectedGateway.account_name}\n`;
          }
          if (selectedGateway.account_number) {
            paymentInfo += `رقم الحساب/المحفظة: ${selectedGateway.account_number}\n`;
          }
          if (selectedGateway.payment_url) {
            paymentInfo += `رابط الدفع: ${selectedGateway.payment_url}\n`;
          }
          if (selectedGateway.instructions) {
            paymentInfo += `\nتعليمات:\n${selectedGateway.instructions}\n`;
          }
          
          paymentInfo += `\nرقم الطلب: ${order.id.substring(0, 8).toUpperCase()}\n`;
          paymentInfo += `المبلغ المطلوب: ${getTotalPrice()} ج.م\n\n`;
          paymentInfo += `✅ تم إرسال هذه المعلومات أيضاً إلى بريدك الإلكتروني`;
          
          alert(paymentInfo);
        }, 500);
      }

      navigate('/');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error('حدث خطأ أثناء إتمام الطلب', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <Layout>
      <div className="bg-primary/10 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center flex items-center justify-center gap-3">
            <ShoppingBag className="h-12 w-12" />
            إتمام الطلب
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">بيانات التوصيل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-lg">الاسم الكامل *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-lg h-12"
                      placeholder="محمد أحمد"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-lg">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="text-lg h-12"
                      placeholder="your@email.com"
                    />
                    <p className="text-sm text-gray-600 mt-1">سيتم إرسال تفاصيل الطلب ومعلومات الدفع إلى هذا البريد</p>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-lg">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="text-lg h-12"
                      placeholder="+20 123 456 7890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-lg">العنوان *</Label>
                    <Textarea
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="text-lg min-h-24"
                      placeholder="المحافظة، المدينة، الشارع، رقم المبنى"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="text-lg">ملاحظات إضافية</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="text-lg min-h-24"
                      placeholder="أي ملاحظات خاصة بالطلب"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <CreditCard className="h-6 w-6" />
                    طريقة الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={handlePaymentMethodChange}
                  >
                    {paymentGateways.map((gateway) => (
                      <div key={gateway.id} className="flex items-start space-x-3 space-x-reverse border-2 rounded-lg p-4 hover:bg-gray-50 hover:border-primary transition-colors">
                        <RadioGroupItem value={gateway.id} id={gateway.id} className="mt-1" />
                        <Label htmlFor={gateway.id} className="flex-1 cursor-pointer">
                          <div className="font-bold text-lg mb-1">{gateway.name}</div>
                          {gateway.instructions && (
                            <p className="text-sm text-gray-600 leading-relaxed">{gateway.instructions}</p>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {selectedGateway && selectedGateway.type !== 'cod' && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm font-bold text-yellow-900 mb-2">
                        📧 معلومات الدفع ستصلك عبر البريد الإلكتروني
                      </p>
                      <p className="text-sm text-yellow-800">
                        بعد تأكيد الطلب، ستتلقى رسالة تحتوي على كافة تفاصيل الدفع وبيانات الحساب
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full text-xl font-bold h-14"
              >
                {loading ? 'جاري إرسال الطلب...' : 'تأكيد الطلب'}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-2xl">ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between text-base">
                    <span className="text-gray-700">
                      {item.medicine.name_ar} × {item.quantity}
                    </span>
                    <span className="font-bold">{item.medicine.price * item.quantity} ج.م</span>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-bold text-gray-900">الإجمالي:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">
                        {getTotalPrice()}
                      </span>
                      <span className="text-lg text-gray-600">ج.م</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
