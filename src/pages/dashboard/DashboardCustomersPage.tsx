import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getCustomers } from '@/lib/storage';
import { Customer } from '@/types';
import { Search, Mail, Phone, MapPin } from 'lucide-react';

export default function DashboardCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const allCustomers = getCustomers();
    setCustomers(allCustomers);
    setFilteredCustomers(allCustomers);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">العملاء</h1>
          <div className="text-lg text-gray-600">
            إجمالي العملاء: <span className="font-bold text-primary">{customers.length}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="ابحث عن عميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Customers Grid */}
        {filteredCustomers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{customer.name}</h3>
                    <p className="text-sm text-gray-500">
                      عميل منذ {new Date(customer.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm break-all">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                    <div className="flex items-start gap-3 text-gray-700">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span className="text-sm">{customer.address}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">إجمالي الطلبات</p>
                      <p className="text-2xl font-bold text-primary">{customer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">إجمالي الإنفاق</p>
                      <p className="text-2xl font-bold text-primary">{customer.totalSpent.toFixed(0)} ج.م</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">لا يوجد عملاء</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
