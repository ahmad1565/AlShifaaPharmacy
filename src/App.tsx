import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { getCurrentUser } from './lib/auth';

// Pages
import HomePage from './pages/HomePage';
import MedicinesPage from './pages/MedicinesPage';
import MedicineDetailPage from './pages/MedicineDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OwnerSetupPage from './pages/OwnerSetupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DashboardMedicinesPage from './pages/dashboard/DashboardMedicinesPage';
import DashboardCustomersPage from './pages/dashboard/DashboardCustomersPage';
import DashboardSuppliersPage from './pages/dashboard/DashboardSuppliersPage';
import DashboardOrdersPage from './pages/dashboard/DashboardOrdersPage';
import DashboardReportsPage from './pages/dashboard/DashboardReportsPage';
import DashboardSettingsPage from './pages/dashboard/DashboardSettingsPage';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const isOwner = user?.role === 'owner';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/medicines" element={<MedicinesPage />} />
          <Route path="/medicines/:id" element={<MedicineDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={user ? <CheckoutPage /> : <Navigate to="/login" />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={isOwner ? "/dashboard" : "/"} />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/owner-setup" element={<OwnerSetupPage />} />

          {/* Dashboard Routes (Owner Only) */}
          <Route
            path="/dashboard"
            element={user && isOwner ? <DashboardPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/medicines"
            element={user && isOwner ? <DashboardMedicinesPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/customers"
            element={user && isOwner ? <DashboardCustomersPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/suppliers"
            element={user && isOwner ? <DashboardSuppliersPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/orders"
            element={user && isOwner ? <DashboardOrdersPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/reports"
            element={user && isOwner ? <DashboardReportsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/settings"
            element={user && isOwner ? <DashboardSettingsPage /> : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
