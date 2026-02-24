import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, updatePassword } from '@/lib/auth';
import { PaymentGateway } from '@/types';
import { Plus, Edit, Trash2, CreditCard, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardSettingsPage() {
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'wallet' as 'electronic' | 'wallet' | 'cod',
    accountName: '',
    accountNumber: '',
    apiKey: '',
    instructions: ''
  });

  useEffect(() => {
    loadGateways();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const loadGateways = async () => {
    const { data } = await supabase
      .from('payment_gateways')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setPaymentGateways(data.map(g => ({
        id: g.id,
        name: g.name,
        type: g.type as 'electronic' | 'wallet' | 'cod',
        enabled: g.enabled,
        accountName: g.account_name,
        accountNumber: g.account_number,
        apiKey: g.payment_url,
        instructions: g.instructions
      })));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const gatewayData = {
      name: formData.name,
      type: formData.type,
      enabled: editingGateway?.enabled ?? true,
      account_name: formData.accountName || null,
      account_number: formData.accountNumber || null,
      payment_url: formData.apiKey || null,
      instructions: formData.instructions || null
    };

    try {
      if (editingGateway) {
        const { error } = await supabase
          .from('payment_gateways')
          .update(gatewayData)
          .eq('id', editingGateway.id);
        
        if (error) throw error;
        toast.success('تم تحديث بوابة الدفع');
      } else {
        const { error } = await supabase
          .from('payment_gateways')
          .insert(gatewayData);
        
        if (error) throw error;
        toast.success('تم إضافة بوابة الدفع');
      }

      loadGateways();
      resetForm();
      setIsAddOpen(false);
    } catch (error: any) {
      toast.error('حدث خطأ', { description: error.message });
    }
  };

  const handleEdit = (gateway: PaymentGateway) => {
    setEditingGateway(gateway);
    setFormData({
      name: gateway.name,
      type: gateway.type,
      accountName: gateway.accountName || '',
      accountNumber: gateway.accountNumber || '',
      apiKey: gateway.apiKey || '',
      instructions: gateway.instructions || ''
    });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه البوابة؟')) return;

    const { error } = await supabase
      .from('payment_gateways')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('حدث خطأ', { description: error.message });
      return;
    }

    loadGateways();
    toast.success('تم حذف بوابة الدفع');
  };

  const toggleGateway = async (id: string) => {
    const gateway = paymentGateways.find(g => g.id === id);
    if (!gateway) return;

    const { error } = await supabase
      .from('payment_gateways')
      .update({ enabled: !gateway.enabled })
      .eq('id', id);

    if (error) {
      toast.error('حدث خطأ', { description: error.message });
      return;
    }

    loadGateways();
    toast.success(!gateway.enabled ? 'تم تفعيل البوابة' : 'تم تعطيل البوابة');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: passwordData.currentPassword
      });

      if (signInError) {
        toast.error('كلمة المرور الحالية غير صحيحة');
        return;
      }

      // Update password
      const { success, error } = await updatePassword(passwordData.newPassword);
      
      if (error || !success) {
        toast.error('فشل تحديث كلمة المرور', { description: error });
        return;
      }

      toast.success('تم تحديث كلمة المرور بنجاح!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error('حدث خطأ', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: emailData.password
      });

      if (signInError) {
        toast.error('كلمة المرور غير صحيحة');
        return;
      }

      // Update email
      const { error } = await supabase.auth.updateUser({
        email: emailData.newEmail
      });

      if (error) throw error;

      toast.success('تم إرسال رابط التأكيد إلى البريد الجديد', {
        description: 'تحقق من بريدك الإلكتروني لتأكيد التغيير'
      });
      setEmailData({ newEmail: '', password: '' });
    } catch (error: any) {
      toast.error('حدث خطأ', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'wallet',
      accountName: '',
      accountNumber: '',
      apiKey: '',
      instructions: ''
    });
    setEditingGateway(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">الإعدادات</h1>
          <p className="text-gray-600">إدارة بوابات الدفع وإعدادات الصيدلية</p>
        </div>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">حسابي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-600">البريد الإلكتروني الحالي</p>
                  <p className="font-bold text-gray-900">{currentUser?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-600">كلمة المرور</p>
                  <p className="font-bold text-gray-900">••••••••</p>
                </div>
              </div>
            </div>

            {/* Change Email */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">تغيير البريد الإلكتروني</h3>
              <form onSubmit={handleChangeEmail} className="space-y-4">
                <div>
                  <Label>البريد الإلكتروني الجديد</Label>
                  <Input
                    type="email"
                    required
                    value={emailData.newEmail}
                    onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                    placeholder="new@email.com"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label>كلمة المرور الحالية للتأكيد</Label>
                  <Input
                    type="password"
                    required
                    value={emailData.password}
                    onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'جاري التحديث...' : 'تحديث البريد'}
                </Button>
              </form>
            </div>

            {/* Change Password */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">تغيير كلمة المرور</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label>كلمة المرور الحالية</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="pr-12"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-9 w-9"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="••••••••"
                      className="pr-12"
                      disabled={loading}
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-9 w-9"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">6 أحرف على الأقل</p>
                </div>
                <div>
                  <Label>تأكيد كلمة المرور الجديدة</Label>
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    disabled={loading}
                    minLength={6}
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Pharmacy Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">معلومات الصيدلية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>اسم الصيدلية</Label>
                <Input value="صيدلية الشفاء الحديثة" disabled />
              </div>
              <div>
                <Label>اسم المالك</Label>
                <Input value="محمد أحمد" disabled />
              </div>
              <div>
                <Label>الدولة</Label>
                <Input value="مصر" disabled />
              </div>
              <div>
                <Label>العملة</Label>
                <Input value="الجنيه المصري (EGP)" disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Gateways */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">بوابات الدفع</CardTitle>
              <Dialog open={isAddOpen} onOpenChange={(open) => {
                setIsAddOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-5 w-5" />
                    إضافة بوابة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-2xl">
                      {editingGateway ? 'تعديل بوابة الدفع' : 'إضافة بوابة دفع جديدة'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label>اسم البوابة *</Label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="فودافون كاش / Paymob / Fawry"
                      />
                    </div>

                    <div>
                      <Label>نوع البوابة *</Label>
                      <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wallet">محفظة إلكترونية (يدوية)</SelectItem>
                          <SelectItem value="electronic">إلكترونية (تلقائية)</SelectItem>
                          <SelectItem value="cod">دفع عند الاستلام</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(formData.type === 'wallet' || formData.type === 'electronic') && (
                      <>
                        <div>
                          <Label>اسم صاحب الحساب</Label>
                          <Input
                            value={formData.accountName}
                            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                            placeholder="محمد أحمد"
                          />
                        </div>
                        <div>
                          <Label>رقم الحساب / المحفظة</Label>
                          <Input
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                            placeholder="01012345678"
                          />
                        </div>
                      </>
                    )}

                    {formData.type === 'electronic' && (
                      <div>
                        <Label>API Key</Label>
                        <Input
                          value={formData.apiKey}
                          onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                          placeholder="sk_live_xxxxx"
                        />
                      </div>
                    )}

                    <div>
                      <Label>تعليمات للعميل</Label>
                      <Input
                        value={formData.instructions}
                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                        placeholder="احفظ رقم الطلب وأرسل المبلغ إلى الرقم المذكور"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" className="flex-1">
                        {editingGateway ? 'تحديث' : 'إضافة'}
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
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentGateways.map((gateway) => (
                <div
                  key={gateway.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{gateway.name}</h3>
                      <p className="text-sm text-gray-600">
                        {gateway.type === 'wallet' && 'محفظة إلكترونية'}
                        {gateway.type === 'electronic' && 'بوابة إلكترونية'}
                        {gateway.type === 'cod' && 'دفع عند الاستلام'}
                      </p>
                      {gateway.accountNumber && (
                        <p className="text-sm text-gray-600">الحساب: {gateway.accountNumber}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={gateway.enabled ? 'default' : 'outline'}
                      onClick={() => toggleGateway(gateway.id)}
                    >
                      {gateway.enabled ? 'مفعّل' : 'معطّل'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(gateway)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(gateway.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
