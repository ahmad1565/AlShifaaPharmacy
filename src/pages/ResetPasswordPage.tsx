import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { updatePassword } from '@/lib/auth';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      const { success, error } = await updatePassword(formData.password);
      
      if (error || !success) {
        toast.error('فشل تحديث كلمة المرور', {
          description: error || 'يرجى المحاولة مرة أخرى'
        });
        return;
      }

      toast.success('تم تحديث كلمة المرور بنجاح!');
      
      // Redirect to login with success message
      navigate('/login', { state: { resetSuccess: true } });
    } catch (error) {
      toast.error('حدث خطأ', {
        description: 'يرجى المحاولة مرة أخرى'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center">
                إنشاء كلمة مرور جديدة
              </CardTitle>
              <CardDescription className="text-center text-lg">
                أدخل كلمة المرور الجديدة لحسابك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password" className="text-lg">كلمة المرور الجديدة</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="text-lg h-12"
                    placeholder="••••••••"
                    disabled={loading}
                    autoFocus
                    minLength={6}
                  />
                  <p className="text-sm text-gray-600 mt-1">6 أحرف على الأقل</p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-lg">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="text-lg h-12"
                    placeholder="••••••••"
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-900 mb-1">
                        اختر كلمة مرور قوية
                      </p>
                      <p className="text-sm text-blue-800">
                        استخدم مزيجاً من الأحرف والأرقام للحماية
                      </p>
                    </div>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full text-xl font-bold h-14" disabled={loading}>
                  {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
