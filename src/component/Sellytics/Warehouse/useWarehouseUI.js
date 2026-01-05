import { useState } from 'react';

export function useWarehouseUI(initialTab = 'overview') {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerType, setScannerType] = useState('INTAKE');
  const [showIntake, setShowIntake] = useState(false);
  const [showDispatch, setShowDispatch] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);

  const openIntake = () => {
    setScannerType('INTAKE');
    setShowIntake(true);
  };

  const openDispatch = () => {
    setScannerType('DISPATCH');
    setShowDispatch(true);
  };

  const closeIntake = () => {
    setShowIntake(false);
    setScannedItems([]);
  };

  const closeDispatch = () => {
    setShowDispatch(false);
    setScannedItems([]);
  };

  const openScanner = (type) => {
    setScannerType(type);
    setShowScanner(true);
  };

  const closeScanner = () => {
    setShowScanner(false);
  };

  const commitScan = (items, type) => {
    setScannedItems(items);
    setShowScanner(false);
    if (type === 'INTAKE') {
      setShowIntake(true);
    } else {
      setShowDispatch(true);
    }
  };

  return {
    activeTab,
    setActiveTab,
    showScanner,
    scannerType,
    showIntake,
    showDispatch,
    showReturn,
    setShowReturn,
    showClientForm,
    setShowClientForm,
    showProductForm,
    setShowProductForm,
    scannedItems,
    setScannedItems,
    openIntake,
    openDispatch,
    closeIntake,
    closeDispatch,
    openScanner,
    closeScanner,
    commitScan
  };
}