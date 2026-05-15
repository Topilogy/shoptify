import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  ChevronDown,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import ChatWidget from "./ChatWidget2";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false); // mobile
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false); // desktop categories
  const [accountOpen, setAccountOpen] = useState(false);

  const { cart } = useCart();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "admin";
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)

  // const dropdownRef = useRef();
  const navRef = useRef();
  const navigate = useNavigate();

  const categories = [
    { name: "Luxury/Designers Shoes", path: "/category/luxury-designers-shoes" },
    { name: "Casual Shoes", path: "/category/casual-shoes" },
    { name: "Formal Shoes", path: "/category/formal-shoes" },
    { name: "Sport/Athletic Shoes", path: "/category/sport-athletic-shoes" },
    { name: "Heel Shoes", path: "/category/heel-shoes" },
  ];

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!navRef.current) return;

      // If click is outside navbar → close everything
      if (!navRef.current.contains(e.target)) {
        setAccountOpen(false);
        setDesktopMenuOpen(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navRef]);

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header ref={navRef} className="fixed top-0 left-0 w-full z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <button
            // onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
            onClick={(e) => {
              e.stopPropagation();
              setDesktopMenuOpen((prev) => {
                const next = !prev;
                if (next) {
                  setAccountOpen(false);
                  setMenuOpen(false);
                }
                return next;
              });
            }}
            className="hidden md:block text-gray-700 hover:text-blue-500"
          >
            <Menu size={22} />
          </button>

          <Link
            to={isAdmin ? "/admin/dashboard" : "/"}
            className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"
          >
            WearDrop
          </Link>
        </div>

        <div className="hidden md:flex flex-1 mx-6">
          <div className="flex w-full bg-gray-100 rounded-lg overflow-hidden focus-within:ring-2 ring-blue-500">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 bg-transparent outline-none text-sm"
            />

            <button className="px-4 text-gray-600 hover:text-blue-500">
              <Search size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-5 text-sm text-gray-700">
            {!isAdmin && (
              <>
                <Link to="/" className="hover:text-blue-500">Home</Link>
                {/* {user && (
                  <Link to="/orders" className="hover:text-blue-500">
                    Orders
                  </Link>
                )} */}
              </>
            )}

            {isAdmin && (
              <>
                <Link to="/admin/dashboard">Dashboard</Link>
                <Link to="/admin">Products</Link>
                <Link to="/admin/orders">Orders</Link>
              </>
            )}
          </div>
          <ChatWidget />

          <div className="relative">
            <button
              // onClick={() => setAccountOpen(!accountOpen)}
              onClick={(e) => {
                e.stopPropagation();
                setAccountOpen((prev) => {
                  const next = !prev;
                  if (next) {
                    setDesktopMenuOpen(false);
                    setMenuOpen(false);
                  }
                  return next;
                });
              }}
              className="flex items-center gap-1 text-gray-700 hover:text-blue-500"
            >
              <User size={20} />
              <span className="hidden md:flex items-center gap-1 text-sm">
                {user ? <span>Hi, {user.name}</span> : "Account"}
                <ChevronDown
                  size={16}
                  className={`transition ${accountOpen ? "rotate-180" : ""}`}
                />
              </span>
            </button>

            {accountOpen && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className={`absolute right-0 mt-3 w-52 bg-white border rounded-lg shadow-lg p-2 text-sm
                  transition-all duration-200 ease-out
                  ${accountOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 -translate-y-2 pointer-events-none"}
                `}
              >
                {!user ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAccountOpen(false);
                      navigate("/login");
                    }}
                    className="w-full bg-blue-500 text-white py-2 rounded-md"
                  >
                    Sign In
                  </button>
                ) : (
                  <>
                    <Link
                      to="/account"
                      onClick={() => setAccountOpen(false)}
                      className="block px-3 py-2 hover:bg-gray-100"
                    >
                      My Account
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setAccountOpen(false)}
                      className="block px-3 py-2 hover:bg-gray-100"
                    >
                      Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setAccountOpen(false)}
                        className="block px-3 py-2 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-red-500 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* CART */}
          <Link to="/cart" className="relative text-gray-700 hover:text-blue-500">
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          {/* MOBILE MENU */}
          <button
            // onClick={() => setMenuOpen(!menuOpen)}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => {
                const next = !prev;
                if (next) {
                  setAccountOpen(false);
                  setDesktopMenuOpen(false);
                }
                return next;
              });
            }}
            className="md:hidden text-gray-700"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {desktopMenuOpen && (
        <div className={`hidden md:block absolute top-full left-0 w-full bg-white border-b shadow-lg z-40
            transition-all duration-500 ease-out
            ${desktopMenuOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-3 pointer-events-none"}
          `}
        >
          <div className="max-w-7xl mx-auto px-6 py-3">

            <div className="flex gap-3 mr-3 -mt-3 text-sm overflow-x-auto">
              {categories.map((cat, index) => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  onClick={() => setDesktopMenuOpen(false)}
                  className={`whitespace-nowrap hover:text-blue-500 px-3 ${
                    index !== 0
                      ? "before:content-['•'] before:mr-3 before:text-gray-400"
                      : ""
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

          </div>
        </div>
      )}

      {menuOpen && (
        <div className={`md:hidden bg-white px-6 py-4 flex flex-col gap-2 shadow
            transition-all duration-300 ease-out
            ${menuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-3 pointer-events-none"}
          `}
        >

          {!isAdmin && (
            <div className="flex gap-3 mr-auto">
              <Link to="/">Home</Link>
              {/* {user && <Link to="/login">Login</Link>} */}
            </div>
          )}

          <div className="border-t pt-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                onClick={() => setMenuOpen(false)}
                className="block py-1 hover:text-blue-500"
              >
                • {cat.name}
              </Link>
            ))}
          </div>

          {/* {user && (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Logout
            </button>
          )} */}
          
        </div>
      )}
    </header>
  );
};

export default Navbar;