"use client";

import Image from "next/image";
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

  const handleDecrease = (id: number, selectedSize: string) => {
    decreaseQuantity(id, selectedSize);
    pushToast("Cart quantity updated.");
  };

  const handleIncrease = (id: number, selectedSize: string) => {
    increaseQuantity(id, selectedSize);
    pushToast("Cart quantity updated.");
  };

  const handleRemove = (id: number, selectedSize: string) => {
    removeFromCart(id, selectedSize);
    pushToast("Item removed from cart.");
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isCartOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-112.5 bg-white z-50 transition-transform duration-300 flex flex-col ${
          isCartOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-20 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Shopping Cart
          </h2>

          <button onClick={closeCart}>
            <X  className="text-gray-900"/>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">
                Your cart is empty.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4"
              >
                
                <div className="relative w-24 h-28 bg-gray-100">
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
                    <button
                      onClick={() =>
                        handleDecrease(item.id, item.selectedSize)
                      }
                      className="border p-1 border-gray-800 text-gray-800"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="text-gray-900">{item.quantity}</span>

                    <button
                      onClick={() =>
                        handleIncrease(item.id, item.selectedSize)
                      }
                      className="border p-1 border-gray-800 text-gray-800"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() =>
                    handleRemove(item.id, item.selectedSize)
                  }
                >
                  <Trash2
                    size={18}
                    className="text-gray-500"
                  />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-gray-500">
              Subtotal
            </p>

            <p className="font-semibold text-lg text-gray-900">
              ₦{totalPrice.toLocaleString()}
            </p>
          </div>

          <button className="w-full bg-gray-900 rounded text-white py-4 hover:bg-gray-800 transition">
            Checkout
          </button>
        </div>
      </div>
    </>
  );
}