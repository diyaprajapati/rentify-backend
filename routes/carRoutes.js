const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const upload = require("../utils/fileUpload");
const {
  createCar,
  updateCar,
  getCars,
  getCarById,
} = require("../controllers/carController");

router.post("/", authMiddleware, upload.multiple, createCar);
router.put("/:id", authMiddleware, upload.multiple, updateCar);
router.get("/", getCars);
router.get("/:id", getCarById);

module.exports = router;
