"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getOrderById, type ApiOrder } from "@/lib/api";
import { useAuthStore } from "@/shore/authStore";
import { formatCurrency } from "@ihemehowell/react-utils/format";

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!token || !user) {
      router.replace("/auth");
      return;
    }

    const loadOrder = async () => {
      setLoading(true);
      const result = await getOrderById(token, params.id);
      if (result.ok && result.order) {
        setOrder(result.order);
      }
      setLoading(false);
    };

    loadOrder();
  }, [initialized, params.id, router, token, user]);

  if (loading) {
    return (
      <main className="min-h-screen bg-paper px-4 py-10 md:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-hairline bg-white p-8 text-ink-soft">
          Loading order details...
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-paper px-4 py-10 md:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-hairline bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">Order not found</h1>
          <Link href="/orders" className="mt-4 inline-flex rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white">
            Back to orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/orders" className="text-sm text-ink-soft hover:text-ink">
          Back to orders
        </Link>

        <section className="rounded-3xl border border-hairline bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-ink-soft">Order details</p>
              <h1 className="mt-2 text-3xl font-semibold text-ink">Order #{order.id}</h1>
              <p className="mt-2 text-ink-soft">Status: {order.status}</p>
            </div>
            <p className="text-2xl font-semibold text-ink">{formatCurrency(order.total)}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-hairline bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-ink">Items</h2>
            <div className="mt-6 space-y-4">
              {order.items.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex items-center justify-between border-b border-hairline pb-4 last:border-b-0">
                  <div>
                    <p className="font-medium text-ink">{item.name}</p>
                    <p className="text-sm text-ink-soft">
                      {item.selectedSize ? `Size: ${item.selectedSize}` : "No size needed"}
                    </p>
                  </div>
                  <p className="text-sm text-ink-soft">Qty: {item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-hairline bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-ink">Shipping</h2>
              <div className="mt-4 space-y-2 text-sm text-ink-soft">
                <p>{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.email}</p>
                <p>{order.shippingAddress?.phone}</p>
                <p>{order.shippingAddress?.address}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                <p>{order.shippingAddress?.country}</p>
              </div>
            </section>

            <section className="rounded-3xl border border-hairline bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-ink">Summary</h2>
              <p className="mt-4 text-sm text-ink-soft">Created: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Unknown"}</p>
              <p className="mt-2 text-sm text-ink-soft">Updated: {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : "Unknown"}</p>
              {order.deliveryMethod && (
                <p className="mt-2 text-sm text-ink-soft">Delivery: {order.deliveryMethod}</p>
              )}
              {typeof order.shippingFee === "number" && (
                <p className="mt-2 text-sm text-ink-soft">Shipping fee: {formatCurrency(order.shippingFee)}</p>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
