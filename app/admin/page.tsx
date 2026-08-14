"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Package } from "lucide-react";
import { useAuthStore } from "@/shore/authStore";

export default function AdminDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const initialized = useAuthStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!user || !token || user.role !== "admin") {
      router.push("/");
    }
  }, [user, token, initialized, router]);

  if (!initialized) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-paper p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-lg text-ink-soft">Loading admin dashboard...</div>
        </div>
      </main>
    );
  }

  if (!user || !token || user.role !== "admin") {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-paper p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.28em] text-ink-soft mb-2">Admin</p>
          <h1 className="text-4xl font-bold text-ink mb-2">Dashboard</h1>
          <p className="text-ink-soft">Manage your store inventory and orders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Orders Management */}
          <Link href="/admin/orders">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-8 cursor-pointer border border-hairline h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-ink">Orders</h2>
                <ShoppingCart size={32} className="text-denim-text" />
              </div>
              <p className="text-ink-soft mb-4">Manage customer orders and update fulfillment status</p>
              <div className="inline-flex items-center text-denim-text font-semibold hover:text-denim-text transition-colors">
                Manage Orders →
              </div>
            </div>
          </Link>

          {/* Products Management */}
          <Link href="/admin/products">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-8 cursor-pointer border border-hairline h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-ink">Products</h2>
                <Package size={32} className="text-green-600" />
              </div>
              <p className="text-ink-soft mb-4">Add, edit, and delete products from your store inventory</p>
              <div className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors">
                Manage Products →
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
