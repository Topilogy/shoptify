import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import API from "../services/api";
import { io } from "socket.io-client";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";


// const socket = io("http://localhost:5000");

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(null);
//   const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  let typingTimeout = null;
  

  const { user } = useAuth();

  // ================= FETCH CHAT =================
  const fetchChat = async () => {
    const { data } = await API.get("/chat");

    setMessages(data.messages || []);

    if (data._id) {
      setChatId(data._id);
      socket.emit("joinChat", data._id);
    }
  };

  // ================= SEND MESSAGE =================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const { data } = await API.post("/chat", {
        text: input,
    });

    // const message = {
    //   sender: "user",
    //   text: input,
    // };

    socket.emit("sendMessage", {
      chatId,
    //   message,
    });

    // setMessages((prev) => [...prev, message]);
    setMessages(data.messages);
    setInput("");
  };

  useEffect(() => {
    fetchChat();
  }, []);

  // ================= SOCKET LISTENER =================
  useEffect(() => {
    const handler = (msg) => {
        setMessages((prev) => [...prev, msg]);
    };

    socket.on("receiveMessage", handler);

    return () => {
        socket.off("receiveMessage", handler);
    };
  }, []);

useEffect(() => {
  if (!user?._id) return;

  socket.emit("registerUser", user._id);
}, [user]);

  // ================= LOAD CHAT =================
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await API.get("/chat");
      setMessages(data.messages || []);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleTyping = (e) => {
  setInput(e.target.value);

  console.log("Typing event sent", chatId);

  socket.emit("typing", {
    chatId,
    sender: "user",
  });

  clearTimeout(window.typingTimeout);

  window.typingTimeout = setTimeout(() => {
    socket.emit("stopTyping", { chatId });
  }, 1000);
};

  const handleStopTyping = () => {
    socket.emit("stopTyping", {
        chatId,
    });
  };

useEffect(() => {
  socket.on("typing", (data) => {
    if (data.chatId === chatId && data.sender === "admin") {
      setIsTyping(true);
    }
  });

  socket.on("stopTyping", (data) => {
    if (data.chatId === chatId && data.sender === "admin") {
      setIsTyping(false);
    }
  });

  return () => {
    socket.off("typing");
    socket.off("stopTyping");
  };
}, [chatId]);

  useEffect(() => {
  if (chatId) {
    socket.emit("joinChat", chatId);
    console.log("User joined:", chatId);
  }
}, [chatId]);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-5 bg-blue-600 text-white p-4 rounded-full shadow-lg"
        >
          <MessageCircle size={20} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 w-80 bg-white rounded-xl shadow-2xl flex flex-col z-50">

          {/* HEADER */}
          <div className="bg-blue-600 text-white p-3 flex justify-between">
            <span>WearDrop Support 💬</span>
            <button onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 p-3 overflow-y-auto max-h-80">
            {messages.map((msg, i) => {
              const isUser = msg.sender === "user";

              return (
                <div
                  key={i}
                  className={`text-sm p-2 rounded-lg max-w-[75%] mb-2 ${
                    isUser
                      ? "bg-blue-600 text-white ml-auto"
                      : "bg-gray-100"
                  }`}
                >
                  {msg.text}
                </div>
              );
            })}
            {isTyping && (
                <p className="text-xs text-gray-500 italic">
                    Admin is typing...
                </p>
            )}
          </div>

          {/* INPUT */}
          <div className="flex border-t">
            <input
              value={input}
              onChange={handleTyping}
              onBlur={handleStopTyping}
              placeholder="Type message..."
              className="flex-1 px-3 py-2 outline-none text-sm"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button onClick={sendMessage} className="px-3">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;