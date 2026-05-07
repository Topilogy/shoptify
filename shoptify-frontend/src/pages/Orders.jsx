import { useEffect, useState } from "react";
import { getOrders } from "../services/api";
import OrderTimeline from "../components/OrderTimeline";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [openOrderId, setOpenOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await getOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrders();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "paid":
        return "bg-blue-500";
      case "processing":
        return "bg-purple-500";
      case "shipped":
        return "bg-indigo-500";
      case "delivered":
        return "bg-green-600";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet</p>
      ) : (
        orders.map((order) => {
          const isOpen = openOrderId === order._id;

          return (
            <div
              key={order._id}
              className="border rounded-lg p-5 mb-5 shadow-sm bg-white"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold text-sm">
                    Order ID:{" "}
                    <span className="text-gray-600">
                      {order._id.slice(-8)}
                    </span>
                  </p>

                  <span
                    className={`text-white text-xs px-3 py-1 rounded-full inline-block mt-1 ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* RIGHT ACTION */}
                <button
                  onClick={() =>
                    setOpenOrderId(isOpen ? null : order._id)
                  }
                  className="text-sm text-blue-600 hover:underline"
                >
                  {isOpen ? "Hide Details" : "See Details"}
                </button>
              </div>

              {/* SUMMARY (ALWAYS VISIBLE) */}
              <div className="mt-4 flex justify-between text-sm text-gray-700">
                <span>
                  {order.items.length} item
                  {order.items.length > 1 ? "s" : ""}
                </span>

                <span className="font-bold">
                  ₦{order.total.toLocaleString()}
                </span>
              </div>

              {/* EXPANDED SECTION */}
              {isOpen && (
                <>
                  {/* TIMELINE */}
                  <OrderTimeline status={order.status} />

                  {/* ITEMS */}
                  <div className="mt-6 space-y-2">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm border-b pb-2"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>

                          {item.size && (
                            <p className="text-gray-500 text-xs">
                              Size: {item.size}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p>
                            ₦{item.price.toLocaleString()} x{" "}
                            {item.quantity}
                          </p>
                          <p className="font-semibold">
                            ₦
                            {(
                              item.price * item.quantity
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* RECEIPT */}
                  {order.status === "pending" ? (
                    <p className="text-xs text-yellow-600 mt-4">
                      Receipt available after payment confirmation
                    </p>
                  ) : (
                    <div className="mt-4">
                      <a
                        href={`https://shoptify-production.up.railway.app/api/orders/receipt/${order._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      >
                        Download Receipt
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Orders;