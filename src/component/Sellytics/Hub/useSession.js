// hooks/useSession.js - FINAL: userEmail ALWAYS from localStorage
import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";

export function useSession() {
  const [session, setSession] = useState({
    userId: null,
    userEmail: null,
    storeId: null,
    ownerId: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storeId = localStorage.getItem("store_id");
        const ownerId = localStorage.getItem("owner_id");
        const userEmail = localStorage.getItem("user_email");

        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();

        setSession({
          userId: authSession?.user?.id ?? null,
          userEmail: userEmail, // ✅ ONLY source
          storeId: storeId ? Number(storeId) : null,
          ownerId: ownerId ? Number(ownerId) : null,
          user: authSession?.user ?? null,
          loading: false,
        });
      } catch (error) {
        console.error("Session load error:", error);
        setSession((prev) => ({ ...prev, loading: false }));
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, authSession) => {
      const storeId = localStorage.getItem("store_id");
      const ownerId = localStorage.getItem("owner_id");
      const userEmail = localStorage.getItem("user_email");

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setSession({
          userId: authSession?.user?.id ?? null,
          userEmail: userEmail, // ✅ ONLY source
          storeId: storeId ? Number(storeId) : null,
          ownerId: ownerId ? Number(ownerId) : null,
          user: authSession?.user ?? null,
          loading: false,
        });
      }

      if (event === "SIGNED_OUT") {
        setSession({
          userId: null,
          userEmail: userEmail, // keep for audit/offline
          storeId: null,
          ownerId: null,
          user: null,
          loading: false,
        });
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  return session;
}
