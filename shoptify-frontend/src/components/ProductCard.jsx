import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ShoppingCart } from "lucide-react";

const ProductCard = React.memo(({ product, onDelete, onEdit, editId }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  const isAdmin = onEdit && onDelete;

  const optimizedImage = product.image.replace(
    "/upload/",
    "/upload/w_400,q_auto,f_auto/"
  );

  const isEditing = String(editId) === String(product._id);
  const isLocked = editId && String(editId) !== String(product._id);

  // ✅ fallback sizes (since admin is not adding sizes)
  const sizes =
    product.sizes?.length > 0
      ? product.sizes
      : ["38", "39", "40", "41", "42", "43", "44"];

  // ✅ discount calculation
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100
        )
      : 0;

  return (
    <>
      {/* ================= CARD ================= */}
      <div
        onClick={() => {
          if (isLocked) return;
          navigate(`/product/${product._id}`);
        }}
        className={`relative bg-white rounded-xl overflow-hidden shadow transition
          ${isLocked ? "opacity-40" : "hover:shadow-lg cursor-pointer"}
          ${isEditing ? "ring-2 ring-blue-500 scale-[1.02]" : ""}
        `}
      >
        {/* LOCK OVERLAY */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-gray-700 text-sm font-semibold z-20 cursor-not-allowed">
            Locked
          </div>
        )}

        {/* IMAGE */}
        <div className="h-72 w-full relative">
          <img
            src={optimizedImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />

          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-md">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* DETAILS */}
        <div className="p-3">
          <div className="flex justify-between items-center">
            <h2 className="font-medium text-sm text-gray-800">
              {product.name}
            </h2>

            {/* 🛒 CART ICON → OPENS MODAL */}
            {!isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickAdd(true);
                }}
                className="text-gray-600 hover:text-black cursor-pointer"
              >
                <ShoppingCart size={20} />
              </button>
            )}
          </div>

          {/* PRICE */}
          <div className="mt-1 flex items-center gap-2">
            <p className="font-semibold text-lg text-black">
              ₦{product.price}
            </p>

            {product.oldPrice && product.oldPrice > product.price && (
              <p className="text-gray-400 line-through text-sm">
                ₦{product.oldPrice}
              </p>
            )}
          </div>

          {/* SAVINGS */}
          {discount > 0 && (
            <p className="text-green-600 text-xs mt-1">
              Save ₦{product.oldPrice - product.price}
            </p>
          )}

          {/* ADMIN BUTTONS */}
          {isAdmin && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(product);
                }}
                disabled={isLocked}
                className={`flex-1 py-1 rounded text-sm ${
                  isLocked
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white"
                }`}
              >
                Edit
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product._id);
                }}
                disabled={isLocked}
                className={`flex-1 py-1 rounded text-sm ${
                  isLocked
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 text-white"
                }`}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= QUICK ADD MODAL ================= */}
      {showQuickAdd && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => {
            setShowQuickAdd(false);
            setSelectedSize("");
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 w-80 shadow-lg"
          >
            <h2 className="text-lg font-semibold mb-4">
              Select Size
            </h2>

            {/* SIZE OPTIONS */}
            <div className="flex flex-wrap gap-2 mb-4">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-lg text-sm transition
                    ${
                      selectedSize === size
                        ? "bg-black text-white border-black"
                        : "hover:border-black"
                    }
                  `}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!selectedSize) {
                    alert("Please select a size");
                    return;
                  }

                  addToCart({
                    ...product,
                    size: selectedSize,
                    quantity: 1,
                  });

                  setShowQuickAdd(false);
                  setSelectedSize("");
                }}
                className="flex-1 bg-black text-white py-2 rounded-lg"
              >
                Add to Cart
              </button>

              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  setSelectedSize("");
                }}
                className="flex-1 border py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default ProductCard;