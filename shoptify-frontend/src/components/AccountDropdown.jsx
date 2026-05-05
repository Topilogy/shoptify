import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AccountDropdown = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* TRIGGER */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 cursor-pointer"
      >
        <User size={20} />
        <span className="hidden md:block">
          {user ? user.name : "Account"}
        </span>
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-3 w-48 bg-white text-black rounded shadow-lg p-3 z-50">

          {!user ? (
            <Link to="/login">
              <button className="w-full bg-orange-500 text-white py-2 rounded mb-2">
                Sign In
              </button>
            </Link>
          ) : (
            <>
              <Link
                to="/account"
                className="block px-2 py-2 hover:bg-gray-100 rounded"
              >
                My Account
              </Link>

              <Link
                to="/orders"
                className="block px-2 py-2 hover:bg-gray-100 rounded"
              >
                Orders
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-2 py-2 hover:bg-gray-100 rounded text-red-500"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;