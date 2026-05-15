"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ShoppingBag, Heart, Menu, X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/shore/cartStore";
import { useAuthStore } from "@/shore/authStore";
import { useFeedbackStore } from "@/shore/feedbackStore";
import { getProductCategories } from "@/lib/api";
import { SHOP_TAXONOMY } from "@/lib/shopTaxonomy";

export default function Navbar() {
  const cart = useCartStore((state) => state.cart);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const pushToast = useFeedbackStore((state) => state.pushToast);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [shopCategories, setShopCategories] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const formatCategory = (category: string) =>
    category
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getProductCategories();

      const taxonomyCategories = SHOP_TAXONOMY.map((group) => group.category);
      const backendOnlyCategories = data.filter(
        (category) =>
          !taxonomyCategories.some(
            (taxonomyCategory) =>
              taxonomyCategory.toLowerCase() === category.toLowerCase()
          )
      );

      setShopCategories([...taxonomyCategories, ...backendOnlyCategories]);
    };

    fetchCategories();
  }, []);

  const taxonomyGroupByCategory = new Map(
    SHOP_TAXONOMY.map((group) => [group.category.toLowerCase(), group])
  );

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
              className="fixed top-0 right-0 h-full w-[85%] max-w-87.5 bg-white z-50 md:hidden overflow-y-auto"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 h-16 border-b sticky top-0 bg-white z-10">
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
                  { href: "/wishlist", label: "Wishlist" },
                  { href: "/new-arrivals", label: "New Arrivals" },
                  ...(user ? [{ href: "/orders", label: "Orders" }] : []),
                  ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
                  { href: "/auth", label: user ? "Account" : "Login / Register" },
                ].map(({ href, label }, i) => (
                  <motion.div key={href} variants={linkVariants} custom={i}>
                    <Link
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-4 border-b text-lg text-gray-500 hover:text-gray-700 transition-colors block"
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}

                {/* ── Mobile Shop Section ── */}
                <motion.div variants={linkVariants} custom={2}>
                  <div className="border-b py-4">
                    {/* Shop header row */}
                    <div className="flex items-center justify-between">
                      <Link
                        href="/shop"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg text-gray-500 transition-colors hover:text-gray-700"
                      >
                        Shop
                      </Link>
                    </div>

                    {shopCategories.length > 0 && (
                      <div className="mt-3 space-y-2 pl-1">
                        {shopCategories.map((category) => {
                          const subcategories =
                            taxonomyGroupByCategory.get(category.toLowerCase())?.subcategories ?? [];
                          const isExpanded = expandedCategory === category;

                          return (
                            <div key={category} className="rounded-xl">
                              {/* Category row */}
                              <div className="flex items-center justify-between pr-1">
                                <Link
                                  href={`/shop?category=${encodeURIComponent(category)}`}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="py-1.5 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
                                >
                                  {formatCategory(category)}
                                </Link>

                                {subcategories.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedCategory(isExpanded ? null : category)
                                    }
                                    className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                    aria-label={`Toggle ${category} subcategories`}
                                  >
                                    <ChevronDown
                                      size={14}
                                      className={`transition-transform duration-200 ${
                                        isExpanded ? "rotate-180" : ""
                                      }`}
                                    />
                                  </button>
                                )}
                              </div>

                              {/* Subcategory pills — animated expand/collapse */}
                              <AnimatePresence initial={false}>
                                {subcategories.length > 0 && isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                  >
                                    <div className="flex flex-wrap gap-1.5 pb-2 pt-1 pl-1">
                                      {subcategories.map((subcategory) => (
                                        <Link
                                          key={`${category}-${subcategory}`}
                                          href={`/shop?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`}
                                          onClick={() => setMobileMenuOpen(false)}
                                          className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800"
                                        >
                                          {subcategory}
                                        </Link>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>

                {user && (
                  <motion.button
                    type="button"
                    onClick={handleLogout}
                    className="mt-4 w-full rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    variants={linkVariants}
                    custom={5}
                  >
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
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Link href="/" className="text-gray-500 transition-colors hover:text-gray-700">
                Home
              </Link>
            </motion.div>

            {/* ── Desktop Shop Dropdown ── */}
            <div
              className="relative"
              onMouseEnter={() => setShopMenuOpen(true)}
              onMouseLeave={() => setShopMenuOpen(false)}
            >
              <div className="flex items-center gap-1">
                <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <Link
                    href="/shop"
                    className="text-gray-500 transition-colors hover:text-gray-700"
                    onClick={() => setShopMenuOpen(false)}
                  >
                    Shop
                  </Link>
                </motion.div>

                {shopCategories.length > 0 && (
                  <button
                    type="button"
                    aria-label="Open shop categories"
                    aria-expanded={shopMenuOpen}
                    onClick={() => setShopMenuOpen((current) => !current)}
                    className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${shopMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {shopMenuOpen && shopCategories.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full z-50 mt-3 w-[560px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
                  >
                    {/* All goods link */}
                    <Link
                      href="/shop"
                      onClick={() => setShopMenuOpen(false)}
                      className="block border-b border-gray-100 px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                    >
                      All goods
                    </Link>

                    {/* 2-column category grid */}
                    <div className="grid grid-cols-2 gap-x-2 p-3 max-h-[420px] overflow-y-auto">
                      {shopCategories.map((category) => {
                        const subcategories =
                          taxonomyGroupByCategory.get(category.toLowerCase())?.subcategories ?? [];

                        return (
                          <div key={category} className="rounded-xl px-2 py-2.5 hover:bg-gray-50">
                            <Link
                              href={`/shop?category=${encodeURIComponent(category)}`}
                              onClick={() => setShopMenuOpen(false)}
                              className="block px-1 py-0.5 text-sm font-semibold text-gray-800 transition hover:text-gray-900"
                            >
                              {formatCategory(category)}
                            </Link>

                            {subcategories.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {subcategories.map((subcategory) => (
                                  <Link
                                    key={`${category}-${subcategory}`}
                                    href={`/shop?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`}
                                    onClick={() => setShopMenuOpen(false)}
                                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
                                  >
                                    {subcategory}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {(user ? [{ href: "/orders", label: "Orders" }] : []).concat(
              user?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []
            ).map(({ href, label }) => (
              <motion.div key={href} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Link href={href} className="text-gray-500 transition-colors hover:text-gray-700">
                  {label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Account Menu */}
            <div
              className="relative hidden md:block"
              onMouseEnter={() => user && setAccountMenuOpen(true)}
              onMouseLeave={() => setAccountMenuOpen(false)}
            >
              {user ? (
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:border-gray-300"
                >
                  {user.name.split(" ")[0] || "Account"}
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:border-gray-300"
                >
                  Login
                </Link>
              )}

              <AnimatePresence>
                {user && accountMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
                  >
                    <Link
                      href="/auth"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block border-b border-gray-100 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      Account
                    </Link>

                    {user?.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block border-b border-gray-100 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                      >
                        Admin Panel
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setAccountMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/wishlist"
                className="relative inline-flex"
                aria-label="View wishlist"
              >
                <Heart size={22} className="text-gray-900" />
              </Link>
            </motion.div>

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