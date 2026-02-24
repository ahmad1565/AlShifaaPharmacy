import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { loginOwner } from '@/lib/auth';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Check for reset password success message
  const resetSuccess = (location.state as any)?.resetSuccess;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user, error } = await loginOwner(formData.email, formData.password);
      
      if (error || !user) {
        toast.error('بيانات الدخول غير صحيحة', {
          description: error || 'يرجى التأكد من البريد الإلكتروني وكلمة المرور'
        });
        setLoading(false);
        return;
      }

      toast.success(`مرحباً ${user.name}!`, {
        description: 'تم تسجيل الدخول بنجاح'
      });
      
      // Redirect owner to dashboard, customers to home
      if (user.role === 'owner') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast.error('حدث خطأ', {
        description: error.message || 'يرجى المحاولة مرة أخرى'
      });
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {resetSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800 font-bold">تم إعادة تعيين كلمة المرور بنجاح!</p>
              <p className="text-green-700 text-sm">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة</p>
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center">تسجيل الدخول - المالك</CardTitle>
              <CardDescription className="text-center text-lg">
                مرحباً بك في لوحة التحكم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-lg">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="text-lg h-12"
                    placeholder="mohamed.ahmed@pharmacy.com"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-lg">كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="text-lg h-12 pr-12"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-10 w-10"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-5 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl">⚠️</span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-amber-900 mb-1">هل أنت المالك؟</p>
                      <p className="text-sm text-amber-800 mb-3 leading-relaxed">
                        إذا كنت تسجل دخول لأول مرة، يجب عليك أولاً <strong>إنشاء حساب المالك</strong> باستخدام البيانات التالية:
                      </p>
                      <div className="bg-white/70 rounded p-3 mb-3 text-sm">
                        <p className="text-gray-900 mb-1">📧 البريد: <strong className="text-primary">hajaraldhaheri2016@gmail.com</strong></p>
                        <p className="text-gray-900">🔐 كلمة المرور: <strong className="text-primary">admin123456</strong></p>
                      </div>
                    </div>
                  </div>
                  <Link to="/owner-setup">
                    <Button type="button" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold">
                      👤 إنشاء حساب المالك الآن
                    </Button>
                  </Link>
                </div>

                <Button type="submit" size="lg" className="w-full text-xl font-bold h-14" disabled={loading}>
                  {loading ? 'جاري التسجيل...' : 'تسجيل الدخول'}
                </Button>

                <div className="text-center pt-4 space-y-2">
                  <p className="text-gray-600">
                    عميل؟{' '}
                    <Link to="/register" className="text-primary font-bold hover:underline">
                      سجل كعميل
                    </Link>
                  </p>
                  <p className="text-gray-600">
                    <Link to="/forgot-password" className="text-primary hover:underline">
                      نسيت كلمة المرور؟
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
