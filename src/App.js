import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import HomePage from "./component/HomePage";
import { CurrencyProvider } from "./component/context/currencyContext";

import LandingFooterLayout from "./component/LandingFooterLayout";
import Navbar from "./component/Navbar";
import Registration from "./component/Auth/Registration";
import { Toaster } from "react-hot-toast";
import AdminRegistration from "./component/Auth/AdminRegistration";
import Login from "./component/Auth/Login";
import Forgotpassword from "./component/Auth/Forgotpassword";
import ResetPassword from "./component/Auth/ResetPassword";

import RegisteredDashboards from "./component/RegisteredDashboards";
import StoreUsersHome from "./component/Sellytics/StoreUsersHome";
import TeamSignup from "./component/Auth/TeamSignup";

import Admins from "./component/AdminAuth/Admins";
import AdminHome from "./component/AdminDashboard/AdminHome";
import SalesMetrics from "./component/UserDashboard/SalesMetrics";
import PoductPurchaseCost from "./component/UserDashboard/ProductsPurchaseCost";

import SalesTracker from "./component/UserDashboard/SalesTracker";
import StoresAdmin from "./component/Ops/StoresAdmin";
import Profile from "./component/UserDashboard/Profile";
import SellyticsPayment from "./component/Payments/SellyticsPayment";



import ReceiptQRCode from "./component/VariexContents/ReceiptQRCode";
import ReceiptQRCodeWrapper from "./component/VariexContents/ReceiptQRCodeWrapper";
import ReceiptModules from "./component/Services/ReceiptModules";
import PricingFeatures from "./component/Payments/PricingFeatures";
import ShareholderModule from "./component/Shareholders";
import ReceiptView from "./component/Sellytics/ReceiptManager/ReceiptView";
import LandingPage from "./component/Sellytics/LandingPage/LandingPage";





import WarehouseHub from "./component/Sellytics/Hub/WarehouseHub";


import ReceiptManager from "./component/Sellytics/ReceiptManager/ReceiptManager";
import StoreDashboard from "./component/Sellytics/StoreDashboard";

const App = () => {
  return (
   
      <CurrencyProvider>
        <Router>
          {/* Public Routes with Navbar & Footer */} <Routes>
          <Route
            element={
              <>
                <Navbar />
                <LandingFooterLayout />

                
              </>
            }
          >
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<Forgotpassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/team-signup" element={<TeamSignup />} />
     
            <Route path="/register" element={<Registration />} />
             
            </Route>
 
            <Route path="/" element={<LandingPage />} />
            {/* Private / Authenticated Routes (no shared layout) */}
         
            
              <Route path="/adminregister" element={<AdminRegistration />} />
              <Route path="/admin" element={<Admins />} />
              <Route path="/regdashboard" element={<RegisteredDashboards />} />
              <Route path="/dashboard" element={<StoreDashboard />} />
              <Route path="/admin-dashboard" element={<AdminHome />} />
              <Route path="/team-dashboard" element={<StoreUsersHome />} />
              <Route path="/sales-metrics" element={<SalesMetrics />} />
              <Route path="/product-cost" element={<PoductPurchaseCost />} />
           
              <Route path="/salestrack" element={<SalesTracker />} />
              <Route path="/owner-dashboard" element={<StoresAdmin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/payment" element={<SellyticsPayment />} />
      
           
            
              <Route path="/rec" element={<ReceiptModules />} />
              <Route path="/qrcodes" element={<ReceiptQRCode />} />
              <Route path="/receipts/:receiptId" element={<ReceiptQRCodeWrapper />} />
              <Route path="/receipt/:receipt_id" element={<ReceiptView />} />
              <Route path="/upgrade" element={<PricingFeatures />} />
              <Route path="/shareholders" element={<ShareholderModule />} />
             
              <Route path="/ano" element={<ReceiptManager />} />
           

            {/* Warehouse Module Routes – Wrapped in WarehouseProvider */}
          
       
      
  
              <Route path="/c" element={<WarehouseHub/>} />

              
              {/* Add more warehouse sub-routes here in the future */}
        
          </Routes>

          {/* Global Toaster */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerStyle={{ top: 20 }}
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1e293b",
                color: "#fff",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "15px",
              },
              success: {
                icon: "",
                style: { background: "#10b981" },
              },
              error: {
                icon: "×",
                style: { background: "#ef4444" },
              },
              loading: {
                icon: "MagnifyingGlass",
                style: { background: "#f59e0b" },
              },
            }}
          />
        </Router>
      </CurrencyProvider>
 
  );
};

export default App;