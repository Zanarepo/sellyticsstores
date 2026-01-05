// utils/matchDeviceId.js

export default function matchDeviceId(requiredDeviceId) {
    try {
      const localId = localStorage.getItem("device_id");
  
      if (!localId) return false;
      if (!requiredDeviceId) return false;
  
      return String(localId).trim() === String(requiredDeviceId).trim();
    } catch (err) {
      console.error("Device ID match failed:", err);
      return false;
    }
  }
  