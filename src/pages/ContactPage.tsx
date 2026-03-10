import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('تم إرسال رسالتك بنجاح', {
      description: 'سنتواصل معك في أقرب وقت ممكن'
    });
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <>
      <Helmet>
        <title>اتصل بنا - صيدلية الشفاء الحديثة</title>
        <meta name="description" content="تواصل مع صيدلية الشفاء الحديثة - نحن هنا لخدمتك على مدار 24 ساعة. الهاتف: +213558166889 | البريد: hajaraldhaheri2016@gmail.com" />
        <link rel="canonical" href="https://alshifaa-pharmacy.onspace.app/contact" />
        <meta property="og:title" content="اتصل بنا - صيدلية الشفاء الحديثة" />
        <meta property="og:description" content="تواصل معنا لأي استفسار أو طلب - متاحون على مدار 24 ساعة" />
        <meta property="og:url" content="https://alshifaa-pharmacy.onspace.app/contact" />
      </Helmet>

      <Layout>
        <div className="bg-primary/10 py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
              اتصل بنا
            </h1>
            <p className="text-xl text-gray-700 text-center max-w-2xl mx-auto">
              نحن هنا لخدمتك. تواصل معنا لأي استفسار أو طلب
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">معلومات التواصل</h2>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">الهاتف / واتساب</h3>
                      <a
                        href="https://wa.me/213558166889"
                        className="text-lg text-primary hover:underline"
                      >
                        +213558166889
                      </a>
                      <p className="text-gray-600 mt-1">متاح على مدار 24 ساعة</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">البريد الإلكتروني</h3>
                      <a
                        href="mailto:hajaraldhaheri2016@gmail.com"
                        className="text-lg text-primary hover:underline break-all"
                      >
                        hajaraldhaheri2016@gmail.com
                      </a>
                      <p className="text-gray-600 mt-1">نرد خلال 24 ساعة</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">الموقع</h3>
                      <p className="text-lg text-gray-700">مصر</p>
                      <p className="text-gray-600 mt-1">توصيل لجميع المحافظات</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">أوقات العمل</h3>
                      <p className="text-lg text-gray-700">السبت - الخميس: 9 صباحاً - 11 مساءً</p>
                      <p className="text-lg text-gray-700">الجمعة: 2 ظهراً - 11 مساءً</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl">أرسل لنا رسالة</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-lg">الاسم</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="text-lg h-12"
                        placeholder="اسمك الكامل"
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-lg">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="text-lg h-12"
                        placeholder="+20 123 456 7890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-lg">الرسالة</Label>
                      <Textarea
                        id="message"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="text-lg min-h-32"
                        placeholder="اكتب رسالتك هنا..."
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full text-xl font-bold h-14">
                      إرسال الرسالة
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
