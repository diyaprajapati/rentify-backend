const CarRental = require("../models/car-rent");
const User = require("../models/user");
const Car = require("../models/car");

const createRental = async (req, res) => {
  try {
    const { carId, startDate, endDate, totalCost } = req.body;
    const userId = req.user.userId;

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

    // Check if car is available
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(400).json({
        success: false,
        message: "Car is not available for rent",
      });
    }
    // Check if the car is already booked for the given dates
    const existingRental = await CarRental.findOne({
      carId,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    if (existingRental) {
      return res.status(400).json({});
    }
    // calculate the cost of the rental
    const rentalDays =
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
    const rentalCost = rentalDays * car.pricePerDay;

    // Create new rental
    const newRental = new CarRental({
      userId,
      carId,
      startDate,
      endDate,
      totalCost: rentalCost,
    });

    // Update car availability

    await newRental.save();
    res.status(201).json({ success: true, rental: newRental });
  } catch (error) {
    console.error("Error creating rental:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getUserRentals = async (req, res) => {
  try {
    const userId = req.user.userId;
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

    // If rental is completed or cancelled, make the car available again
    if (status === "completed" || status === "cancelled") {
      await Car.findByIdAndUpdate(rental.carId, { available: true });
    }

    res.json({ success: true, rental });
  } catch (error) {
    console.error("Error updating rental status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const { paymentReferenceNumber } = req.body;
    const userId = req.user.userId;

    if (!paymentReferenceNumber) {
      return res.status(400).json({
        success: false,
        message: "Payment reference number is required",
      });
    }

    const rental = await CarRental.findOneAndUpdate(
      { _id: rentalId, userId },
      { paymentReferenceNumber }
    );

    if (!rental) {
      return res
        .status(404)
        .json({ success: false, message: "Rental not found or unauthorized" });
    }
    if (rental.paymentReferenceNumber) {
      return res
        .status(400)
        .json({ success: false, message: "Payment already made" });
    }
    if (rental.paymentStatus === "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Payment already made" });
    }

    res.json({ success: true, rental });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const carRentalDashboard = async (req, res) => {
  try {
    // Get total rentals
    const totalRentals = await CarRental.countDocuments();

    // Get active rentals (assuming 'confirmed' status means active)
    const activeRentals = await CarRental.countDocuments({
      status: "confirmed",
    });

    // Get total revenue
    const revenue = await CarRental.aggregate([
      { $group: { _id: null, total: { $sum: "$totalCost" } } },
    ]);

    // Get recent rentals
    const recentRentals = await CarRental.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name")
      .populate("carId", "model");

    // Get rental data for the past 7 months
    const rentalData = await CarRental.aggregate([
      {
        $group: {
          _id: { $month: "$startDate" },
          rentals: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 7 },
    ]);

    // Get revenue data for the past 7 months
    const revenueData = await CarRental.aggregate([
      {
        $group: {
          _id: { $month: "$startDate" },
          revenue: { $sum: "$totalCost" },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 7 },
    ]);

    // Get top rented cars
    const topRentedCars = await CarRental.aggregate([
      { $group: { _id: "$carId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "cars",
          localField: "_id",
          foreignField: "_id",
          as: "carDetails",
        },
      },
      { $unwind: "$carDetails" },
      {
        $project: {
          _id: 0,
          model: { $concat: ["$carDetails.make", " ", "$carDetails.model"] },
          rentals: "$count",
        },
      },
    ]);
    console.log(topRentedCars);

    // Prepare the response
    const dashboardData = {
      totalRentals,
      activeRentals,
      revenue: revenue[0]?.total || 0,
      recentRentals: recentRentals.map((rental) => ({
        id: rental._id,
        user: rental.userId.name,
        car: rental.carId.model,
        startDate: rental.startDate,
        endDate: rental.endDate,
        status: rental.status,
      })),
      rentalData: rentalData.map((data) => ({
        name: new Date(2023, data._id - 1).toLocaleString("default", {
          month: "short",
        }),
        rentals: data.rentals,
      })),
      revenueData: revenueData.map((data) => ({
        name: new Date(2023, data._id - 1).toLocaleString("default", {
          month: "short",
        }),
        revenue: data.revenue,
      })),
      topRentedCars,
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching dashboard data" });
  }
};

module.exports = {
  createRental,
  getUserRentals,
  updateRentalStatus,
  updatePaymentStatus,
  carRentalDashboard,
};
