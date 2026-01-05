// src/components/store-owner/StoreOwnerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useNavigate } from 'react-router-dom';

import ProfileHeader from './ProfileHeader';
import StoreDetailsForm from './StoreDetailsForm';
import PasswordChangeForm from './PasswordChangeForm';
import NotificationBanner from './NotificationBanner';

const StoreOwnerDashboard = () => {
  const navigate = useNavigate();
  const storeId = localStorage.getItem('store_id');

  const [isEditing, setIsEditing] = useState(false);
  const [storeDetails, setStoreDetails] = useState({
    shop_name: '', full_name: '', email_address: '', nature_of_business: '',
    phone_number: '', physical_address: '', state: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const fetchStoreDetails = async () => {
      if (!storeId) return;
      const { data, error } = await supabase.from('stores').select('*').eq('id', storeId).single();
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
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    let logoUrl = storeDetails.business_logo;

    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${storeId}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, logoFile, { upsert: true });
      if (uploadError) {
        setNotification({ message: `Logo upload failed: ${uploadError.message}`, type: 'error' });
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
      logoUrl = publicUrl;
    }

    const { error } = await supabase.from('stores').update({ ...storeDetails, business_logo: logoUrl }).eq('id', storeId);
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
    const { error } = await supabase.from('stores').update({ password: hashed }).eq('id', storeId);
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
        <NotificationBanner message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: 'success' })} />

        <ProfileHeader storeDetails={storeDetails} handleLogout={handleLogout} />

        <StoreDetailsForm
          storeDetails={storeDetails}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleInputChange={handleInputChange}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
          handleUpdateDetails={handleUpdateDetails}
        />

        <PasswordChangeForm password={password} setPassword={setPassword} handleChangePassword={handleChangePassword} />
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;