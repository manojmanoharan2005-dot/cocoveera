import { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  Home,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Beaker,
  Settings,
  BarChart3,
  Tag,
  Tags,
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { name: 'Products', icon: Package, path: '/admin/products' },
    { name: 'Categories', icon: Tags, path: '/admin/categories' },
    { name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Containers', icon: Truck, path: '/admin/containers' },
    { name: 'Reports', icon: BarChart3, path: '/admin/reports' },
    { name: 'Discounts', icon: Tag, path: '/admin/discounts' },
    { name: 'Shipping', icon: Truck, path: '/admin/shipping' },
    { name: 'Currency', icon: Settings, path: '/admin/currency' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
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
        <div className="p-6 shrink-0 flex justify-between items-center">
          <h1 className="text-xl font-bold whitespace-nowrap">Cocoveera Admin</h1>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1 px-4 py-2 custom-scrollbar">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className="flex items-center space-x-3 rounded-lg px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition whitespace-nowrap"
            >
              <item.icon size={20} className="shrink-0" />
              <span>{item.name}</span>
            </a>
          ))}
        </nav>

        <div className="shrink-0 border-t border-gray-700 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-red-400 hover:text-red-300 transition w-full px-4 py-2 whitespace-nowrap"
          >
            <LogOut size={20} className="shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 flex flex-col min-h-screen ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <div className="bg-white shadow shrink-0">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={24} className="lg:hidden" /> : <Menu size={24} />}
              <Menu size={24} className="hidden lg:block" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-gray-900">{admin?.name}</p>
                <p className="text-sm text-gray-500">{admin?.email}</p>
              </div>
              <img
                src={admin?.profileImage || 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'}
                alt="Admin Avatar"
                className="h-10 w-10 rounded-full object-cover border border-stone-200"
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
