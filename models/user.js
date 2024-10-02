const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  drivingLicensePhoto: { type: String },
  address: { type: String },
  mobileNumber: { type: String, unique: true },
  password: { type: String },
});

module.exports = mongoose.model("User", userSchema);
