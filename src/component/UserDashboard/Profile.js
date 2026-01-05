// StoreOwnerDashboard.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaSave, FaTimes, FaCamera, FaSignOutAlt } from 'react-icons/fa';

// Reusable Notification Banner
const NotificationBanner = ({ message, type = 'success', onClose }) => {
  if (!message) return null;
  return (
    <div className={`max-w-2xl mx-auto mb-6 p-4 rounded-2xl shadow-lg border-l-4 ${
      type === 'success'
        ? 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300'
        : 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300'
    } flex items-center justify-between`}>
      <p className="font-medium">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition">
        <FaTimes />
      </button>
    </div>
  );
};

// Profile Header with Logo & Actions
const ProfileHeader = ({ storeDetails, isEditing, handleLogout }) => {
  const [previewUrl] = useState(storeDetails.business_logo);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-3xl p-8 text-center text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      <div className="absolute top-4 right-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition"
        >
          <FaSignOutAlt />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      <div className="relative z-10">
        <div className="mx-auto w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
          <img
            src={previewUrl || 'https://via.placeholder.com/150?text=Logo'}
            alt="Store Logo"
            className="w-full h-full object-cover"
          />
          {isEditing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition">
              <FaCamera className="text-3xl text-white" />
            </div>
          )}
        </div>
        <h1 className="text-4xl font-bold mb-2">{storeDetails.shop_name || 'My Store'}</h1>
        <p className="text-white/80 text-lg">Store Owner Profile</p>
      </div>
    </div>
  );
};

// Store Details Form Component
const StoreDetailsForm = ({
  storeDetails,
  isEditing,
  setIsEditing,
  handleInputChange,
  logoFile,
  setLogoFile,
  handleUpdateDetails,
  setPreviewUrl,
}) => {
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const states = ['Lagos', 'Abuja', 'Rivers', 'Kaduna', 'Oyo', 'Kano', 'Enugu', 'Port Harcourt'];
  const currencies = [
    { code: 'NGN', name: 'Naira (NGN)' },
    { code: 'USD', name: 'US Dollar (USD)' },
    { code: 'EUR', name: 'Euro (EUR)' },
    { code: 'GBP', name: 'British Pound (GBP)' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 mt-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Store Details</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          {isEditing ? (
            <>
              <FaTimes /> Cancel
            </>
          ) : (
            <>
              <FaEdit /> Edit Profile
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleUpdateDetails} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shop Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Shop Name</label>
          <input
            type="text"
            name="shop_name"
            value={storeDetails.shop_name}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`w-full px-4 py-3 rounded-xl border ${
              isEditing
                ? 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white'
                : 'border-slate-200 bg-slate-50 dark:bg-slate-800'
            } transition`}
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={storeDetails.full_name}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`w-full px-4 py-3 rounded-xl border ${
              isEditing
                ? 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white'
                : 'border-slate-200 bg-slate-50 dark:bg-slate-800'
            } transition`}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
          <input
            type="email"
            name="email_address"
            value={storeDetails.email_address}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`w-full px-4 py-3 rounded-xl border ${
              isEditing
                ? 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white'
                : 'border-slate-200 bg-slate-50 dark:bg-slate-800'
            } transition`}
          />
        </div>

        {/* Nature of Business */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nature of Business</label>
          <input
            type="text"
            name="nature_of_business"
            value={storeDetails.nature_of_business}
            onChange={handleInputChange}
            readOnly={!isEditing}
            placeholder="e.g., Retail, Pharmacy, Restaurant"
            className={`w-full px-4 py-3 rounded-xl border ${
              isEditing
                ? 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white'
                : 'border-slate-200 bg-slate-50 dark:bg-slate-800'
            } transition`}
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
          <input
            type="text"
            name="phone_number"
            value={storeDetails.phone_number}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`w-full px-4 py-3 rounded-xl border ${
              isEditing
                ? 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white'
                : 'border-slate-200 bg-slate-50 dark:bg-slate-800'
            } transition`}
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">State / Region</label>
          {isEditing ? (
            <select
              name="state"
              value={storeDetails.state}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              <option value="">Select state</option>
              {states.map((s) => (
                <option key={s} value={s.toLowerCase()}>{s}</option>
              ))}
            </select>
          ) : (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200">
              {storeDetails.state || 'Not set'}
            </div>
          )}
        </div>

        {/* Default Currency */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Default Currency</label>
          {isEditing ? (
            <select
              name="default_currency"
              value={storeDetails.default_currency}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              <option value="">Select currency</option>
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          ) : (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200">
              {currencies.find(c => c.code === storeDetails.default_currency)?.name || 'Not set'}
            </div>
          )}
        </div>

        {/* Physical Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Physical Address</label>
          <textarea
            name="physical_address"
            value={storeDetails.physical_address}
            onChange={handleInputChange}
            readOnly={!isEditing}
            rows="3"
            className={`w-full px-4 py-3 rounded-xl border resize-none ${
              isEditing
                ? 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white'
                : 'border-slate-200 bg-slate-50 dark:bg-slate-800'
            } transition`}
          />
        </div>

        {/* Logo Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Logo</label>
          {isEditing ? (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 px-6 py-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/70 transition">
                <FaCamera className="text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium text-indigo-700 dark:text-indigo-300">Choose New Logo</span>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
              {logoFile && <span className="text-sm text-green-600">New logo selected</span>}
            </div>
          ) : (
            <div className="flex justify-center">
              <img
                src={storeDetails.business_logo || 'https://via.placeholder.com/200?text=No+Logo'}
                alt="Store Logo"
                className="w-40 h-40 object-cover rounded-2xl shadow-lg border-4 border-slate-200 dark:border-slate-700"
              />
            </div>
          )}
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="md:col-span-2 text-center">
            <button
              type="submit"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
            >
              <FaSave /> Save All Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

// Password Change Form
const PasswordChangeForm = ({ password, setPassword, handleChangePassword }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Change Password</h2>
      <form onSubmit={handleChangePassword} className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            placeholder="Enter new password (min. 6 characters)"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white transition"
          />
        </div>
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

// Main Component
const StoreOwnerDashboard = () => {
  const navigate = useNavigate();
  const storeId = localStorage.getItem('store_id');

  const [isEditing, setIsEditing] = useState(false);
  const [storeDetails, setStoreDetails] = useState({
    shop_name: '',
    full_name: '',
    email_address: '',
    nature_of_business: '',
    phone_number: '',
    physical_address: '',
    state: '',
    business_logo: '',
    default_currency: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [, setPreviewUrl] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const fetchStoreDetails = async () => {
      if (!storeId) return;
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();

      if (error) {
        setNotification({ message: 'Failed to load store details.', type: 'error' });
      } else {
        setStoreDetails(data);
        setPreviewUrl(data.business_logo);
      }
    };

    fetchStoreDetails();
  }, [storeId]);

  const handleInputChange = (e) => {
    setStoreDetails({ ...storeDetails, [e.target.name]: e.target.value });
  };

  const hashPassword = async (plainText) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    let logoUrl = storeDetails.business_logo;

    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${storeId}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, logoFile, { upsert: true });

      if (uploadError) {
        setNotification({ message: `Logo upload failed: ${uploadError.message}`, type: 'error' });
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
      logoUrl = publicUrl;
    }

    const { error } = await supabase
      .from('stores')
      .update({
        ...storeDetails,
        business_logo: logoUrl,
      })
      .eq('id', storeId);

    if (error) {
      setNotification({ message: `Update failed: ${error.message}`, type: 'error' });
    } else {
      setNotification({ message: 'Store details updated successfully!', type: 'success' });
      setIsEditing(false);
      setLogoFile(null);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setNotification({ message: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }
    const hashed = await hashPassword(password);
    const { error } = await supabase
      .from('stores')
      .update({ password: hashed })
      .eq('id', storeId);

    if (error) {
      setNotification({ message: `Password update failed: ${error.message}`, type: 'error' });
    } else {
      setNotification({ message: 'Password updated successfully!', type: 'success' });
      setPassword('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('store_id');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Notification */}
        <NotificationBanner
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: 'success' })}
        />

        {/* Header */}
        <ProfileHeader
          storeDetails={storeDetails}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleLogout={handleLogout}
        />

        {/* Store Details */}
        <StoreDetailsForm
          storeDetails={storeDetails}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleInputChange={handleInputChange}
          logoFile={logoFile}
          setLogoFile={setLogoFile}
          handleUpdateDetails={handleUpdateDetails}
          setPreviewUrl={setPreviewUrl}
        />

        {/* Password Change */}
        <PasswordChangeForm
          password={password}
          setPassword={setPassword}
          handleChangePassword={handleChangePassword}
        />
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;