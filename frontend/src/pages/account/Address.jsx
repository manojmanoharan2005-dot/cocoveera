/**
 * File: frontend/src/pages/account/Address.jsx
 * Purpose: React page component representing the Address view.
 */
import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient, useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const Address = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { fetchProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '', phone: '', street: '', city: '', state: '', zip: '', country: 'United States', isDefault: false, tag: 'Home'
  });

  const mapPattern = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232E7D32' fill-opacity='0.03' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/users/profile');
        if (res.data.success) {
          const fetchedAddresses = res.data.data.addresses || [];
          setAddresses(fetchedAddresses);
          if (fetchedAddresses.length === 0) {
            setIsEditing(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch addresses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/users/addresses', formData);
      if (res.data.success) {
        setAddresses(res.data.data);
        setIsEditing(false);
        setFormData({ name: '', phone: '', street: '', city: '', state: '', zip: '', country: 'United States', isDefault: false, tag: 'Home' });
        const fetchedProfile = await fetchProfile();
        if (fetchedProfile && fetchedProfile.addresses && fetchedProfile.addresses.length === 1) {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const res = await apiClient.delete(`/users/addresses/${id}`);
        if (res.data.success) {
          setAddresses(res.data.data);
          await fetchProfile();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      const res = await apiClient.post('/users/addresses', { ...addr, isDefault: true });
      if (res.data.success) {
        setAddresses(res.data.data);
        await fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-12 text-center text-stone-500 font-bold">Loading addresses...</div>;

  return (
    <div className="w-full space-y-6 pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Address</h1>
          {addresses.length === 0 ? (
            <p className="text-red-500 font-bold text-sm">Action Required: Please complete your profile by adding a shipping address to proceed.</p>
          ) : (
            <p className="text-stone-500 font-semibold text-sm">Manage your shipping and billing locations.</p>
          )}
        </div>
        <button 
          onClick={() => setIsEditing(true)}
          className="px-6 py-2.5 bg-[#2E7D32] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#1B5E20] transition-colors shadow-lg shadow-[#2E7D32]/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      {isEditing && (
        <div className="bg-white rounded-[24px] p-6 lg:p-8 border border-[#2E7D32] shadow-sm mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-black text-stone-900 mb-6">Add New Address</h2>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Full Name</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Phone Number</label>
                <PhoneInput
                  country={'us'}
                  value={formData.phone}
                  onChange={(phone) => setFormData({ ...formData, phone })}
                  enableSearch={true}
                  searchPlaceholder="Search country or code..."
                  inputClass="!w-full !bg-stone-50 !border-stone-200 !text-stone-900 !rounded-xl !h-[46px] !pl-12 !pr-4 !text-sm !font-semibold focus:!bg-white focus:!border-[#2E7D32] !outline-none !transition-all"
                  buttonClass="!bg-stone-50 !border-stone-200 !rounded-l-xl !pl-2"
                  dropdownClass="!rounded-xl !border-stone-200 !shadow-lg !text-sm !font-semibold"
                  searchClass="!bg-stone-50 !border-stone-200 !text-sm !font-semibold !rounded-lg !mb-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Street Address (Port / Warehouse)</label>
                <input required name="street" value={formData.street} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] outline-none transition-all" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">City</label>
                <input required name="city" value={formData.city} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] outline-none transition-all" />
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">State / Province</label>
                <input required name="state" value={formData.state} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] outline-none transition-all" />
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Postal Code</label>
                <input required name="zip" value={formData.zip} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] outline-none transition-all" />
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Country</label>
                <select required name="country" value={formData.country} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] outline-none transition-all appearance-none">
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="UAE">UAE</option>
                  <option value="India">India</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Address Tag</label>
                <select name="tag" value={formData.tag || 'Home'} onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] outline-none transition-all appearance-none">
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" name="isDefault" id="makeDefault" checked={formData.isDefault} onChange={handleChange} className="w-4 h-4 text-[#2E7D32] rounded border-stone-300 focus:ring-[#2E7D32]" />
              <label htmlFor="makeDefault" className="text-sm font-semibold text-stone-700">Set as default shipping address</label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
              {addresses.length > 0 && (
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-stone-500 font-bold text-sm hover:text-stone-900 transition-colors">
                  Cancel
                </button>
              )}
              <button type="submit" className="px-8 py-2.5 bg-[#2E7D32] text-white font-bold text-sm rounded-xl hover:bg-[#1B5E20] transition-colors">
                Save Address
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses.map((addr) => (
          <div key={addr._id} className={`relative rounded-[22px] p-[2px] transition-all duration-500 ${addr.isDefault ? 'bg-[#2E7D32] shadow-md shadow-[#2E7D32]/10' : 'bg-transparent border border-stone-200'}`}>
            <div className="bg-white rounded-[20px] p-6 h-full relative overflow-hidden group">
              {/* Map Grid Background */}
              <div className="absolute inset-0 z-0 pointer-events-none opacity-50 transition-opacity duration-500 group-hover:opacity-100" style={{ backgroundImage: mapPattern }}></div>
              
              <div className="relative z-10">
                {addr.isDefault && (
                  <div className="absolute -top-3 -right-3 bg-[#2E7D32] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Default
                  </div>
                )}
                
                <div className="flex items-start gap-3 mb-4 border-b border-stone-100 pb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-[#F0FAF0] text-[#2E7D32]' : 'bg-stone-100 text-stone-500'}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                      {addr.name}
                      {addr.tag && (
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[9px] uppercase rounded border border-stone-200 tracking-wide font-bold">
                          {addr.tag}
                        </span>
                      )}
                    </h3>
                  </div>
                </div>

                <address className="not-italic text-sm font-semibold text-stone-600 space-y-1 mb-6 h-20">
                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.state} {addr.zip}</p>
                  <p>{addr.country}</p>
                  <p className="pt-1 text-stone-900 font-bold">
                    {addr.phone ? (
                      addr.phone.replace(/\D/g, '').startsWith('91') && addr.phone.replace(/\D/g, '').length > 10
                        ? `+91 ${addr.phone.replace(/\D/g, '').slice(2)}`
                        : addr.phone
                    ) : ''}
                  </p>
                </address>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  {!addr.isDefault ? (
                    <button 
                      onClick={() => handleSetDefault(addr)}
                      className="text-xs font-bold text-[#2E7D32] hover:text-[#1B5E20] transition-colors"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <div /> // spacer
                  )}
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setIsEditing(true);
                        setFormData({
                          ...addr,
                          name: addr.name || '',
                          phone: addr.phone || '',
                          street: addr.street || '',
                          city: addr.city || '',
                          state: addr.state || '',
                          zip: addr.zip || '',
                          country: addr.country || 'United States',
                          isDefault: addr.isDefault || false,
                          tag: addr.tag || 'Home'
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(addr._id)}
                      className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Address;
