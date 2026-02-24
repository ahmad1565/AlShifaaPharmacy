import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Medicine {
  id: string;
  name_ar: string;
  name_en: string;
  scientific_name: string;
  category: string;
  dosage: string;
  price: number;
  quantity: number;
  expiry_date: string;
  image: string;
  requires_prescription: boolean;
  min_stock_level: number;
  description?: string;
}

export default function DashboardMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = ['مسكنات', 'مضادات حيوية', 'فيتامينات', 'أدوية البرد والإنفلونزا'];

  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    scientific_name: '',
    category: categories[0],
    dosage: '',
    price: '',
    quantity: '',
    expiry_date: '',
    image: '',
    requires_prescription: false,
    min_stock_level: '10',
    description: ''
  });

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    let result = medicines;
    if (categoryFilter !== 'all') {
      result = result.filter(m => m.category === categoryFilter);
    }
    if (searchTerm) {
      result = result.filter(m =>
        m.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.name_en.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredMedicines(result);
  }, [searchTerm, categoryFilter, medicines]);

  const loadMedicines = async () => {
    const { data } = await supabase
      .from('medicines')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setMedicines(data);
      setFilteredMedicines(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const medicineData = {
        name_ar: formData.name_ar,
        name_en: formData.name_en,
        scientific_name: formData.scientific_name,
        category: formData.category,
        dosage: formData.dosage,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        expiry_date: formData.expiry_date,
        image: formData.image || '/src/assets/medicines/painkillers.jpg',
        requires_prescription: formData.requires_prescription,
        min_stock_level: parseInt(formData.min_stock_level),
        description: formData.description
      };

      if (editingMedicine) {
        const { error } = await supabase
          .from('medicines')
          .update(medicineData)
          .eq('id', editingMedicine.id);

        if (error) throw error;
        toast.success('تم تحديث الدواء بنجاح');
      } else {
        const { error } = await supabase
          .from('medicines')
          .insert(medicineData);

        if (error) throw error;
        toast.success('تم إضافة الدواء بنجاح');

        // Add notification
        await supabase
          .from('notifications')
          .insert({
            title: 'دواء جديد',
            message: `تم إضافة ${medicineData.name_ar} إلى المخزون`,
            type: 'success'
          });
      }

      loadMedicines();
      resetForm();
      setIsAddOpen(false);
      setEditingMedicine(null);
    } catch (error: any) {
      toast.error('حدث خطأ', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name_ar: medicine.name_ar,
      name_en: medicine.name_en,
      scientific_name: medicine.scientific_name,
      category: medicine.category,
      dosage: medicine.dosage,
      price: medicine.price.toString(),
      quantity: medicine.quantity.toString(),
      expiry_date: medicine.expiry_date,
      image: medicine.image,
      requires_prescription: medicine.requires_prescription,
      min_stock_level: medicine.min_stock_level.toString(),
      description: medicine.description || ''
    });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدواء؟')) return;

    const { error } = await supabase
      .from('medicines')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('حدث خطأ', { description: error.message });
      return;
    }

    loadMedicines();
    toast.success('تم حذف الدواء بنجاح');
  };

  const resetForm = () => {
    setFormData({
      name_ar: '',
      name_en: '',
      scientific_name: '',
      category: categories[0],
      dosage: '',
      price: '',
      quantity: '',
      expiry_date: '',
      image: '',
      requires_prescription: false,
      min_stock_level: '10',
      description: ''
    });
    setEditingMedicine(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">إدارة الأدوية</h1>
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-5 w-5" />
                إضافة دواء جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingMedicine ? 'تعديل الدواء' : 'إضافة دواء جديد'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>الاسم بالعربية *</Label>
                    <Input
                      required
                      value={formData.name_ar}
                      onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>الاسم بالإنجليزية *</Label>
                    <Input
                      required
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>الاسم العلمي *</Label>
                  <Input
                    required
                    value={formData.scientific_name}
                    onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>التصنيف / القسم *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>الجرعة *</Label>
                    <Input
                      required
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="500 مجم - قرص كل 6 ساعات"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>السعر (ج.م) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>الكمية *</Label>
                    <Input
                      type="number"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>الحد الأدنى للمخزون *</Label>
                    <Input
                      type="number"
                      required
                      value={formData.min_stock_level}
                      onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>تاريخ الانتهاء *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label>رابط الصورة</Label>
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/src/assets/medicines/medicine.jpg"
                  />
                </div>

                <div>
                  <Label>الوصف</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prescription"
                    checked={formData.requires_prescription}
                    onChange={(e) => setFormData({ ...formData, requires_prescription: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <Label htmlFor="prescription" className="cursor-pointer">
                    يتطلب وصفة طبية
                  </Label>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'جاري الحفظ...' : (editingMedicine ? 'تحديث' : 'إضافة')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddOpen(false);
                      resetForm();
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="ابحث عن دواء..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="اختر القسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأقسام</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Medicines Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">الصورة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">الاسم</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">التصنيف</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">السعر</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">الكمية</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <img
                        src={medicine.image}
                        alt={medicine.name_ar}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{medicine.name_ar}</p>
                      <p className="text-sm text-gray-600">{medicine.name_en}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{medicine.category}</Badge>
                    </td>
                    <td className="px-6 py-4 font-bold">{medicine.price} ج.م</td>
                    <td className="px-6 py-4 font-bold">{medicine.quantity}</td>
                    <td className="px-6 py-4">
                      {medicine.quantity === 0 ? (
                        <Badge variant="destructive">نفذ</Badge>
                      ) : medicine.quantity < medicine.min_stock_level ? (
                        <Badge variant="outline" className="border-orange-500 text-orange-600">منخفض</Badge>
                      ) : (
                        <Badge className="bg-green-600">متوفر</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(medicine)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(medicine.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
