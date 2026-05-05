
const steps = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
];

const labels = {
  pending: "Order Placed",
  paid: "Payment Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

const OrderTimeline = ({ status = "pending" }) => {
  const currentIndex = steps.indexOf(status);

  return (
    <div className="w-full bg-white p-4 rounded-lg border mt-4">
      <h2 className="text-sm font-semibold mb-4">Order Tracking</h2>

      <div className="flex items-center justify-between relative">

        {/* LINE */}
        <div className="absolute top-3 left-0 right-0 h-1 bg-gray-200 z-0" />

        {steps.map((step, index) => {
          const isActive = index <= currentIndex;

          return (
            <div
              key={step}
              className="flex flex-col items-center relative z-10 w-full"
            >
              {/* CIRCLE */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${
                    isActive
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }
                `}
              >
                {index + 1}
              </div>

              {/* LABEL */}
              <p className="text-[10px] mt-2 text-center">
                {labels[step]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;