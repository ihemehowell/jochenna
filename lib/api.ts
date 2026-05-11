// Product type matching your backend schema
export interface Product {
  id: string | number;
  _id?: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  sizes: string[];
  images: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Helper function to normalize product data (convert MongoDB _id to id)
function normalizeProduct(product: any): Product {
  return {
    id: product._id || product.id,
    _id: product._id,
    name: product.name,
    price: product.price,
    category: product.category,
    stock: product.stock,
    sizes: product.sizes,
    images: product.images,
  };
}

// Fetch all products
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      cache: "no-store", // Disable caching for fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map(normalizeProduct);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Fetch single product by ID
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/products/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return normalizeProduct(data);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

// Create a new product (for admin use)
export async function createProduct(product: Omit<Product, "_id">): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.statusText}`);
    }

    const data = await response.json();
    return normalizeProduct(data);
  } catch (error) {
    console.error("Error creating product:", error);
    return null;
  }
}
