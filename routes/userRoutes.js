const express = require("express");
const {
  signinController,
  signupController,
  updateUserProfile,
  getUserProfile,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const upload = require("../utils/fileUpload");

const router = express.Router();

router.post("/signin", signinController);
router.post("/signup", signupController);
router.put("/profile", authMiddleware, upload.single, updateUserProfile);
router.get("/profile", authMiddleware, getUserProfile);

module.exports = router;
