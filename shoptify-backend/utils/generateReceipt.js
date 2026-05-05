const PDFDocument = require("pdfkit");

const generateReceipt = (order, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt-${order._id}.pdf`
  );

  doc.pipe(res);

  // ================= HEADER =================
  doc
    .fillColor("#111")
    .fontSize(22)
    .text("SHOPTIFY", { align: "center", bold: true });

  doc
    .fontSize(10)
    .fillColor("gray")
    .text("Order Receipt", { align: "center" });

  doc.moveDown(1.5);

  // ================= ORDER INFO BOX =================
  doc
    .fillColor("#000")
    .fontSize(11)
    .text(`Order ID: ${order._id}`);

  doc.text(`Status: ${order.status.toUpperCase()}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  doc.text(
    `Paid At: ${
      order.paidAt ? new Date(order.paidAt).toLocaleString() : "N/A"
    }`
  );

  doc.moveDown(1);

  // Divider
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

  doc.moveDown(1);

  // ================= ITEMS HEADER =================
  doc
    .fontSize(12)
    .fillColor("#111")
    .text("Items Purchased", { underline: true });

  doc.moveDown(0.5);

  // ================= ITEMS TABLE HEADER =================
  doc
    .fontSize(10)
    .fillColor("gray")
    .text("Item", 50, doc.y)
    .text("Qty", 250, doc.y)
    .text("Size", 300, doc.y)
    .text("Price", 380, doc.y)
    .text("Total", 460, doc.y);

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

  doc.moveDown(0.5);

  // ================= ITEMS =================
  order.items.forEach((item) => {
    const qty = item.quantity || 1;
    const total = item.price * qty;

    const y = doc.y;

    doc
      .fillColor("#000")
      .fontSize(10)
      .text(item.name, 50, y, { width: 180 })
      .text(qty, 250, y)
      .text(item.size || "-", 300, y)
      .text(`₦${item.price.toLocaleString()}`, 380, y)
      .text(`₦${total.toLocaleString()}`, 460, y);

    doc.moveDown();
  });

  doc.moveDown(1);

  // Divider
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

  doc.moveDown(1);

  // ================= TOTAL =================
  doc
    .fontSize(12)
    .fillColor("#000")
    .text("TOTAL:", 380)
    .text(`₦${order.total.toLocaleString()}`, 460);

  doc.moveDown(2);

  // ================= FOOTER =================
  doc
    .fontSize(10)
    .fillColor("gray")
    .text("Thank you for shopping with Shoptify ❤️", {
      align: "center",
    });

  doc.text("support@shoptify.com", {
    align: "center",
  });

  doc.end();
};

module.exports = generateReceipt;