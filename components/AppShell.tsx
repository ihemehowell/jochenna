"use client";

import type { ReactNode } from "react";

import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/cart/CartDrawer";
import Toast from "@/components/ui/Toast";

export default function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <Toast />
      {children}
    </>
  );
}