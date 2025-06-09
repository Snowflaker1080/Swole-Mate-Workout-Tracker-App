const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const morgan = require("morgan");
const Car = require("./models/car.js");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));// why is this needed?
//native fetch in Node.js is only available in ES module environments by default, unless you enable it for CommonJS.

//middleware to serve static files from the directory
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method")); // new
app.use(morgan("dev")); //new - Morgan terminal logs
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs"); // set the view engine to ejs

app.get("/gtav/vehicles", async (req, res) => {
  try {
    const response = await fetch('https://gtav-vehicle-database.vercel.app/api/vehicles');
    const cars = await response.json();

    // Attach GitHub-hosted image URLs to each car
    cars.forEach(car => {
      car.imageUrl = `https://raw.githubusercontent.com/MericcaN41/gta5carimages/main/images/${car.Name.toLowerCase()}.png`;;
    console.log(`${car.Name}: ${car.imageUrl}`);
    });

    console.log('✅ Fetched GTA cars:', cars.length);
    res.render("cars/gtav-index.ejs", { cars });
  } catch (err) {
    console.error("❌ GTAV API error:", err);
    res.status(500).send("Error loading GTA V cars.");
  }
});

// GET /...(READ) HOMEPAGE
app.get("/", async (req, res) => {
  res.render("index.ejs");
});

// GET /cars...(READ) Local MongoDEB Cars Index
app.get("/cars", async (req, res) => {
  const allCars = await Car.find();
  console.log(allCars); // log the cars!
  res.render("cars/index.ejs", { cars: allCars });
});

// GET /cars/new...(READ)..NEW CAR FORM
app.get("/cars/new", (req, res) => {
  res.render("cars/new.ejs");
});

// GET /cars/:carId...(READ)...SHOW CAR DETAILS
app.get("/cars/:carId", async (req, res) => {
  const carId = req.params.carId;
  const foundCar = await Car.findById(req.params.carId);
  res.render("cars/show.ejs", { car: foundCar });
});

// GET /cars/:carId/edit...(READ-EDIT)...EDIT CAR FORM
app.get("/cars/:carId/edit", async (req, res) => {
  const foundCar = await Car.findById(req.params.carId);
  res.render("cars/edit.ejs", { car: foundCar });
});

// PUT /cars/:carId...(UPDATE)...UPDATE CAR DETAILS
app.put("/cars/:carId", async (req, res) => {
  // Handle the 'typeOfCar' checkbox data
  if (req.body.typeOfCar === "on") {
    req.body.typeOfCar = true;
  } else {
    req.body.typeOfCar = false;
  }

  // Update the car in the database
  await Car.findByIdAndUpdate(req.params.carId, req.body);

  // Redirect to the car's show page to see the updates
  res.redirect(`/cars/${req.params.carId}`);
});

// POST /cars...(CREATE)...CREATE NEW CAR
app.post("/cars", async (req, res) => {
  if (req.body.typeOfCar === "on") {
    req.body.typeOfCar = true;
  } else {
    req.body.typeOfCar = false;
  }
  await Car.create(req.body);
  res.redirect("/cars"); // redirect to index cars
});

// DELETE /cars/:carId...(DELETE)...DELETE CAR
app.delete("/cars/:carId", async (req, res) => {

  await Car.findByIdAndDelete(req.params.carId);
  res.redirect("/cars");
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
