// src/component/Sellytics/NotificationSettings/useNotificationSettings.js
import { useEffect, useState } from 'react';
import { supabase } from '../../../../supabaseClient';

const DEFAULTS = {
  id: null,
  enable_low_stock: false,
  enable_sales_summary: false,
  enable_product_events: false,
  enable_sales_events: false,
  email_enabled: true,
  frequency: 'daily',
  reporting_period: 'daily',
  reorder_level_threshold: 5,
  send_time: '09:00',
  preferred_day: 1,
};

export function useNotificationSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);

  const storeId = localStorage.getItem('store_id');
  const ownerId = localStorage.getItem('owner_id');

  useEffect(() => {
    if (!storeId || !ownerId) return;

    supabase
      .from('notification_settings')
      .select('*')
      .eq('store_id', storeId)
      .eq('owner_id', ownerId)
      .single()
      .then(({ data }) => {
        if (data) {
          setSettings({
            ...DEFAULTS,
            ...data,
            send_time: data.send_time?.slice(0, 5) || '09:00',
            preferred_day: Number(data.preferred_day ?? 1),
          });
        }
      });
  }, [storeId, ownerId]);

  const update = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setLoading(true);

    const payload = {
      ...settings,
      store_id: storeId,
      owner_id: ownerId,
      preferred_day: Number(settings.preferred_day),
      send_time: settings.send_time.slice(0, 5),
    };

    const { error } = await supabase
      .from('notification_settings')
      .upsert(payload, { onConflict: 'store_id,owner_id' });

    setLoading(false);
    return error;
  };

  const remove = async () => {
    if (!settings.id) return null;

    const { error } = await supabase
      .from('notification_settings')
      .delete()
      .eq('id', settings.id);

    if (!error) setSettings(DEFAULTS);
    
    return error;
  };

  return {
    settings,
    update,
    save,
    remove,
    loading,
    hasSettings: !!settings.id,
  };
}
