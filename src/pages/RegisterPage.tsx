import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { registerCustomer, verifyOTP } from '@/lib/auth';
import { toast } from 'sonner';
import { Mail, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, error } = await registerCustomer(formData.email, formData.name);
      
      if (error || !success) {
        toast.error('فشل الإرسال', {
          description: error || 'يرجى المحاولة مرة أخرى'
        });
        return;
      }

      toast.success('تم الإرسال!', {
        description: `تم إرسال رمز التحقق إلى ${formData.email}`
      });
      
      setStep('verify');
    } catch (error) {
      toast.error('حدث خطأ', {
        description: 'يرجى المحاولة مرة أخرى'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user, error } = await verifyOTP(formData.email, formData.otp);
      
      if (error || !user) {
        toast.error('رمز غير صحيح', {
          description: error || 'يرجى التحقق من الرمز والمحاولة مرة أخرى'
        });
        return;
      }

      toast.success('مرحباً بك!', {
        description: 'تم إنشاء حسابك بنجاح'
      });
      
      navigate('/');
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
                {step === 'email' ? 'إنشاء حساب جديد' : 'التحقق من البريد'}
              </CardTitle>
              <CardDescription className="text-center text-lg">
                {step === 'email' 
                  ? 'سجل الآن للبدء في الشراء' 
                  : `أدخل الرمز المرسل إلى ${formData.email}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 'email' ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-lg">الاسم الكامل</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-lg h-12"
                      placeholder="محمد أحمد"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-lg">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="text-lg h-12"
                      placeholder="your@email.com"
                      disabled={loading}
                    />
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-green-900 mb-1">
                          سيصلك رمز التحقق عبر البريد
                        </p>
                        <p className="text-sm text-green-800">
                          تحقق من صندوق الوارد أو البريد المزعج
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full text-xl font-bold h-14" disabled={loading}>
                    {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
                  </Button>

                  <div className="text-center pt-4">
                    <p className="text-gray-600">
                      لديك حساب بالفعل؟{' '}
                      <Link to="/login" className="text-primary font-bold hover:underline">
                        سجل دخول
                      </Link>
                    </p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <Label htmlFor="otp" className="text-lg">رمز التحقق</Label>
                    <Input
                      id="otp"
                      type="text"
                      required
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                      className="text-2xl h-16 text-center tracking-widest font-mono"
                      placeholder="000000"
                      maxLength={6}
                      disabled={loading}
                      autoFocus
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-blue-900 mb-1">
                          تحقق من بريدك الإلكتروني
                        </p>
                        <p className="text-sm text-blue-800">
                          الرمز صالح لمدة ساعة واحدة
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full text-xl font-bold h-14" disabled={loading}>
                    {loading ? 'جاري التحقق...' : 'تأكيد وإنشاء الحساب'}
                  </Button>

                  <div className="text-center pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep('email')}
                      disabled={loading}
                    >
                      تغيير البريد الإلكتروني
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
