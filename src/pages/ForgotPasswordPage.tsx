import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { resetPassword } from '@/lib/auth';
import { toast } from 'sonner';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, error } = await resetPassword(email);
      
      if (error || !success) {
        toast.error('فشل الإرسال', {
          description: error || 'يرجى المحاولة مرة أخرى'
        });
        return;
      }

      setEmailSent(true);
      toast.success('تم الإرسال!', {
        description: `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`
      });
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
                نسيت كلمة المرور؟
              </CardTitle>
              <CardDescription className="text-center text-lg">
                {emailSent 
                  ? 'تحقق من بريدك الإلكتروني' 
                  : 'أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailSent ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <p className="text-lg font-bold text-green-900 mb-2">
                      تم إرسال الرابط بنجاح!
                    </p>
                    <p className="text-green-800 leading-relaxed">
                      تحقق من بريدك الإلكتروني <strong>{email}</strong> واتبع التعليمات لإعادة تعيين كلمة المرور.
                    </p>
                    <p className="text-sm text-green-700 mt-3">
                      قد تحتاج للتحقق من مجلد البريد المزعج
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={() => setEmailSent(false)}
                    >
                      إرسال مرة أخرى
                    </Button>
                    <Link to="/login" className="block">
                      <Button variant="outline" className="w-full gap-2">
                        <ArrowRight className="h-4 w-4" />
                        العودة لتسجيل الدخول
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-lg">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-lg h-12"
                      placeholder="your@email.com"
                      disabled={loading}
                      autoFocus
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-blue-900 mb-1">
                          سنرسل لك رابطاً عبر البريد
                        </p>
                        <p className="text-sm text-blue-800">
                          استخدم الرابط لإنشاء كلمة مرور جديدة
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full text-xl font-bold h-14" disabled={loading}>
                    {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
                  </Button>

                  <div className="text-center pt-4">
                    <Link to="/login" className="text-primary hover:underline">
                      العودة لتسجيل الدخول
                    </Link>
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
