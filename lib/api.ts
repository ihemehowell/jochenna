import type {
  AgeGroup,
  Product,
  ProductCategory,
  ProductCondition,
} from "./types";

const DEFAULT_DEV_API_BASE_URL = "http://localhost:5000";
let hasWarnedAboutEnv = false;

function resolveApiBaseUrl(): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  if (!configuredBaseUrl) {
    if (!hasWarnedAboutEnv) {
      hasWarnedAboutEnv = true;
      console.warn(
        isProduction
          ? "NEXT_PUBLIC_BACKEND_URL is not set in production. Falling back to same-origin /api."
          : "NEXT_PUBLIC_BACKEND_URL is not set. Falling back to http://localhost:5000."
      );
    }

    return isProduction ? "" : DEFAULT_DEV_API_BASE_URL;
  }

  try {
    return new URL(configuredBaseUrl).toString().replace(/\/$/, "");
  } catch {
    if (!hasWarnedAboutEnv) {
      hasWarnedAboutEnv = true;
      console.warn(
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
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

type RawProduct = {
  _id?: unknown;
  id?: unknown;
  name?: unknown;
  price?: unknown;
  category?: unknown;
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
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
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
  return allowed.includes(normalized as ProductCondition)
    ? (normalized as ProductCondition)
    : "gently-used";
}

function asAgeGroups(value: unknown): AgeGroup[] {
  const allowed: AgeGroup[] = ["0-6m", "6-12m", "1-2y", "3-5y", "6-10y"];
  return Array.isArray(value)
    ? value.filter(
        (item): item is AgeGroup =>
          typeof item === "string" && allowed.includes(item as AgeGroup)
      )
    : [];
}

// Helper function to normalize product data (convert MongoDB _id to id)
function normalizeProduct(product: RawProduct): Product {
  const id = product._id ?? product.id;
  return {
    id: asString(id, "unknown-id"),
    name: asString(product.name, "Untitled Product"),
    price: asNumber(product.price, 0),
    category: asCategory(product.category),
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

  if (!product.id || !selectedSize) {
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

// Fetch all products
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(buildApiUrl("/api/products"), {
      cache: "no-store", // Disable caching for fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const data = (await response.json()) as RawProduct[];
    return data.map(normalizeProduct);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductCategories(): Promise<string[]> {
  try {
    const response = await fetch(buildApiUrl("/api/products/categories"), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const data = (await response.json()) as unknown;
    return Array.isArray(data)
      ? data.filter((item): item is string => typeof item === "string")
      : [];
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return [];
  }
}

export async function getBestSellers(limit?: number): Promise<Product[]> {
  try {
    const query = createQueryString({ limit });
    const response = await fetch(buildApiUrl(`/api/products/best-sellers${query}`), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch best sellers: ${response.statusText}`);
    }

    const data = (await response.json()) as RawProduct[];
    return Array.isArray(data) ? data.map(normalizeProduct) : [];
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    return [];
  }
}

export async function filterProducts(
  params: FilterProductsParams = {}
): Promise<FilterProductsResult> {
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

    const response = await fetch(buildApiUrl(`/api/products/filters${query}`), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to filter products: ${response.statusText}`);
    }

    const data = (await response.json()) as RawPaginatedProducts;
    const rawProducts = Array.isArray(data.products) ? data.products : [];

    return {
      products: rawProducts.map(normalizeProduct),
      page: asNumber(data.page, params.page ?? 1),
      limit: asNumber(data.limit, fallbackLimit),
      total: asNumber(data.total, rawProducts.length),
      totalPages: asNumber(data.totalPages, 1),
    };
  } catch (error) {
    console.error("Error filtering products:", error);
    return {
      products: [],
      page: params.page ?? 1,
      limit: fallbackLimit,
      total: 0,
      totalPages: 0,
    };
  }
}

// Fetch single product by ID
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const response = await fetch(buildApiUrl(`/api/products/${id}`), {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as RawProduct;
    return normalizeProduct(data);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

// Create a new product (for admin use)
export async function createProduct(product: Omit<Product, "id">): Promise<Product | null> {
  try {
    const response = await fetch(buildApiUrl("/api/products"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.statusText}`);
    }

    const data = (await response.json()) as RawProduct;
    return normalizeProduct(data);
  } catch (error) {
    console.error("Error creating product:", error);
    return null;
  }
}

// Seed the database with starter products
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
    console.error("Error seeding products:", error);
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

    return {
      ok: true,
      items: normalizeCartItems(rawItems),
    };
  } catch (error) {
    console.error("Error fetching cart:", error);
    return { ok: false, items: [], message: "Could not connect to cart service." };
  }
}

export async function addCartItem(
  token: string,
  payload: { productId: string; quantity: number; size: string }
): Promise<{ ok: boolean; items?: ApiCartItem[]; message?: string }> {
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
    console.error("Error adding cart item:", error);
    return { ok: false, message: "Could not connect to cart service." };
  }
}

export async function removeCartItem(
  token: string,
  payload: { itemIndex: number }
): Promise<{ ok: boolean; items?: ApiCartItem[]; message?: string }> {
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
    console.error("Error removing cart item:", error);
    return { ok: false, message: "Could not connect to cart service." };
  }
}

export async function updateCartItem(
  token: string,
  payload: { itemIndex: number; quantity: number }
): Promise<{ ok: boolean; items?: ApiCartItem[]; message?: string }> {
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
    console.error("Error updating cart item:", error);
    return { ok: false, message: "Could not connect to cart service." };
  }
}

export async function clearCartApi(
  token: string
): Promise<{ ok: boolean; items?: ApiCartItem[]; message?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/cart/clear"), {
      method: "POST",
      headers: {
        ...buildAuthHeaders(token),
      },
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
    console.error("Error clearing cart:", error);
    return { ok: false, message: "Could not connect to cart service." };
  }
}

type SubmitOrderResult = {
  ok: boolean;
  message: string;
  orderId?: string;
  isMock?: boolean;
};

export async function submitOrder(
  payload: { shippingAddress: ShippingAddress; deliveryMethod: "standard" | "express" | "pickup" },
  token?: string
): Promise<SubmitOrderResult> {
  try {
    if (!token) {
      return {
        ok: false,
        message: "Please sign in to place an order.",
      };
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

      return {
        ok: false,
        message: errorMessage,
      };
    }

    const body = (await response.json()) as { id?: string; orderId?: string };

    return {
      ok: true,
      message: "Order placed successfully.",
      orderId: body.orderId ?? body.id,
    };
  } catch (error) {
    console.error("Error placing order:", error);
    return {
      ok: false,
      message:
        "Could not reach the checkout service. Check your backend and try again.",
    };
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
    role: role || (isAdmin ? "admin" : "user"),
  };
}

function normalizeAuthPayload(input: RawAuthResponse): AuthPayload | null {
  const userSource: RawAuthUser | undefined = input.user ?? {
    _id: input._id,
    id: input.id,
    name: input.name,
    email: input.email,
  };

  const user = normalizeAuthUser(userSource);
  const token = asString(input.token, "");

  if (!user.id || !user.email || !token) {
    return null;
  }

  return { user, token };
}

export async function registerUser(
  payload: RegisterPayload
): Promise<{ ok: boolean; data?: AuthPayload; message?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/auth/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as RawAuthResponse & { message?: string };
    if (!response.ok) {
      return {
        ok: false,
        message: body.message || "Registration failed.",
      };
    }

    const normalized = normalizeAuthPayload(body);
    if (!normalized) {
      return {
        ok: false,
        message: "Registration succeeded but response payload is invalid.",
      };
    }

    return {
      ok: true,
      data: normalized,
    };
  } catch (error) {
    console.error("Register error:", error);
    return {
      ok: false,
      message: "Could not connect to auth service.",
    };
  }
}

export async function loginUser(
  payload: LoginPayload
): Promise<{ ok: boolean; data?: AuthPayload; message?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/auth/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as RawAuthResponse & { message?: string };
    if (!response.ok) {
      return {
        ok: false,
        message: body.message || "Login failed.",
      };
    }

    const normalized = normalizeAuthPayload(body);
    if (!normalized) {
      return {
        ok: false,
        message: "Login succeeded but response payload is invalid.",
      };
    }

    return {
      ok: true,
      data: normalized,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      ok: false,
      message: "Could not connect to auth service.",
    };
  }
}

export async function getCurrentUser(
  token: string
): Promise<{ ok: boolean; user?: AuthUser; message?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/auth/me"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const body = (await response.json()) as RawAuthUser & { user?: RawAuthUser; message?: string };
    if (!response.ok) {
      return {
        ok: false,
        message: body.message || "Could not load current user.",
      };
    }

    const userSource = body.user ?? body;
    const user = normalizeAuthUser(userSource);

    if (!user.id || !user.email) {
      return {
        ok: false,
        message: "Current user payload is invalid.",
      };
    }

    return {
      ok: true,
      user,
    };
  } catch (error) {
    console.error("Current user error:", error);
    return {
      ok: false,
      message: "Could not connect to auth service.",
    };
  }
}

export async function seedAuthUsers(): Promise<{
  ok: boolean;
  users: AuthSeedUser[];
  message?: string;
}> {
  try {
    const response = await fetch(buildApiUrl("/api/auth/seed"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const body = (await response.json()) as AuthSeedResponse & { message?: string; users?: AuthSeedUser[] };
    if (!response.ok) {
      return {
        ok: false,
        users: [],
        message: body.message || `Failed to seed auth users (${response.status}).`,
      };
    }

    return {
      ok: true,
      users: Array.isArray(body.users) ? body.users : [],
    };
  } catch (error) {
    console.error("Error seeding auth users:", error);
    return {
      ok: false,
      users: [],
      message: "Could not connect to auth seed service.",
    };
  }
}

export async function getOrders(
  token: string
): Promise<{ ok: boolean; orders: ApiOrder[]; message?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/orders"), {
      cache: "no-store",
      headers: buildAuthHeaders(token),
    });

    const body = (await response.json()) as RawOrdersResponse & { message?: string };
    if (!response.ok) {
      return {
        ok: false,
        orders: [],
        message: body.message || `Failed to fetch orders (${response.status}).`,
      };
    }

    const rawOrders = Array.isArray(body)
      ? body
      : Array.isArray((body as { orders?: RawOrder[] }).orders)
      ? (body as { orders?: RawOrder[] }).orders || []
      : Array.isArray((body as { data?: RawOrder[] }).data)
      ? (body as { data?: RawOrder[] }).data || []
      : [];

    return {
      ok: true,
      orders: rawOrders.map(normalizeOrder),
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { ok: false, orders: [], message: "Could not connect to orders service." };
  }
}

export async function getOrderById(
  token: string,
  orderId: string
): Promise<{ ok: boolean; order?: ApiOrder; message?: string }> {
  try {
    const response = await fetch(buildApiUrl(`/api/orders/${orderId}`), {
      cache: "no-store",
      headers: buildAuthHeaders(token),
    });

    const body = (await response.json()) as RawOrder & { message?: string };
    if (!response.ok) {
      return {
        ok: false,
        message: body.message || `Failed to fetch order (${response.status}).`,
      };
    }

    const orderSource = (body.order ?? body) as RawOrder;
    return { ok: true, order: normalizeOrder(orderSource) };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { ok: false, message: "Could not connect to orders service." };
  }
}

export async function getAdminOrders(
  token: string
): Promise<{ ok: boolean; orders: ApiOrder[]; message?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/orders/admin/all"), {
      cache: "no-store",
      headers: buildAuthHeaders(token),
    });

    const body = (await response.json()) as RawOrdersResponse & { message?: string };
    if (!response.ok) {
      return {
        ok: false,
        orders: [],
        message: body.message || `Failed to fetch admin orders (${response.status}).`,
      };
    }

    const rawOrders = Array.isArray(body)
      ? body
      : Array.isArray((body as { orders?: RawOrder[] }).orders)
      ? (body as { orders?: RawOrder[] }).orders || []
      : Array.isArray((body as { data?: RawOrder[] }).data)
      ? (body as { data?: RawOrder[] }).data || []
      : [];

    return {
      ok: true,
      orders: rawOrders.map(normalizeOrder),
    };
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return { ok: false, orders: [], message: "Could not connect to admin orders service." };
  }
}

export async function updateOrderStatus(
  token: string,
  orderId: string,
  status: ApiOrderStatus
): Promise<{ ok: boolean; order?: ApiOrder; message?: string }> {
  try {
    const response = await fetch(buildApiUrl(`/api/orders/${orderId}/status`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(token),
      },
      body: JSON.stringify({ status }),
    });

    const body = (await response.json()) as RawOrder & { message?: string };
    if (!response.ok) {
      return {
        ok: false,
        message: body.message || `Failed to update order status (${response.status}).`,
      };
    }

    return { ok: true, order: normalizeOrder(body) };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { ok: false, message: "Could not connect to orders service." };
  }
}

export async function seedStarterProducts(token: string): Promise<Product[]> {
  try {
    const response = await fetch(buildApiUrl("/api/products/seed"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(token),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to seed products: ${response.statusText}`);
    }

    const data = (await response.json()) as RawProduct[] | RawProduct;
    return Array.isArray(data) ? data.map(normalizeProduct) : [];
  } catch (error) {
    console.error("Error seeding products:", error);
    return [];
  }
}

export async function createProductAdmin(token: string, product: Omit<Product, "id">): Promise<Product | null> {
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
    console.error("Error creating product:", error);
    return null;
  }
}

export async function updateProductAdmin(token: string, id: string, product: Partial<Omit<Product, "id">>): Promise<Product | null> {
  try {
    const response = await fetch(buildApiUrl(`/api/products/${id}`), {
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
    console.error("Error updating product:", error);
    return null;
  }
}

export async function deleteProductAdmin(token: string, id: string): Promise<boolean> {
  try {
    const response = await fetch(buildApiUrl(`/api/products/${id}`), {
      method: "DELETE",
      headers: buildAuthHeaders(token),
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
}
