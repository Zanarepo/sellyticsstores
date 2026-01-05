// src/components/Dashboard/toolsConfig.js

import {
  FaRegMoneyBillAlt,
  FaMoneyCheckAlt,
  FaBoxes,
  FaChartLine,
  FaUsers,
  FaTasks,
  FaReceipt,
  FaUndoAlt,
  FaBoxOpen,
  FaSearch,
  FaCrown,
} from 'react-icons/fa';

import ExpenseManager from '../Expenses/ExpenseManager';
import ReceiptManager from '../ReceiptManager/ReceiptManager';
import StockTransfer from '../StockTransfer/StockTransfer';
import Sales from '../Sales/Sales';
import Inventory from '../InventoryLogs/Inventory';
import ProductCatalogue from '../ProductLogs/ProductCatalogue';
import UnpaidManager from '../UnpaidSupplies/UnpaidManager';
import DebtForm from '../DebtPayment/DebtForm';
import SalesSummary from '../SalesDashboard/SalesSummary';
import CustomerManagement from '../Customers/CustomerManagement';
import SuppliersInventory from '../SuppliersDashboard/SuppliersInventory';
import Returns from '../ReturnsModule/Returns';

export const tools = [
  {
    key: 'sales',
    label: 'Sales Tracker',
    icon: FaChartLine,
    desc: 'Add your sales and see how your business is doing ( Fast, offline-ready point of sale)',
    component: <Sales />,
    isFreemium: true,
    category: 'Sales & Revenue',
  },
  {
    key: 'products',
    label: 'Products & Pricing Tracker',
    icon: FaBoxes,
    desc: "Add and manage your store's products, prices, and stock here",
    component: <ProductCatalogue />,
    isFreemium: true,
    category: 'Inventory',
  },
  {
    key: 'stock_transfer',
    label: 'Stock Transfer',
    icon: FaReceipt,
    desc: 'Easily Transfer Stock from one store to another.',
    component: <StockTransfer />,
    isFreemium: false,
    category: 'Inventory',
  },
  {
    key: 'inventory',
    label: 'Manage Inventory (Goods)',
    icon: FaTasks,
    desc: 'Keep an eye on how much goods you have sold and what is left in your store.',
    component: <Inventory />,
    isFreemium: true,
    category: 'Inventory',
  },
  {
    key: 'receipts',
    label: 'Sales Receipts',
    icon: FaReceipt,
    desc: 'Monitor and track sales.',
    component: <ReceiptManager />,
    isFreemium: true,
    category: 'Sales & Revenue',
  },
  {
    key: 'returns',
    label: 'Returned Items Tracker',
    icon: FaUndoAlt,
    desc: 'Track returned items from customers.',
    component: <Returns />,
    isFreemium: false,
    category: 'Sales & Revenue',
  },
  {
    key: 'expenses',
    label: 'Expenses Tracker',
    icon: FaRegMoneyBillAlt,
    desc: 'Keep track of your stores spending.',
    component: <ExpenseManager />,
    isFreemium: true,
    category: 'Finance',
  },
  {
    key: 'unpaid_supplies',
    label: 'Unpaid Supplies',
    icon: FaBoxOpen,
    desc: "See who took goods on credit and hasn't paid yet",
    component: <UnpaidManager />,
    isFreemium: false,
    category: 'Finance',
  },
  {
    key: 'debts',
    label: 'Debtors',
    icon: FaMoneyCheckAlt,
    desc: 'Track debtors.',
    component: <DebtForm />,
    isFreemium: false,
    category: 'Finance',
  },
  {
    key: 'suppliers',
    label: 'Suppliers & Product Tracker',
    icon: FaSearch,
    desc: 'Track product & suppliers.',
    component: <SuppliersInventory />,
    isFreemium: false,
    category: 'Operations',
  },
  {
    key: 'sales_summary',
    label: 'Sales Summary',
    icon: FaChartLine,
    desc: 'View a summary of your sales performance.',
    component: <SalesSummary />,
    isFreemium: true,
    category: 'Analytics',
  },
  {
    key: 'customers',
    label: 'Customer Manager',
    icon: FaUsers,
    desc: 'Manage your customers.',
    component: <CustomerManagement />,
    isFreemium: false,
    category: 'Operations',
  },
];

export const featureKeyMapping = {
  'products & pricing tracker': 'products',
  'products': 'products',
  'product tracker': 'products',
  'products tracker': 'products',
  'dynamic products': 'products',
  'suppliers & product tracker': 'suppliers',
  'suppliers': 'suppliers',
  'supplier': 'suppliers',
  'sales summary': 'sales_summary',
  'unpaid supplies': 'unpaid_supplies',
  'stock transfer': 'stock_transfer',
  'stock transfer tracker': 'stock_transfer',
};

export const premiumIcons = { FaCrown };