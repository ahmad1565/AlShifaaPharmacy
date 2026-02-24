import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, AlertCircle, ArrowRight, Plus, Minus } from 'lucide-react';
import { getMedicines, getCart, saveCart } from '@/lib/storage';
import { Medicine } from '@/types';
import { toast } from 'sonner';

export default function MedicineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const medicines = getMedicines();
    const found = medicines.find(m => m.id === id);
    if (found) {
      setMedicine(found);
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!medicine) return;

    if (medicine.quantity <= 0) {
      toast.error('نفذت الكمية', {
        description: 'هذا الدواء غير متوفر حالياً'
      });
      return;
    }

    const cart = getCart();
    const existingItem = cart.find(item => item.medicine.id === medicine.id);

    if (existingItem) {
      if (existingItem.quantity + quantity > medicine.quantity) {
        toast.error('الكمية غير كافية', {
          description: 'لا يوجد مخزون كافي من هذا الدواء'
        });
        return;
      }
      existingItem.quantity += quantity;
    } else {
      cart.push({ medicine, quantity });
    }

    saveCart(cart);
    toast.success('تمت الإضافة للسلة', {
      description: `تم إضافة ${quantity} من ${medicine.nameAr} إلى سلة التسوق`
    });
  };

  const incrementQuantity = () => {
    if (medicine && quantity < medicine.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (!medicine) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-xl text-gray-600">الدواء غير موجود</p>
          <Button onClick={() => navigate('/medicines')} className="mt-4">
            العودة للأدوية
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/medicines')}
          className="mb-6 text-lg font-medium"
        >
          <ArrowRight className="ml-2 h-5 w-5" />
          العودة للأدوية
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            <img
              src={medicine.image}
              alt={medicine.nameAr}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{medicine.nameAr}</h1>
            <h2 className="text-2xl text-gray-600 mb-4">{medicine.nameEn}</h2>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary" className="text-base px-3 py-1">
                {medicine.category}
              </Badge>
              {medicine.requiresPrescription && (
                <Badge variant="outline" className="text-base px-3 py-1 gap-2">
                  <AlertCircle className="h-4 w-4" />
                  يتطلب وصفة طبية
                </Badge>
              )}
            </div>

            <Card className="mb-6">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">الاسم العلمي</h3>
                  <p className="text-gray-900 text-lg">{medicine.scientificName}</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">الجرعة</h3>
                  <p className="text-gray-900 text-lg">{medicine.dosage}</p>
                </div>
                {medicine.description && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-700 mb-1">الوصف</h3>
                    <p className="text-gray-900 text-lg">{medicine.description}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">تاريخ الانتهاء</h3>
                  <p className="text-gray-900 text-lg">{new Date(medicine.expiryDate).toLocaleDateString('ar-EG')}</p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-primary/10 rounded-lg p-6 mb-6">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-5xl font-bold text-primary">{medicine.price * quantity}</span>
                <span className="text-2xl text-gray-700">ج.م</span>
              </div>

              {medicine.quantity <= 0 ? (
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  نفذت الكمية
                </Badge>
              ) : medicine.quantity < medicine.minStockLevel ? (
                <Badge variant="outline" className="text-lg px-4 py-2 border-orange-500 text-orange-600">
                  كمية محدودة ({medicine.quantity} متوفر)
                </Badge>
              ) : (
                <p className="text-lg text-gray-700 font-medium">
                  متوفر ({medicine.quantity} قطعة)
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-lg font-bold text-gray-700">الكمية:</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={!medicine || quantity >= medicine.quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={medicine.quantity <= 0}
              size="lg"
              className="w-full text-xl font-bold gap-3 h-14"
            >
              <ShoppingCart className="h-6 w-6" />
              أضف للسلة
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
