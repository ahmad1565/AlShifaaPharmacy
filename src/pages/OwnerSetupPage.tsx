import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';

export default function OwnerSetupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: 'hajaraldhaheri2016@gmail.com',
    password: '',
    confirmPassword: '',
    name: 'محمد أحمد'
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

    if (formData.password !== 'admin123456') {
      toast.error('كلمة المرور يجب أن تكون: admin123456');
      return;
    }

    setLoading(true);

    try {
      // Check if owner already exists
      const { data: existingUsers } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', formData.email);

      if (existingUsers && existingUsers.length > 0) {
        toast.error('المالك مسجل بالفعل', {
          description: 'استخدم صفحة تسجيل الدخول'
        });
        navigate('/login');
        return;
      }

      // Sign up owner
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.name,
            full_name: formData.name
          }
        }
      });

      if (signUpError) throw signUpError;

      toast.success('تم إنشاء حساب المالك بنجاح! 🎉', {
        description: 'يمكنك الآن تسجيل الدخول'
      });

      navigate('/login');
    } catch (error: any) {
      console.error('Setup error:', error);
      toast.error('حدث خطأ', {
        description: error.message
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
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <ShieldCheck className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl text-center">
                إعداد حساب المالك
              </CardTitle>
              <CardDescription className="text-center text-lg">
                أنشئ حساب المالك لأول مرة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-5 mb-4">
                  <p className="text-base font-bold text-green-900 mb-3 text-center">✅ معلومات حساب المالك</p>
                  <div className="space-y-2 bg-white/70 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">📧 البريد الإلكتروني:</span>
                      <span className="text-sm font-bold text-primary">hajaraldhaheri2016@gmail.com</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">🔐 كلمة المرور:</span>
                      <span className="text-sm font-bold text-primary">admin123456</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">👤 الاسم:</span>
                      <span className="text-sm font-bold text-gray-900">محمد أحمد</span>
                    </div>
                  </div>
                  <p className="text-xs text-green-800 text-center mt-3">⚠️ تأكد من كتابة كلمة المرور بالضبط كما هي موضحة أعلاه</p>
                </div>

                <div>
                  <Label htmlFor="name" className="text-lg">الاسم</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-lg h-12"
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-lg">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    className="text-lg h-12"
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-lg">كلمة المرور <span className="text-red-600">*</span></Label>
                  <Input
                    id="password"
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="text-lg h-12 font-mono"
                    placeholder="اكتب: admin123456"
                    disabled={loading}
                    minLength={6}
                    autoFocus
                  />
                  <p className="text-sm text-amber-700 mt-1 font-medium">⚠️ اكتب بالضبط: admin123456</p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-lg">تأكيد كلمة المرور <span className="text-red-600">*</span></Label>
                  <Input
                    id="confirmPassword"
                    type="text"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="text-lg h-12 font-mono"
                    placeholder="اكتب: admin123456"
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full text-xl font-bold h-14" disabled={loading}>
                  {loading ? 'جاري الإنشاء...' : 'إنشاء حساب المالك'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
