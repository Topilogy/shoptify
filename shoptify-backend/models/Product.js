const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  oldPrice: { type: Number, default: null },
  image: String,
  description: String,
  category: {
    type: String,
    required: true,
    enum: [
      "luxury-designers-shoes",
      "casual-shoes",
      "formal-shoes",
      "sport-athletic-shoes",
      "heel-shoes"
    ]
  },
  sizes: {
    type: [String],
    default: [],
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);