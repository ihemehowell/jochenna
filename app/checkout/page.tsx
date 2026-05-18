"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import Image from "next/image";
import { initializePaystackPayment, verifyPaystackPayment } from "@/lib/api";
import { useAuthStore } from "@/shore/authStore";
import { useCartStore } from "@/shore/cartStore";
import { useFeedbackStore } from "@/shore/feedbackStore";

const IMAGE_PLACEHOLDER =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="960" viewBox="0 0 800 960"%3E%3Crect width="800" height="960" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial, sans-serif" font-size="28"%3EImage unavailable%3C/text%3E%3C/svg%3E';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, clearCart } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const pushToast = useFeedbackStore((state) => state.pushToast);

  // ── All useState hooks first ──
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pendingCheckoutUrl, setPendingCheckoutUrl] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderStatusLabel, setOrderStatusLabel] = useState("");
  const checkoutId = useId();
  const orderNumber = `JOC-${checkoutId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase().padStart(6, "0")}`;
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express" | "pickup">("standard");
  const processedReference = useRef<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Nigeria",
  });

  const [userFirstName = "", ...userRestName] = (user?.name || "").split(" ");
  const effectiveFormData = {
    ...formData,
    email: formData.email || user?.email || "",
    firstName: formData.firstName || userFirstName,
    lastName: formData.lastName || userRestName.join(" "),
    phone: formData.phone,
    country: formData.country || "Nigeria",
  };
  const showAuthPrompt = !user;

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
  const referenceParam = searchParams.get("reference")?.trim() || "";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateShippingStep = () => {
    if (
      !effectiveFormData.email.trim() ||
      !effectiveFormData.firstName.trim() ||
      !effectiveFormData.lastName.trim() ||
      !effectiveFormData.phone.trim() ||
      !effectiveFormData.address.trim() ||
      !effectiveFormData.city.trim() ||
      !effectiveFormData.state.trim() ||
      !effectiveFormData.zipCode.trim()
    ) {
      pushToast("Please complete all required fields.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(effectiveFormData.email)) {
      pushToast("Please enter a valid email.");
      return false;
    }

    if (!/^\d{5,10}$/.test(effectiveFormData.zipCode.trim())) {
      pushToast("Please enter a valid ZIP/postal code.");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (loading) {
      return;
    }

    if (!validateShippingStep()) {
      setStep(1);
      return;
    }

    if (cart.length === 0) {
      pushToast("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);
      setPendingCheckoutUrl("");
      console.info("[checkout] Starting Paystack initialization", {
        deliveryMethod,
        hasToken: Boolean(token),
        cartItems: cart.length,
        visibilityState: document.visibilityState,
      });

      const result = await initializePaystackPayment(
        {
          shippingAddress: {
            name: `${effectiveFormData.firstName.trim()} ${effectiveFormData.lastName.trim()}`.trim(),
            email: effectiveFormData.email.trim(),
            phone: effectiveFormData.phone.trim(),
            address: effectiveFormData.address.trim(),
            city: effectiveFormData.city.trim(),
            postalCode: effectiveFormData.zipCode.trim(),
            country: effectiveFormData.country.trim() || "Nigeria",
          },
          deliveryMethod,
        },
        token || undefined
      );

      if (!result.ok || !result.authorizationUrl) {
        console.warn("[checkout] Paystack initialization returned no redirect URL", {
          ok: result.ok,
          message: result.message,
          reference: result.reference,
        });
        setLoading(false);
        pushToast(result.message);
        return;
      }

      const checkoutUrl = result.authorizationUrl.trim();
      const isValidCheckoutUrl = /^https:\/\/checkout\.paystack\.com\//i.test(checkoutUrl);

      if (!isValidCheckoutUrl) {
        console.error("[checkout] Invalid Paystack checkout URL", {
          checkoutUrl,
          reference: result.reference,
        });
        setLoading(false);
        pushToast("Received an invalid Paystack checkout URL.");
        return;
      }

      // Use direct navigation first, then expose a manual fallback link if navigation is blocked.
      console.info("[checkout] Redirecting to Paystack", {
        checkoutUrl,
        reference: result.reference,
      });
      window.location.href = checkoutUrl;

      window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          console.warn("[checkout] Redirect fallback activated", {
            checkoutUrl,
            reference: result.reference,
            visibilityState: document.visibilityState,
          });
          setPendingCheckoutUrl(checkoutUrl);
          setLoading(false);
          pushToast("Redirect was blocked. Tap below to open Paystack checkout.");
        }
      }, 1500);
    } catch (error) {
      console.error("[checkout] Paystack redirect failed", error);
      setLoading(false);
      pushToast(error instanceof Error ? error.message : "Unable to open Paystack checkout.");
    }
  };

  useEffect(() => {
    const verifyReference = async () => {
      if (!referenceParam || processedReference.current === referenceParam || orderPlaced) {
        return;
      }

      processedReference.current = referenceParam;
      setLoading(true);

      const result = await verifyPaystackPayment(
        { reference: referenceParam },
        token || undefined
      );

      setLoading(false);

      if (!result.ok) {
        pushToast(result.message);
        return;
      }

      setOrderStatusLabel(result.message);
      pushToast(result.message);
      setOrderPlaced(true);
      clearCart();
      router.replace("/checkout");
    };

    void verifyReference();
  }, [
    clearCart,
    deliveryMethod,
    effectiveFormData.address,
    effectiveFormData.city,
    effectiveFormData.country,
    effectiveFormData.email,
    effectiveFormData.firstName,
    effectiveFormData.lastName,
    effectiveFormData.phone,
    effectiveFormData.zipCode,
    orderPlaced,
    pushToast,
    referenceParam,
    router,
    token,
  ]);

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
              Thank you for your purchase. We&apos;ll send you an email confirmation shortly.
            </p>
            {orderStatusLabel && (
              <p className="text-sm text-gray-500 mb-6">{orderStatusLabel}</p>
            )}
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Order Total: ₦{total.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Order #{orderNumber} · Confirmation sent to {effectiveFormData.email}
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
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <motion.div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Checkout Account</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900">Sign in to continue</h2>
            <p className="mt-3 text-sm text-gray-600">
                You need to sign in before placing an order so we can create your order and update your cart.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/auth"
                className="w-full rounded-full bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                  Go to Login
                </Link>

                <Link
                  href="/shop"
                  className="w-full rounded-full border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                  Back to Shop
                </Link>
            </div>
          </motion.div>
        </div>
      )}

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Checkout Form */}
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900">Checkout</h2>

              <div className="flex flex-col gap-2 text-xs sm:text-sm text-gray-500 mb-6">
                <span>🔒 Secure Checkout</span>
                <span>Fast Nationwide Delivery</span>
                <span>Premium Thrift Quality</span>
              </div>

              {/* Step Indicator */}
              <div className="flex gap-2 mb-8 sm:gap-4">
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
                    className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                      step === s
                        ? "bg-gray-900 text-white"
                        : step > s
                        ? "bg-green-100 text-green-700 cursor-pointer"
                        : "bg-gray-100 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <span className="hidden sm:inline">{step > s ? "✓ " : ""}{s === 1 ? "Shipping" : "Payment"}</span>
                    <span className="sm:hidden">{step > s ? "✓" : "Step " + s}</span>
                  </button>
                ))}
              </div>

              {/* Step 1: Shipping */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Email*</label>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      value={effectiveFormData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="w-full border text-stone-800 border-gray-300 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">First Name*</label>
                      <input
                        type="text"
                        name="firstName"
                        autoComplete="given-name"
                        required
                        value={effectiveFormData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        className="w-full border text-stone-800 border-gray-300 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Last Name*</label>
                      <input
                        type="text"
                        name="lastName"
                        autoComplete="family-name"
                        required
                        value={effectiveFormData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className="w-full border text-stone-800 border-gray-300 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Phone*</label>
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="08012345678"
                      className="w-full border text-stone-800 border-gray-300 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Address*</label>
                    <input
                      type="text"
                      name="address"
                      autoComplete="street-address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                      className="w-full border text-stone-800 border-gray-300 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">City*</label>
                      <input
                        type="text"
                        name="city"
                        autoComplete="address-level2"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Lagos"
                        className="w-full border text-stone-800 border-gray-300 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">State*</label>
                      <input
                        type="text"
                        name="state"
                        autoComplete="address-level1"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Lagos"
                        className="w-full border text-stone-800 border-gray-300 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">ZIP Code*</label>
                    <input
                      type="text"
                      name="zipCode"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      pattern="[0-9]{5,10}"
                      required
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="100001"
                      className="w-full border text-stone-800 border-gray-300 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Country*</label>
                    <input
                      type="text"
                      name="country"
                      autoComplete="country-name"
                      required
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full border text-stone-800 border-gray-300 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                    />
                  </div>

                  {/* Delivery Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Delivery Method
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: "standard", label: "Standard Delivery", sub: "2–5 business days · Free over ₦50,000" },
                        { value: "express", label: "Express Delivery", sub: "24–48 hours · ₦5,000" },
                        { value: "pickup", label: "Store Pickup", sub: "Pickup from our location · Free" },
                      ].map(({ value, label, sub }) => (
                        <motion.button
                          key={value}
                          type="button"
                          onClick={() => setDeliveryMethod(value as "standard" | "express" | "pickup")}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full border rounded-lg p-4 text-left transition ${
                            deliveryMethod === value ? "border-gray-900 bg-gray-50 ring-2 ring-gray-900" : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <p className="font-medium text-gray-900">{label}</p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">{sub}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    onClick={() => {
                      if (validateShippingStep()) setStep(2);
                    }}
                    disabled={loading}
                    className="w-full bg-gray-900 text-white py-3 sm:py-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-500 transition font-medium"
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
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-gray-50">
                    <p className="font-semibold text-gray-900 mb-2">Secure Paystack checkout</p>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                      You&apos;ll be redirected to Paystack to pay securely by card, bank transfer, or USSD.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      onClick={() => setStep(1)}
                      className="flex-1 border border-gray-300 py-3 text-stone-800 rounded-lg hover:bg-gray-50 transition font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex-1 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-500 transition font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? "Redirecting..." : "Pay with Paystack"}
                    </motion.button>
                  </div>

                  {pendingCheckoutUrl && (
                    <a
                      href={pendingCheckoutUrl}
                      className="block w-full text-center border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition font-medium text-gray-900"
                      rel="noopener noreferrer"
                    >
                      Open Paystack Checkout
                    </a>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Order Summary - Mobile: below form, Desktop: sidebar */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm lg:sticky lg:top-20">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">Order Summary</h3>

              <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3">
                    <div className="relative w-14 h-16 shrink-0 bg-gray-100 rounded sm:w-16 sm:h-20">
                      <Image
                        src={item.images?.[0] || IMAGE_PLACEHOLDER}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 text-xs sm:text-sm">
                      <p className="font-medium text-gray-900 line-clamp-2">{item.name}</p>
                      <p className="text-gray-500">
                        {item.selectedSize || "No size needed"}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="font-semibold text-gray-900">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-gray-500">x{item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 sm:space-y-3 pt-4 sm:pt-6 border-t">
                <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium">{shipping === 0 ? "Free" : `₦${shipping.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                  <span>Delivery</span>
                  <span className="font-medium capitalize">{deliveryMethod}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-semibold text-gray-900 pt-2 sm:pt-3 border-t">
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