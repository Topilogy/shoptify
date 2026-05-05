import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQty } = useCart();
  

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-gray-500">
        <h1 className="text-2xl font-semibold mb-2">Your cart is empty</h1>
        <button
          onClick={() => navigate("/")}
          className="bg-black text-white px-6 py-2 rounded-lg mt-3"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* ================= CART ITEMS ================= */}
        <div className="md:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={`${item._id}-${item.size}`}
              className="flex gap-4 items-center bg-white p-4 rounded-xl shadow"
            >
              {/* IMAGE */}
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />

              {/* DETAILS */}
              <div className="flex-1">
                <h2 className="font-medium">{item.name}</h2>

                {/* SIZE */}
                <p className="text-sm text-gray-500">
                  Size: <span className="font-medium">{item.size}</span>
                </p>

                {/* PRICE */}
                <p className="font-semibold mt-1">
                  ₦{item.price.toLocaleString()}
                </p>
              </div>

              {/* QUANTITY */}
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    updateQty(item._id, Math.max(1, item.quantity - 1), item.size)
                  }
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  <Minus size={16} />
                </button>

                <span className="px-4">{item.quantity}</span>

                <button
                  onClick={() =>
                    updateQty(item._id, item.quantity + 1, item.size)
                  }
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* REMOVE */}
              <button
                onClick={() => removeFromCart(item._id, item.size)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="bg-white p-6 rounded-xl shadow h-fit">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

          <div className="flex justify-between mb-2 text-sm">
            <span>Subtotal</span>
            <span>₦{total.toLocaleString()}</span>
          </div>

          <div className="flex justify-between mb-4 text-sm text-gray-500">
            <span>Delivery</span>
            <span>Calculated at checkout</span>
          </div>

          <hr className="mb-4" />

          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;