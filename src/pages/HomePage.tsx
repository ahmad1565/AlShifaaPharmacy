import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package, Users, TrendingUp, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import MedicineCard from '@/components/features/MedicineCard';
import heroImage from '@/assets/pharmacy-hero.jpg';
import pharmacistImage from '@/assets/pharmacist.jpg';

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

export default function HomePage() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    const { data } = await supabase
      .from('medicines')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8);
    
    if (data) {
      setMedicines(data);
      
      // Calculate categories
      const allMedicines = await supabase.from('medicines').select('category');
      if (allMedicines.data) {
        const categoryMap = new Map<string, number>();
        allMedicines.data.forEach((m) => {
          categoryMap.set(m.category, (categoryMap.get(m.category) || 0) + 1);
        });
        
        const cats = Array.from(categoryMap.entries()).map(([name, count]) => ({
          name,
          count
        }));
        setCategories(cats);
      }
    }
  };

  const features = [
    {
      icon: Package,
      title: 'أدوية أصلية',
      description: 'جميع منتجاتنا أصلية ومعتمدة من وزارة الصحة المصرية'
    },
    {
      icon: TrendingUp,
      title: 'أسعار تنافسية',
      description: 'أفضل الأسعار في السوق المصري مع عروض مستمرة'
    },
    {
      icon: Users,
      title: 'فريق متخصص',
      description: 'صيادلة مؤهلون لتقديم الاستشارات الطبية'
    },
    {
      icon: Shield,
      title: 'ضمان الجودة',
      description: 'نضمن جودة وسلامة جميع المنتجات'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="صيدلية الشفاء"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              صيدلية الشفاء الحديثة
            </h1>
            <p className="text-xl md:text-2xl mb-8 leading-relaxed text-gray-100">
              نوفر لك أجود أنواع الأدوية بأسعار منافسة مع خدمة توصيل سريعة وآمنة في جميع أنحاء مصر
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/medicines')}
                className="text-lg px-8 font-bold"
              >
                تصفح الأدوية
                <ArrowRight className="mr-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/contact')}
                className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-gray-900 font-bold"
              >
                اتصل بنا
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            أقسام الأدوية
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => navigate('/medicines', { state: { category: category.name } })}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center group"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 font-medium">{category.count} منتج</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Medicines */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">منتجات مميزة</h2>
            <Button variant="link" onClick={() => navigate('/medicines')} className="text-lg font-medium">
              عرض الكل
              <ArrowRight className="mr-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {medicines.map((medicine) => (
              <MedicineCard 
                key={medicine.id} 
                medicine={{
                  id: medicine.id,
                  nameAr: medicine.name_ar,
                  nameEn: medicine.name_en,
                  scientificName: medicine.scientific_name,
                  category: medicine.category,
                  dosage: medicine.dosage,
                  price: medicine.price,
                  quantity: medicine.quantity,
                  expiryDate: medicine.expiry_date,
                  image: medicine.image,
                  requiresPrescription: medicine.requires_prescription,
                  minStockLevel: medicine.min_stock_level,
                  description: medicine.description
                }} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            لماذا تختار صيدلية الشفاء؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-l from-primary to-primary/80">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src={pharmacistImage}
                alt="فريق الصيادلة"
                className="rounded-lg shadow-2xl"
              />
            </div>
            <div className="text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                نحن هنا لخدمتك
              </h2>
              <p className="text-xl leading-relaxed mb-8">
                فريقنا من الصيادلة المحترفين جاهز لتقديم الاستشارات الطبية ومساعدتك في اختيار الأدوية المناسبة.
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/contact')}
                className="text-lg px-8 font-bold"
              >
                تواصل معنا الآن
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
