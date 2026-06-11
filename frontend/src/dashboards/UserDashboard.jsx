/**
 * File: frontend/src/dashboards/UserDashboard.jsx
 * Purpose: Layout wrapper or sub-component specific to user/admin dashboards.
 */
import React, { useState, useEffect } from 'react';
import { useAuth, apiClient } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import Marketplace from './Marketplace';
import ProfileCard from './ProfileCard';

const UserDashboard = () => {
  const { user, logout, fetchProfile } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState('Marketplace');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  
  // Filter/Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Featured');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  // Product Data
  const [products, setProducts] = useState(() => {
    const cached = localStorage.getItem('cocoveera_products');
    return cached ? JSON.parse(cached) : [];
  });
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(() => !localStorage.getItem('cocoveera_products'));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const cached = localStorage.getItem('cocoveera_products');
        if (cached) {
          setProducts(JSON.parse(cached));
          setLoading(false);
        }

        const prodRes = await apiClient.get('/products');
        if (prodRes.data.success) {
          setProducts(prodRes.data.data);
          localStorage.setItem('cocoveera_products', JSON.stringify(prodRes.data.data));
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user) {
      setWishlist(user.wishlist || []);
      setCartCount(user.cart?.length || 0);
    }
  }, [user]);

  const handleWishlistToggle = async (product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p._id === product._id);
      if (exists) {
        return prev.filter(p => p._id !== product._id);
      }
      return [...prev, product];
    });
    try {
      await apiClient.post('/users/wishlist', { productId: product._id });
      await fetchProfile(); // Refresh global context
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const res = await apiClient.post('/users/cart', { productId: product._id, quantity: 1, increment: true });
      if (res.data.success) {
        setCartCount(res.data.data.length);
        await fetchProfile(); // Refresh global context
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyNow = async (product) => {
    await handleAddToCart(product);
    navigate('/account/cart');
  };

  const handleTabChange = (tab) => {
    switch(tab) {
      case 'Marketplace': setActiveTab('Marketplace'); break;
      case 'Profile': setActiveTab('Profile'); break;
      case 'My Orders': navigate('/account/orders'); break;
      case 'Cart': navigate('/account/cart'); break;
      case 'Wishlist': navigate('/account/saved'); break;
      case 'Saved Addresses': navigate('/account/address'); break;
      case 'Help & Support': navigate('/account/support'); break;
      case 'Settings': navigate('/account/settings'); break;
      default: setActiveTab(tab);
    }
  };

  return (
    <DashboardLayout
      user={user}
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      cartCount={cartCount}
      wishlistCount={wishlist.length}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      sortBy={sortBy}
      setSortBy={setSortBy}
      onLogoutClick={logout}
      onFilterClick={() => setFilterDrawerOpen(true)}
    >
      {activeTab === 'Marketplace' && (
        <Marketplace 
          loading={loading}
          products={products}
          wishlist={wishlist}
          onWishlistToggle={handleWishlistToggle}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterDrawerOpen={filterDrawerOpen}
          setFilterDrawerOpen={setFilterDrawerOpen}
        />
      )}
      
      {activeTab === 'Profile' && (
        <div className="flex-1 max-w-2xl mx-auto w-full">
          <ProfileCard user={user} />
        </div>
      )}
      
      {/* Placeholder for other tabs like "My Orders", "Wishlist", "Cart", "Saved Addresses", "Settings" */}
      {activeTab !== 'Marketplace' && activeTab !== 'Profile' && (
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-stone-100 p-8 flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4 max-w-sm">
            <h2 className="text-xl font-bold text-stone-800">{activeTab}</h2>
            <p className="text-stone-500 text-sm font-semibold leading-relaxed">
              This section is currently under development. Check back later for updates.
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserDashboard;
