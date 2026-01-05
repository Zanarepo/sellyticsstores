// src/components/Debts/EditDebtModal/constants.js
export const defaultEntry = {
  customer_id: '',
  customer_name: '',
  phone_number: '',
  dynamic_product_id: '',
  product_name: '',
  supplier: '',
  deviceIds: [''],
  deviceSizes: [''],
  qty: 1,
  owed: '',
  deposited: 0,
  date: new Date().toISOString().split('T')[0],
  isUniqueProduct: true,
};