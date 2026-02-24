import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Award, Users, Heart } from 'lucide-react';
import pharmacistImage from '@/assets/pharmacist.jpg';

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'الجودة والأمان',
      description: 'نلتزم بتوفير أدوية أصلية ومعتمدة من وزارة الصحة المصرية'
    },
    {
      icon: Award,
      title: 'الخبرة والاحترافية',
      description: 'فريق من الصيادلة المحترفين بخبرة تزيد عن 15 عاماً'
    },
    {
      icon: Users,
      title: 'خدمة العملاء',
      description: 'نضع راحة ورضا عملائنا في المقام الأول'
    },
    {
      icon: Heart,
      title: 'الرعاية الصحية',
      description: 'نساهم في تحسين الصحة العامة للمجتمع المصري'
    }
  ];

  return (
    <Layout>
      <div className="bg-primary/10 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            من نحن
          </h1>
          <p className="text-xl text-gray-700 text-center max-w-3xl mx-auto">
            صيدلية الشفاء الحديثة - شريكك الموثوق في الرعاية الصحية
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <img
              src={pharmacistImage}
              alt="فريق صيدلية الشفاء"
              className="rounded-lg shadow-xl"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">قصتنا</h2>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
              <p>
                تأسست صيدلية الشفاء الحديثة بهدف توفير أجود أنواع الأدوية والمستلزمات الطبية للمجتمع المصري بأسعار منافسة وخدمة متميزة.
              </p>
              <p>
                نفخر بتقديم خدماتنا لآلاف العملاء في جميع أنحاء مصر، مع التزامنا التام بمعايير الجودة والسلامة في كل منتج نقدمه.
              </p>
              <p>
                يقود صيدليتنا الأستاذ محمد أحمد، صيدلي إكلينيكي بخبرة تزيد عن 15 عاماً في مجال الصيدلة والرعاية الصحية.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">قيمنا ومبادئنا</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="bg-primary/5 rounded-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">رؤيتنا</h2>
          <p className="text-xl text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
            نطمح لأن نكون الصيدلية الأولى في مصر التي يثق بها المواطنون للحصول على أدويتهم ومستلزماتهم الطبية، 
            مع تقديم خدمة استثنائية تجمع بين الجودة والسرعة والأسعار المناسبة.
          </p>
        </div>
      </div>
    </Layout>
  );
}
