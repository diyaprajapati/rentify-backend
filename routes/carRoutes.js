const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const roleAuth = require("../middleware/roles");
const upload = require("../utils/fileUpload");
const {
  createCar,
  updateCar,
  getCars,
  getCarById,
} = require("../controllers/carController");

router.post(
  "/",
  authMiddleware,
  roleAuth(["admin"]),
  upload.multiple,
  createCar
);
router.put(
  "/:id",
  authMiddleware,
  roleAuth(["admin"]),
  upload.multiple,
  updateCar
);
router.get("/", getCars);
router.get("/:id", getCarById);

module.exports = router;
