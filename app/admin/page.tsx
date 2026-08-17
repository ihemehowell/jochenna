"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Package, TrendingUp, Clock, AlertTriangle, Boxes } from "lucide-react";
import { useAuthStore } from "@/shore/authStore";
import { formatCurrency } from "@ihemehowell/react-utils/format";
import { getAdminStats, type AdminStats } from "@/lib/api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const initialized = useAuthStore((state) => state.initialized);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!user || !token || user.role !== "admin") {
      router.push("/");
    }
  }, [user, token, initialized, router]);

  useEffect(() => {
    if (!token || !user || user.role !== "admin") {
      return;
    }

    let cancelled = false;

    (async () => {
      setStatsLoading(true);
      setStatsError(null);

      const result = await getAdminStats(token);

      if (cancelled) {
        return;
      }

      if (!result.ok || !result.stats) {
        setStatsError(result.message || "Could not load dashboard stats.");
        setStatsLoading(false);
        return;
      }

      setStats(result.stats);
      setStatsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [token, user]);

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

  const statCards = [
    {
      label: "Total Revenue",
      value: stats ? formatCurrency(stats.totalRevenue) : null,
      icon: TrendingUp,
      accent: "text-green-600",
    },
    {
      label: "Total Orders",
      value: stats ? String(stats.totalOrders) : null,
      icon: ShoppingCart,
      accent: "text-denim-text",
    },
    {
      label: "Orders Today",
      value: stats ? String(stats.ordersToday) : null,
      icon: Clock,
      accent: "text-denim-text",
    },
    {
      label: "Pending Orders",
      value: stats ? String(stats.pendingOrders) : null,
      icon: Clock,
      accent: "text-amber-600",
    },
    {
      label: "Total Products",
      value: stats ? String(stats.totalProducts) : null,
      icon: Boxes,
      accent: "text-green-600",
    },
    {
      label: "Low Stock (≤5)",
      value: stats ? String(stats.lowStockCount) : null,
      icon: AlertTriangle,
      accent: stats && stats.lowStockCount > 0 ? "text-red-600" : "text-ink-soft",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-paper p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.28em] text-ink-soft mb-2">Admin</p>
          <h1 className="text-4xl font-bold text-ink mb-2">Dashboard</h1>
          <p className="text-ink-soft">Manage your store inventory and orders</p>
        </div>

        {/* Stats */}
        <div className="mb-12">
          {statsError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {statsError}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-lg shadow-sm border border-hairline p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-wide text-ink-soft">{card.label}</p>
                    <card.icon size={18} className={card.accent} />
                  </div>
                  {statsLoading ? (
                    <div className="h-7 w-20 rounded bg-paper animate-pulse" />
                  ) : (
                    <p className="text-2xl font-bold text-ink">{card.value ?? "—"}</p>
                  )}
                </div>
              ))}
            </div>
          )}
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