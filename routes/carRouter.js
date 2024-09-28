const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  createCar,
  getCars,
  getCarById,
} = require("../controllers/carController");

router.post("/", authMiddleware, createCar);
router.get("/", getCars);
router.get("/:id", getCarById);

module.exports = router;
