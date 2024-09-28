const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  createRental,
  getUserRentals,
  updateRentalStatus,
} = require("../controllers/carRentalController");

router.post("/", authMiddleware, createRental);
router.get("/user", authMiddleware, getUserRentals);
router.put("/:rentalId/status", authMiddleware, updateRentalStatus);

module.exports = router;
