"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product, ProductCondition, AgeGroup } from "@/lib/types";
import { getProducts, createProductAdmin, updateProductAdmin, deleteProductAdmin } from "@/lib/api";
import { useAuthStore } from "@/shore/authStore";
import { useFeedbackStore } from "@/shore/feedbackStore";
import { X, Plus, Edit2, Trash2 } from "lucide-react";

const PRODUCT_CONDITIONS: ProductCondition[] = ["like-new", "gently-used", "used"];
const AGE_GROUPS: AgeGroup[] = ["0-6m", "6-12m", "1-2y", "3-5y", "6-10y"];
const GENDER_OPTIONS = ["boys", "girls", "unisex"];

type FormData = Omit<Product, "id">;

const emptyForm: FormData = {
  name: "",
  price: 0,
  images: [],
  category: "",
  ageGroup: [],
  gender: "unisex",
  condition: "gently-used",
  stock: 0,
  description: "",
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { pushToast } = useFeedbackStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [imageInput, setImageInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Role guard
  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [user, router]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setImageInput("");
    setShowModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      images: product.images,
      category: product.category,
      ageGroup: product.ageGroup,
      gender: product.gender || "unisex",
      condition: product.condition,
      stock: product.stock,
      description: product.description || "",
    });
    setImageInput("");
    setShowModal(true);
  };

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()],
      });
      setImageInput("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleToggleAgeGroup = (ag: AgeGroup) => {
    setFormData({
      ...formData,
      ageGroup: formData.ageGroup.includes(ag)
        ? formData.ageGroup.filter((a) => a !== ag)
        : [...formData.ageGroup, ag],
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      pushToast("Product name is required");
      return;
    }
    if (formData.price <= 0) {
      pushToast("Price must be greater than 0");
      return;
    }
    if (formData.images.length === 0) {
      pushToast("At least one image is required");
      return;
    }
    if (formData.ageGroup.length === 0) {
      pushToast("Select at least one age group");
      return;
    }
    if (!formData.category.trim()) {
      pushToast("Category is required");
      return;
    }
    if (formData.stock < 0) {
      pushToast("Stock cannot be negative");
      return;
    }

    setSubmitting(true);

    try {
      if (token) {
        let result: Product | null;
        if (editingId) {
          result = await updateProductAdmin(token, editingId, formData);
          if (result) {
            setProducts(products.map((p) => (p.id === editingId ? (result as Product) : p)));
            pushToast("Product updated successfully");
          } else {
            pushToast("Failed to update product");
          }
        } else {
          result = await createProductAdmin(token, formData);
          if (result) {
            setProducts([...products, result]);
            pushToast("Product created successfully");
          } else {
            pushToast("Failed to create product");
          }
        }
        setShowModal(false);
        setFormData(emptyForm);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      pushToast("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSubmitting(true);
    try {
      if (token) {
        const success = await deleteProductAdmin(token, id);
        if (success) {
          setProducts(products.filter((p) => p.id !== id));
          pushToast("Product deleted successfully");
          setDeleteConfirm(null);
        } else {
          pushToast("Failed to delete product");
        }
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      pushToast("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Products Manager</h1>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-lg mb-4">No products yet</p>
            <button
              onClick={handleOpenCreate}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="mb-4">
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                    <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">
                      {product.condition}
                    </span>
                    {product.gender && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">
                        {product.gender}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                  >
                    <Edit2 size={18} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? "Edit Product" : "Create Product"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Clothing, Toys, Books"
                  />
                </div>

                {/* Condition & Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition *
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condition: e.target.value as ProductCondition,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {PRODUCT_CONDITIONS.map((cond) => (
                        <option key={cond} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender || "unisex"}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as "boys" | "girls" | "unisex" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Age Groups */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age Groups * (select at least one)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {AGE_GROUPS.map((ag) => (
                      <label key={ag} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.ageGroup.includes(ag)}
                          onChange={() => handleToggleAgeGroup(ag)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{ag}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images * (at least one)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddImage();
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter image URL"
                    />
                    <button
                      onClick={handleAddImage}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gray-100 p-3 rounded-lg"
                      >
                        <span className="text-sm text-gray-700 truncate">{img}</span>
                        <button
                          onClick={() => handleRemoveImage(idx)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product description (optional)"
                    rows={3}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Saving..." : editingId ? "Update Product" : "Create Product"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Product?</h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. Are you sure you want to delete this product?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
