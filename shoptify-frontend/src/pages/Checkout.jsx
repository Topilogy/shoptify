import { useCart } from "../context/CartContext";
import { initializePayment, createOrder } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handlePayment = async () => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const orderData = {
        items: cart,
        total,
      };

      const orderRes = await createOrder(orderData);
      const order = orderRes.data;

      // prevent duplicate payment
      if (order.status === "paid") {
        alert("This order is already paid");
        return;
      }

      const paymentData = {
        email: user.email,
        amount: total,
        orderId: order._id,
      };

      const { data } = await initializePayment(paymentData);
      console.log("PAYMENT RESPONSE:", data);

      // optional: clear cart before redirect
      // clearCart();

      window.location.href = data.data.authorization_url;
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-gray-500">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-black text-white px-6 py-2 rounded-lg"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-22 grid md:grid-cols-3 gap-8">

      {/* ================= ITEMS ================= */}
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>

        {cart.map((item) => (
          <div
            key={`${item._id}-${item.size}`}
            className="flex items-center gap-4 border rounded-xl p-4 bg-white"
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

              <p className="text-sm text-gray-500">
                Size: <span className="font-medium">{item.size}</span>
              </p>

              <p className="text-sm text-gray-500">
                Qty: {item.quantity}
              </p>
            </div>

            {/* PRICE */}
            <div className="font-semibold">
              ₦{(item.price * item.quantity).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="bg-white shadow rounded-xl p-6 h-fit">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

        <div className="flex justify-between mb-2 text-sm">
          <span>Subtotal</span>
          <span>₦{total.toLocaleString()}</span>
        </div>

        <div className="flex justify-between mb-2 text-sm text-gray-500">
          <span>Shipping</span>
          <span>Calculated at next step</span>
        </div>

        <hr className="my-4" />

        <div className="flex justify-between font-bold text-lg mb-4">
          <span>Total</span>
          <span>₦{total.toLocaleString()}</span>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex justify-center items-center"
        >
          {loading ? "Processing..." : "Pay with Paystack"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;