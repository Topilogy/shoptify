const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const authMiddleware = require("../middleware/authMiddleware");


// ================= USER GET CHAT =================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user._id });
    res.json(chat || { messages: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= USER SEND MESSAGE =================
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
      senderType: "user",
      text,
      createdAt: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    const io = req.app.get("io");

    io.to(chat._id.toString()).emit("receiveMessage", {
      chatId: chat._id.toString(),
      ...message,
    });

    res.json(chat);
  } catch (err) {
    console.error("CHAT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


// ================= ADMIN GET ALL CHATS =================
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const chats = await Chat.find()
      .populate("userId", "name email lastSeen")
      .lean();

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= ADMIN GET SINGLE CHAT =================
router.get("/:chatId", authMiddleware, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= ADMIN REPLY =================
router.post("/admin/:chatId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Message required" });
    }

    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const message = {
      senderType: "admin",
      text,
      createdAt: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    const io = req.app.get("io");

    io.to(chat._id.toString()).emit("receiveMessage", {
      chatId: chat._id.toString(),
      ...message,
    });

    res.json(chat);
  } catch (err) {
    console.error("ADMIN CHAT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;