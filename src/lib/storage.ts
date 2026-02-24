import { Medicine, Customer, Supplier, Order, PaymentGateway, User, Notification as AppNotification } from '@/types';

// Storage keys
const KEYS = {
  MEDICINES: 'pharmacy_medicines',
  CUSTOMERS: 'pharmacy_customers',
  SUPPLIERS: 'pharmacy_suppliers',
  ORDERS: 'pharmacy_orders',
  PAYMENT_GATEWAYS: 'pharmacy_payment_gateways',
  USERS: 'pharmacy_users',
  NOTIFICATIONS: 'pharmacy_notifications',
  CURRENT_USER: 'pharmacy_current_user',
  CART: 'pharmacy_cart',
};

// Initialize default data
export const initializeDefaultData = () => {
  if (!localStorage.getItem(KEYS.MEDICINES)) {
    localStorage.setItem(KEYS.MEDICINES, JSON.stringify(defaultMedicines));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem(KEYS.PAYMENT_GATEWAYS)) {
    localStorage.setItem(KEYS.PAYMENT_GATEWAYS, JSON.stringify(defaultPaymentGateways));
  }
  if (!localStorage.getItem(KEYS.CUSTOMERS)) {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.SUPPLIERS)) {
    localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
};

// Default medicines data
const defaultMedicines: Medicine[] = [
  {
    id: '1',
    nameAr: 'بارامول أقراص',
    nameEn: 'Paramol Tablets',
    scientificName: 'Paracetamol 500mg',
    category: 'مسكنات',
    dosage: '500 مجم - قرص كل 6 ساعات',
    price: 25,
    quantity: 150,
    expiryDate: '2026-12-31',
    image: '/src/assets/medicines/painkillers.jpg',
    requiresPrescription: false,
    minStockLevel: 20,
    description: 'مسكن للآلام وخافض للحرارة'
  },
  {
    id: '2',
    nameAr: 'أيبوبروفين',
    nameEn: 'Ibuprofen',
    scientificName: 'Ibuprofen 400mg',
    category: 'مسكنات',
    dosage: '400 مجم - قرص كل 8 ساعات',
    price: 35,
    quantity: 120,
    expiryDate: '2026-10-15',
    image: '/src/assets/medicines/painkillers.jpg',
    requiresPrescription: false,
    minStockLevel: 15,
    description: 'مسكن ومضاد للالتهابات'
  },
  {
    id: '3',
    nameAr: 'أموكسيسيلين',
    nameEn: 'Amoxicillin',
    scientificName: 'Amoxicillin 500mg',
    category: 'مضادات حيوية',
    dosage: '500 مجم - كبسولة كل 8 ساعات',
    price: 55,
    quantity: 80,
    expiryDate: '2025-08-20',
    image: '/src/assets/medicines/antibiotics.jpg',
    requiresPrescription: true,
    minStockLevel: 10,
    description: 'مضاد حيوي واسع المجال'
  },
  {
    id: '4',
    nameAr: 'أزيثرومايسين',
    nameEn: 'Azithromycin',
    scientificName: 'Azithromycin 250mg',
    category: 'مضادات حيوية',
    dosage: '250 مجم - قرص يومياً',
    price: 85,
    quantity: 60,
    expiryDate: '2025-11-30',
    image: '/src/assets/medicines/antibiotics.jpg',
    requiresPrescription: true,
    minStockLevel: 10,
    description: 'مضاد حيوي للجهاز التنفسي'
  },
  {
    id: '5',
    nameAr: 'فيتامين سي 1000',
    nameEn: 'Vitamin C 1000',
    scientificName: 'Ascorbic Acid 1000mg',
    category: 'فيتامينات',
    dosage: '1000 مجم - قرص يومياً',
    price: 45,
    quantity: 200,
    expiryDate: '2027-03-15',
    image: '/src/assets/medicines/vitamins.jpg',
    requiresPrescription: false,
    minStockLevel: 30,
    description: 'مكمل فيتامين سي لتقوية المناعة'
  },
  {
    id: '6',
    nameAr: 'أوميجا 3',
    nameEn: 'Omega 3',
    scientificName: 'Omega 3 Fish Oil 1000mg',
    category: 'فيتامينات',
    dosage: 'كبسولة يومياً',
    price: 120,
    quantity: 90,
    expiryDate: '2026-06-30',
    image: '/src/assets/medicines/vitamins.jpg',
    requiresPrescription: false,
    minStockLevel: 20,
    description: 'زيت السمك لصحة القلب والدماغ'
  },
  {
    id: '7',
    nameAr: 'شراب الكحة',
    nameEn: 'Cough Syrup',
    scientificName: 'Dextromethorphan 15mg/5ml',
    category: 'أدوية البرد والإنفلونزا',
    dosage: '10 مل كل 6 ساعات',
    price: 28,
    quantity: 100,
    expiryDate: '2025-12-31',
    image: '/src/assets/medicines/cold-flu.jpg',
    requiresPrescription: false,
    minStockLevel: 15,
    description: 'شراب مهدئ للكحة'
  },
  {
    id: '8',
    nameAr: 'كونجستال',
    nameEn: 'Congestal',
    scientificName: 'Paracetamol + Pseudoephedrine',
    category: 'أدوية البرد والإنفلونزا',
    dosage: 'قرص كل 6 ساعات',
    price: 18,
    quantity: 180,
    expiryDate: '2026-09-15',
    image: '/src/assets/medicines/cold-flu.jpg',
    requiresPrescription: false,
    minStockLevel: 25,
    description: 'لعلاج أعراض البرد والإنفلونزا'
  }
];

// Default users
const defaultUsers: User[] = [
  {
    id: 'owner-1',
    email: 'mohamed.ahmed@pharmacy.com',
    name: 'محمد أحمد',
    role: 'owner',
    createdAt: new Date().toISOString()
  }
];

// Default payment gateways
const defaultPaymentGateways: PaymentGateway[] = [
  {
    id: 'cod',
    name: 'الدفع عند الاستلام',
    type: 'cod',
    enabled: true,
    instructions: 'سيتم الدفع نقداً عند استلام الطلب'
  }
];

// Generic storage functions
export const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Medicine functions
export const getMedicines = (): Medicine[] => getFromStorage<Medicine>(KEYS.MEDICINES);
export const saveMedicines = (medicines: Medicine[]): void => saveToStorage(KEYS.MEDICINES, medicines);

// Customer functions
export const getCustomers = (): Customer[] => getFromStorage<Customer>(KEYS.CUSTOMERS);
export const saveCustomers = (customers: Customer[]): void => saveToStorage(KEYS.CUSTOMERS, customers);

// Supplier functions
export const getSuppliers = (): Supplier[] => getFromStorage<Supplier>(KEYS.SUPPLIERS);
export const saveSuppliers = (suppliers: Supplier[]): void => saveToStorage(KEYS.SUPPLIERS, suppliers);

// Order functions
export const getOrders = (): Order[] => getFromStorage<Order>(KEYS.ORDERS);
export const saveOrders = (orders: Order[]): void => saveToStorage(KEYS.ORDERS, orders);

// Payment gateway functions
export const getPaymentGateways = (): PaymentGateway[] => getFromStorage<PaymentGateway>(KEYS.PAYMENT_GATEWAYS);
export const savePaymentGateways = (gateways: PaymentGateway[]): void => saveToStorage(KEYS.PAYMENT_GATEWAYS, gateways);

// User functions
export const getUsers = (): User[] => getFromStorage<User>(KEYS.USERS);
export const saveUsers = (users: User[]): void => saveToStorage(KEYS.USERS, users);

// Notification functions
export const getNotifications = (): AppNotification[] => getFromStorage<AppNotification>(KEYS.NOTIFICATIONS);
export const saveNotifications = (notifications: AppNotification[]): void => saveToStorage(KEYS.NOTIFICATIONS, notifications);

// Current user
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
};

// Cart functions
export const getCart = (): CartItem[] => getFromStorage(KEYS.CART);
export const saveCart = (cart: CartItem[]): void => saveToStorage(KEYS.CART, cart);

interface CartItem {
  medicine: Medicine;
  quantity: number;
}

// Add notification
export const addNotification = (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): void => {
  const notifications = getNotifications();
  const newNotification: AppNotification = {
    ...notification,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    read: false
  };
  notifications.unshift(newNotification);
  saveNotifications(notifications);
  
  // Show browser notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/vite.svg'
    });
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<void> => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};
