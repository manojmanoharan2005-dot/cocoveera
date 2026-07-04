/**
 * File: frontend/src/App.jsx
 * Purpose: Main React application component defining routing structure.
 */
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import axios from 'axios';
import { API_URL } from './utils/config';

// Prefetching removed for optimization
// Public Pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Products = lazy(() => import('./pages/Products'));
const QualityTesting = lazy(() => import('./pages/QualityTesting'));
const CoconutSubstrates = lazy(() => import('./pages/CoconutSubstrates'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AuthLayout = lazy(() => import('./layouts/AuthLayout'));
const OTPForm = lazy(() => import('./components/auth/OTPForm'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/AdminCategories'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminInquiries = lazy(() => import('./pages/admin/AdminInquiries'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminRefunds = lazy(() => import('./pages/admin/AdminRefunds'));
const AdminTesting = lazy(() => import('./pages/AdminTesting'));
const AdminReports = lazy(() => import('./pages/AdminReports'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminCurrencyManagement = lazy(() => import('./pages/AdminCurrencyManagement'));
const AdminShippingManagement = lazy(() => import('./pages/AdminShippingManagement'));
const AdminDiscounts = lazy(() => import('./pages/AdminDiscounts'));
const ContainerViewerDemo = lazy(() => import('./pages/ContainerViewerDemo'));

// User Protected Route
const Marketplace = lazy(() => import('./dashboards/Marketplace'));
const PrivateLayout = lazy(() => import('./layouts/PrivateLayout'));
const Orders = lazy(() => import('./pages/account/Orders'));
const OrderDetails = lazy(() => import('./pages/account/OrderDetails'));
const Cart = lazy(() => import('./pages/account/Cart'));
const Checkout = lazy(() => import('./pages/account/Checkout'));
const OrderSummary = lazy(() => import('./pages/account/OrderSummary'));
const Payment = lazy(() => import('./pages/account/Payment'));
const OrderSuccess = lazy(() => import('./pages/account/OrderSuccess'));
const TrackOrder = lazy(() => import('./pages/account/TrackOrder'));
const SavedCart = lazy(() => import('./pages/account/SavedCart'));
const Address = lazy(() => import('./pages/account/Address'));
const Settings = lazy(() => import('./pages/account/Settings'));
const Profile = lazy(() => import('./pages/account/Profile'));
const ProductView = lazy(() => import('./pages/account/ProductView'));
const Invoices = lazy(() => import('./pages/account/Invoices'));
const Quotes = lazy(() => import('./pages/account/Quotes'));
const Notifications = lazy(() => import('./pages/account/Notifications'));
const PaymentHistory = lazy(() => import('./pages/account/PaymentHistory'));
const CustomerTestingReports = lazy(() => import('./pages/account/CustomerTestingReports'));
const HelpCenter = lazy(() => import('./pages/account/HelpCenter'));
const MobileAccount = lazy(() => import('./pages/account/MobileAccount'));
const MobileBottomNav = lazy(() => import('./components/MobileBottomNav'));

import { Ship } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Loading screen matching the requested design
const LoadingScreen = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center">
    <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
      {/* Outer spinning ring */}
      <div className="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-[#2F7D32] border-t-transparent border-l-transparent rounded-full animate-spin"></div>
      
      {/* Inner moving ship */}
      <motion.div
        animate={{
          y: [-2, 2, -2],
          rotate: [-5, 5, -5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-[#2F7D32]"
      >
        <Ship className="w-8 h-8" />
      </motion.div>
    </div>
    <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.25em] text-stone-400 font-sans">
      Loading Cocoveera...
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Guard for guest pages (redirects to dashboard if already logged in)
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
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



const PublicLayout = () => {
  const location = useLocation();
  
  const hideFooter = ['/login', '/register'].includes(location.pathname);

  return (
    <div 
      className="flex flex-col min-h-screen relative text-[#1A1A1A] font-sans bg-stone-50"
    >
      <div className="relative z-10 flex flex-col flex-grow w-full">
        <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-grow"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      {!hideFooter && <Footer />}
      </div>
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function AppContent() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ScrollToTop />
      <Routes>
        {/* Fullscreen Immerse Route */}
        <Route path="/welcome" element={<Onboarding />} />

        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/quality-testing" element={<QualityTesting />} />
          <Route path="/substrates" element={<CoconutSubstrates />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/containers/viewer" element={<ContainerViewerDemo />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route
            path="/verify-otp"
            element={
              <AuthLayout>
                <OTPForm />
              </AuthLayout>
            }
          />
        </Route>

        {/* User Protected Routes under PrivateLayout */}
        <Route element={<ProtectedRoute><PrivateLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Marketplace />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-summary" element={<OrderSummary />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/track/:id" element={<TrackOrder />} />
          <Route path="/wishlist" element={<SavedCart />} />
          <Route path="/saved" element={<SavedCart />} />
          <Route path="/address" element={<Address />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/payments" element={<PaymentHistory />} />
          <Route path="/testing-reports" element={<CustomerTestingReports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/support" element={<HelpCenter />} />
          <Route path="/mobile" element={<MobileAccount />} />
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
          path="/admin/inquiries"
          element={
            <AdminProtectedRoute>
              <AdminInquiries />
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
          path="/admin/refunds"
          element={
            <AdminProtectedRoute>
              <AdminRefunds />
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

        {/* Catch all route and Product routes */}
        <Route element={<PublicLayout />}>
          <Route path="/product/:id" element={<ProductView />} />
          <Route path="/productview/:id" element={<ProductView />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <MobileBottomNav />
    </Suspense>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <AdminAuthProvider>
            <AppContent />
          </AdminAuthProvider>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
