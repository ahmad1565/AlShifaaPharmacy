import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import MedicineCard from '@/components/features/MedicineCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { getMedicines } from '@/lib/storage';
import { Medicine } from '@/types';

export default function MedicinesPage() {
  const location = useLocation();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'مسكنات', 'مضادات حيوية', 'فيتامينات', 'أدوية البرد والإنفلونزا'];

  useEffect(() => {
    const allMedicines = getMedicines();
    setMedicines(allMedicines);
    setFilteredMedicines(allMedicines);

    // Check if category was passed from navigation
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    }
  }, [location]);

  useEffect(() => {
    let result = medicines;

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(m => m.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      result = result.filter(m =>
        m.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMedicines(result);
  }, [searchTerm, selectedCategory, medicines]);

  return (
    <>
      <Helmet>
        <title>الأدوية المتوفرة - صيدلية الشفاء الحديثة</title>
        <meta name="description" content="تصفح مجموعتنا الواسعة من الأدوية الأصلية المعتمدة. مسكنات، مضادات حيوية، فيتامينات، وأدوية البرد والإنفلونزا بأفضل الأسعار في مصر." />
        <link rel="canonical" href="https://alshifaa-pharmacy.onspace.app/medicines" />
        <meta property="og:title" content="الأدوية المتوفرة - صيدلية الشفاء الحديثة" />
        <meta property="og:description" content="تصفح مجموعتنا الواسعة من الأدوية الأصلية المعتمدة" />
        <meta property="og:url" content="https://alshifaa-pharmacy.onspace.app/medicines" />
      </Helmet>

      <Layout>
        <div className="bg-primary/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
              الأدوية المتوفرة
            </h1>
            <p className="text-xl text-gray-700 text-center max-w-2xl mx-auto">
              تصفح مجموعتنا الواسعة من الأدوية الأصلية المعتمدة
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="ابحث عن دواء..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-lg h-12"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="text-lg h-12">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأقسام</SelectItem>
                  {categories.slice(1).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <p className="text-lg text-gray-700">
              عرض <span className="font-bold text-primary">{filteredMedicines.length}</span> منتج
              {selectedCategory !== 'all' && ` في قسم ${selectedCategory}`}
            </p>
          </div>

          {/* Medicine Grid */}
          {filteredMedicines.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredMedicines.map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">لا توجد منتجات تطابق البحث</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mt-4 text-lg"
              >
                مسح الفلاتر
              </Button>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
