"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product, ProductCondition, AgeGroup } from "@/lib/types";
import { getProducts, createProductAdmin, updateProductAdmin, deleteProductAdmin, uploadProductImages } from "@/lib/api";
import { useAuthStore } from "@/shore/authStore";
import { useFeedbackStore } from "@/shore/feedbackStore";
import { X, Plus, Edit2, Trash2, UploadCloud, Loader2 } from "lucide-react";

const PRODUCT_CONDITIONS: ProductCondition[] = ["like-new", "gently-used", "used"];
const AGE_GROUPS: AgeGroup[] = ["0-6m", "6-12m", "1-2y", "3-5y", "6-10y"];
const GENDER_OPTIONS = ["boys", "girls", "unisex"];
const MAX_UPLOAD_FILES = 6;
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setUploadError(null);
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
    setUploadError(null);
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

  const handleFileSelect = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setUploadError(null);

    const files = Array.from(fileList);
    const remainingSlots = MAX_UPLOAD_FILES - formData.images.length;

    if (remainingSlots <= 0) {
      setUploadError(`You can only add up to ${MAX_UPLOAD_FILES} images per product.`);
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    const invalidFile = filesToUpload.find(
      (file) => !ALLOWED_MIME_TYPES.has(file.type) || file.size > MAX_FILE_SIZE_MB * 1024 * 1024
    );

    if (invalidFile) {
      setUploadError(
        `${invalidFile.name}: only JPG, PNG, WEBP, or GIF under ${MAX_FILE_SIZE_MB}MB are allowed.`
      );
      return;
    }

    setUploading(true);
    const result = await uploadProductImages(token ?? undefined, filesToUpload);
    setUploading(false);

    if (!result.ok) {
      setUploadError(result.message || "Upload failed. Please try again.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...result.images.map((img) => img.url)],
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
        const success = await deleteProductAdmin(id, token);
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
    <div className="min-h-screen bg-gradient-to-b from-white to-paper p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-ink">Products Manager</h1>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-denim text-white px-6 py-3 rounded-lg hover:bg-denim-deep transition-colors font-medium"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-ink-soft">Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-ink-soft">
            <p className="text-lg mb-4">No products yet</p>
            <button
              onClick={handleOpenCreate}
              className="text-denim-text hover:text-denim-text font-medium"
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
                  <h3 className="text-xl font-bold text-ink mb-2">{product.name}</h3>
                  <p className="text-ink-soft text-sm mb-2">{product.category}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-denim-text">${product.price}</span>
                    <span className="text-sm text-ink-soft">Stock: {product.stock}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-block px-2 py-1 text-xs bg-hairline text-ink rounded">
                      {product.condition}
                    </span>
                    {product.gender && (
                      <span className="inline-block px-2 py-1 text-xs bg-hairline text-ink rounded">
                        {product.gender}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="flex-1 flex items-center justify-center gap-2 bg-denim/15 text-denim-text px-4 py-2 rounded-lg hover:bg-denim/20 transition-colors font-medium"
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
              <div className="flex justify-between items-center p-6 border-b border-hairline sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-ink">
                  {editingId ? "Edit Product" : "Create Product"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-ink-soft hover:text-ink transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-hairline rounded-lg focus:ring-2 focus:ring-denim focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2 border border-hairline rounded-lg focus:ring-2 focus:ring-denim focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">
                      Stock *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2 border border-hairline rounded-lg focus:ring-2 focus:ring-denim focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-hairline rounded-lg focus:ring-2 focus:ring-denim focus:border-transparent"
                    placeholder="e.g., Clothing, Toys, Books"
                  />
                </div>

                {/* Condition & Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">
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
                      className="w-full px-4 py-2 border border-hairline rounded-lg focus:ring-2 focus:ring-denim focus:border-transparent"
                    >
                      {PRODUCT_CONDITIONS.map((cond) => (
                        <option key={cond} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender || "unisex"}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as "boys" | "girls" | "unisex" })}
                      className="w-full px-4 py-2 border border-hairline rounded-lg focus:ring-2 focus:ring-denim focus:border-transparent"
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
                  <label className="block text-sm font-medium text-ink mb-2">
                    Age Groups * (select at least one)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {AGE_GROUPS.map((ag) => (
                      <label key={ag} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.ageGroup.includes(ag)}
                          onChange={() => handleToggleAgeGroup(ag)}
                          className="w-4 h-4 rounded border-hairline text-denim-text focus:ring-denim"
                        />
                        <span className="text-sm text-ink">{ag}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Images * (at least one, up to {MAX_UPLOAD_FILES})
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || formData.images.length >= MAX_UPLOAD_FILES}
                    className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-hairline rounded-lg py-6 mb-3 text-ink-soft hover:border-denim hover:text-denim-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-hairline disabled:hover:text-ink-soft"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={22} className="animate-spin" />
                        <span className="text-sm font-medium">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={22} />
                        <span className="text-sm font-medium">
                          Click to upload images from your device
                        </span>
                        <span className="text-xs text-ink-soft">
                          JPG, PNG, WEBP, or GIF — up to {MAX_FILE_SIZE_MB}MB each
                        </span>
                      </>
                    )}
                  </button>

                  {uploadError && (
                    <p className="text-sm text-red-600 mb-3">{uploadError}</p>
                  )}

                  <details className="mb-3">
                    <summary className="text-sm text-ink-soft cursor-pointer hover:text-ink">
                      Or add an image by URL instead
                    </summary>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={imageInput}
                        onChange={(e) => setImageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddImage();
                          }
                        }}
                        className="flex-1 px-4 py-2 border border-hairline rounded-lg focus:ring-2 focus:ring-denim focus:border-transparent"
                        placeholder="Enter image URL"
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="bg-denim text-white px-4 py-2 rounded-lg hover:bg-denim-deep transition-colors font-medium"
                      >
                        Add
                      </button>
                    </div>
                  </details>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {formData.images.map((img, idx) => (
                        <div
                          key={`${img}-${idx}`}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-hairline bg-paper"
                        >
                          <Image
                            src={img}
                            alt={`Product image ${idx + 1}`}
                            fill
                            sizes="150px"
                            className="object-cover"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 bg-ink/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-hairline rounded-lg focus:ring-2 focus:ring-denim focus:border-transparent"
                    placeholder="Enter product description (optional)"
                    rows={3}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border border-hairline text-ink rounded-lg hover:bg-paper transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-denim text-white rounded-lg hover:bg-denim-deep transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
              <h3 className="text-xl font-bold text-ink mb-4">Delete Product?</h3>
              <p className="text-ink-soft mb-6">
                This action cannot be undone. Are you sure you want to delete this product?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-hairline text-ink rounded-lg hover:bg-paper transition-colors font-medium"
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
