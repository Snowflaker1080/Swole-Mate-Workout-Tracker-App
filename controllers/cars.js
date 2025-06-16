const express = require("express");
const router = express.Router();
const Car = require("../models/car");

// INDEX – GET /cars — show all cars
router.get("/", async (req, res) => {
  try {
    const cars = await Car.find({});
    res.render("cars/index", { cars });
  } catch (err) {
    console.error("Error fetching cars:", err);
    res.status(500).send("Internal Server Error");
  }
});

// NEW – GET /cars/new — form to create a new car
router.get("/new", (req, res) => {
  res.render("cars/new");
});

// CREATE – POST /cars — add new car to DB
router.post("/", async (req, res) => {
  try {
    const carData = {
      Name: req.body.Name,
      DisplayName: req.body.DisplayName,
      Manufacturer: req.body.Manufacturer,
      Class: req.body.Class,
      imageUrl: req.body.imageUrl,
    };

    await Car.create(carData);
    res.redirect("/cars");
  } catch (err) {
    console.error("Error creating car:", err);
    res.status(500).send("Internal Server Error");
  }
});

// SHOW – GET /cars/:id — show single car detail
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    res.render("cars/show", { car });
  } catch (err) {
    console.error("Error fetching car:", err);
    res.status(404).send("Car not found");
  }
});

// EDIT – GET /cars/:id/edit — form to edit a car
router.get("/:id/edit", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    res.render("cars/edit", { car });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(404).send("Car not found");
  }
});

// UPDATE – PUT /cars/:id — update car in DB
router.put("/:id", async (req, res) => {
  try {
    const updatedCar = {
      Name: req.body.Name,
      DisplayName: req.body.DisplayName,
      Manufacturer: req.body.Manufacturer,
      Class: req.body.Class,
      imageUrl: req.body.imageUrl,
    };

    await Car.findByIdAndUpdate(req.params.id, updatedCar);
    res.redirect(`/cars/${req.params.id}`);
  } catch (err) {
    console.error("Error updating car:", err);
    res.status(500).send("Update failed");
  }
});

// DELETE – DELETE /cars/:id — remove a car
router.delete("/:id", async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.redirect("/cars");
    console.log("DELETE request received for ID:", req.params.id);
  } catch (err) {
    console.error("Error deleting car:", err);
    res.status(500).send("Failed to delete car.");
  }
});

module.exports = router;
