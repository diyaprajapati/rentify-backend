const mongoose = require("mongoose");

const carRentalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paymentReferenceNumber: {
    type: String,
    default: null,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
});

module.exports = mongoose.model("CarRental", carRentalSchema);
