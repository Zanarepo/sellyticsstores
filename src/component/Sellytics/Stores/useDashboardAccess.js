// src/components/Dashboard/useDashboardAccess.js

import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { featureKeyMapping } from './toolsConfig';

export default function useDashboardAccess() {
  const [shopName, setShopName] = useState('Store Owner');
  const [allowedFeatures, setAllowedFeatures] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchAllowedFeatures = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const storeId = localStorage.getItem('store_id');
      const userId = localStorage.getItem('user_id');
      const userAccessRaw = localStorage.getItem('user_access');

      if (!storeId) {
        setErrorMessage('Please log in to access the dashboard.');
        setIsLoading(false);
        return;
      }

      localStorage.removeItem(`features_${storeId}`);

      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('shop_name, allowed_features, premium')
        .eq('id', storeId)
        .single();

      if (storeError || !storeData) {
        setErrorMessage('Failed to load feature permissions. Please try again.');
        setIsLoading(false);
        return;
      }

      let hasPremiumAccess = storeData.premium === true || 
        (typeof storeData.premium === 'string' && storeData.premium.toLowerCase() === 'true');

      let features = [];
      if (Array.isArray(storeData.allowed_features)) {
        features = storeData.allowed_features
          .map(item => {
            const normalized = item?.trim().toLowerCase();
            return featureKeyMapping[normalized] || normalized;
          })
          .filter(Boolean);
      } else if (typeof storeData.allowed_features === 'string') {
        try {
          const parsed = JSON.parse(storeData.allowed_features);
          if (Array.isArray(parsed)) {
            features = parsed
              .map(item => {
                const normalized = item?.trim().toLowerCase();
                return featureKeyMapping[normalized] || normalized;
              })
              .filter(Boolean);
          }
        } catch (e) {
          features = [];
        }
      }

      let fetchedShopName = storeData.shop_name || 'Store Owner';

      // Additional premium checks via store_users and user_access
      if (!hasPremiumAccess && userId) {
        const { data: userStores } = await supabase
          .from('store_users')
          .select('store_id')
          .eq('id', userId);

        if (userStores?.length > 0) {
          const associatedIds = userStores.map(us => us.store_id);
          const { data: premiumStores } = await supabase
            .from('stores')
            .select('shop_name, premium')
            .in('id', associatedIds)
            .eq('premium', true);

          if (premiumStores?.length > 0) {
            hasPremiumAccess = true;
            fetchedShopName = premiumStores[0].shop_name || fetchedShopName;
          }
        }
      }

      if (!hasPremiumAccess && userAccessRaw) {
        try {
          const userAccess = JSON.parse(userAccessRaw);
          const accessStoreIds = userAccess?.store_ids || [];
          if (accessStoreIds.length > 0) {
            const { data: premiumAccessStores } = await supabase
              .from('stores')
              .select('shop_name, premium')
              .in('id', accessStoreIds)
              .eq('premium', true);

            if (premiumAccessStores?.length > 0) {
              hasPremiumAccess = true;
              fetchedShopName = premiumAccessStores[0].shop_name || fetchedShopName;
            }
          }
        } catch (e) {
          console.error('Error parsing user_access');
        }
      }

      setShopName(fetchedShopName);
      setIsPremium(hasPremiumAccess);
      setAllowedFeatures(features);
      if (!hasPremiumAccess) {
        setErrorMessage('Some features are available only for premium users. Please upgrade your store\'s subscription.');
      }
    } catch (err) {
      setErrorMessage('An error occurred while loading permissions. Please try again.');
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
    isLoading,
    errorMessage,
    setErrorMessage,
    refreshPermissions: fetchAllowedFeatures,
  };
}