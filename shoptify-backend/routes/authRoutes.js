const express = require("express");
const router = express.Router();

const { signup, login, changePassword } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");


router.post("/signup", signup);
router.post("/login", login);

router.put("/change-password", authMiddleware, changePassword);

router.get("/me", authMiddleware, async (req, res) => {
  res.json(req.user);
});

module.exports = router;