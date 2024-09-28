const CarRental = require("../models/carRental");
const User = require("../models/user");

const createRental = async (req, res) => {
  try {
    const { carId, startDate, endDate, totalCost } = req.body;
    const userId = req.user;

    // Check if user has filled required fields
    const user = await User.findById(userId);
    if (!user.drivingLicensePhoto || !user.address || !user.mobileNumber) {
      return res.status(400).json({
        success: false,
        message: "Please complete your profile before renting a car",
        missingFields: {
          drivingLicensePhoto: !user.drivingLicensePhoto,
          address: !user.address,
          mobileNumber: !user.mobileNumber,
        },
      });
    }

    const newRental = new CarRental({
      userId,
      carId,
      startDate,
      endDate,
      totalCost,
    });

    await newRental.save();
    res.status(201).json({ success: true, rental: newRental });
  } catch (error) {
    console.error("Error creating rental:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getUserRentals = async (req, res) => {
  try {
    const userId = req.user;
    const rentals = await CarRental.find({ userId }).populate("carId");
    res.json({ success: true, rentals });
  } catch (error) {
    console.error("Error fetching user rentals:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateRentalStatus = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const { status } = req.body;
    const userId = req.user;

    const rental = await CarRental.findOneAndUpdate(
      { _id: rentalId, userId },
      { status },
      { new: true }
    );

    if (!rental) {
      return res
        .status(404)
        .json({ success: false, message: "Rental not found or unauthorized" });
    }

    res.json({ success: true, rental });
  } catch (error) {
    console.error("Error updating rental status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createRental,
  getUserRentals,
  updateRentalStatus,
};
