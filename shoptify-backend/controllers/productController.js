const Product = require("../models/Product");

// GET all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().select("name price discount oldPrice image category description");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE new product
exports.createProduct = async (req, res) => {
  try {
    console.log("REQ BODY (CREATE):", req.body);

    const { name, price, discount, image, description, category } = req.body;

    // 🔥 VALIDATION (THIS FIXES YOUR 400 ERROR)
    if (!name || !price || !image || !category) {
      return res.status(400).json({
        message: "Name, price, image, and category are required",
      });
    }

    let oldPrice = null;

    if (discount && discount > 0) {
      oldPrice = Math.round(price / (1 - discount / 100));
    }

    const product = new Product({
      name,
      price,
      discount,
      oldPrice,
      image,
      description,
      category,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);

  } catch (error) {
    console.log("CREATE PRODUCT ERROR:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// UPDATE product by ID
exports.updateProduct = async (req, res) => {
  try {
    // console.log("REQ BODY (UPDATE):", req.body);
    const { price, discount, oldPrice, ...rest } = req.body;

    let updateData = { ...rest, price, discount };

    // ✅ Only calculate if discount is provided
    if (discount && discount > 0) {
      updateData.oldPrice = Math.round(price / (1 - discount / 100));
    } else {
      updateData.oldPrice = null;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // console.log("UPDATED PRODUCT:", updatedProduct);

    res.json(updatedProduct);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.categoryName;

    const products = await Product.find({
      category: category,
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching category products",
      error,
    });
  }
};