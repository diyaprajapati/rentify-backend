const Car = require("../models/car");

const createCar = async (req, res) => {
  try {
    const carData = req.body;

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      carData.images = req.files.map((file) => {
        return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      });
    }

    const newCar = new Car(carData);
    await newCar.save();
    res.status(201).json({ success: true, car: newCar });
  } catch (error) {
    console.error("Error creating car:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateCar = async (req, res) => {
  try {
    const carId = req.params.id;
    const updateData = req.body;

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => {
        return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      });
    }

    const updatedCar = await Car.findByIdAndUpdate(carId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCar) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    res.json({ success: true, car: updatedCar });
  } catch (error) {
    console.error("Error updating car:", error);
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
  updateCar,
  getCars,
  getCarById,
};
