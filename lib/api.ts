import { FALLBACK_PRODUCTS } from "@/data/fallbackProducts";
import type {
  AgeGroup,
  Product,
  ProductCategory,
  ProductCondition,
} from "./types";

const DEFAULT_DEV_API_BASE_URL = "http://localhost:5000";
let hasWarnedAboutEnv = false;

function logApiEvent(level: "info" | "warn" | "error", message: string, details?: unknown) {
  const prefix = "[jochenna-api]";

  if (level === "info") {
    console.info(prefix, message, details ?? "");
    return;
  }

  if (level === "warn") {
    console.warn(prefix, message, details ?? "");
    return;
  }

  console.error(prefix, message, details ?? "");
}

function resolveApiBaseUrl(): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  if (!configuredBaseUrl) {
    if (!hasWarnedAboutEnv) {
      hasWarnedAboutEnv = true;
      logApiEvent(
        "warn",
        isProduction
          ? "NEXT_PUBLIC_BACKEND_URL is not set in production. Falling back to same-origin /api."
          : "NEXT_PUBLIC_BACKEND_URL is not set. Falling back to http://localhost:5000."
      );
    }

    return isProduction ? "" : DEFAULT_DEV_API_BASE_URL;
  }

  try {
    const normalized = new URL(configuredBaseUrl).toString().replace(/\/$/, "");
    logApiEvent("info", "Resolved API base URL.", normalized);
    return normalized;
  } catch {
    if (!hasWarnedAboutEnv) {
      hasWarnedAboutEnv = true;
      logApiEvent(
        "warn",
        isProduction
          ? `Invalid NEXT_PUBLIC_BACKEND_URL (${configuredBaseUrl}) in production. Falling back to same-origin /api.`
          : `Invalid NEXT_PUBLIC_BACKEND_URL (${configuredBaseUrl}). Falling back to http://localhost:5000.`
      );
    }

    return isProduction ? "" : DEFAULT_DEV_API_BASE_URL;
  }
}

function buildApiUrl(pathname: string): string {
  const baseUrl = resolveApiBaseUrl();
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

function buildAuthHeaders(token?: string): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type RawProduct = {
  _id?: unknown;
  id?: unknown;
  name?: unknown;
  price?: unknown;
  category?: unknown;
  subcategory?: unknown;
  stock?: unknown;
  sold?: unknown;
  sizes?: unknown;
  images?: unknown;
  ageGroup?: unknown;
  gender?: unknown;
  condition?: unknown;
};

type RawCartEntry = {
  product?: RawProduct;
  productId?: unknown;
  quantity?: unknown;
  size?: unknown;
  selectedSize?: unknown;
  itemIndex?: unknown;
  [key: string]: unknown;
};

type RawCartResponse = {
  cart?: unknown;
  items?: unknown;
  data?: unknown;
  message?: string;
  [key: string]: unknown;
};

type RawOrder = {
  _id?: unknown;
  id?: unknown;
  status?: unknown;
  total?: unknown;
  totalPrice?: unknown;
  items?: unknown;
  shippingAddress?: unknown;
  deliveryMethod?: unknown;
  shippingFee?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  user?: unknown;
  [key: string]: unknown;
};

type RawOrdersResponse = RawOrder[] | { orders?: RawOrder[]; data?: RawOrder[]; message?: string };

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asGender(value: unknown): Product["gender"] {
  const normalized = asString(value).toLowerCase();
  if (normalized === "boys" || normalized === "girls" || normalized === "unisex") {
    return normalized;
  }
  return undefined;
}

function asCategory(value: unknown): ProductCategory {
  return asString(value, "Uncategorized");
}

function asCondition(value: unknown): ProductCondition {
  const normalized = asString(value);
  const allowed: ProductCondition[] = ["like-new", "gently-used", "used"];
  return allowed.includes(normalized as ProductCondition) ? (normalized as ProductCondition) : "gently-used";
}

function asAgeGroups(value: unknown): AgeGroup[] {
  const allowed: AgeGroup[] = ["0-6m", "6-12m", "1-2y", "3-5y", "6-10y"];
  return Array.isArray(value)
    ? value.filter(
        (item): item is AgeGroup => typeof item === "string" && allowed.includes(item as AgeGroup)
      )
    : [];
}

function normalizeProduct(product: RawProduct): Product {
  const id = product._id ?? product.id;
  return {
    id: asString(id, "unknown-id"),
    name: asString(product.name, "Untitled Product"),
    price: asNumber(product.price, 0),
    category: asCategory(product.category),
    subcategory: asString(product.subcategory) || undefined,
    stock: asNumber(product.stock, 0),
    sold: asNumber(product.sold, 0),
    sizes: asStringArray(product.sizes),
    images: asStringArray(product.images),
    ageGroup: asAgeGroups(product.ageGroup),
    gender: asGender(product.gender),
    condition: asCondition(product.condition),
  };
}

export type ApiCartItem = Product & {
  quantity: number;
  selectedSize: string;
};

function normalizeCartEntry(entry: RawCartEntry): ApiCartItem | null {
  const source = (entry.product ?? entry) as RawProduct;
  const product = normalizeProduct(source);
  const quantity = asNumber(entry.quantity, 1);
  const selectedSize = asString(entry.selectedSize ?? entry.size, "");

  if (!product.id) {
    return null;
  }

  const requiresSize = (product.sizes?.length ?? 0) > 0;

  if (requiresSize && !selectedSize) {
    return null;
  }

  return {
    ...product,
    quantity,
    selectedSize,
  };
}

function normalizeCartItems(input: unknown): ApiCartItem[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      return normalizeCartEntry(entry as RawCartEntry);
    })
    .filter((item): item is ApiCartItem => Boolean(item));
}

export type ShippingAddress = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export type ApiOrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type ApiOrder = {
  id: string;
  status: ApiOrderStatus;
  total: number;
  items: ApiCartItem[];
  shippingAddress: ShippingAddress | null;
  deliveryMethod?: "standard" | "express" | "pickup";
  shippingFee?: number;
  createdAt?: string;
  updatedAt?: string;
};

function normalizeOrder(order: RawOrder): ApiOrder {
  const rawItems = Array.isArray(order.items) ? order.items : [];
  const shippingAddress =
    order.shippingAddress && typeof order.shippingAddress === "object"
      ? (order.shippingAddress as ShippingAddress)
      : null;

  return {
    id: asString(order._id ?? order.id, "unknown-order"),
    status: (asString(order.status, "pending") as ApiOrderStatus) || "pending",
    total: asNumber(order.total ?? order.totalPrice, 0),
    items: normalizeCartItems(rawItems),
    shippingAddress,
    deliveryMethod: asString(order.deliveryMethod, "") as ApiOrder["deliveryMethod"],
    shippingFee: asNumber(order.shippingFee, 0),
    createdAt: typeof order.createdAt === "string" ? order.createdAt : undefined,
    updatedAt: typeof order.updatedAt === "string" ? order.updatedAt : undefined,
  };
}

type RawPaginatedProducts = {
  products?: RawProduct[];
  page?: unknown;
  limit?: unknown;
  total?: unknown;
  totalPages?: unknown;
};

export type FilterProductsParams = {
  category?: string;
  search?: string;
  sort?: "price-asc" | "price-desc" | "best-selling";
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  ageGroup?: string;
  gender?: string;
  condition?: string;
};

export type FilterProductsResult = {
  products: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

function createQueryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }
    query.set(key, String(value));
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

function matchesFilter(product: Product, params: FilterProductsParams): boolean {
  const search = params.search?.trim().toLowerCase();

  if (params.category && product.category.toLowerCase() !== params.category.toLowerCase()) {
    return false;
  }

  if (params.size && !(product.sizes ?? []).some((size) => size.toLowerCase() === params.size?.toLowerCase())) {
    return false;
  }

  if (params.ageGroup && !(product.ageGroup ?? []).includes(params.ageGroup as AgeGroup)) {
    return false;
  }

  if (params.gender && product.gender !== params.gender) {
    return false;
  }

  if (params.condition && product.condition !== params.condition) {
    return false;
  }

  if (!search) {
    return true;
  }

  const haystack = [product.name, product.category, product.subcategory ?? ""].join(" ").toLowerCase();
  return haystack.includes(search);
}

function sortProducts(products: Product[], sort?: FilterProductsParams["sort"]): Product[] {
  const sorted = [...products];

  if (sort === "price-asc") {
    return sorted.sort((left, right) => left.price - right.price);
  }

  if (sort === "price-desc") {
    return sorted.sort((left, right) => right.price - left.price);
  }

  if (sort === "best-selling") {
    return sorted.sort((left, right) => (right.sold ?? 0) - (left.sold ?? 0));
  }

  return sorted;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; statusText: string; data?: T; text?: string }> {
  const response = await fetch(url, init);
  let data: T | undefined;
  let text: string | undefined;

  try {
    data = (await response.json()) as T;
  } catch {
    try {
      text = await response.text();
    } catch {
      text = undefined;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    data,
    text,
  };
}

function fallbackProductsForFilter(params: FilterProductsParams): FilterProductsResult {
  const fallbackProducts = sortProducts(FALLBACK_PRODUCTS.filter((product) => matchesFilter(product, params)), params.sort);
  const total = fallbackProducts.length;
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const startIndex = (page - 1) * limit;

  return {
    products: fallbackProducts.slice(startIndex, startIndex + limit),
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const url = buildApiUrl("/api/products");
    logApiEvent("info", "Fetching products.", url);
    const result = await fetchJson<RawProduct[]>(url, { cache: "no-store" });

    if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
      logApiEvent("error", "Product fetch failed.", {
        url,
        status: result.status,
        statusText: result.statusText,
        body: result.text,
      });
      return FALLBACK_PRODUCTS;
    }

    logApiEvent("info", "Fetched products successfully.", { url, count: result.data.length });
    return result.data.map(normalizeProduct);
  } catch (error) {
    logApiEvent("error", "Error fetching products; using fallback catalog.", error);
    return FALLBACK_PRODUCTS;
  }
}

export async function getProductCategories(): Promise<string[]> {
  try {
    const url = buildApiUrl("/api/products/categories");
    logApiEvent("info", "Fetching product categories.", url);
    const result = await fetchJson<unknown>(url, { cache: "no-store" });

    if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
      logApiEvent("error", "Category fetch failed.", {
        url,
        status: result.status,
        statusText: result.statusText,
        body: result.text,
      });
      return [...new Set(FALLBACK_PRODUCTS.map((product) => product.category))];
    }

    logApiEvent("info", "Fetched product categories successfully.", { url, count: result.data.length });
    return result.data.filter((item): item is string => typeof item === "string");
  } catch (error) {
    logApiEvent("error", "Error fetching product categories.", error);
    return [...new Set(FALLBACK_PRODUCTS.map((product) => product.category))];
  }
}

export async function getBestSellers(limit?: number): Promise<Product[]> {
  try {
    const query = createQueryString({ limit });
    const url = buildApiUrl(`/api/products/best-sellers${query}`);
    logApiEvent("info", "Fetching best sellers.", url);
    const result = await fetchJson<RawProduct[]>(url, { cache: "no-store" });

    if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
      logApiEvent("error", "Best sellers fetch failed.", {
        url,
        status: result.status,
        statusText: result.statusText,
        body: result.text,
      });
      return [...FALLBACK_PRODUCTS].sort((left, right) => (right.sold ?? 0) - (left.sold ?? 0)).slice(0, limit ?? 4);
    }

    logApiEvent("info", "Fetched best sellers successfully.", { url, count: result.data.length });
    return result.data.map(normalizeProduct);
  } catch (error) {
    logApiEvent("error", "Error fetching best sellers; using fallback catalog.", error);
    return [...FALLBACK_PRODUCTS].sort((left, right) => (right.sold ?? 0) - (left.sold ?? 0)).slice(0, limit ?? 4);
  }
}

export async function filterProducts(params: FilterProductsParams = {}): Promise<FilterProductsResult> {
  const fallbackLimit = params.limit ?? 12;

  try {
    const query = createQueryString({
      category: params.category,
      search: params.search,
      sort: params.sort,
      page: params.page,
      limit: params.limit,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      size: params.size,
      ageGroup: params.ageGroup,
      gender: params.gender,
      condition: params.condition,
    });

    const url = buildApiUrl(`/api/products/filters${query}`);
    logApiEvent("info", "Filtering products.", { url, params });
    const result = await fetchJson<RawPaginatedProducts>(url, { cache: "no-store" });

    if (!result.ok || !result.data || !Array.isArray(result.data.products) || result.data.products.length === 0) {
      logApiEvent("error", "Product filtering failed.", {
        url,
        status: result.status,
        statusText: result.statusText,
        body: result.text,
      });
      return fallbackProductsForFilter(params);
    }

    const rawProducts = result.data.products;
    logApiEvent("info", "Filtered products successfully.", {
      url,
      count: rawProducts.length,
      total: asNumber(result.data.total, rawProducts.length),
    });

    return {
      products: rawProducts.map(normalizeProduct),
      page: asNumber(result.data.page, params.page ?? 1),
      limit: asNumber(result.data.limit, fallbackLimit),
      total: asNumber(result.data.total, rawProducts.length),
      totalPages: asNumber(result.data.totalPages, 1),
    };
  } catch (error) {
    logApiEvent("error", "Error filtering products; using fallback catalog.", error);
    return fallbackProductsForFilter(params);
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const url = buildApiUrl(`/api/products/${id}`);
    logApiEvent("info", "Fetching product by id.", { url, id });
    const result = await fetchJson<RawProduct>(url, { cache: "no-store" });

    if (!result.ok || !result.data) {
      logApiEvent("warn", "Product by id request returned non-ok response.", {
        url,
        status: result.status,
        statusText: result.statusText,
        body: result.text,
      });
      return null;
    }

    logApiEvent("info", "Fetched product by id successfully.", { url, id });
    return normalizeProduct(result.data);
  } catch (error) {
    logApiEvent("error", `Error fetching product ${id}.`, error);
    return null;
  }
}

export async function createProductAdmin(token: string | undefined, product: Omit<Product, "id">): Promise<Product | null> {
  try {
    const response = await fetch(buildApiUrl("/api/products"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(token),
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.statusText}`);
    }

    const data = (await response.json()) as RawProduct;
    return normalizeProduct(data);
  } catch (error) {
    logApiEvent("error", "Error creating product.", error);
    return null;
  }
}

export async function updateProductAdmin(token: string | undefined, productId: string, product: Partial<Omit<Product, "id">>): Promise<Product | null> {
  try {
    const response = await fetch(buildApiUrl(`/api/products/${productId}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(token),
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.statusText}`);
    }

    const data = (await response.json()) as RawProduct;
    return normalizeProduct(data);
  } catch (error) {
    logApiEvent("error", "Error updating product.", error);
    return null;
  }
}

export async function deleteProductAdmin(productId: string, token?: string): Promise<boolean> {
  try {
    const response = await fetch(buildApiUrl(`/api/products/${productId}`), {
      method: "DELETE",
      headers: buildAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    logApiEvent("error", "Error deleting product.", error);
    return false;
  }
}

export async function seedProducts(): Promise<Product[]> {
  try {
    const response = await fetch(buildApiUrl("/api/products/seed"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to seed products: ${response.statusText}`);
    }

    const data = (await response.json()) as RawProduct[] | RawProduct;
    return Array.isArray(data) ? data.map(normalizeProduct) : [];
  } catch (error) {
    logApiEvent("error", "Error seeding products.", error);
    return [];
  }
}

export async function getCart(token: string): Promise<{ ok: boolean; items: ApiCartItem[]; message?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/cart"), {
      cache: "no-store",
      headers: buildAuthHeaders(token),
    });

    const body = (await response.json()) as RawCartResponse;
    if (!response.ok) {
      return {
        ok: false,
        items: [],
        message: body.message || `Failed to fetch cart (${response.status}).`,
      };
    }

    const rawItems = Array.isArray(body.cart)
      ? body.cart
      : Array.isArray(body.items)
      ? body.items
      : Array.isArray(body.data)
      ? body.data
      : [];

    return { ok: true, items: normalizeCartItems(rawItems) };
  } catch (error) {
    logApiEvent("error", "Error fetching cart.", error);
    return { ok: false, items: [], message: "Could not connect to cart service." };
  }
}

export async function addCartItem(token: string, payload: { productId: string; quantity: number; size?: string }): Promise<{ ok: boolean; items?: ApiCartItem[]; message?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/cart/add"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(token),
      },
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as RawCartResponse;
    if (!response.ok) {
      return { ok: false, message: body.message || "Failed to add item to cart." };
    }

    const rawItems = Array.isArray(body.cart)
      ? body.cart
      : Array.isArray(body.items)
      ? body.items
      : Array.isArray(body.data)
      ? body.data
      : [];

    return { ok: true, items: normalizeCartItems(rawItems) };
  } catch (error) {
    logApiEvent("error", "Error adding cart item.", error);
    return { ok: false, message: "Could not connect to cart service." };
  }
}

export async function removeCartItem(token: string, payload: { itemIndex: number }): Promise<{ ok: boolean; items?: ApiCartItem[]; message?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/cart/remove"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(token),
      },
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as RawCartResponse;
    if (!response.ok) {
      return { ok: false, message: body.message || "Failed to remove item from cart." };
    }

    const rawItems = Array.isArray(body.cart)
      ? body.cart
      : Array.isArray(body.items)
      ? body.items
      : Array.isArray(body.data)
      ? body.data
      : [];

    return { ok: true, items: normalizeCartItems(rawItems) };
  } catch (error) {
    logApiEvent("error", "Error removing cart item.", error);
    return { ok: false, message: "Could not connect to cart service." };
  }
}

export async function updateCartItem(token: string, payload: { itemIndex: number; quantity: number }): Promise<{ ok: boolean; items?: ApiCartItem[]; message?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/cart/update"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(token),
      },
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as RawCartResponse;
    if (!response.ok) {
      return { ok: false, message: body.message || "Failed to update cart item." };
    }

    const rawItems = Array.isArray(body.cart)
      ? body.cart
      : Array.isArray(body.items)
      ? body.items
      : Array.isArray(body.data)
      ? body.data
      : [];

    return { ok: true, items: normalizeCartItems(rawItems) };
  } catch (error) {
    logApiEvent("error", "Error updating cart item.", error);
    return { ok: false, message: "Could not connect to cart service." };
  }
}

export async function clearCartApi(token: string): Promise<{ ok: boolean; items?: ApiCartItem[]; message?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/cart/clear"), {
      method: "POST",
      headers: { ...buildAuthHeaders(token) },
    });

    const body = (await response.json()) as RawCartResponse;
    if (!response.ok) {
      return { ok: false, message: body.message || "Failed to clear cart." };
    }

    const rawItems = Array.isArray(body.cart)
      ? body.cart
      : Array.isArray(body.items)
      ? body.items
      : Array.isArray(body.data)
      ? body.data
      : [];

    return { ok: true, items: normalizeCartItems(rawItems) };
  } catch (error) {
    logApiEvent("error", "Error clearing cart.", error);
    return { ok: false, message: "Could not connect to cart service." };
  }
}

type SubmitOrderResult = {
  ok: boolean;
  message: string;
  orderId?: string;
  isMock?: boolean;
};

type VerifyPaystackPaymentResult = {
  ok: boolean;
  message: string;
  orderId?: string;
};

type InitializePaystackPaymentResult = {
  ok: boolean;
  message: string;
  authorizationUrl?: string;
  reference?: string;
};

export async function submitOrder(
  payload: { shippingAddress: ShippingAddress; deliveryMethod: "standard" | "express" | "pickup" },
  token?: string
): Promise<SubmitOrderResult> {
  try {
    if (!token) {
      return { ok: false, message: "Please sign in to place an order." };
    }

    const response = await fetch(buildApiUrl("/api/orders"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(token),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Unable to place order (${response.status}).`;
      try {
        const body = (await response.json()) as { message?: string };
        if (body.message) {
          errorMessage = body.message;
        }
      } catch {
        // Ignore JSON parse issues and keep default message.
      }

      return { ok: false, message: errorMessage };
    }

    const body = (await response.json()) as { id?: string; orderId?: string };
    return { ok: true, message: "Order placed successfully.", orderId: body.orderId ?? body.id };
  } catch (error) {
    logApiEvent("error", "Error placing order.", error);
    return { ok: false, message: "Could not reach the checkout service. Check your backend and try again." };
  }
}

export async function verifyPaystackPayment(
  payload: {
    reference: string;
    shippingAddress?: ShippingAddress;
    deliveryMethod?: "standard" | "express" | "pickup";
  },
  token?: string
): Promise<VerifyPaystackPaymentResult> {
  try {
    if (!token) {
      return { ok: false, message: "Please sign in to place an order." };
    }

    const response = await fetch(buildApiUrl("/api/orders/paystack/verify"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(token),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Unable to verify payment (${response.status}).`;
      try {
        const body = (await response.json()) as { message?: string };
        if (body.message) {
          errorMessage = body.message;
        }
      } catch {
        // Ignore JSON parse issues and keep default message.
      }

      return { ok: false, message: errorMessage };
    }

    const body = (await response.json()) as { id?: string; orderId?: string; message?: string };
    return {
      ok: true,
      message: body.message ?? "Payment verified successfully.",
      orderId: body.orderId ?? body.id,
    };
  } catch (error) {
    logApiEvent("error", "Error verifying Paystack payment.", error);
    return { ok: false, message: "Could not verify payment. Check your backend and try again." };
  }
}

export async function initializePaystackPayment(
  payload: {
    shippingAddress: ShippingAddress;
    deliveryMethod: "standard" | "express" | "pickup";
  },
  token?: string
): Promise<InitializePaystackPaymentResult> {
  try {
    logApiEvent("info", "Initializing Paystack payment request.", {
      hasToken: Boolean(token),
      deliveryMethod: payload.deliveryMethod,
      email: payload.shippingAddress?.email,
    });

    if (!token) {
      return { ok: false, message: "Please sign in to place an order." };
    }

    const response = await fetch(buildApiUrl("/api/orders/paystack/initialize"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(token),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Unable to initialize payment (${response.status}).`;
      try {
        const body = (await response.json()) as { message?: string };
        if (body.message) {
          errorMessage = body.message;
        }
      } catch {
        // Ignore JSON parse issues and keep default message.
      }

      return { ok: false, message: errorMessage };
    }

    const body = (await response.json()) as {
      authorizationUrl?: string;
      authorization_url?: string;
      reference?: string;
      message?: string;
    };

    const resolvedAuthorizationUrl = body.authorizationUrl ?? body.authorization_url;

    logApiEvent("info", "Paystack initialize API succeeded.", {
      status: response.status,
      reference: body.reference,
      hasAuthorizationUrl: Boolean(resolvedAuthorizationUrl),
      authorizationHost: resolvedAuthorizationUrl
        ? (() => {
            try {
              return new URL(resolvedAuthorizationUrl).host;
            } catch {
              return "invalid-url";
            }
          })()
        : null,
    });

    return {
      ok: true,
      message: body.message ?? "Payment initialized successfully.",
      authorizationUrl: resolvedAuthorizationUrl,
      reference: body.reference,
    };
  } catch (error) {
    logApiEvent("error", "Error initializing Paystack payment.", error);
    return { ok: false, message: "Could not initialize payment. Check your backend and try again." };
  }
}

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type RawAuthUser = {
  _id?: unknown;
  id?: unknown;
  name?: unknown;
  email?: unknown;
  role?: unknown;
  isAdmin?: unknown;
};

type RawAuthResponse = {
  user?: RawAuthUser;
  token?: unknown;
  _id?: unknown;
  id?: unknown;
  name?: unknown;
  email?: unknown;
};

type RawCurrentUserResponse = {
  user?: RawAuthUser;
  _id?: unknown;
  id?: unknown;
  name?: unknown;
  email?: unknown;
  role?: unknown;
  isAdmin?: unknown;
  message?: unknown;
};

export type AuthPayload = {
  user: AuthUser;
  token: string;
};

export type AuthSeedUser = AuthPayload & {
  email: string;
  password?: string;
};

export type AuthSeedResponse = {
  users: AuthSeedUser[];
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

function normalizeAuthUser(input: RawAuthUser | undefined): AuthUser {
  const role = asString(input?.role, "");
  const isAdmin = input?.isAdmin === true;
  return {
    id: asString(input?._id ?? input?.id, ""),
    name: asString(input?.name, ""),
    email: asString(input?.email, ""),
    role: isAdmin ? "admin" : role || undefined,
  };
}

function normalizeAuthPayload(payload: RawAuthResponse | undefined): AuthPayload | null {
  if (!payload) {
    return null;
  }

  const userSource = payload.user ?? payload;
  const user = normalizeAuthUser(userSource);
  const token = asString(payload.token, "");

  if (!user.id || !user.email || !token) {
    return null;
  }

  return { user, token };
}

function normalizeCurrentUser(payload: RawCurrentUserResponse | undefined): AuthUser | null {
  if (!payload) {
    return null;
  }

  return normalizeAuthUser(payload.user ?? payload);
}

function normalizeAuthSeedUser(payload: unknown): AuthSeedUser | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as { user?: RawAuthUser; token?: unknown; email?: unknown; password?: unknown };
  const authPayload = normalizeAuthPayload({ user: record.user, token: record.token });

  if (!authPayload) {
    return null;
  }

  return {
    ...authPayload,
    email: asString(record.email, authPayload.user.email),
    password: typeof record.password === "string" ? record.password : undefined,
  };
}

export async function seedUsers(): Promise<AuthSeedResponse> {
  try {
    const response = await fetch(buildApiUrl("/api/auth/seed"), { method: "POST" });
    const data = (await response.json()) as unknown;
    const seedEntries: unknown[] = Array.isArray(data)
      ? (data as unknown[])
      : Array.isArray((data as { users?: unknown }).users)
      ? ((data as { users?: unknown }).users as unknown[])
      : [];

    const users = seedEntries
      .map(normalizeAuthSeedUser)
      .filter((item): item is AuthSeedUser => Boolean(item));

    return { users };
  } catch (error) {
    logApiEvent("error", "Error seeding users.", error);
    return { users: [] };
  }
}

export async function registerUser(payload: RegisterPayload): Promise<AuthPayload | null> {
  try {
    const response = await fetch(buildApiUrl("/api/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as RawAuthResponse;
    if (!response.ok) {
      return null;
    }

    return normalizeAuthPayload(data);
  } catch (error) {
    logApiEvent("error", "Error registering user.", error);
    return null;
  }
}

export async function loginUser(payload: LoginPayload): Promise<AuthPayload | null> {
  try {
    const response = await fetch(buildApiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as RawAuthResponse;
    if (!response.ok) {
      return null;
    }

    return normalizeAuthPayload(data);
  } catch (error) {
    logApiEvent("error", "Error logging in user.", error);
    return null;
  }
}

export async function getCurrentUser(token: string): Promise<{ ok: boolean; user: AuthUser | null; message?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/auth/me"), {
      cache: "no-store",
      headers: buildAuthHeaders(token),
    });

    const data = (await response.json()) as RawCurrentUserResponse;

    if (!response.ok) {
      logApiEvent("warn", "Failed to fetch current user.", {
        status: response.status,
        statusText: response.statusText,
        message: data.message,
      });
      return { ok: false, user: null, message: asString(data.message, "Failed to fetch current user.") };
    }

    const user = normalizeCurrentUser(data);
    if (!user?.id || !user.email) {
      return { ok: false, user: null, message: "Invalid user payload." };
    }

    return { ok: true, user };
  } catch (error) {
    logApiEvent("error", "Error fetching current user.", error);
    return { ok: false, user: null, message: "Could not connect to auth service." };
  }
}

type RawOrdersPayload = RawOrdersResponse;

export async function getOrders(token: string): Promise<{ ok: boolean; orders: ApiOrder[]; message?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/orders"), {
      cache: "no-store",
      headers: buildAuthHeaders(token),
    });

    const data = (await response.json()) as RawOrdersPayload;
    if (!response.ok) {
      const message = Array.isArray(data) ? "Failed to fetch orders." : data.message || "Failed to fetch orders.";
      return { ok: false, orders: [], message };
    }

    const orders = Array.isArray(data)
      ? data
      : Array.isArray(data.orders)
      ? data.orders
      : Array.isArray(data.data)
      ? data.data
      : [];

    return { ok: true, orders: orders.map(normalizeOrder) };
  } catch (error) {
    logApiEvent("error", "Error fetching orders.", error);
    return { ok: false, orders: [], message: "Could not connect to orders service." };
  }
}

export async function getOrderById(token: string, orderId: string): Promise<{ ok: boolean; order: ApiOrder | null; message?: string }> {
  try {
    const response = await fetch(buildApiUrl(`/api/orders/${orderId}`), {
      cache: "no-store",
      headers: buildAuthHeaders(token),
    });

    const data = (await response.json()) as RawOrder;
    if (!response.ok) {
      return { ok: false, order: null, message: asString((data as { message?: unknown }).message, "Failed to fetch order.") };
    }

    return { ok: true, order: normalizeOrder(data) };
  } catch (error) {
    logApiEvent("error", "Error fetching order by id.", error);
    return { ok: false, order: null, message: "Could not connect to orders service." };
  }
}

export async function getAdminOrders(token: string): Promise<{ ok: boolean; orders: ApiOrder[]; message?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/orders/admin/all"), {
      cache: "no-store",
      headers: buildAuthHeaders(token),
    });

    const data = (await response.json()) as RawOrdersPayload;
    if (!response.ok) {
      const message = Array.isArray(data) ? "Failed to fetch admin orders." : data.message || "Failed to fetch admin orders.";
      return { ok: false, orders: [], message };
    }

    const orders = Array.isArray(data)
      ? data
      : Array.isArray(data.orders)
      ? data.orders
      : Array.isArray(data.data)
      ? data.data
      : [];

    return { ok: true, orders: orders.map(normalizeOrder) };
  } catch (error) {
    logApiEvent("error", "Error fetching admin orders.", error);
    return { ok: false, orders: [], message: "Could not connect to orders service." };
  }
}

export async function updateOrderStatus(
  token: string,
  orderId: string,
  status: ApiOrderStatus
): Promise<{ ok: boolean; order: ApiOrder | null; message?: string }> {
  try {
    const response = await fetch(buildApiUrl(`/api/orders/${orderId}/status`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(token),
      },
      body: JSON.stringify({ status }),
    });

    const data = (await response.json()) as RawOrder | { message?: string };
    if (!response.ok) {
      return {
        ok: false,
        order: null,
        message: asString((data as { message?: unknown }).message, "Failed to update order status."),
      };
    }

    return { ok: true, order: normalizeOrder(data as RawOrder) };
  } catch (error) {
    logApiEvent("error", "Error updating order status.", error);
    return { ok: false, order: null, message: "Could not connect to orders service." };
  }
}
