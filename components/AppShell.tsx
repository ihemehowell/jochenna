"use client";

import { useEffect, useRef, type ReactNode } from "react";

import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/cart/CartDrawer";
import Toast from "@/components/ui/Toast";
import { useAuthStore } from "@/shore/authStore";
import { useCartStore } from "@/shore/cartStore";

export default function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const token = useAuthStore((state) => state.token);
  const initialized = useAuthStore((state) => state.initialized);
  const syncCartFromServer = useCartStore((state) => state.syncCartFromServer);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!initialized || !token) {
      return;
    }

    syncCartFromServer();
  }, [initialized, syncCartFromServer, token]);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <Toast />
      {children}
    </>
  );
}