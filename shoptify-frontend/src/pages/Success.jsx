import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Success = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const hasVerified = useRef(false);
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (!reference || hasVerified.current) return;

    hasVerified.current = true;

    const verify = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data } = await axios.get(
          `http://localhost:5000/api/payments/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrder(data.order);

        // ✅ CLEAR CART AFTER SUCCESS
        clearCart();

        // ✅ REDIRECT AFTER 3 SECONDS
        setTimeout(() => {
          navigate("/orders");
        }, 3000);

      } catch (err) {
        console.log("Verification failed:", err);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-green-600">
        Payment Successful 🎉
      </h1>

      {order ? (
        <div className="mt-6 bg-white p-6 shadow rounded">
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Total:</strong> ₦{order.total}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Paid At:</strong> {order.paidAt}</p>
        </div>
      ) : (
        <p className="mt-4">Verifying payment...</p>
      )}

      <p className="mt-4 text-gray-500">
        Redirecting to your orders...
      </p>
    </div>
  );
};

export default Success;