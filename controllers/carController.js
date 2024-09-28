const Car = require("../models/car");

const createCar = async (req, res) => {
  try {
    const newCar = new Car(req.body);
    await newCar.save();
    res.status(201).json({ success: true, car: newCar });
  } catch (error) {
    console.error("Error creating car:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getCars = async (req, res) => {
  try {
    const cars = await Car.find({ available: true });
    res.json({ success: true, cars });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    res.json({ success: true, car });
  } catch (error) {
    console.error("Error fetching car:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createCar,
  getCars,
  getCarById,
};
