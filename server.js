const dotenv = require("dotenv");
dotenv.config();
const express = require('express');

const app = express();
const methodOverride = require("method-override"); // new
const mongoose = require("mongoose");
const morgan = require("morgan"); //new
const path = require("path");

// Import the Car model
const Car = require("./models/car.js");

//middleware
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method")); // new
 // app.use(morgan('dev'));
app.use(morgan("dev")); //new - Morgan terminal logs
app.use(express.static(path.join(__dirname, "public")));


// GET /...(READ)
app.get("/", async (req, res) => {
  res.render("index.ejs");
});

// GET /cars...(READ)
app.get("/cars", async (req, res) => {
  const allCars = await Car.find();
  res.render("cars/index.ejs", { cars: allCars });
});

// GET /cars/new...(READ)
app.get("/cars/new", (req, res) => {
  res.render("cars/new.ejs");
});

// GET /cars/:carId...(READ)
app.get("/cars/:carId", async (req, res) => {
  const foundCar = await Car.findById(req.params.carId);
  res.render("cars/show.ejs", { car: foundCar });
});

// GET /cars/:carId/edit...(READ-EDIT)
app.get("/cars/:carId/edit", async (req, res) => {
  const foundCar = await Car.findById(req.params.fruitId);
  res.render("cars/edit.ejs", {
    car: foundCar,
  });
});

// POST /cars...(CREATE)
app.post("/cars", async (req, res) => {
  if (req.body.typeOfCar === "on") {
    req.body.typeOfCar = true;
  } else {
    req.body.typeOfCar = false;
  }
  await Car.create(req.body);
  res.redirect("/cars"); // redirect to index cars
});

// DELETE /cars/:carId...(DELETE)
app.delete("/cars/:carId", async (req, res) => {
  await Fruit.findByIdAndDelete(req.params.fruitId);
  res.redirect("/cars");
});

// PUT /cars/:carId...(UPDATE)
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



mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});