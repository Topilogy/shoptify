import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  LogOut,
  Menu,
  X,
  MessageCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const AdminLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false); // mobile toggle

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Orders", path: "/admin/orders", icon: <ShoppingCart size={18} /> },
    { name: "Products", path: "/admin/products", icon: <Package size={18} /> },
    { name: "Live Chats", path: "/admin/chats", icon: <MessageCircle size={18} /> }
  ];

  return (
    <div className="flex h-screen bg-[#0f172a] text-white">

      {/* 🔹 MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 🔹 SIDEBAR */}
      <div
        className={`
          fixed md:static z-50 top-0 left-0 h-full w-64 bg-[#020617]
          border-r border-gray-800 flex flex-col transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* HEADER */}
        <div className="p-6 text-xl font-bold flex justify-between items-center">
          WearDrop Admin
          <button
            className="md:hidden"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setOpen(false)} // close on mobile click
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                location.pathname === item.path
                  ? "bg-blue-600"
                  : "hover:bg-gray-800"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          {/* <Link to="/admin/chats">
            Live Chats
          </Link> */}
        </nav>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="m-4 flex items-center gap-2 px-4 py-2 bg-red-500 rounded hover:bg-red-600"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* 🔹 MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* 🔹 MOBILE TOP BAR */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[#020617] border-b border-gray-800">
          <button onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <h1 className="font-semibold">Admin</h1>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto "> 
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;