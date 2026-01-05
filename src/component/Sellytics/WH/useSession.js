// hooks/useSession.js
export function useSession() {
  return {
    userId: Number(localStorage.getItem("user_id")) || null,
    storeId: Number(localStorage.getItem("store_id")) || null,
    ownerId: Number(localStorage.getItem("owner_id")) || null,
    email: localStorage.getItem("user_email") || null,
  };
}