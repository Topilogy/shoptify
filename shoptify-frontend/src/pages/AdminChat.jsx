import { useEffect, useState } from "react";
// import axios from "axios";
import { useRef } from "react";
import { io } from "socket.io-client";
import  API  from "../services/api";
import socket from "../services/socket";
import { useAuth } from "../context/AuthContext";


// const socket = io("http://localhost:5000");

const AdminChat = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unread, setUnread] = useState({});
  const [isTyping, setIsTyping] = useState(false);

  const { user } = useAuth();
 

  // ================= LOAD ALL CHATS =================
  const fetchChats = async () => {
    try {
        const { data } = await API.get("/chat/admin/all");
        setChats(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error("FULL ERROR:", err.response?.data || err.message);
    }
  };

  // ================= OPEN CHAT =================
  const openChat = (chat) => {
  setActiveChat(chat);
  setMessages(chat.messages || []);

  socket.emit("joinChat", chat._id);
  console.log("Admin joined:", chat._id);
};

  // ================= SEND MESSAGE =================
    const sendMessage = async () => {
        if (!input.trim() || !activeChat) return;

        await API.post(`/chat/admin/${activeChat._id}`, {
        text: input,
        });

        setInput("");
    };

    useEffect(() => {
        fetchChats();

        const interval = setInterval(fetchChats, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handler = (msg) => {
            if (activeChat?._id !== msg.chatId) {
            setUnread((prev) => ({
                ...prev,
                [msg.chatId]: (prev[msg.chatId] || 0) + 1,
            }));
            }

            setMessages((prev) => [...prev, msg]);
        };

        socket.on("receiveMessage", handler);

        return () => {
            socket.off("receiveMessage", handler);
        };
    }, [activeChat]);

    useEffect(() => {
        socket.on("onlineUsers", (users) => {
            setOnlineUsers(users);
        });

        return () => socket.off("onlineUsers");
    }, []);


    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const interval = setInterval(async () => {
            const { data } = await API.get("/chat/admin/all");
            const chats = Array.isArray(data) ? data : [];

            setChats(chats);

            // 🔥 update active chat LIVE
            if (activeChat) {
                const updated = chats.find(
                    (c) => c._id === activeChat._id
                );

                if (updated) {
                    setMessages(updated.messages || []);
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [activeChat]);

    const formatLastSeen = (userId, date) => {
        // ✅ If user is online → override everything
        if (onlineUsers.includes(userId)) {
            return "Online";
        }

        // fallback → last seen
        if (!date) return "Offline";

        const diff = Date.now() - new Date(date).getTime();

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return "Just now";
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hr ago`;
        return `${days} day(s) ago`;
    };

    useEffect(() => {
        if (!user?._id) return;

        socket.emit("registerUser", user._id);
    }, [user]);

    useEffect(() => {
  socket.on("typing", (data) => {
    console.log("Typing event received:", data);

    if (data.chatId === activeChat?._id) {
      setIsTyping(true);
    }
  });

  socket.on("stopTyping", (data) => {
    if (data.chatId === activeChat?._id) {
      setIsTyping(false);
    }
  });

  return () => {
    socket.off("typing");
    socket.off("stopTyping");
  };
}, [activeChat]);

    const status = formatLastSeen(
        activeChat?.userId?._id,
        activeChat?.userId?.lastSeen
    );

  return (
  <div className="h-screen flex flex-col md:grid md:grid-cols-3 
    bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">

    {/* ================= LEFT (CHAT LIST) ================= */}
    <div
      className={`${
        activeChat ? "hidden md:block" : "block"
      } border-r border-gray-200 
      bg-white/60 backdrop-blur-xl 
      p-4 overflow-y-auto`}
    >
      <h2 className="font-bold text-lg mb-4 text-gray-800">
        💬 Customer Chats
      </h2>

      <div className="space-y-2">
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => openChat(chat)}
            className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col
              ${
                activeChat?._id === chat._id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg scale-[1.02]"
                  : "bg-white/70 hover:bg-white shadow-sm"
              }`}
          >
            <p
              className={`text-xs truncate ${
                activeChat?._id === chat._id
                  ? "text-blue-100"
                  : "text-gray-900"
              }`}
            >
              {chat.userId?.name || "User"}
            </p>

            <p
              className={`text-xs truncate ${
                activeChat?._id === chat._id
                  ? "text-blue-100"
                  : "text-gray-500"
              }`}
            >
              {chat.userId?.email}
            </p>

            {unread[chat._id] > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unread[chat._id]}
                </span>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* ================= RIGHT (CHAT WINDOW) ================= */}
    <div
      className={`flex flex-col flex-1 ${
        activeChat ? "block" : "hidden md:flex"
      } md:col-span-2`}
    >
      {/* HEADER */}
      <div className="p-4 border-b border-gray-200 
        bg-white/70 backdrop-blur-xl 
        flex items-center justify-between shadow-sm">

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveChat(null)}
            className="md:hidden text-blue-600 text-lg"
          >
            ←
          </button>

          {/* AVATAR */}
          <div className="w-10 h-10 rounded-full 
            bg-gradient-to-br from-blue-500 to-indigo-500 
            flex items-center justify-center 
            font-bold text-white shadow">
            {activeChat?.userId?.name?.charAt(0) || "U"}
          </div>

            <div>
                <p className="font-semibold text-sm text-gray-800">
                    {activeChat?.userId?.name || "Select a chat"}
                </p>

                <p className="text-xs text-gray-500">
                    {activeChat?.userId?.email}
                </p>

                <p
                    className={`text-xs font-medium ${
                    status === "Online" ? "text-green-500" : "text-gray-500"
                    }`}
                >
                    {status === "Online"
                    ? "● Online"
                    : `Last seen: ${status}`}
                </p>
            </div>
        </div>

        <span
            className={`text-xs font-medium flex items-center gap-1 ${
                onlineUsers.includes(activeChat?.userId?._id)
                ? "text-green-500"
                : "text-gray-400"
            }`}
            >
            <span
                className={`w-2 h-2 rounded-full ${
                onlineUsers.includes(activeChat?.userId?._id)
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
            ></span>

            {onlineUsers.includes(activeChat?.userId?._id)
                ? "Online"
                : "Offline"
            }
        </span>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 
        bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200">

        {messages.map((msg, i) => {
          const isAdmin = msg.sender === "admin";

          return (
            <div
              key={i}
              className={`flex ${
                isAdmin ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 text-sm max-w-xs 
                  rounded-2xl shadow-md transition-all duration-200
                  ${
                    isAdmin
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                  }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        {isTyping && (
            <div className="flex items-center gap-1 text-gray-400 text-xs italic">
                User is typing
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-150">.</span>
                <span className="animate-bounce delay-300">.</span>
            </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      {activeChat && (
        <div className="p-3 border-t border-gray-200 
          bg-white/70 backdrop-blur-xl 
          flex items-center gap-2 shadow-inner">

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-gray-200 
            rounded-full px-4 py-2 text-sm 
            bg-gray-50 text-gray-800 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            placeholder="Type a message..."
          />

          <button
            onClick={sendMessage}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 
              hover:opacity-90 text-white px-5 py-2 
              rounded-full shadow-md transition"
          >
            Send
          </button>
        </div>
      )}
    </div>
  </div>
);
};

export default AdminChat;