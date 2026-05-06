const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");


// ================= INIT PAYMENT =================
router.post("/initialize", async (req, res) => {
  try {
    const { email, amount, orderId } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        metadata: { orderId },
        callback_url: "https://shoptify-weardrop.vercel.app/success",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    return res.json(response.data);
  } catch (err) {
    console.log("PAYSTACK ERROR:", err.response?.data || err.message);

    return res.status(500).json({
      message: "Payment service unstable, try again later",
      error: err.response?.data || err.message,
    });
  }
});

// ================= VERIFY PAYMENT =================
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

    if (payment.status !== "success") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    const orderId = payment.metadata.orderId;
    const order = await Order.findById(orderId);

    // ✅ Prevent duplicate payment
    if (order.status === "paid") {
      return res.json({ message: "Order already paid", order });
    }

    // ✅ Update order
    order.status = "paid";
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentReference = reference;

    await order.save(); // 🔥 IMPORTANT

    // ✅ Send email
    await sendEmail({
      to: payment.customer.email,
      subject: "Your Shoptify Order Receipt",
      html: `
        <div style="font-family: Arial; padding:20px">
            <h2 style="color: green;">Payment Successful 🎉</h2>
            <p>Hi ${payment.customer.email},</p>

            <p>Your order has been confirmed.</p>

            <hr/>

            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total:</strong> ₦${order.total}</p>
            <p><strong>Status:</strong> ${order.status}</p>

            <hr/>

            <p>Thanks for shopping with <b>Shoptify</b> 🛍️</p>
        </div>
        `,
    });

    console.log("📧 Receipt email sent");

    return res.json({
      message: "Payment verified & order updated",
      order,
    });
  } catch (err) {
    console.log("VERIFY ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "Verification failed" });
  }
});


// ================= WEBHOOK (FINAL VERSION) =================
router.post(
  "/webhook",
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
        const payment = event.data;
        const orderId = payment.metadata.orderId;

        const order = await Order.findById(orderId);

        if (order && order.status !== "paid") {
          order.status = "paid";
          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentReference = payment.reference;

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





module.exports = router;