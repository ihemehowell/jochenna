"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  getAdminOrders,
  updateOrderStatus,
  type ApiOrder,
  type ApiOrderStatus,
} from "@/lib/api";
import { useAuthStore } from "@/shore/authStore";
import { useFeedbackStore } from "@/shore/feedbackStore";
import { ArrowLeft } from "lucide-react";

const statusOptions: ApiOrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const pushToast = useFeedbackStore((state) => state.pushToast);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!token || !user) {
      router.replace("/auth");
      return;
    }

    if (user.role !== "admin") {
      router.push("/");
      return;
    }

    const loadOrders = async () => {
      setLoading(true);
      const result = await getAdminOrders(token);
      if (result.ok) {
        setOrders(result.orders);
      } else {
        pushToast(result.message || "Could not load admin orders.");
      }
      setLoading(false);
    };

    loadOrders();
  }, [initialized, pushToast, router, token, user]);

  const handleStatusChange = async (orderId: string, status: ApiOrderStatus) => {
    if (!token) {
      return;
    }

    setSavingId(orderId);
    const result = await updateOrderStatus(token, orderId, status);
    setSavingId(null);

    if (!result.ok || !result.order) {
      pushToast(result.message || "Failed to update order status.");
      return;
    }

    setOrders((current) => current.map((order) => (order.id === orderId ? result.order as ApiOrder : order)));
    pushToast(`Order ${orderId} updated to ${status}.`);
  };

  if (!initialized) {
    return (
      <main className="min-h-screen bg-paper px-4 py-10 md:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-hairline bg-white p-8 text-ink-soft">
          Loading admin orders...
        </div>
      </main>
    );
  }

  if (!user || !token) {
    return (
      <main className="min-h-screen bg-paper px-4 py-10 md:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-hairline bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">Sign in required</h1>
          <p className="mt-3 text-ink-soft">Please log in to access the admin dashboard.</p>
          <Link href="/auth" className="mt-6 inline-flex rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white">
            Go to auth
          </Link>
        </div>
      </main>
    );
  }

  if (user.role !== "admin") {
    return (
      <main className="min-h-screen bg-paper px-4 py-10 md:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-hairline bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">Admin only</h1>
          <p className="mt-3 text-ink-soft">Your account does not have admin access.</p>
          <Link href="/orders" className="mt-6 inline-flex rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white">
            View your orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-ink-soft hover:text-ink transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>

        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-ink-soft">Admin</p>
            <h1 className="mt-2 text-4xl font-semibold text-ink">Orders Dashboard</h1>
            <p className="mt-3 text-ink-soft">Manage every order and update fulfillment status.</p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-hairline">
            <p className="text-sm text-ink-soft">Signed in as</p>
            <p className="text-sm font-semibold text-ink">{user.email}</p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-hairline bg-white p-8 text-ink-soft">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-hairline bg-white p-8 text-center">
            <p className="text-ink-soft">No admin orders found yet.</p>
          </div>
        ) : (
          <motion.div
            className="grid gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
            }}
          >
            {orders.map((order) => (
              <motion.article
                key={order.id}
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                className="rounded-3xl border border-hairline bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm text-ink-soft">Order #{order.id}</p>
                    <h2 className="mt-1 text-xl font-semibold text-ink">₦{order.total.toLocaleString()}</h2>
                    <p className="mt-1 text-sm text-ink-soft">
                      {order.shippingAddress?.name || "No shipping name"} · {order.status}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {order.shippingAddress?.city || "Unknown city"} · {order.shippingAddress?.email || "No email"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={savingId === order.id || order.status === status}
                        onClick={() => handleStatusChange(order.id, status)}
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                          order.status === status
                            ? "bg-ink text-white"
                            : "border border-hairline bg-white text-ink hover:bg-paper"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {savingId === order.id && order.status !== status ? "Saving..." : status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-paper p-4">
                  <p className="text-sm font-semibold text-ink">Items</p>
                  <div className="mt-3 space-y-2 text-sm text-ink-soft">
                    {order.items.map((item) => (
                      <div key={`${item.id}-${item.selectedSize}`} className="flex items-center justify-between">
                        <span>
                          {item.name}
                          {item.selectedSize ? ` · ${item.selectedSize}` : " · No size needed"}
                        </span>
                        <span>Qty {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
