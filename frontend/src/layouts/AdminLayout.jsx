import { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  RefreshCw,
  FileText,
  Tags,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  FileClock,
  AlertCircle,
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [productsOpen, setProductsOpen] = useState(
    location.pathname.includes('/admin/products') || location.pathname.includes('/admin/categories')
  );
  const [rfqOpen, setRfqOpen] = useState(
    location.pathname.includes('/admin/quote-requests')
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path, search = '') => {
    if (search) {
      return location.pathname === path && location.search.includes(search);
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen bg-gray-900 text-white transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-0 lg:translate-x-0'
        } overflow-hidden`}
      >
        {/* Brand Header */}
        <div className="p-5 shrink-0 flex items-center space-x-3 border-b border-gray-800">
          <img src="/logo.webp" alt="Cocoveera" className="w-8 h-8 object-contain rounded-lg bg-white/10 p-0.5 shrink-0" />
          <div className="leading-none">
            <h1 className="text-sm font-black tracking-widest text-white">COCOVEERA</h1>
            <span className="text-emerald-400 text-[10px] font-bold tracking-wider">B2B Admin Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-0.5 px-3 py-4 [&::-webkit-scrollbar]:hidden select-none">

          {/* ── Dashboard ── */}
          <a
            href="/admin/dashboard"
            className={`flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-[12px] font-extrabold transition-all ${
              isActive('/admin/dashboard')
                ? 'bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/30'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Home size={16} className="shrink-0" />
            <span>Dashboard</span>
          </a>

          {/* ── Products Group ── */}
          <div>
            <button
              onClick={() => setProductsOpen(!productsOpen)}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[12px] font-extrabold transition-all ${
                productsOpen ? 'text-white bg-gray-800' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Package size={16} className="shrink-0" />
                <span>Products</span>
              </div>
              {productsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>

            {productsOpen && (
              <div className="ml-4 pl-3 border-l border-gray-800 mt-1 mb-1 space-y-0.5">
                <a
                  href="/admin/products"
                  className={`flex items-center space-x-2.5 rounded-lg px-3 py-2 text-[11px] font-bold transition-all ${
                    isActive('/admin/products')
                      ? 'bg-[#2E7D32]/20 text-emerald-400 border-l-2 border-emerald-500'
                      : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <Package size={13} />
                  <span>Products</span>
                </a>
                <a
                  href="/admin/categories"
                  className={`flex items-center space-x-2.5 rounded-lg px-3 py-2 text-[11px] font-bold transition-all ${
                    isActive('/admin/categories')
                      ? 'bg-[#2E7D32]/20 text-emerald-400 border-l-2 border-emerald-500'
                      : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <Tags size={13} />
                  <span>Categories</span>
                </a>
              </div>
            )}
          </div>

          {/* ── RFQ & Quotations Group ── */}
          <div>
            <button
              onClick={() => setRfqOpen(!rfqOpen)}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[12px] font-extrabold transition-all ${
                rfqOpen ? 'text-white bg-gray-800' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText size={16} className="shrink-0 text-emerald-400" />
                <span>RFQ & Quotations</span>
              </div>
              {rfqOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>

            {rfqOpen && (
              <div className="ml-4 pl-3 border-l border-gray-800 mt-1 mb-1 space-y-0.5">
                <a
                  href="/admin/quote-requests?status=submitted"
                  className={`flex items-center space-x-2.5 rounded-lg px-3 py-2 text-[11px] font-bold transition-all ${
                    isActive('/admin/quote-requests', 'status=submitted')
                      ? 'bg-amber-500/10 text-amber-400 border-l-2 border-amber-400'
                      : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <Clock size={13} className="text-amber-400 shrink-0" />
                  <span>New RFQs</span>
                </a>
                <a
                  href="/admin/quote-requests?status=pending_review"
                  className={`flex items-center space-x-2.5 rounded-lg px-3 py-2 text-[11px] font-bold transition-all ${
                    isActive('/admin/quote-requests', 'status=pending_review')
                      ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-400'
                      : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <FileClock size={13} className="text-blue-400 shrink-0" />
                  <span>Pending Review</span>
                </a>
                <a
                  href="/admin/quote-requests?status=approved"
                  className={`flex items-center space-x-2.5 rounded-lg px-3 py-2 text-[11px] font-bold transition-all ${
                    isActive('/admin/quote-requests', 'status=approved')
                      ? 'bg-[#2E7D32]/20 text-emerald-400 border-l-2 border-emerald-400'
                      : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                  <span>Approved Quotes</span>
                </a>
                <a
                  href="/admin/quote-requests?status=rejected"
                  className={`flex items-center space-x-2.5 rounded-lg px-3 py-2 text-[11px] font-bold transition-all ${
                    isActive('/admin/quote-requests', 'status=rejected')
                      ? 'bg-red-500/10 text-red-400 border-l-2 border-red-400'
                      : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <XCircle size={13} className="text-red-400 shrink-0" />
                  <span>Rejected Quotes</span>
                </a>
                <a
                  href="/admin/quote-requests?status=expired"
                  className={`flex items-center space-x-2.5 rounded-lg px-3 py-2 text-[11px] font-bold transition-all ${
                    isActive('/admin/quote-requests', 'status=expired')
                      ? 'bg-gray-600/20 text-gray-400 border-l-2 border-gray-500'
                      : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <AlertCircle size={13} className="text-gray-500 shrink-0" />
                  <span>Expired Quotes</span>
                </a>
              </div>
            )}
          </div>

          {/* ── Separator ── */}
          <div className="my-2 border-t border-gray-800/60" />

          {/* ── Orders ── */}
          <a
            href="/admin/orders"
            className={`flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-[12px] font-extrabold transition-all ${
              isActive('/admin/orders')
                ? 'bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/30'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <ShoppingCart size={16} className="shrink-0" />
            <span>Orders</span>
          </a>

          {/* ── Refunds ── */}
          <a
            href="/admin/refunds"
            className={`flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-[12px] font-extrabold transition-all ${
              isActive('/admin/refunds')
                ? 'bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/30'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <RefreshCw size={16} className="shrink-0" />
            <span>Refunds</span>
          </a>

          {/* ── Customers ── */}
          <a
            href="/admin/users"
            className={`flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-[12px] font-extrabold transition-all ${
              isActive('/admin/users')
                ? 'bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/30'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Users size={16} className="shrink-0" />
            <span>Customers</span>
          </a>

          {/* ── Separator ── */}
          <div className="my-2 border-t border-gray-800/60" />

          {/* ── Settings ── */}
          <a
            href="/admin/settings"
            className={`flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-[12px] font-extrabold transition-all ${
              isActive('/admin/settings')
                ? 'bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/30'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Settings size={16} className="shrink-0" />
            <span>Settings</span>
          </a>
        </nav>

        {/* Footer: Admin Info + Logout */}
        <div className="shrink-0 border-t border-gray-800 bg-gray-950">
          {/* Admin Profile */}
          <div className="flex items-center space-x-3 px-4 py-3 border-b border-gray-800/60">
            <img
              src={admin?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(admin?.name || 'Admin')}&background=2E7D32&color=fff`}
              alt="Admin"
              className="w-8 h-8 rounded-full object-cover border border-gray-700 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-black text-white truncate">{admin?.name || 'Admin'}</p>
              <p className="text-[10px] text-gray-500 truncate">{admin?.email}</p>
            </div>
          </div>
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-red-400 hover:text-red-300 font-extrabold text-[12px] transition w-full px-4 py-3 hover:bg-red-500/10 cursor-pointer"
          >
            <LogOut size={16} className="shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 flex flex-col min-h-screen ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer"
            >
              <span className="lg:hidden">
                {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
              </span>
              <span className="hidden lg:block">
                <Menu size={22} />
              </span>
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{admin?.name}</p>
                <p className="text-xs text-gray-500">{admin?.email}</p>
              </div>
              <img
                src={admin?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(admin?.name || 'Admin')}&background=2E7D32&color=fff`}
                alt="Admin Avatar"
                className="h-9 w-9 rounded-full object-cover border-2 border-emerald-500/30"
              />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
