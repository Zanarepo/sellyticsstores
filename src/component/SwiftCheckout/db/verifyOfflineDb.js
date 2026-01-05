import { productCache, inventoryCache, offlineSalesQueue, syncStatusManager } from './offlineDb';

export default function verifyOfflineDb() {
  try {
    console.log('Verifying Dexie DB...');

    const caches = [productCache, inventoryCache, offlineSalesQueue, syncStatusManager];
    let allOk = true;

    caches.forEach((cache) => {
      if (!cache) {
        console.error('❌ Cache not found', cache);
        allOk = false;
      } else {
        console.log(`✅ ${cache.constructor.name || 'Cache'} exists`);
      }
    });

    if (allOk) console.log('🎉 All Dexie caches verified successfully!');
    else console.warn('⚠️ Some caches missing or not initialized properly');
  } catch (err) {
    console.error('Error verifying Dexie DB:', err);
  }
}
