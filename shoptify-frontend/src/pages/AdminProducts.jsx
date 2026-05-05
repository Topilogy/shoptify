import React, { useState, useEffect, useRef, useCallback } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct,} from "../services/api";
import ProductCard from "../components/ProductCard";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import debounce from "lodash.debounce";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    discount: "",
    image: "",
    description: "",
    category: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  // const [category, setCategory] = useState("");

  const categories = [
    "all",
    ...Array.from(
      new Set(
        products
          .map((p) => p.category?.toLowerCase().trim())
          .filter(Boolean)
      )
    ),
  ];

  useEffect(() => {
    if (categoryFilter !== "all") {
      const exists = products.some(
        (p) => p.category?.toLowerCase() === categoryFilter.toLowerCase()
      );

      if (!exists) setCategoryFilter("all");
    }
  }, [products]);

  const formRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  if (user.role !== "admin") {
    return <h1 className="p-8 text-red-500">Access Denied</h1>;
  }

  const showToast = (msg, type = "success") => toast[type](msg);

  const editingProduct = products.find((p) => p._id === editId);

  // ================= FETCH =================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  };

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteProduct(id);
      fetchProducts();
      showToast("Deleted");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  // ================= AUTOSAVE =================
  const autoSave = useCallback(
    debounce(async (data, id) => {
      try {
        setSaving(true);

        if (id) {
          await updateProduct(id, data);
        } else {
          await createProduct(data);
        }

        fetchProducts();
        setIsDirty(false);
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
      }
    }, 800),
    []
  );

 useEffect(() => {
  if (!isDirty || !editId) return; // ✅ FIX HERE

  const payload = {
    name: form.name,
    price: Number(form.price),
    discount: Number(form.discount),
    image: form.image,
    description: form.description,
    category: form.category,
  };

  autoSave(payload, editId);
}, [form, isDirty, editId, autoSave]);

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    name: form.name?.trim(),
    price: Number(form.price),
    discount: form.discount ? Number(form.discount) : 0,
    image: form.image,
    description: form.description,
    category: form.category,
    sizes: form.sizes
    ? form.sizes.split(",").map((s) => s.trim())
    : [],
  };

  if (!payload.name || !payload.price || !payload.image || !payload.category) {
    showToast("All required fields must be filled", "error");
    return;
  }

  if (uploading) {
    showToast("Please wait for image upload", "error");
    return;
  }

  try {
    setSaving(true);

    if (editId) {
      // ✅ UPDATE MODE
      await updateProduct(editId, payload);
      showToast("Product updated successfully");

      setEditId(null); // 🔥 IMPORTANT
    } else {
      // ✅ CREATE MODE
      await createProduct(payload);
      showToast("Product added successfully");
    }

    resetForm();     // 🔥 CLEAR FORM
    fetchProducts(); // 🔄 REFRESH LIST

  } catch (err) {
    console.log("BACKEND ERROR:", err.response?.data);
    showToast(err.response?.data?.message || "Error", "error");
  } finally {
    setSaving(false);
  }
};

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      discount: "",
      image: "",
      description: "",
      category: "",
    });
    setIsDirty(false);
  };
  
  const PRODUCT_CATEGORIES = [
  { label: "Luxury/Designer Shoes", value: "luxury-designers-shoes" },
  { label: "Casual Shoes", value: "casual-shoes" },
  { label: "Formal Shoes", value: "formal-shoes" },
  { label: "Sport/Athletic Shoes", value: "sport-athletic-shoes" },
  { label: "Heel Shoes", value: "heel-shoes" },
];

  // ================= EDIT =================
  const handleEdit = (product) => {
    setEditId(product._id);

    setForm({
      name: product.name || "",
      price: product.price || "",
      discount: product.discount || "",
      image: product.image || "",
      description: product.description || "",
      category: product.category || "",
      sizes: product.sizes?.join(", ") || "",
    });

    setIsDirty(false);

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleCancelEdit = () => {
    if (isDirty && !window.confirm("Discard changes?")) return;

    setEditId(null);
    resetForm();
  };

  const processedProducts = products
  .filter((p) => {
    const query = debouncedSearch.trim().toLowerCase();

    const name = p.name?.toLowerCase() || "";
    const category = p.category?.toLowerCase() || "";
    const description = p.description?.toLowerCase() || "";

    // 🔍 SEARCH
    const matchesSearch =
      name.includes(query) ||
      category.includes(query) ||
      description.includes(query);

    // 🏷 CATEGORY
    const matchesCategory =
      categoryFilter === "all" ||
      category === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  })
  .sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return (a.price || 0) - (b.price || 0);

      case "price-high":
        return (b.price || 0) - (a.price || 0);

      case "name":
        return (a.name || "").localeCompare(b.name || "");

      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);

      default: // newest
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });
  // ================= IMAGE UPLOAD =================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Only images allowed", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Shoess");

    try {
      setUploading(true);

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dqxamrhl9/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        image: data.secure_url,
      }));

      setIsDirty(true);
      showToast("Uploaded");
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const formatPrice = (value) => {
    if (!value) return "";

    const number = Number(value.toString().replace(/,/g, ""));
    if (isNaN(number)) return "";

    return number.toLocaleString();
  };

  const parsePriceInput = (value) => {
    if (!value) return "";

    value = value.toLowerCase().replace(/,/g, "");

    if (value.endsWith("k")) {
      return Number(value.slice(0, -1)) * 1000;
    }

    if (value.endsWith("m")) {
      return Number(value.slice(0, -1)) * 1000000;
    }

    return Number(value);
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div ref={formRef} className="p-8 overflow-hidden">

      {/* ================= ELITE STICKY BAR ================= */}
      {editId && (
        <div className="sticky top-0 z-50 mb-4">
          <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white px-5 py-3 rounded-xl shadow-lg flex justify-between items-center">

            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm">
                Editing <b>{editingProduct?.name}</b>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* {saving && (
                <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded">
                  <Loader2 className="animate-spin w-3 h-3" />
                  Saving
                </div>
              )}

              {isDirty && !saving && (
                <span className="text-xs bg-yellow-400/20 px-2 py-1 rounded">
                  Unsaved
                </span>
              )} */}

              <button
                onClick={handleCancelEdit}
                className="text-xs bg-white text-blue-600 px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6"></div> */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between lg:justify-between gap-3 mb-5">
        <div> 
          <h1 className="text-2xl font-bold">Add Product</h1>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full md:w-64
              bg-white/10 backdrop-blur border border-white/20
              text-white placeholder-gray-400
              px-4 py-2 rounded-lg outline-none
              focus:ring-2 focus:ring-blue-500
            "
          />

          {/* 🏷 CATEGORY FILTER */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-64 bg-white/10 backdrop-blur border border-white/20 text-white px-4 py-2 rounded-lg"
          >
            <option value="all" className="text-black">
              ALL CATEGORIES
            </option>

            {categories
              .filter((cat) => cat !== "all")
              .map((cat, i) => (
                <option key={i} value={cat} className="text-black">
                  {cat.toUpperCase()}
                </option>
              ))
            }
          </select>

          {/* 🔽 SORT */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            placeholder="SELECT"
            className="
              w-full md:w-64
              bg-white/10 backdrop-blur border border-white/20
              text-white placeholder-gray-400
              px-4 py-2 rounded-lg outline-none
              focus:ring-2 focus:ring-blue-500
            "
          >
            <option value="newest" className="text-black">Newest</option>
            <option value="oldest" className="text-black">Oldest</option>
            <option value="price-low" className="text-black">Price: Low → High</option>
            <option value="price-high" className="text-black">Price: High → Low</option>
            <option value="name" className="text-black">Name (A-Z)</option>
          </select>

        </div>

      </div>

      {/* ================= FORM ================= */}
      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 mb-6"
      >
        <input
          value={form.name}
          onChange={(e) => {
            setForm({ ...form, name: e.target.value });
            // setIsDirty(true);
          }}
          placeholder="Name"
          className="border p-2 rounded"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="border p-2 rounded"
        />

        <input
          type="text"
          inputMode="numeric"
          value={formatPrice(form.price)}
          onChange={(e) => {
            const rawValue = e.target.value;

            const parsed = parsePriceInput(rawValue);

            if (!isNaN(parsed)) {
              setForm({ ...form, price: parsed });
              // setIsDirty(true);
            }
          }}
          placeholder="Price"
          className="border p-2 rounded"
        />

        <input
          type="number"
          value={form.discount}
          onChange={(e) => {
            setForm({ ...form, discount: e.target.value });
            // setIsDirty(true);
          }}
          placeholder="Discount (%)"
          className="border p-2 rounded"
        />

        <select
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">Select Category</option>
           {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} className="text-black">
                {cat.label}
              </option>
            ))}
        </select>

        <input
          type="text"
          placeholder="Sizes (comma separated e.g 38,39,40,41)"
          value={form.sizes || ""}
          onChange={(e) =>
            setForm({
              ...form,
              sizes: e.target.value,
            })
          }
          className="border p-2 rounded"
        />

        <input
          value={form.description}
          onChange={(e) => {
            setForm({ ...form, description: e.target.value });
            // setIsDirty(true);
          }}
          placeholder="Description"
          className="border p-2 rounded"
        />
        <button
          disabled={uploading || saving}
          className="bg-green-500 text-white p-2 rounded flex justify-center items-center gap-2"
        >
          {(uploading || saving) && (
            <Loader2 className="animate-spin w-4 h-4" />
          )}

          {uploading
            ? "Uploading..."
            : saving
            ? "Saving..."
            : editId
            ? "Update Product"
            : "Add Product"
          }
        </button>

        {/* IMAGE PREVIEW */}
        {form.image && (
          <img
            src={form.image}
            className="h-32 object-cover rounded border"
          />
        )}
      </form>

      {/* ================= PRODUCTS ================= */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {processedProducts.map((p) => (
          <ProductCard
            key={p._id}
            product={p}
            onDelete={handleDelete}
            onEdit={handleEdit}
            editId={editId}
          />
        ))}

        {processedProducts.length === 0 && (
          <div className="text-center text-gray-400 mt-6">
            No matching products found
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;