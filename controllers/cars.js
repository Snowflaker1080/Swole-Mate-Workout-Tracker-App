const express = require("express");
const router = express.Router();
const Car = require("../models/car");
const isSignedIn = require("../middleware/is-signed-in");

const fetch = require('node-fetch');

const getCarImageFromGoogle = async (displayName) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  try {
    const query = encodeURIComponent(`${displayName} car`);
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&cx=${cx}&searchType=image&num=1&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.items?.[0]?.link || null;
  } catch (err) {
    console.error("Google CSE image fetch failed:", err);
    return null;
  }
};

// INDEX – GET /cars — show all cars
router.get("/", isSignedIn,  async (req, res) => {
  try {
    const cars = await Car.find({ user: req.session.user._id });
    res.render("cars/index", { cars });
  } catch (err) {
    console.error("Error fetching cars:", err);
    res.status(500).send("Internal Server Error");
  }
});

// NEW – GET /cars/new — form to create a new car
router.get("/new", async (req, res) => {
  const displayName = req.query.displayName || "";
  let imageUrl = "";

  if (displayName) {
    imageUrl = await getCarImageFromGoogle(displayName);
  }

  res.render("cars/new", { imageUrl, displayName });
});

// GET Image
router.get("/image", async (req, res) => {
  const displayName = req.query.displayName;
  if (!displayName) return res.json({ imageUrl: "" });

  try {
    const imageUrl =
      (await getCarImageFromGoogle(displayName)) ||
      "/stylesheets/images/placeholder.jpg";
    res.json({ imageUrl });
  } catch (err) {
    console.error("Image preview fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});


// CREATE – POST /cars — add new car to DB
router.post("/", isSignedIn, async (req, res) => {
  let { Name, DisplayName, Manufacturer, Class, imageUrl } = req.body;

  try {
    if (!Name || !DisplayName || !Manufacturer) {
      return res.status(400).send("Missing required fields.");
    }

     if (!imageUrl && DisplayName) {
      imageUrl =
        (await getCarImageFromGoogle(DisplayName)) ||
        "/stylesheets/images/placeholder.jpg";
    }


    await Car.create({ Name, DisplayName, Manufacturer, Class, imageUrl, user: req.session.user._id, });
   console.log(`Custom car "${DisplayName}" added by ${req.session.user.username}`);
    res.redirect("/cars");
  } catch (err) {
    console.error("Failed to save custom car:", err);
    res.status(500).send("Failed to save car.");
  }
});

// SHOW – GET /cars/:id — show single car detail
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car || car.user.toString() !== req.session.user._id) {
      return res.status(403).send("Access denied");
    }

    res.render("cars/show", { car });
  } catch (err) {
    console.error("Error fetching car:", err);
    res.status(404).send("Car not found");
  }
});

// EDIT – GET /cars/:id/edit — form to edit a car
router.get("/:id/edit", isSignedIn, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
     if (!car || car.user.toString() !== req.session.user._id) {
      return res.status(403).send("Access denied.");
    }

    res.render("cars/edit", { car });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(404).send("Car not found");
  }
});

// UPDATE – PUT /cars/:id — update car in DB
router.put("/:id", isSignedIn, async (req, res) => {
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
router.delete("/:id", isSignedIn, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
     if (!car || car.user.toString() !== req.session.user._id) {
      return res.status(403).send("Access denied.");
    }

    await Car.findByIdAndDelete(req.params.id);
    console.log(`Car deleted by ${req.session.user.username}: ID ${req.params.id}`);
    res.redirect("/cars");
  } catch (err) {
    console.error("Error deleting car:", err);
    res.status(500).send("Failed to delete car.");
  }
});

module.exports = router;
