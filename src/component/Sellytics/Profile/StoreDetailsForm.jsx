// src/components/store-owner/StoreDetailsForm.jsx
import React from 'react';
import { FaEdit, FaTimes, FaSave } from 'react-icons/fa';


const states = ['Lagos', 'Abuja', 'Rivers', 'Kaduna', 'Oyo', 'Kano', 'Enugu', 'Port Harcourt'];
const currencies = [
  { code: 'NGN', name: 'Naira (NGN)' },
  { code: 'USD', name: 'US Dollar (USD)' },
  { code: 'EUR', name: 'Euro (EUR)' },
  { code: 'GBP', name: 'British Pound (GBP)' },
];

const StoreDetailsForm = ({
  storeDetails,
  isEditing,
  setIsEditing,
  handleInputChange,
  //logoFile,
  //setLogoFile,
 // previewUrl,
  //setPreviewUrl,
  handleUpdateDetails,


}) => {
  

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Store Details</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          {isEditing ? <> <FaTimes /> Cancel</> : <> <FaEdit /> Edit Profile</>}
        </button>
      </div>

      <form onSubmit={handleUpdateDetails} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form fields same as before */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Shop Name</label>
          <input type="text" name="shop_name" value={storeDetails.shop_name} onChange={handleInputChange} readOnly={!isEditing}
            className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white' : 'border-slate-200 bg-slate-50 dark:bg-slate-800'} transition`} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
          <input type="text" name="full_name" value={storeDetails.full_name} onChange={handleInputChange} readOnly={!isEditing}
            className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white' : 'border-slate-200 bg-slate-50 dark:bg-slate-800'} transition`} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
          <input type="email" name="email_address" value={storeDetails.email_address} onChange={handleInputChange} readOnly={!isEditing}
            className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white' : 'border-slate-200 bg-slate-50 dark:bg-slate-800'} transition`} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nature of Business</label>
          <input type="text" name="nature_of_business" value={storeDetails.nature_of_business} onChange={handleInputChange} readOnly={!isEditing}
            placeholder="e.g., Retail, Pharmacy" className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white' : 'border-slate-200 bg-slate-50 dark:bg-slate-800'} transition`} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
          <input type="text" name="phone_number" value={storeDetails.phone_number} onChange={handleInputChange} readOnly={!isEditing}
            className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white' : 'border-slate-200 bg-slate-50 dark:bg-slate-800'} transition`} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">State / Region</label>
          {isEditing ? (
            <select name="state" value={storeDetails.state} onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white">
              <option value="">Select state</option>
              {states.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
            </select>
          ) : (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200">
              {storeDetails.state || 'Not set'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Default Currency</label>
          {isEditing ? (
            <select name="default_currency" value={storeDetails.default_currency} onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white">
              <option value="">Select currency</option>
              {currencies.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          ) : (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200">
              {currencies.find(c => c.code === storeDetails.default_currency)?.name || 'Not set'}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Physical Address</label>
          <textarea name="physical_address" value={storeDetails.physical_address} onChange={handleInputChange} readOnly={!isEditing} rows="3"
            className={`w-full px-4 py-3 rounded-xl border resize-none ${isEditing ? 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white' : 'border-slate-200 bg-slate-50 dark:bg-slate-800'} transition`} />
        </div>
{/** 
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Logo</label>
          {isEditing ? (
            <div className="flex flex-col items-start gap-4">
              <label className="flex items-center gap-3 px-6 py-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/70 transition">
                <FaCamera className="text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium text-indigo-700 dark:text-indigo-300">Choose New Logo</span>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
              {logoFile && <span className="text-sm text-green-600">✓ New logo selected</span>}
              {previewUrl && (
                <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded-xl shadow" />
              )}
            </div>



          ) : (
            <div className="flex justify-center">
              <img
                src={previewUrl || 'https://via.placeholder.com/200?text=No+Logo'}
                alt="Store Logo"
                className="w-40 h-40 object-cover rounded-2xl shadow-lg border-4 border-slate-200 dark:border-slate-700"
              />
            </div>
          )}
        </div>
*/}
        {isEditing && (
          <div className="md:col-span-2 text-center">
            <button type="submit"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg">
              <FaSave /> Save All Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default StoreDetailsForm;