// src/components/store-owner/PasswordChangeForm.jsx
import React from 'react';

const PasswordChangeForm = ({ password, setPassword, handleChangePassword }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Change Password</h2>
      <form onSubmit={handleChangePassword} className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            placeholder="Min. 6 characters"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white transition"
          />
        </div>
        <button type="submit"
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg">
          Update Password
        </button>
      </form>
    </div>
  );
};

export default PasswordChangeForm;