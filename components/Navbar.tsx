"use client";

import Link from "next/link";
import { ShoppingBag, Menu } from "lucide-react";

import Image from "next/image";
import { useCartStore } from "@/shore/cartStore";

export default function Navbar() {
  const cart = useCartStore((state) => state.cart);

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const toggleCart = useCartStore(
  (state) => state.toggleCart
);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-semibold tracking-tight"
        >
          <Image src="/light.png" alt="Logo" width={240} height={240} className="w-30" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            Shop
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          
          {/* Cart */}
          <button
            onClick={toggleCart}
            className="relative"
          >
            <ShoppingBag
              size={22}
              className="text-gray-900"
            />

            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Menu */}
          <button className="md:hidden">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}