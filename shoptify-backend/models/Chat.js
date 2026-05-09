const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderType: {
    type: String,
    enum: ["user", "admin"],
    required: true,
  },

  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  senderName: String,

  text: String,
  createdAt: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    messages: [messageSchema],
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);