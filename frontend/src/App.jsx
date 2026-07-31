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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/common/ErrorBoundary';

// Configure QueryClient with the optimized performance settings requested
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes stale time
      cacheTime: 15 * 60 * 1000,     // 15 minutes cache time
      refetchOnWindowFocus: false,   // Disable refetching on window focus
      keepPreviousData: true,        // Show cached data while loading new
    },
  },
});

import { lazyWithRetry } from './utils/lazyWithRetry';

// Prefetching removed for optimization
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
const QualityTesting = lazyWithRetry(() => import('./pages/QualityTesting'), 'QualityTesting');
const CoconutSubstrates = lazyWithRetry(() => import('./pages/CoconutSubstrates'), 'CoconutSubstrates');
import Contact from './pages/Contact';
const NotFound = lazyWithRetry(() => import('./pages/NotFound'), 'NotFound');
const PrivacyPolicy = lazyWithRetry(() => import('./pages/PrivacyPolicy'), 'PrivacyPolicy');
const TermsConditions = lazyWithRetry(() => import('./pages/TermsConditions'), 'TermsConditions');
const Onboarding = lazyWithRetry(() => import('./pages/Onboarding'), 'Onboarding');

// Eagerly load Authentication pages to prevent Suspend flickers during auth flow navigation
import AuthLayout from './layouts/AuthLayout';
import OTPForm from './components/auth/OTPForm';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

// Admin Pages
const AdminDashboard = lazyWithRetry(() => import('./pages/AdminDashboard'), 'AdminDashboard');
const AdminProducts = lazyWithRetry(() => import('./pages/AdminProducts'), 'AdminProducts');
const AdminCategories = lazyWithRetry(() => import('./pages/AdminCategories'), 'AdminCategories');
const AdminOrders = lazyWithRetry(() => import('./pages/AdminOrders'), 'AdminOrders');
const AdminUsers = lazyWithRetry(() => import('./pages/AdminUsers'), 'AdminUsers');
const AdminInquiries = lazyWithRetry(() => import('./pages/admin/AdminInquiries'), 'AdminInquiries');
const AdminPayments = lazyWithRetry(() => import('./pages/admin/AdminPayments'), 'AdminPayments');
const AdminRefunds = lazyWithRetry(() => import('./pages/admin/AdminRefunds'), 'AdminRefunds');
const AdminTesting = lazyWithRetry(() => import('./pages/AdminTesting'), 'AdminTesting');
const AdminReports = lazyWithRetry(() => import('./pages/AdminReports'), 'AdminReports');
const AdminSettings = lazyWithRetry(() => import('./pages/AdminSettings'), 'AdminSettings');
const AdminCurrencyManagement = lazyWithRetry(() => import('./pages/AdminCurrencyManagement'), 'AdminCurrencyManagement');
const AdminShippingManagement = lazyWithRetry(() => import('./pages/AdminShippingManagement'), 'AdminShippingManagement');
const AdminDiscounts = lazyWithRetry(() => import('./pages/AdminDiscounts'), 'AdminDiscounts');
const AdminQuoteRequests = lazyWithRetry(() => import('./pages/admin/AdminQuoteRequests'), 'AdminQuoteRequests');
const AdminQuoteRequestDetails = lazyWithRetry(() => import('./pages/admin/AdminQuoteRequestDetails'), 'AdminQuoteRequestDetails');

// User Protected Route
const Marketplace = lazyWithRetry(() => import('./dashboards/Marketplace'), 'Marketplace');
const DashboardLayout = lazyWithRetry(() => import('./dashboards/DashboardLayout'), 'DashboardLayout');
const Orders = lazyWithRetry(() => import('./pages/account/Orders'), 'Orders');
const OrderDetails = lazyWithRetry(() => import('./pages/account/OrderDetails'), 'OrderDetails');
const OrderPaymentMilestones = lazyWithRetry(() => import('./pages/account/OrderPaymentMilestones'), 'OrderPaymentMilestones');
import Cart from './pages/account/Cart';
const Checkout = lazyWithRetry(() => import('./pages/account/Checkout'), 'Checkout');
const OrderSummary = lazyWithRetry(() => import('./pages/account/OrderSummary'), 'OrderSummary');
const Payment = lazyWithRetry(() => import('./pages/account/Payment'), 'Payment');
const OrderSuccess = lazyWithRetry(() => import('./pages/account/OrderSuccess'), 'OrderSuccess');
const TrackOrder = lazyWithRetry(() => import('./pages/account/TrackOrder'), 'TrackOrder');
const SavedCart = lazyWithRetry(() => import('./pages/account/SavedCart'), 'SavedCart');
const Address = lazyWithRetry(() => import('./pages/account/Address'), 'Address');
const Settings = lazyWithRetry(() => import('./pages/account/Settings'), 'Settings');
const Profile = lazyWithRetry(() => import('./pages/account/Profile'), 'Profile');
import ProductView from './pages/account/ProductView';
const Quotes = lazyWithRetry(() => import('./pages/account/Quotes'), 'Quotes');
const QuoteDetails = lazyWithRetry(() => import('./pages/account/QuoteDetails'), 'QuoteDetails');
const RequestQuotePage = lazyWithRetry(() => import('./pages/account/RequestQuotePage'), 'RequestQuotePage');
const Notifications = lazyWithRetry(() => import('./pages/account/Notifications'), 'Notifications');
const PaymentHistory = lazyWithRetry(() => import('./pages/account/PaymentHistory'), 'PaymentHistory');
const CustomerTestingReports = lazyWithRetry(() => import('./pages/account/CustomerTestingReports'), 'CustomerTestingReports');
const HelpCenter = lazyWithRetry(() => import('./pages/account/HelpCenter'), 'HelpCenter');
const MobileAccount = lazyWithRetry(() => import('./pages/account/MobileAccount'), 'MobileAccount');

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

// Utility to safely parse JWT
const parseJwtSafe = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const isTokenValid = (token) => {
  if (!token) return false;
  const decoded = parseJwtSafe(token);
  if (!decoded || !decoded.exp) return false;
  return (decoded.exp * 1000) > Date.now();
};

// Guard for user authenticated pages
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // STRICT BROWSER HISTORY SECURITY: Verify token directly in sessionStorage
  const token = sessionStorage.getItem('cocoveera_token');
  const hasValidToken = isTokenValid(token);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !hasValidToken) {
    const fullPath = location.pathname + location.search + location.hash;
    sessionStorage.setItem('postLoginRedirect', fullPath);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Guard for guest pages (redirects to dashboard if already logged in)
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const token = sessionStorage.getItem('cocoveera_token');
  const hasValidToken = isTokenValid(token);
  const [shouldRedirect, setShouldRedirect] = React.useState(false);

  useEffect(() => {
    // Only intercept if they have a valid session on mount, preventing race conditions
    // during the active login process where state updates before animation finishes.
    if (user && hasValidToken) {
      setShouldRedirect(true);
    }
  }, []); // Run only once on mount

  if (loading) {
    return <LoadingScreen />;
  }

  if (shouldRedirect) {
    const storedRedirect = sessionStorage.getItem('postLoginRedirect');
    return <Navigate to={storedRedirect || "/dashboard"} replace />;
  }

  return children;
};

// Guard for admin pages
const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();

  // STRICT BROWSER HISTORY SECURITY: Verify token directly in sessionStorage
  const adminToken = sessionStorage.getItem('adminToken');
  const hasValidToken = isTokenValid(adminToken);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!admin || !hasValidToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicLayout = () => {
  const location = useLocation();

  const authPaths = ['/login', '/register', '/verify-otp'];
  const hideFooter = authPaths.includes(location.pathname);

  return (
    <div
      className="flex flex-col min-h-screen relative text-[#1A1A1A] font-sans bg-stone-50"
    >
      <div className="relative z-10 flex flex-col flex-grow w-full">
        <Navbar />
        <div className="flex-grow flex flex-col w-full">
          <ErrorBoundary>
            <Suspense fallback={<div className="flex-grow flex items-center justify-center opacity-0 transition-opacity duration-300 delay-150"><div className="w-8 h-8 border-4 border-stone-200 border-t-[#2F7D32] rounded-full animate-spin"></div></div>}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
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
    const pending = sessionStorage.getItem('postLoginRedirect');
    if (pending && pathname === pending.split('?')[0]) {
      sessionStorage.removeItem('postLoginRedirect');
    }
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
  // Security: Handle back button and bfcache navigation without allowing cached protected pages
  useEffect(() => {
    const verifySecurityState = () => {
      const token = sessionStorage.getItem('cocoveera_token');
      const adminToken = sessionStorage.getItem('adminToken');

      const hasValidUserToken = isTokenValid(token);
      const hasValidAdminToken = isTokenValid(adminToken);

      const path = window.location.pathname;
      const isUserProtected = path.includes('/dashboard') || path.includes('/orders') || path.includes('/cart') || path.includes('/checkout') || path.includes('/profile') || path.includes('/settings') || path.includes('/product') || path.includes('/quotes') || path.includes('/payments') || path.includes('/testing-reports') || path.includes('/notifications') || path.includes('/support') || path.includes('/mobile') || path.includes('/address') || path.includes('/wishlist') || path.includes('/saved');
      const isAdminProtected = path.startsWith('/admin');

      if (isAdminProtected && !hasValidAdminToken) {
        window.location.replace('/login');
      } else if (isUserProtected && !hasValidUserToken) {
        window.location.replace('/login');
      }
    };

    const handlePageShow = (event) => {
      verifySecurityState();
    };

    const handlePopState = () => {
      verifySecurityState();
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <ScrollToTop />
      <Routes>
        {/* Fullscreen Immerse Routes */}
        <Route path="/welcome" element={<Onboarding />} />

        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<Navigate to="/login" replace />} />
          <Route path="/production-process" element={<QualityTesting />} />
          <Route path="/quality-testing" element={<Navigate to="/production-process" replace />} />
          <Route path="/global-network" element={<CoconutSubstrates />} />
          <Route path="/substrates" element={<Navigate to="/global-network" replace />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />

          {/* Auth Flow - Shared Layout to prevent flicker */}
          <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
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
          <Route path="/orders/payment/:id" element={<OrderPaymentMilestones />} />
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
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/quotes/:id" element={<QuoteDetails />} />
          <Route path="/dashboard/request-quote" element={<RequestQuotePage />} />
          <Route path="/request-quote" element={<RequestQuotePage />} />
          <Route path="/payments" element={<PaymentHistory />} />
          <Route path="/testing-reports" element={<CustomerTestingReports />} />
          <Route path="/dashboard/how-to-use" element={<Onboarding />} />
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
          path="/admin/quote-requests"
          element={
            <AdminProtectedRoute>
              <AdminQuoteRequests />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/quote-requests/:id"
          element={
            <AdminProtectedRoute>
              <AdminQuoteRequestDetails />
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

import { WishlistProvider } from './context/WishlistContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Router>
          <AuthProvider>
            <WishlistProvider>
              <AdminAuthProvider>
                <AppContent />
              </AdminAuthProvider>
            </WishlistProvider>
          </AuthProvider>
        </Router>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
