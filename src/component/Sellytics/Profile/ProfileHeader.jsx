// src/components/store-owner/ProfileHeader.jsx
import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

const ProfileHeader = ({ storeDetails, handleLogout }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-3xl p-8 text-center text-white mb-8">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

      <div className="absolute top-4 right-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition"
        >
          <FaSignOutAlt />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      <div className="relative z-10">
        <div className="mx-auto w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
          <img
            src={storeDetails.business_logo || 'https://via.placeholder.com/150?text=Logo'}
            alt="Store Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-4xl font-bold mb-2">{storeDetails.shop_name || 'My Store'}</h1>
        <p className="text-white/80 text-lg">Store Owner Profile</p>
      </div>
    </div>
  );
};

export default ProfileHeader;