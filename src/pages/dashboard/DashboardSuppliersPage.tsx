import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getSuppliers, saveSuppliers } from '@/lib/storage';
import { Supplier } from '@/types';
import { Plus, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    setSuppliers(getSuppliers());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const supplierData: Supplier = {
      id: editingSupplier?.id || `supplier-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      medicines: editingSupplier?.medicines || [],
      createdAt: editingSupplier?.createdAt || new Date().toISOString()
    };

    const allSuppliers = getSuppliers();
    if (editingSupplier) {
      const index = allSuppliers.findIndex(s => s.id === editingSupplier.id);
      allSuppliers[index] = supplierData;
      toast.success('تم تحديث المورد بنجاح');
    } else {
      allSuppliers.push(supplierData);
      toast.success('تم إضافة المورد بنجاح');
    }

    saveSuppliers(allSuppliers);
    loadSuppliers();
    resetForm();
    setIsAddOpen(false);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address
    });
    setIsAddOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;

    const allSuppliers = getSuppliers().filter(s => s.id !== id);
    saveSuppliers(allSuppliers);
    loadSuppliers();
    toast.success('تم حذف المورد بنجاح');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: ''
    });
    setEditingSupplier(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">الموردين</h1>
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-5 w-5" />
                إضافة مورد جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>اسم المورد *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>البريد الإلكتروني *</Label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>رقم الهاتف *</Label>
                  <Input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>العنوان *</Label>
                  <Input
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    {editingSupplier ? 'تحديث' : 'إضافة'}
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

        {/* Suppliers Grid */}
        {suppliers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{supplier.name}</h3>
                      <p className="text-sm text-gray-500">
                        مورد منذ {new Date(supplier.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(supplier)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(supplier.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm break-all">{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{supplier.phone}</span>
                    </div>
                    <div className="flex items-start gap-3 text-gray-700">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span className="text-sm">{supplier.address}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">لا يوجد موردين</p>
            <p className="text-gray-500 mt-2">قم بإضافة موردين لإدارة المخزون بشكل أفضل</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
