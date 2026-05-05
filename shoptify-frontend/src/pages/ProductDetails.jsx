import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductById } from "../services/api";
import { useCart } from "../context/CartContext";
import { Loader2, ShoppingCart, Minus, Plus } from "lucide-react";


const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await getProductById(id);
        setProduct(data);
        setSelectedImage(data.image);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  if (!product) {
    return <h1 className="p-8 text-red-500">Product not found</h1>;
  }

  const images = product.images?.length
    ? product.images
    : [product.image, product.image, product.image];

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100
        )
      : 0;

  const savings =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice - product.price
      : 0;

  // const sizes = product.sizes?.length ? product.sizes : ["38", "39", "40", "41", "42", "43", "44"];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 mt-27">

      {/* MAIN GRID */}
      <div className="grid md:grid-cols-2 gap-10 items-start">

        {/* ================= LEFT (IMAGES) ================= */}
        <div className="space-y-4">

          <div className="relative group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-[400px] md:h-[500px] object-cover rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
            />

            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* THUMBNAILS */}
          <div className="flex gap-3">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 object-cover rounded-lg cursor-pointer border transition ${
                  selectedImage === img
                    ? "border-black scale-105"
                    : "border-gray-300 hover:scale-105"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ================= RIGHT (DETAILS) ================= */}
        <div className="flex flex-col gap-6">

          {/* TITLE */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {product.name}
          </h1>

          {/* PRICE */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-black">
              ₦{product.price.toLocaleString()}
            </span>

            {product.oldPrice && (
              <span className="text-gray-400 line-through text-lg">
                ₦{product.oldPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* SAVINGS */}
          {savings > 0 && (
            <p className="text-green-600 text-sm">
              You save ₦{savings.toLocaleString()}
            </p>
          )}

          {/* RATING */}
          <div className="text-yellow-500 text-sm">
            ★★★★☆ <span className="text-gray-500">(120 reviews)</span>
          </div>

          {/* DESCRIPTION */}
          <p className="text-gray-600 leading-relaxed border-t pt-4">
            {product.description || "No description available"}
          </p>

          {/* SIZE SELECTION */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Select Size:</span>

              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size, index) => (
                  <button
                    key={index}
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
            </div>
          )}

          {/* CATEGORY */}
          <p className="text-sm text-gray-400">
            Category: <span className="font-medium">{product.category}</span>
          </p>

          {/* QUANTITY */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Quantity:</span>

            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                className="px-3 py-2 hover:bg-gray-100"
              >
                <Minus size={16} />
              </button>

              <span className="px-5">{qty}</span>

              <button
                onClick={() => setQty((prev) => prev + 1)}
                className="px-3 py-2 hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => {
                if (!selectedSize) {
                  alert("Please select a size");
                  return;
                }

                addToCart({ ...product, quantity: qty, size: selectedSize });
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>

            <button className="flex-1 border border-black py-3 rounded-xl hover:bg-black hover:text-white transition">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE FIXED BAR ================= */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t px-4 py-3 flex justify-between items-center md:hidden shadow-lg z-50">
        <span className="font-bold text-lg">
          ₦{product.price.toLocaleString()}
        </span>

        <button
          onClick={() => addToCart({ ...product, quantity: qty })}
          className="bg-black text-white px-5 py-2 rounded-lg"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;