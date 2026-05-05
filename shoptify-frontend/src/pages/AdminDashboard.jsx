import { useEffect, useState } from "react";
import { DollarSign, ShoppingCart } from "lucide-react";
import { getAllOrdersAdmin } from "../services/api";
import axios from "axios";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, } from "recharts";
import { useAuth } from "../context/AuthContext";



const useParallax = () => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      setOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return offset;
};

const GlassCard = ({ children }) => (
  <div className="
bg-white/10 backdrop-blur-xl 
border border-white/10 p-3 md:p-5 lg:p-4
rounded-2xl shadow-xl
hover:shadow-cyan-500/20
transition
">
    {children}
  </div>
);

// const useCountUp = (end, duration = 1000) => {
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     let start = 0;
//     const increment = end / (duration / 16);

//     const timer = setInterval(() => {
//       start += increment;
//       if (start >= end) {
//         setCount(end);
//         clearInterval(timer);
//       } else {
//         setCount(Math.floor(start));
//       }
//     }, 16);

//     return () => clearInterval(timer);
//   }, [end]);

//   return count;
// };

const formatMonthlyData = (data) => {
  const monthly = {};

  data.forEach((item) => {
    const date = new Date(item.date);

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const label = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    if (!monthly[key]) {
      monthly[key] = { date: label, sales: 0 };
    }

    monthly[key].sales += item.sales;
  });

  return Object.values(monthly);
};

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  // const isAdmin = user?.role === "admin";
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, });
  // const { x, y } = useParallax();

  const itemsPerPage = 2;
  const paidOrders = orders.filter(o => o.status === "paid").length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;
  const pieData = [
    { name: "Paid", value: paidOrders },
    { name: "Pending", value: pendingOrders },
    { name: "Delivered", value: deliveredOrders },
  ];
  const COLORS = [
    "#16a34a", 
    "#f59e0b", 
    "#3b82f6"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get(
          "http://localhost:5000/api/orders/admin/stats"
        );
        setStats(statsRes.data || { totalOrders: 0, totalRevenue: 0 });

        const { data } = await getAllOrdersAdmin();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const now = new Date();
    const date = new Date(order.createdAt);

    if (filter === "today") {
      return date.toDateString() === now.toDateString();
    }

    if (filter === "week") {
      return now - date < 7 * 24 * 60 * 60 * 1000;
    }

    if (filter === "month") {
      return date.getMonth() === now.getMonth();
    }

    return true;
  });
  const totalOrders = filteredOrders.length;
  
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice( startIndex, startIndex + itemsPerPage );

  const totalRevenue = filteredOrders.reduce(
    (sum, o) => sum + (o.total || 0),
    0
  );

 const dailySales = {};

  filteredOrders.forEach((order) => {
    const date = new Date(order.createdAt)
      .toISOString()
      .split("T")[0];

    if (!dailySales[date]) dailySales[date] = 0;
    dailySales[date] += order.total || 0;
  });

  const chartData = Object.entries(dailySales).map(([date, value]) => ({
    date,
    sales: value,
  }));

  
  const monthlyData = formatMonthlyData(chartData);

  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  const maxItem = pieData.reduce((prev, current) =>
    current.value > prev.value ? current : prev
  );

  const maxPercentage = ((maxItem.value / total) * 100).toFixed(1);

  const targetPercentage = ((maxItem.value / total) * 100);
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000; // 1 second animation
    const startTime = performance.now();

    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const value = progress * targetPercentage;
        setAnimatedPercent(value.toFixed(1));

        if (progress < 1) {
        requestAnimationFrame(animate);
        }
    };

    requestAnimationFrame(animate);
 }, [targetPercentage]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-t-4 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  const productMap = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!productMap[item.name]) productMap[item.name] = 0;
      productMap[item.name] += item.qty;
    });
  });

  const topProduct = Object.entries(productMap).sort((a, b) => b[1] - a[1])[0];


  return (
    // <div className="relative min-h-screen overflow-hidden bg-transparent text-white p-2">
    <div className="relative md:h-full md:min-h-screen overflow-hidden bg-transparent text-white p-2">

        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black animate-gradient" />

        <div className="absolute w-[400px] h-[400px] bg-blue-500/30 blur-3xl rounded-full top-[-100px] left-[-100px] animate-floatSlow" />
        <div className="absolute w-[300px] h-[300px] bg-purple-500/30 blur-3xl rounded-full bottom-[-80px] right-[-80px] animate-float" />

        <div className="relative z-10 p-8">
            <div className="lg:flex justify-between items-center -mt-2 mb-1 md:grid">
                {user && (
                    <h1 className="text-2xl font-semibold mb-6 text-white -mt-7">📊 Welcome back, {user.name}! </h1>
                )}
            
                <div className="flex gap-3 mb-3">
                    {["all", "today", "week", "month"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full border-t text-xs transition ${
                        filter === f
                            ? "bg-blue-600 text-white"
                            : "backdrop-blur hover:bg-blue-600"
                        }`}
                    >
                        {f.toUpperCase()}
                    </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">         
                <GlassCard>
                    <p className="text-lg text-white mb-5">Total Revenue</p>
                    <h2 className="text-4xl font-bold text-green-400 mt-2 mb-5">
                        ₦{stats.totalRevenue}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Filtered: ₦{totalRevenue}
                    </p>
                </GlassCard>

                <GlassCard>
                    <p className="text-lg text-white mb-5">Total Orders</p>
                    <h2 className="text-4xl font-bold text-blue-400 mt-2 mb-5">
                    {stats.totalOrders}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                    Filtered: {totalOrders}
                    </p>
                </GlassCard>

                <GlassCard>
                    <p className="text-lg text-white mb-5">Top Product</p>
                    <h2 className="text-2xl font-bold text-yellow-400 mt-2 mb-5">
                    {topProduct ? topProduct[0] : "N/A"}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                    {topProduct ? `${topProduct[1]} sold` : ""}
                    </p>
                </GlassCard>

                <GlassCard>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold">Status Overview</h2>
                        <div className="flex items-center gap-2 text-xs text-green-400">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Live
                        </div>
                    </div>
                    <div className="mt-3 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Pending</span>
                            <span className="text-yellow-400 font-semibold">
                                {pendingOrders}
                            </span>
                        </div>
                        <div className="w-full bg-white/10 rounded h-1 mt-1">
                            <div className="bg-yellow-400 h-1 rounded" style={{ width: `${(pendingOrders / totalOrders) * 50}%` }} />
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Paid</span>
                            <span className="text-green-400 font-semibold">
                                {paidOrders}
                            </span>
                            
                        </div>
                        <div className="w-full bg-white/10 rounded h-1 mt-1">
                            <div className="bg-green-400 h-1 rounded" style={{ width: `${(paidOrders / totalOrders) * 50}%` }} />
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Delivered</span>
                            <span className="text-blue-400 font-semibold">
                                {deliveredOrders}
                            </span>
                        </div>
                        <div className="w-full bg-white/10 rounded h-1 mt-1">
                            <div className="bg-blue-400 h-1 rounded" style={{ width: `${(deliveredOrders / totalOrders) * 50}%` }} />
                        </div>

                    </div>
                </GlassCard>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[4fr_3fr] gap-6 mt-6">
                <GlassCard>
                    <h2 className="text-lg font-semibold mb-4">
                    📈 Sales Overview
                    </h2>

                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                          dataKey="date"
                          tick={{ fill: "#fff" }}
                          axisLine={{ stroke: "#fff" }}
                        />

                        <YAxis
                          tick={{ fill: "#fff" }}
                          axisLine={{ stroke: "#fff" }}
                        />

                        <Tooltip />

                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke="#3b82f6"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                </GlassCard>
                <GlassCard className="relative w-full h-[300px]">
                    <h2 className="text-lg font-semibold mb-4">
                    🧾 Payment Status
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                cx="50%"
                                cy="50%"
                                innerRadius={65}  
                                outerRadius={100}
                                // label
                                stroke="none"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-2xl font-bold">
                        {animatedPercent}%
                        </p>
                        <p className="text-sm text-gray-500">
                        {maxItem.name}
                        </p>
                    </div>

                </GlassCard>
            </div>
        
            <div className="rounded-xl shadow-sm mt-6">
                <GlassCard>
                    <h2 className="text-lg mb-4 font-semibold">Recent Orders</h2>

                    <table className="w-full text-sm -mt-4">
                        <thead>
                            <tr className="text-left text-white border-b">
                            <th className="py-2">Order ID</th>
                            <th>Status</th>
                            <th>Total</th>
                            <th>Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedOrders.map((order) => (
                            <tr key={order._id} className="border-b text-white overflow-scroll">
                                <td className="py-2 text-white">{order._id.slice(-6)}</td>
                                <td>
                                    <span
                                        className={`px-2 py-1 rounded text-white text-xs ${
                                            order.status === "paid"
                                                ? "bg-green-600"
                                                : order.status === "delivered"
                                                ? "bg-blue-500"
                                                : "bg-yellow-600"
                                            }`}
                                        >
                                        {order.status}
                                    </span>
                                </td>
                                <td className="text-white">₦{order.total}</td>
                                <td className="text-white">
                                {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-between items-center mt-4 text-sm text-white">

                    {/* LEFT SIDE */}
                    <div className="flex gap-4">

                        <span
                        onClick={() => currentPage > 1 && setCurrentPage((p) => p - 1)}
                        className={`cursor-pointer transition ${
                            currentPage === 1
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:text-blue-400"
                        }`}
                        >
                            &lt;&lt; Prev
                        </span>

                        <span
                        onClick={() =>
                            currentPage < totalPages && setCurrentPage((p) => p + 1)
                        }
                        className={`cursor-pointer transition ${
                            currentPage === totalPages
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:text-blue-400"
                        }`}
                        >
                            Next &gt;&gt;
                        </span>

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="text-gray-300">
                        Page {currentPage} of {totalPages}
                    </div>

                    </div>
                </GlassCard>
            </div>
        </div>
    </div>  
  );
};

export default AdminDashboard;