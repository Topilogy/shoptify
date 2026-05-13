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
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unread, setUnread] = useState({});
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef();
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

          const { data } = await API.post(
            `/chat/admin/${activeChat._id}`,
            { text: input }
          );
          
        setMessages(data.messages || []);
        setInput("");
    };

    useEffect(() => {
        fetchChats();

        const interval = setInterval(fetchChats, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
    const handler = (msg) => {
      if (msg.chatId === activeChat?._id) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setUnread((prev) => ({
          ...prev,
          [msg.chatId]: (prev[msg.chatId] || 0) + 1,
        }));
      }
    };

    socket.on("receiveMessage", handler);

    return () => socket.off("receiveMessage", handler);
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

      if (activeChat) {
        const updated = chats.find((c) => c._id === activeChat._id);
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
      if (
        data.chatId === activeChat?._id &&
        data.sender === "user"
      ) {
        setIsTyping(true);
      }
    });

    socket.on("stopTyping", (data) => {
      if (
        data.chatId === activeChat?._id &&
        data.sender === "user"
      ) {
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


  const isOnline = onlineUsers.includes(
    activeChat?.userId?._id
  );


  return (
    <div className="h-screen grid grid-cols-3 bg-gray-100">

      {/* ================= LEFT CHAT LIST ================= */}
      <div className="border-r bg-white p-4 overflow-y-auto">
        <h2 className="font-bold mb-4">Customer Chats</h2>

        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => openChat(chat)}
            className={`p-3 mb-2 rounded cursor-pointer ${
              activeChat?._id === chat._id
                ? "bg-blue-600 text-white"
                : "bg-gray-100"
            }`}
          >
            <p className="text-sm font-semibold">
              {chat.userId?.name || "User"}
            </p>

            <p className="text-xs">
              {chat.userId?.email}
            </p>

            {unread[chat._id] > 0 && (
              <span className="text-xs text-red-500">
                {unread[chat._id]} new
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ================= CHAT WINDOW ================= */}
      <div className="col-span-2 flex flex-col">

        {/* HEADER */}
        <div className="p-4 bg-white border-b flex justify-between items-center">
          <div>
            <p className="font-semibold">
              {activeChat?.userId?.name || "Select Chat"}
            </p>

            <p className="text-xs text-gray-500">
              {activeChat?.userId?.email}
            </p>

            {isOnline ? (
              <p className="text-xs text-green-500">
                ● Online
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Last seen:{" "}
                {activeChat?.userId?.lastSeen
                  ? new Date(
                      activeChat.userId.lastSeen
                    ).toLocaleString()
                  : "Offline"}
              </p>
            )}
          </div>

          <div
            className={`text-xs ${
              isOnline ? "text-green-500" : "text-gray-400"
            }`}
          >
            ● {isOnline ? "Online" : "Offline"}
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg, i) => {
            const isAdmin = msg.senderType === "admin";

            return (
              <div
                key={i}
                className={`flex mb-2 ${
                  isAdmin
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-xs ${
                    isAdmin
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <p className="text-xs text-gray-500 italic">
              User is typing...
            </p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        {activeChat && (
          <div className="p-3 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              className="flex-1 border px-3 py-2 rounded"
              placeholder="Type message..."
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage()
              }
            />

            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 rounded"
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