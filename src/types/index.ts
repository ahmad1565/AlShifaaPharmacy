export interface Medicine {
  id: string;
  nameAr: string;
  nameEn: string;
  scientificName: string;
  category: string;
  dosage: string;
  price: number;
  quantity: number;
  expiryDate: string;
  image: string;
  requiresPrescription: boolean;
  supplierId?: string;
  minStockLevel: number;
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  medicines: string[];
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentGateway?: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'cancelled';
  orderStatus: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  prescriptionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'electronic' | 'wallet' | 'cod';
  enabled: boolean;
  accountName?: string;
  accountNumber?: string;
  apiKey?: string;
  webhookUrl?: string;
  instructions?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'customer';
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface DashboardStats {
  todaySales: number;
  monthlySales: number;
  totalOrders: number;
  lowStockItems: number;
  outOfStockItems: number;
  netProfit: number;
  pendingOrders: number;
  completedOrders: number;
}
