const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat2");
const authMiddleware = require("../middleware/authMiddleware");


// ================= USER =================

// get user chat
router.get("/", authMiddleware, async (req, res) => {
  const chat = await Chat.findOne({ userId: req.user._id });
  res.json(chat || { messages: [] });
});

// send message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Message required" });
    }

    let chat = await Chat.findOne({ userId: req.user._id });

    if (!chat) {
      chat = await Chat.create({
        userId: req.user._id,
        messages: [],
      });
    }

    const message = {
      senderType: "user", // instead of sender
      text,
      createdAt: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    const io = req.app.get("io");

    io.to(chat._id.toString()).emit("receiveMessage", {
      chatId: chat._id,
      ...message,
    });

    return res.json(chat);

  } catch (err) {
    console.error("CHAT ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});

// ================= ADMIN =================

// get all chats (dashboard)
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const chats = await Chat.find()
      .populate("userId", "name email lastSeen")
      .lean();

    console.log("CHATS DEBUG:", JSON.stringify(chats, null, 2));

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:chatId", async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  res.json(chat);
});

// send admin reply
router.post("/admin/:chatId", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { text } = req.body;

  const chat = await Chat.findById(req.params.chatId);

  const io = req.app.get("io");

  const message = {
    senderType: "admin",
    text,
    createdAt: new Date(),
  };

  chat.messages.push(message);
  await chat.save();

  io.to(chat._id.toString()).emit("receiveMessage", {
    chatId: chat._id,
    ...message,
  });

  res.json(chat);
});

module.exports = router;