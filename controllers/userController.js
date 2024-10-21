const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const signinController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error("Error in signin:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const signupController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user;
    const { address, mobileNumber } = req.body;
    let drivingLicensePhoto = null;

    if (req.file) {
      const base64Image = req.file.buffer.toString("base64");
      drivingLicensePhoto = `data:${req.file.mimetype};base64,${base64Image}`;
    }

    const updateData = {
      address,
      mobileNumber,
      ...(drivingLicensePhoto && { drivingLicensePhoto }),
    };

    const updatedUser = await User.findByIdAndUpdate(userId.user, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId.userId).select(
      "-googleId -password"
    );
    console.log(user);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  signinController,
  signupController,
  updateUserProfile,
  getUserProfile,
};
