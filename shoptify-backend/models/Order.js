const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    items: [
      {
        _id: false, // optional (prevents Mongo generating extra _id per item)

        name: String,
        price: Number,
        quantity: Number,

        // 👇 THIS is your size field
        size: String,
      },
    ],

    total: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "shipped", "delivered"],
    },

    paymentRef: String,
    paidAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);