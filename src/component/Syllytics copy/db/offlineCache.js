import * as products from './productCache';
import * as inventory from './inventoryCache';
import * as sales from './sales';
import * as customers from './customerCache';
import * as stores from './stores';
import * as queue from './queue';
import notificationCache from './notificationsCache';


import * as syncLogs from './syncLogs';
import * as utils from '../utils';

const offlineCache = {
  ...products,
  ...inventory,
  ...sales,
  ...customers,
  ...stores,
  ...queue,
  ...notificationCache,
  ...syncLogs,
  ...utils,
};

export default offlineCache;
