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
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
const QualityTesting = lazy(() => import('./pages/QualityTesting'));
const CoconutSubstrates = lazy(() => import('./pages/CoconutSubstrates'));
import Contact from './pages/Contact';
const NotFound = lazy(() => import('./pages/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

// Eagerly load Authentication pages to prevent Suspend flickers during auth flow navigation
// Eagerly load Authentication pages to prevent Suspend flickers during auth flow navigation
import AuthLayout from './layouts/AuthLayout';
import OTPForm from './components/auth/OTPForm';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

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
const DashboardLayout = lazy(() => import('./dashboards/DashboardLayout'));
const Orders = lazy(() => import('./pages/account/Orders'));
const OrderDetails = lazy(() => import('./pages/account/OrderDetails'));
import Cart from './pages/account/Cart';
const Checkout = lazy(() => import('./pages/account/Checkout'));
const OrderSummary = lazy(() => import('./pages/account/OrderSummary'));
const Payment = lazy(() => import('./pages/account/Payment'));
const OrderSuccess = lazy(() => import('./pages/account/OrderSuccess'));
const TrackOrder = lazy(() => import('./pages/account/TrackOrder'));
const SavedCart = lazy(() => import('./pages/account/SavedCart'));
const Address = lazy(() => import('./pages/account/Address'));
const Settings = lazy(() => import('./pages/account/Settings'));
const Profile = lazy(() => import('./pages/account/Profile'));
import ProductView from './pages/account/ProductView';
const Invoices = lazy(() => import('./pages/account/Invoices'));
const Quotes = lazy(() => import('./pages/account/Quotes'));
const Notifications = lazy(() => import('./pages/account/Notifications'));
const PaymentHistory = lazy(() => import('./pages/account/PaymentHistory'));
const CustomerTestingReports = lazy(() => import('./pages/account/CustomerTestingReports'));
const HelpCenter = lazy(() => import('./pages/account/HelpCenter'));
const MobileAccount = lazy(() => import('./pages/account/MobileAccount'));

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

  // STRICT BROWSER HISTORY SECURITY: Verify token directly
  const hasToken = !!localStorage.getItem('cocoveera_token');

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !hasToken) {
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

  // STRICT BROWSER HISTORY SECURITY: Verify token directly
  const hasToken = !!localStorage.getItem('adminToken');

  if (loading) {
    return <LoadingScreen />;
  }

  if (!admin || !hasToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};



const PublicLayout = () => {
  const location = useLocation();
  
  const authPaths = ['/login', '/register', '/verify-otp'];
  const hideFooter = authPaths.includes(location.pathname);
  const animationKey = authPaths.includes(location.pathname) ? 'auth-flow' : location.pathname;

  return (
    <div 
      className="flex flex-col min-h-screen relative text-[#1A1A1A] font-sans bg-stone-50"
    >
      <div className="relative z-10 flex flex-col flex-grow w-full">
        <Navbar />
      <div className="flex-grow flex flex-col w-full">
        <Suspense fallback={<div className="flex-grow flex items-center justify-center opacity-0 transition-opacity duration-300 delay-150"><div className="w-8 h-8 border-4 border-stone-200 border-t-[#2F7D32] rounded-full animate-spin"></div></div>}>
          <Outlet />
        </Suspense>
      </div>
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

const DynamicLayout = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return user ? <DashboardLayout /> : <PublicLayout />;
};

function AppContent() {
  // Security: Handle bfcache without forcing a full page reload
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        // If restored from bfcache, we can trigger a soft re-check if needed,
        // but we strictly avoid window.location.reload() to prevent flashes.
        const hasToken = !!localStorage.getItem('cocoveera_token');
        const hasAdminToken = !!localStorage.getItem('adminToken');
        
        const path = window.location.pathname;
        const isUserProtected = path.includes('/dashboard') || path.includes('/orders') || path.includes('/cart') || path.includes('/checkout') || path.includes('/profile') || path.includes('/settings');
        const isAdminProtected = path.startsWith('/admin');
        
        if (isAdminProtected && !hasAdminToken) {
          window.location.replace('/login');
        } else if (isUserProtected && !hasToken) {
          window.location.replace('/login');
        }
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

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
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          
          {/* Auth Flow - Shared Layout to prevent flicker */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/verify-otp" element={<OTPForm />} />
          </Route>
        </Route>

        {/* User Protected Routes under DashboardLayout */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
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
          <Route path="/product/:id" element={<ProductView />} />
          <Route path="/productview/:id" element={<ProductView />} />
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

        {/* Catch all route and Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Product routes have been moved to ProtectedRoute above */}
        <Route element={<DynamicLayout />}>
          {/* Empty dynamic block, leaving for any future public/private hybrid routes */}
        </Route>
      </Routes>
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
