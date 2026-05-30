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
    { name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Containers', icon: Truck, path: '/admin/containers' },
    { name: 'Quality Testing', icon: Beaker, path: '/admin/testing' },
    { name: 'Reports', icon: BarChart3, path: '/admin/reports' },
    { name: 'Discounts', icon: Tag, path: '/admin/discounts' },
    { name: 'Shipping', icon: Truck, path: '/admin/shipping' },
    { name: 'Currency', icon: Settings, path: '/admin/currency' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen bg-gray-900 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold">Cocoveera Admin</h1>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className="flex items-center space-x-3 rounded-lg px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition"
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </a>
          ))}
        </nav>

        <div className="absolute bottom-6 left-0 right-0 border-t border-gray-700 pt-6 px-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-red-400 hover:text-red-300 transition w-full"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <div className="bg-white shadow">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">{admin?.name}</p>
                <p className="text-sm text-gray-500">{admin?.email}</p>
              </div>
              <img
                src={admin?.profileImage || 'https://via.placeholder.com/40'}
                alt="Admin Avatar"
                className="h-10 w-10 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
