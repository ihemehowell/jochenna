"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getOrders, type ApiOrder } from "@/lib/api";
import { useAuthStore } from "@/shore/authStore";

export default function OrdersPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!token || !user) {
      router.replace("/auth");
      return;
    }

    const loadOrders = async () => {
      setLoading(true);
      const result = await getOrders(token);
      if (result.ok) {
        setOrders(result.orders);
      }
      setLoading(false);
    };

    loadOrders();
  }, [initialized, token, user, router]);

  return (
    <main className="px-4 py-10 md:px-8 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-500">Account</p>
          <h1 className="mt-2 text-4xl font-semibold text-gray-900">My Orders</h1>
          <p className="mt-3 text-gray-600">Track recent purchases and open individual order details.</p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-gray-600">You do not have any orders yet.</p>
            <Link
              href="/shop"
              className="mt-4 inline-flex rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <motion.div
            className="grid gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
          >
            {orders.map((order) => (
              <motion.div
                key={order.id}
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order.id}</p>
                    <h2 className="mt-1 text-xl font-semibold text-gray-900">
                      {order.shippingAddress?.name || "Customer order"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {order.shippingAddress?.city || "Unknown city"} · {order.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-semibold text-gray-900">₦{order.total.toLocaleString()}</p>
                    <Link
                      href={`/orders/${order.id}`}
                      className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
