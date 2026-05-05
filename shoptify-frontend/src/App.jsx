import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AdminProducts from "./pages/AdminProducts";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { ToastContainer } from "react-toastify";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import AdminOrders from "./pages/AdminOrders";
import AdminDashboard from "./pages/AdminDashboard";
import ChangePassword from "./pages/ChangePassword";
import Success from "./pages/Success";
import AdminLayout from "./layouts/AdminLayout";
import ProductDetails from "./pages/ProductDetails";
import CategoryProduct from "./pages/CategoryProduct";
import AdminChat from "./pages/AdminChat";

const Layout = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  const isAdminPage = location.pathname.startsWith("/admin");

  if (loading) return null;

  return (
    <div className="relative">
      {/* Hide Navbar on admin pages */}
      {!isAuthPage && !isAdminPage && <Navbar />}

      <Routes>
        {/* USER ROUTES */}
        <Route path="/" element={<Home />} />
        {/* <Route path="/about" element={<About />} /> */}
        {/* <Route path="/contact" element={<Contact />} /> */}
        <Route path="/category/:categoryName" element={<CategoryProduct />} />
        <Route path="/cart" element={<Cart />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route path="/product/:id" element={<ProductDetails />} />

        {/* ADMIN LAYOUT (PARENT ROUTE) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              {user?.role === "admin" ? (
                <AdminLayout />
              ) : (
                <Navigate to="/" />
              )}
            </ProtectedRoute>
          }
        >
          {/* CHILD ROUTES (render inside sidebar) */}
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="chats" element={<AdminChat />} />
        </Route>

        <Route path="/success" element={<Success />} />
      </Routes>

      {/* AUTH MODAL */}
      {isAuthPage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;