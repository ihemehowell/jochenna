"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, LogOut } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/shore/cartStore";
import { useAuthStore } from "@/shore/authStore";
import { useFeedbackStore } from "@/shore/feedbackStore";

export default function Navbar() {
  const cart = useCartStore((state) => state.cart);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const pushToast = useFeedbackStore((state) => state.pushToast);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    pushToast("You have been logged out.");
    setMobileMenuOpen(false);
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

  const linkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  const badgeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 10,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <>
      {/* ── Overlay & Drawer live OUTSIDE the header ── */}
      <AnimatePresence mode="wait">
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 h-full w-[85%] max-w-87.5 bg-white z-50 md:hidden"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 h-16 border-b">
                <h2 className="font-semibold text-lg">Menu</h2>
                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Drawer Links */}
              <motion.nav className="flex flex-col p-6" initial="hidden" animate="visible">
                {[
                  { href: "/", label: "Home" },
                  { href: "/shop", label: "Shop" },
                  { href: "/wishlist", label: "Wishlist" },
                  { href: "/new-arrivals", label: "New Arrivals" },
                  ...(user ? [{ href: "/orders", label: "Orders" }] : []),
                  ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
                  { href: "/auth", label: user ? "Account" : "Login / Register" },
                ].map(({ href, label }, i) => (
                  <motion.div
                    key={href}
                    variants={linkVariants}
                    custom={i}
                  >
                    <Link
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-4 border-b text-lg text-gray-500 hover:text-gray-700 transition-colors block"
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}

                {user && (
                  <motion.button
                    type="button"
                    onClick={handleLogout}
                    className="mt-4 flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                    variants={linkVariants}
                    custom={5}
                  >
                    <LogOut size={16} />
                    Logout
                  </motion.button>
                )}
              </motion.nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <motion.header
        className="sticky top-0 z-50 bg-white border-b border-gray-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-14 md:h-16 flex items-center justify-between">
          
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/light.png"
                alt="Logo"
                width={440}
                height={440}
                className="w-30"
              />
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: "/", label: "Home" },
              { href: "/shop", label: "Shop" },
              ...(user ? [{ href: "/orders", label: "Orders" }] : []),
              ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
            ].map(({ href, label }) => (
              <motion.div
                key={href}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={href}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="hidden rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:border-gray-300 md:inline-flex"
            >
              {user ? user.name.split(" ")[0] || "Account" : "Login"}
            </Link>

            {user && (
              <motion.button
                onClick={handleLogout}
                className="hidden text-gray-600 transition hover:text-gray-900 md:inline-flex"
                aria-label="Logout"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={18} />
              </motion.button>
            )}

            {/* Cart */}
            <motion.button
              onClick={toggleCart}
              className="relative"
              aria-label="Open cart"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBag size={22} className="text-gray-900" />
              <AnimatePresence mode="wait">
                {totalItems > 0 && (
                  <motion.span
                    className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold"
                    variants={badgeVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    key={totalItems}
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden"
              aria-label="Open menu"
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={24} className="text-gray-900" />
            </motion.button>
          </div>
        </div>
      </motion.header>
    </>
  );
}