"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { useCartStore } from "@/shore/cartStore";
import { useFeedbackStore } from "@/shore/feedbackStore";


const IMAGE_PLACEHOLDER =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="960" viewBox="0 0 800 960"%3E%3Crect width="800" height="960" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial, sans-serif" font-size="28"%3EImage unavailable%3C/text%3E%3C/svg%3E';


export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCartStore();
  const pushToast = useFeedbackStore((state) => state.pushToast);

  const totalPrice = cart.reduce(
    (total: number, item) =>
      total + item.price * item.quantity,
    0
  );

  const handleDecrease = (id: string | number, selectedSize: string) => {
    decreaseQuantity(id, selectedSize);
    pushToast("Cart quantity updated.");
  };

  const handleIncrease = (id: string | number, selectedSize: string) => {
    increaseQuantity(id, selectedSize);
    pushToast("Cart quantity updated.");
  };

  const handleRemove = (id: string | number, selectedSize: string) => {
    removeFromCart(id, selectedSize);
    pushToast("Item removed from cart.");
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const drawerVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      x: "100%",
      opacity: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-105 bg-white z-50 flex flex-col"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            
            {/* Header */}
            <motion.div
              className="flex items-center justify-between px-6 h-20 border-b"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-gray-900">
                Shopping Cart
              </h2>

              <button onClick={closeCart} aria-label="Close cart">
                <X className="text-gray-900" />
              </button>
            </motion.div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {cart.length === 0 ? (
                <motion.div
                  className="h-full flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <p className="text-gray-500">
                    Your cart is empty.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence mode="popLayout">
                    {cart.map((item, i) => (
                      <motion.div
                        key={`${item.id}-${item.selectedSize}`}
                        className="flex gap-4"
                        variants={itemVariants}
                        custom={i}
                        layout
                        exit={{ opacity: 0, x: 20 }}
                      >
                        
                        <div className="relative w-24 h-28 bg-gray-100 overflow-hidden">
                          <Image
                            src={item.images?.[0] || IMAGE_PLACEHOLDER}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {item.name}
                          </h3>

                          <p className="text-gray-500 text-sm mt-1">
                            ₦
                            {item.price.toLocaleString()}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            Size: {item.selectedSize}
                          </p>

                          {/* Quantity */}
                          <div className="flex items-center gap-3 mt-4">
                            <motion.button
                              onClick={() =>
                                handleDecrease(item.id, item.selectedSize)
                              }
                              className="border p-1 border-gray-800 text-gray-800 hover:bg-gray-100"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Minus size={16} />
                            </motion.button>

                            <span className="text-gray-900">{item.quantity}</span>

                            <motion.button
                              onClick={() =>
                                handleIncrease(item.id, item.selectedSize)
                              }
                              className="border p-1 border-gray-800 text-gray-800 hover:bg-gray-100"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Plus size={16} />
                            </motion.button>
                          </div>
                        </div>

                        {/* Remove */}
                        <motion.button
                          onClick={() =>
                            handleRemove(item.id, item.selectedSize)
                          }
                          className="text-gray-500 hover:text-red-500 transition"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <motion.div
              className="border-t px-4 sm:px-6 py-5 sm:py-6 space-y-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <p className="text-gray-500">
                  Subtotal
                </p>

                <motion.p
                  className="font-semibold text-lg text-gray-900"
                  key={totalPrice}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  ₦{totalPrice.toLocaleString()}
                </motion.p>
              </div>

              <Link href="/checkout">
                <motion.button
                  onClick={closeCart}
                  className="w-full bg-gray-900 rounded text-white py-4 hover:bg-gray-800 transition"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Checkout
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
