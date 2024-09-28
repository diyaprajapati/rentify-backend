const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  color: { type: String },
  licensePlate: { type: String, required: true, unique: true },
  seats: { type: Number, required: true },
  fuelType: { type: String, enum: ["petrol", "diesel", "electric", "hybrid"] },
  transmission: { type: String, enum: ["manual", "automatic"] },
  pricePerDay: { type: Number, required: true },
  available: { type: Boolean, default: true },
  features: [String],
  images: [String],
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number],
  },
});

carSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Car", carSchema);
