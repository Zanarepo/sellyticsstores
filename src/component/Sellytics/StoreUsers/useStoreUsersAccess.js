import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { featureKeyMapping } from './storeUsersToolsConfig';

export default function useStoreUsersAccess() {
  const [shopName, setShopName] = useState('Store Owner');
  const [allowedFeatures, setAllowedFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  const fetchAllowedFeatures = async () => {
    try {
      setIsLoading(true);
      setError('');
      const storeId = localStorage.getItem('store_id');
      const userId = localStorage.getItem('user_id');
      const userAccessRaw = localStorage.getItem('user_access');
      let hasPremiumAccess = false;
      let fetchedShopName = 'Store Owner';
      let features = [];

      if (!storeId) {
        setError('No store assigned. Contact your admin.');
        setAllowedFeatures([]);
        setIsLoading(false);
        return;
      }

      if (!userId) {
        setError('User not authenticated. Please log in.');
        setAllowedFeatures([]);
        setIsLoading(false);
        return;
      }

      // Fetch store features and premium status
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('shop_name, allowed_features, premium')
        .eq('id', storeId)
        .single();

      if (storeError) {
        setError('Failed to load store permissions.');
        setAllowedFeatures([]);
        setIsLoading(false);
        return;
      }

      fetchedShopName = storeData?.shop_name || 'Store Owner';
      const isPremiumStore = storeData.premium === true || 
                           (typeof storeData.premium === 'string' && 
                            storeData.premium.toLowerCase() === 'true');
      if (isPremiumStore) {
        hasPremiumAccess = true;
      }

      // Parse store features
      if (Array.isArray(storeData?.allowed_features)) {
        features = storeData.allowed_features
          .map((item) => {
            const normalized = item?.trim().toLowerCase();
            return featureKeyMapping[normalized] || normalized;
          })
          .filter(Boolean);
      } else if (storeData?.allowed_features === '' || storeData?.allowed_features === '""') {
        features = [];
      } else if (typeof storeData?.allowed_features === 'string') {
        try {
          const parsed = JSON.parse(storeData.allowed_features);
          if (Array.isArray(parsed)) {
            features = parsed
              .map((item) => {
                const normalized = item?.trim().toLowerCase();
                return featureKeyMapping[normalized] || normalized;
              })
              .filter(Boolean);
          } else {
            setError('Invalid store feature data.');
            features = [];
          }
        } catch (e) {
          setError('Invalid store feature data.');
          features = [];
        }
      }

      // Fetch user features from store_users
      const { data: userData, error: userError } = await supabase
        .from('store_users')
        .select('allowed_features')
        .eq('id', userId)
        .eq('store_id', storeId)
        .single();

      if (userError) {
        setError('Failed to load user permissions.');
        setAllowedFeatures([]);
        setIsLoading(false);
        return;
      }

      let userFeatures = [];
      if (Array.isArray(userData?.allowed_features)) {
        userFeatures = userData.allowed_features
          .map((item) => {
            const normalized = item?.trim().toLowerCase();
            return featureKeyMapping[normalized] || normalized;
          })
          .filter(Boolean);
      } else if (userData?.allowed_features === '' || userData?.allowed_features === '""') {
        userFeatures = [];
      } else if (typeof userData?.allowed_features === 'string') {
        try {
          const parsed = JSON.parse(userData.allowed_features);
          if (Array.isArray(parsed)) {
            userFeatures = parsed
              .map((item) => {
                const normalized = item?.trim().toLowerCase();
                return featureKeyMapping[normalized] || normalized;
              })
              .filter(Boolean);
          } else {
            setError('Invalid user feature data.');
            userFeatures = [];
          }
        } catch (e) {
          setError('Invalid user feature data.');
          userFeatures = [];
        }
      }

      // If not premium yet and user_id is present, check associated stores via store_users
      if (!hasPremiumAccess && userId) {
        const { data: userStores, error: userStoresError } = await supabase
          .from('store_users')
          .select('store_id')
          .eq('id', userId);

        if (!userStoresError && userStores?.length > 0) {
          const associatedStoreIds = userStores.map((us) => us.store_id);

          // Query premium status for associated stores
          const { data: premiumStores, error: premiumStoresError } = await supabase
            .from('stores')
            .select('id, shop_name, premium')
            .in('id', associatedStoreIds)
            .eq('premium', true);

          if (!premiumStoresError && premiumStores?.length > 0) {
            hasPremiumAccess = true;
            fetchedShopName = premiumStores[0].shop_name || fetchedShopName;
          }
        }
      }

      // If user_access is present, cross-check store_ids for premium
      if (!hasPremiumAccess && userAccessRaw) {
        try {
          const userAccess = JSON.parse(userAccessRaw);
          const accessStoreIds = userAccess?.store_ids || [];

          if (accessStoreIds.length > 0) {
            const { data: premiumAccessStores, error: premiumAccessError } = await supabase
              .from('stores')
              .select('id, shop_name, premium')
              .in('id', accessStoreIds)
              .eq('premium', true);

            if (!premiumAccessError && premiumAccessStores?.length > 0) {
              hasPremiumAccess = true;
              fetchedShopName = premiumAccessStores[0].shop_name || fetchedShopName;
            }
          }
        } catch (parseError) {
          console.error('Error parsing user_access:', parseError.message);
        }
      }

      // Intersect store and user features
      const effectiveFeatures = features
        .map((f) => featureKeyMapping[f] || f)
        .filter((f) => userFeatures.includes(f));

      setShopName(fetchedShopName);
      setIsPremium(hasPremiumAccess);
      setAllowedFeatures(effectiveFeatures);
      if (!hasPremiumAccess) {
        setError('Some features are available only for premium users. Please upgrade your stores subscription.');
      }
    } catch (err) {
      setError('An error occurred while loading permissions.');
      setAllowedFeatures([]);
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
    isLoading,
    error,
    setError,
    isPremium,
    refreshPermissions: fetchAllowedFeatures,
  };
}