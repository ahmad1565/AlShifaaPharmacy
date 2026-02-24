import { Link } from 'react-router-dom';
import { Medicine } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, AlertCircle } from 'lucide-react';
import { getCart, saveCart } from '@/lib/storage';
import { toast } from 'sonner';

interface MedicineCardProps {
  medicine: Medicine;
}

export default function MedicineCard({ medicine }: MedicineCardProps) {
  const handleAddToCart = () => {
    if (medicine.quantity <= 0) {
      toast.error('نفذت الكمية', {
        description: 'هذا الدواء غير متوفر حالياً'
      });
      return;
    }

    const cart = getCart();
    const existingItem = cart.find(item => item.medicine.id === medicine.id);

    if (existingItem) {
      if (existingItem.quantity >= medicine.quantity) {
        toast.error('الكمية غير كافية', {
          description: 'لا يوجد مخزون كافي من هذا الدواء'
        });
        return;
      }
      existingItem.quantity += 1;
    } else {
      cart.push({ medicine, quantity: 1 });
    }

    saveCart(cart);
    toast.success('تمت الإضافة للسلة', {
      description: `تم إضافة ${medicine.nameAr} إلى سلة التسوق`
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/medicines/${medicine.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={medicine.image}
            alt={medicine.nameAr}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/medicines/${medicine.id}`}>
          <h3 className="font-bold text-lg mb-1 text-gray-900 hover:text-primary transition-colors">
            {medicine.nameAr}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{medicine.nameEn}</p>
        </Link>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {medicine.category}
          </Badge>
          {medicine.requiresPrescription && (
            <Badge variant="outline" className="text-xs gap-1">
              <AlertCircle className="h-3 w-3" />
              يتطلب وصفة
            </Badge>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-primary">{medicine.price}</span>
          <span className="text-sm text-gray-600">ج.م</span>
        </div>

        {medicine.quantity <= 0 ? (
          <Badge variant="destructive" className="w-full justify-center">
            نفذت الكمية
          </Badge>
        ) : medicine.quantity < medicine.minStockLevel ? (
          <Badge variant="outline" className="w-full justify-center border-orange-500 text-orange-600">
            كمية محدودة ({medicine.quantity} متوفر)
          </Badge>
        ) : (
          <p className="text-sm text-gray-600 text-center">
            متوفر ({medicine.quantity} قطعة)
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={medicine.quantity <= 0}
          className="w-full font-medium gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          أضف للسلة
        </Button>
      </CardFooter>
    </Card>
  );
}
