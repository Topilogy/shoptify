const steps = ["pending", "paid", "processing", "shipped", "delivered"];

const StatusStepper = ({ currentStatus, onChange, loading }) => {
  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-2 flex-wrap mt-3">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isNext = index === currentIndex + 1;

        return (
          <button
            key={step}
            disabled={loading || (!isNext && !isCurrent)}
            onClick={() => {
              if (isNext) onChange(step);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition
              
              ${
                isCompleted
                  ? "bg-green-600 text-white"
                  : isCurrent
                  ? "bg-blue-600 text-white"
                  : isNext
                  ? "bg-gray-200 hover:bg-gray-300 text-black cursor-pointer"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {step}
          </button>
        );
      })}
    </div>
  );
};

export default StatusStepper;