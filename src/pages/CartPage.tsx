import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { getCart, saveCart } from '@/lib/storage';
import { CartItem } from '@/types';
import { toast } from 'sonner';
import { isAuthenticated } from '@/lib/auth';

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const updateQuantity = (index: number, newQuantity: number) => {
    const item = cart[index];
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }
    if (newQuantity > item.medicine.quantity) {
      toast.error('الكمية غير كافية', {
        description: 'لا يوجد مخزون كافي من هذا الدواء'
      });
      return;
    }
    cart[index].quantity = newQuantity;
    saveCart(cart);
    setCart([...cart]);
  };

  const removeItem = (index: number) => {
    cart.splice(index, 1);
    saveCart(cart);
    setCart([...cart]);
    toast.success('تم الحذف', {
      description: 'تم حذف الدواء من السلة'
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (!isAuthenticated()) {
      toast.error('يجب تسجيل الدخول', {
        description: 'يرجى تسجيل الدخول للمتابعة إلى الدفع'
      });
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingCart className="h-24 w-24 mx-auto text-gray-300 mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">سلة التسوق فارغة</h1>
          <p className="text-xl text-gray-600 mb-8">لم تقم بإضافة أي منتجات بعد</p>
          <Button size="lg" onClick={() => navigate('/medicines')} className="text-lg">
            تصفح الأدوية
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-primary/10 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center">
            سلة التسوق
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={item.medicine.image}
                      alt={item.medicine.nameAr}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {item.medicine.nameAr}
                      </h3>
                      <p className="text-gray-600 mb-3">{item.medicine.nameEn}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-xl font-bold w-12 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-primary">
                            {item.medicine.price * item.quantity}
                          </span>
                          <span className="text-gray-600">ج.م</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">ملخص الطلب</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">عدد المنتجات:</span>
                    <span className="font-bold">{cart.length}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">الكمية الإجمالية:</span>
                    <span className="font-bold">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
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
                </div>
                <Button
                  onClick={handleCheckout}
                  size="lg"
                  className="w-full text-xl font-bold h-14"
                >
                  إتمام الطلب
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
