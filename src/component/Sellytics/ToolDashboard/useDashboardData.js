// src/components/dashboard/useDashboardData.js
import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient'; // adjust path
import { featureKeyMapping } from './tools';

export function useDashboardData() {
  const [shopName, setShopName] = useState('Store Owner');
  const [allowedFeatures, setAllowedFeatures] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllowedFeatures = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const storeId = localStorage.getItem('store_id');
      if (!storeId) {
        setErrorMessage('Please log in to access the dashboard.');
        return;
      }

      const { data: storeData, error } = await supabase
        .from('stores')
        .select('shop_name, allowed_features, premium')
        .eq('id', storeId)
        .single();

      if (error) throw error;

      setShopName(storeData?.shop_name || 'Store Owner');
      setIsPremium(!!storeData?.premium);

      let features = [];
      if (Array.isArray(storeData.allowed_features)) {
        features = storeData.allowed_features
          .map(item => {
            const norm = item?.trim().toLowerCase();
            return featureKeyMapping[norm] || norm;
          })
          .filter(Boolean);
      } else if (typeof storeData.allowed_features === 'string') {
        try {
          const parsed = JSON.parse(storeData.allowed_features);
          if (Array.isArray(parsed)) {
            features = parsed.map(item => {
              const norm = item?.trim().toLowerCase();
              return featureKeyMapping[norm] || norm;
            }).filter(Boolean);
          }
        } catch {}
      }

      setAllowedFeatures(features);
      if (!storeData.premium) {
        setErrorMessage('Some features are available only for premium users.');
      }
    } catch (err) {
      setErrorMessage('Failed to load permissions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllowedFeatures();
  }, []);

  return {
    shopName,
    allowedFeatures,
    isPremium,
    errorMessage,
    isLoading,
    setErrorMessage,
    fetchAllowedFeatures,
  };
}