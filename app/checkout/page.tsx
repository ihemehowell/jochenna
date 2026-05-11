"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/shore/cartStore";
import { useFeedbackStore } from "@/shore/feedbackStore";

const IMAGE_PLACEHOLDER =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="960" viewBox="0 0 800 960"%3E%3Crect width="800" height="960" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial, sans-serif" font-size="28"%3EImage unavailable%3C/text%3E%3C/svg%3E';

export default function CheckoutPage() {
  const { cart, clearCart } = useCartStore();
  const pushToast = useFeedbackStore((state) => state.pushToast);

  // ── All useState hooks first ──
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express" | "pickup">("standard");
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // ── Derived values after hooks ──
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping =
    deliveryMethod === "express"
      ? 5000
      : deliveryMethod === "pickup"
      ? 0
      : subtotal > 50000
      ? 0
      : 2000;
  const total = subtotal + shipping;

  // ── Stable order number (won't change on re-render) ──
  const [orderNumber] = useState(`JOC-${Date.now().toString().slice(-6)}`);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateShippingStep = () => {
    if (
      !formData.email.trim() ||
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.zipCode.trim()
    ) {
      pushToast("Please complete all required fields.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      pushToast("Please enter a valid email.");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    setOrderPlaced(true);
    clearCart();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // ── Success screen ──
  if (orderPlaced) {
    return (
      <main className="px-4 md:px-8 py-10 bg-gray-50 min-h-screen flex items-center">
        <motion.div
          className="max-w-2xl mx-auto w-full text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="mb-8" variants={itemVariants}>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">Order Placed!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for your purchase. We'll send you an email confirmation shortly.
            </p>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Order Total: ₦{total.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Order #{orderNumber} · Confirmation sent to {formData.email}
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link href="/shop">
              <motion.button
                className="w-full bg-gray-900 text-white py-3 rounded hover:bg-gray-800 transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue Shopping
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    );
  }

  // ── Empty cart screen ──
  if (cart.length === 0) {
    return (
      <main className="px-4 md:px-8 py-10 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Link href="/shop" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-8">
            <ArrowLeft size={18} />
            Back to Shop
          </Link>
          <div className="h-96 flex flex-col items-center justify-center">
            <p className="text-gray-500 mb-6">Your cart is empty</p>
            <Link href="/shop">
              <button className="bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 transition">
                Shop Now
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Main checkout ──
  return (
    <main className="px-4 md:px-8 py-10 bg-gray-50">
      <motion.div
        className="max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="mb-8">
          <Link href="/shop" className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
            <ArrowLeft size={18} />
            Back to Cart
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <div className="bg-white rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Checkout</h2>

              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-8">
                <span>🔒 Secure Checkout</span>
                <span>•</span>
                <span>Fast Nationwide Delivery</span>
                <span>•</span>
                <span>Premium Thrift Quality</span>
              </div>

              {/* Step Indicator */}
              <div className="flex gap-4 mb-8">
                {[1, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      if (s === 1) {
                        setStep(1);
                      } else if (s === 2 && step === 1 && validateShippingStep()) {
                        setStep(2);
                      }
                    }}
                    className={`flex-1 py-2 rounded text-sm font-medium transition ${
                      step === s
                        ? "bg-gray-900 text-white"
                        : step > s
                        ? "bg-green-100 text-green-700 cursor-pointer"
                        : "bg-gray-100 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {step > s ? "✓ " : ""}{s === 1 ? "Shipping" : "Payment"}
                  </button>
                ))}
              </div>

              {/* Step 1: Shipping */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Email*</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="w-full border text-stone-800 border-gray-300 px-4 py-3 rounded outline-none focus:border-black transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">First Name*</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        className="w-full border text-stone-800 border-gray-300 px-4 py-3 rounded outline-none focus:border-black transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Last Name*</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className="w-full border text-stone-800 border-gray-300 px-4 py-3 rounded outline-none focus:border-black transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Address*</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                      className="w-full border text-stone-800 border-gray-300 px-4 py-3 rounded outline-none focus:border-black transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">City*</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Lagos"
                        className="w-full border text-stone-800 border-gray-300 px-4 py-3 rounded outline-none focus:border-black transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">State*</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Lagos"
                        className="w-full border text-stone-800 border-gray-300 px-4 py-3 rounded outline-none focus:border-black transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">ZIP Code*</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="100001"
                      className="w-full border text-stone-800 border-gray-300 px-4 py-3 rounded outline-none focus:border-black transition"
                    />
                  </div>

                  {/* Delivery Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Delivery Method
                    </label>
                    <div className="space-y-3">
                      {[
                        { value: "standard", label: "Standard Delivery", sub: "2–5 business days · Free over ₦50,000" },
                        { value: "express", label: "Express Delivery", sub: "24–48 hours · ₦5,000" },
                        { value: "pickup", label: "Store Pickup", sub: "Pickup from our location · Free" },
                      ].map(({ value, label, sub }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setDeliveryMethod(value as "standard" | "express" | "pickup")}
                          className={`w-full border rounded-lg p-4 text-left transition ${
                            deliveryMethod === value ? "border-black bg-gray-50" : "border-gray-300"
                          }`}
                        >
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-gray-500 mt-1">{sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    onClick={() => {
                      if (validateShippingStep()) setStep(2);
                    }}
                    className="w-full bg-gray-900 text-white py-3 rounded hover:bg-gray-800 transition"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue to Payment
                  </motion.button>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                    <p className="font-semibold text-gray-900 mb-2">Payment Integration Coming Soon</p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Secure payment integration with Paystack or Flutterwave will be available here.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => setStep(1)}
                      className="flex-1 border border-gray-300 py-3 text-stone-800 rounded hover:bg-gray-50 transition"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex-1 bg-gray-900 text-white py-3 rounded hover:bg-gray-800 transition disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? "Processing..." : "Place Order"}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-lg p-8 lg:sticky lg:top-20">
              <h3 className="text-xl font-semibold mb-6 text-gray-900">Order Summary</h3>

              <div className="space-y-4 max-h-80 overflow-y-auto mb-6">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 pb-4 border-b">
                    <div className="relative w-16 h-20 bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.images?.[0] || IMAGE_PLACEHOLDER}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-gray-500">{item.selectedSize}</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₦${shipping.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>

                    <span className="capitalize">
                        {deliveryMethod}
                    </span>
                    </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}