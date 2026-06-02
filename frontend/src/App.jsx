import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import QualityTesting from './pages/QualityTesting';
import CoconutSubstrates from './pages/CoconutSubstrates';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthLayout from './layouts/AuthLayout';
import OTPForm from './components/auth/OTPForm';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AdminContainers from './pages/AdminContainers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminTesting from './pages/AdminTesting';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import AdminCurrencyManagement from './pages/AdminCurrencyManagement';
import AdminShippingManagement from './pages/AdminShippingManagement';
import AdminDiscounts from './pages/AdminDiscounts';
import ContainerViewerDemo from './pages/ContainerViewerDemo';

// User Protected Route
import UserDashboard from './dashboards/UserDashboard';
import AccountLayout from './layouts/AccountLayout';
import Orders from './pages/account/Orders';
import OrderDetails from './pages/account/OrderDetails';
import Cart from './pages/account/Cart';
import Checkout from './pages/account/Checkout';
import OrderSummary from './pages/account/OrderSummary';
import Payment from './pages/account/Payment';
import OrderSuccess from './pages/account/OrderSuccess';
import TrackOrder from './pages/account/TrackOrder';
import SavedCart from './pages/account/SavedCart';
import Address from './pages/account/Address';
import Settings from './pages/account/Settings';
import Profile from './pages/account/Profile';
import ProductView from './pages/account/ProductView';
import Invoices from './pages/account/Invoices';
import Quotes from './pages/account/Quotes';
import Notifications from './pages/account/Notifications';
import PaymentHistory from './pages/account/PaymentHistory';
import HelpCenter from './pages/account/HelpCenter';

// Loading screen matching the requested design
const LoadingScreen = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center">
    <div className="w-12 h-12 border-4 border-[#2F7D32] border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.25em] text-stone-400 font-sans">
      Loading Cocoveera Trade Platform...
    </p>
  </div>
);

// Guard for user authenticated pages
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Force user to add an address before proceeding to any other protected page
  if (user && (!user.addresses || user.addresses.length === 0) && location.pathname !== '/account/address') {
    return <Navigate to="/account/address" state={{ requireAddress: true }} replace />;
  }

  return children;
};

// Guard for admin pages
const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <div className="flex-grow">
      <Outlet />
    </div>
    <Footer />
  </div>
);

function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/quality-testing" element={<QualityTesting />} />
        <Route path="/substrates" element={<CoconutSubstrates />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/containers/viewer" element={<ContainerViewerDemo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/verify-otp"
          element={
            <AuthLayout>
              <OTPForm />
            </AuthLayout>
          }
        />
      </Route>

      {/* User Protected Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Account Commerce Flow */}
      <Route path="/account" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-summary" element={<OrderSummary />} />
        <Route path="payment" element={<Payment />} />
        <Route path="order-success" element={<OrderSuccess />} />
        <Route path="track/:id" element={<TrackOrder />} />
        <Route path="saved" element={<SavedCart />} />
        <Route path="address" element={<Address />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="quotes" element={<Quotes />} />
        <Route path="payments" element={<PaymentHistory />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="support" element={<HelpCenter />} />
        <Route path="product/:id" element={<ProductView />} />
        <Route path="productview/:id" element={<ProductView />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminProtectedRoute>
            <AdminProducts />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminProtectedRoute>
            <AdminCategories />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminProtectedRoute>
            <AdminOrders />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <AdminProtectedRoute>
            <AdminPayments />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminProtectedRoute>
            <AdminUsers />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/containers"
        element={
          <AdminProtectedRoute>
            <AdminContainers />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/testing"
        element={
          <AdminProtectedRoute>
            <AdminTesting />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <AdminProtectedRoute>
            <AdminReports />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminProtectedRoute>
            <AdminSettings />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/currency"
        element={
          <AdminProtectedRoute>
            <AdminCurrencyManagement />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/shipping"
        element={
          <AdminProtectedRoute>
            <AdminShippingManagement />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/discounts"
        element={
          <AdminProtectedRoute>
            <AdminDiscounts />
          </AdminProtectedRoute>
        }
      />

      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
