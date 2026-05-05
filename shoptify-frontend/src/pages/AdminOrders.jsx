import { useEffect, useState } from "react";
import { getAllOrdersAdmin, updateOrderStatus } from "../services/api";
import OrderTimeline from "../components/OrderTimeline";
import StatusStepper from "../components/StatusStepper";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [openOrderId, setOpenOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await getAllOrdersAdmin();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);

      await updateOrderStatus(orderId, newStatus);

      // ✅ Update UI without reload
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-t-4 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found</p>
      ) : (
        orders.map((order) => {
          const isOpen = openOrderId === order._id;

          return (
            <div
              key={order._id}
              className="border rounded-xl p-5 mb-5 shadow-sm bg-white"
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

                  <p className="text-xs text-gray-500">
                    {order.userId?.name} • {order.userId?.email}
                  </p>

                  <span
                    className={`text-white text-xs px-3 py-1 rounded-full inline-block mt-2 ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex flex-col items-end gap-2 min-w-[140px]">
  
                  {/* STATUS DROPDOWN */}
                  <StatusStepper
                    currentStatus={order.status}
                    loading={updatingId === order._id}
                    onChange={(newStatus) =>
                      handleStatusChange(order._id, newStatus)
                    }
                  />

                  {/* SEE DETAILS */}
                  <button
                    onClick={() =>
                      setOpenOrderId(isOpen ? null : order._id)
                    }
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {isOpen ? "Hide Details" : "See Details"}
                  </button>
                </div>
              </div>

              {/* SUMMARY */}
              <div className="mt-4 flex justify-between text-sm text-gray-700">
                <span>
                  {order.items.length} item
                  {order.items.length > 1 ? "s" : ""}
                </span>

                <span className="font-bold">
                  ₦{order.total.toLocaleString()}
                </span>
              </div>

              {/* EXPANDED */}
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
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default AdminOrders;