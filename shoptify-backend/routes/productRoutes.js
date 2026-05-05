const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory, // ✅ add this
} = require("../controllers/productController");

// ✅ CATEGORY ROUTE (MUST COME FIRST)
router.get("/category/:categoryName", getProductsByCategory);

// CRUD Routes
router.get("/", getProducts); // Read all products
router.get("/:id", getProductById); // Read single product
router.post("/", createProduct); // Create product
router.put("/:id", updateProduct); // Update product
router.delete("/:id", deleteProduct); // Delete product

module.exports = router;