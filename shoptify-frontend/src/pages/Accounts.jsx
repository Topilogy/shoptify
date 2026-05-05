import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  ShoppingCart,
  Contact,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  // const [cartOpen, setCartOpen] = useState(false);
  const { cart, removeFromCart } = useCart();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-blue-600 text-white px-6 py-4 flex justify-between items-center">

  {/* LOGO + MENU BUTTON */}
  <div className="flex justify-between items-center w-full md:w-auto">
    <Link
      to={isAdmin ? "/admin/dashboard" : "/"}
      className="text-xl font-bold"
    >
      WearDrop
    </Link>

    <button
      className="md:hidden text-2xl"
      onClick={() => setMenuOpen(!menuOpen)}
    >
      ☰
    </button>
  </div>

  {/* DESKTOP MENU */}
  <div className="hidden md:flex items-center gap-6">
    {!user && <Link to="/login">Login</Link>}

    {user && !isAdmin && (
      <>
        <Link to="/">Home</Link>
        <Link to="/orders">My Orders</Link>

        <div className="relative">
          <Link to="/cart" className="relative">
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-xs px-2 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </>
    )}

    {user && isAdmin && (
      <>
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin">Products</Link>
        <Link to="/admin/orders">Orders</Link>
      </>
    )}

    {user && (
      <>
        <span>My Account: {user.name}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 px-2 py-1 rounded"
        >
          Logout <LogOut size={16} />
        </button>
      </>
    )}
  </div>

  {/* MOBILE MENU */}
  {menuOpen && (
    <div className="absolute top-full left-0 w-full bg-blue-600 flex flex-col gap-4 p-4 md:hidden shadow-lg animate-slide-down">

      {!user && <Link to="/login">Login</Link>}

      {user && !isAdmin && (
        <>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>

          <Link to="/cart" onClick={() => setMenuOpen(false)}>
            Cart ({totalItems})
          </Link>
        </>
      )}

      {user && isAdmin && (
        <>
          <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link to="/admin" onClick={() => setMenuOpen(false)}>Products</Link>
          <Link to="/admin/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
        </>
      )}

      {user && (
        <>
          <span>My Account: {user.name}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-2 py-1 rounded"
          >
            Logout
          </button>
        </>
      )}
    </div>
  )}
</nav>
  );
};

export default Navbar;