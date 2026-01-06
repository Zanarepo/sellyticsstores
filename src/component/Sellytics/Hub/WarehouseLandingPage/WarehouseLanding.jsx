import React from 'react';
import HeroSection from './HeroSection';
import FeaturesOverview from './FeaturesOverview';
import DashboardMockup from './DashboardMockup';
import DualBusinessModel from './DualBusinessModel';
import FeatureShowcase from './FeatureShowcase';
import WhyChooseUs from './WhyChooseUs';
import MobileFirst from './MobileFirst';
import FinalCTA from './FinalCTA';
//import Footer from '../../LandingPage/Footer';
import  WarehouseNavbar from './WarehouseNavbar'
export default function WarehouseLanding() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <WarehouseNavbar />
      <HeroSection />
      <div id="features">
        <FeaturesOverview />
      </div>
      <div id="dashboard">
        <DashboardMockup />
      </div>
      <div id="dual-model">
        <DualBusinessModel />
      </div>
      <FeatureShowcase />
      <div id="why-us">
        <WhyChooseUs />
      </div>
      <div id="mobile">
        <MobileFirst />
      </div>
      <FinalCTA />
    </div>
  );
}