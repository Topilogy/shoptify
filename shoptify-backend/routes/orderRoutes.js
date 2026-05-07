const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");
const generateReceipt = require("../utils/generateReceipt");

// 👤 USER ORDERS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }); // ✅ FIXED
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 👑 ADMIN - ALL ORDERS
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔄 UPDATE ORDER STATUS (ADMIN ONLY)
router.put("/admin/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 📦 CREATE ORDER
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, total } = req.body;

    const order = await Order.create({
      items,
      total,
      status: "pending",
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const payment = response.data.data;

    if (payment.status === "success") {
      const orderId = payment.metadata.orderId;

      await Order.findByIdAndUpdate(orderId, {
        status: "paid",
        paymentRef: reference,
      });

      return res.json({ message: "Payment verified" });
    }

    res.status(400).json({ message: "Payment failed" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/receipt/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).send("Order not found");

  generateReceipt(order, res);
});

router.get("/admin/stats", async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  res.json({
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
  });
});


module.exports = router;

