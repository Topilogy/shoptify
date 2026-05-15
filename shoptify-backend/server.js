const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const crypto = require("crypto");

const onlineUsers = new Map();

const http = require("http");
const { Server } = require("socket.io");

const axios = require("axios");
const axiosRetry = require("axios-retry").default;

const Order = require("./models/Order");
const Chat = require("./models/Chat2");

// ================= INIT APP =================
const app = express();

// ================= SOCKET SETUP =================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Make io accessible in routes
app.set("io", io);

// ================= SOCKET LOGIC =================
// 🔥 DEFINE THIS ABOVE io.on


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ================= REGISTER USER =================
  socket.on("registerUser", (userId) => {
    if (!userId) return;

    socket.userId = userId; // ✅ attach to socket
    onlineUsers.set(userId, {
      socketId: socket.id,
      lastActive: Date.now(),
    });

    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("heartbeat", (userId) => {
    const user = onlineUsers.get(userId);

    if (user) {
      onlineUsers.set(userId, {
        ...user,
        lastActive: Date.now(),
      });
    }
  });

  // ================= JOIN CHAT =================
  socket.on("joinChat", (chatId) => {
  socket.join(chatId);
  console.log("Joined room:", chatId);
});

  // ================= SEND MESSAGE =================
  socket.on("sendMessage", async ({ chatId, message }) => {
    try {
      if (!chatId || !message) return;

      const Chat = require("./models/Chat2");

      // ✅ Save message
      await Chat.findByIdAndUpdate(chatId, {
        $push: { messages: message },
      });

      // ✅ Broadcast message
      io.to(chatId).emit("receiveMessage", {
        chatId,
        ...message, // sender + text
      });

    } catch (err) {
      console.log("Socket sendMessage error:", err.message);
    }
  });

  // ================= TYPING =================
  socket.on("typing", ({ chatId, sender }) => {
  socket.to(chatId).emit("typing", {
    chatId,
    sender, // "user" or "admin"
  });
});

socket.on("stopTyping", ({ chatId, sender }) => {
  socket.to(chatId).emit("stopTyping", {
    chatId,
    sender,
  });
});

  // ================= DISCONNECT =================
  socket.on("disconnect", async () => {
      try {

        console.log("DISCONNECTED:", socket.id);

        for (const [userId, data] of onlineUsers.entries()) {

          console.log("CHECKING:", data);

          if (data.socketId === socket.id) {

            console.log("REMOVING USER:", userId);

            onlineUsers.delete(userId);

            const User = require("./models/User");

            await User.findByIdAndUpdate(userId, {
              lastSeen: new Date(),
            });

            break;
          }
        }

        io.emit("onlineUsers", Array.from(onlineUsers.keys()));

      } catch (err) {

        console.log("Disconnect error:", err.message);

      }
    });
  });

setInterval(() => {
  const now = Date.now();
  const timeout = 60 * 1000;

  for (let [userId, data] of onlineUsers.entries()) {
    if (now - data.lastActive > timeout) {
      onlineUsers.delete(userId);
    }
  }

  io.emit("onlineUsers", Array.from(onlineUsers.keys()));
}, 30000);

// ================= AXIOS RETRY =================
axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) =>
    error.code === "ECONNABORTED" ||
    error.code === "ENOTFOUND" ||
    error.code === "EAI_AGAIN",
});

// ================= WEBHOOK (VERY IMPORTANT POSITION) =================
app.post(
  "/api/payments/webhook",
  express.json({ type: "*/*" }),
  async (req, res) => {
    try {
      const secret = process.env.PAYSTACK_SECRET_KEY;

      const hash = crypto
        .createHmac("sha512", secret)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (hash !== req.headers["x-paystack-signature"]) {
        console.log("❌ Invalid webhook signature");
        return res.sendStatus(400);
      }

      const event = req.body;

      console.log("🔥 Webhook received:", event.event);

      if (event.event === "charge.success") {
        const reference = event.data.reference;

        const order = await Order.findOne({ reference });

        if (order && order.status !== "paid") {
          order.status = "paid";
          order.paidAt = new Date();
          await order.save();

          console.log("✅ Order updated via webhook");
        }
      }

      res.sendStatus(200);
    } catch (err) {
      console.log("WEBHOOK ERROR:", err.message);
      res.sendStatus(500);
    }
  }
);

// ================= MIDDLEWARE =================
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://shoptify-weardrop.vercel.app",
    "https://shoptify-production.up.railway.app/" // add this too
  ],
  credentials: true
}));

app.use(express.json());

// ================= TEST ROUTE =================
app.get("/test-db", async (req, res) => {
  try {
    const test = await mongoose.connection.db
      .collection("tests")
      .insertOne({ message: "Hello Shoptify!" });

    const all = await mongoose.connection.db
      .collection("tests")
      .find()
      .toArray();

    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ROUTES =================
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const chatRoutes = require("./routes/chatRoutes2");

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/api/chat", require("./routes/chatRoutes2"));



// ================= NO CACHE =================
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});


// ================= DB CONNECTION =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});