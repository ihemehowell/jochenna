import { beforeEach, describe, expect, it } from "vitest";
import type { Product } from "../lib/types";
import { useCartStore } from "./cartStore";

const product: Product = {
  id: "p-1",
  name: "Test Hoodie",
  price: 12000,
  images: ["https://example.com/image.jpg"],
  category: "clothes",
  ageGroup: ["1-2y"],
  condition: "gently-used",
  stock: 5,
  sizes: ["2T", "3T"],
};

const noSizeProduct: Product = {
  ...product,
  id: "p-2",
  name: "Test Bottle",
  sizes: [],
};

describe("cartStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({
      cart: [],
      isCartOpen: false,
    });
  });

  it("adds and merges same product+size", () => {
    const { addToCart } = useCartStore.getState();

    addToCart(product, "2T");
    addToCart(product, "2T");

    const { cart } = useCartStore.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it("treats different sizes as separate cart lines", () => {
    const { addToCart } = useCartStore.getState();

    addToCart(product, "2T");
    addToCart(product, "3T");

    const { cart } = useCartStore.getState();
    expect(cart).toHaveLength(2);
    expect(cart.map((item) => item.selectedSize).sort()).toEqual(["2T", "3T"]);
  });

  it("decreases quantity and removes item at zero", () => {
    const { addToCart, decreaseQuantity } = useCartStore.getState();

    addToCart(product, "2T");
    decreaseQuantity(product.id, "2T");

    const { cart } = useCartStore.getState();
    expect(cart).toHaveLength(0);
  });

  it("adds products that do not require a size", () => {
    const { addToCart } = useCartStore.getState();

    addToCart(noSizeProduct, "");

    const { cart } = useCartStore.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].selectedSize).toBe("");
  });
});
