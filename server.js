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

//view engines
app.set("view engine", "ejs"); // set the view engine to ejs
app.set('views', path.join(__dirname, 'views'))

//View API GTAV vehicles
app.get("/gtav/vehicles", async (req, res) => {
  try {
    const response = await fetch('https://gtav-vehicle-database.vercel.app/api/vehicles');
    const cars = await response.json();

    // Attach GitHub-hosted image URLs to each car
    cars.forEach(car => {
      car.imageUrl = `https://raw.githubusercontent.com/MericcaN41/gta5carimages/main/images/${car.Name.toLowerCase()}.png`;
      console.log(`${car.Name}: ${car.imageUrl}`);
    }); 

    console.log('Fetched GTA cars:', cars.length);
    res.render("cars/gtav-index.ejs", { cars, savedNames: [] }); // add savedNames to avoid crash
  } catch (err) {
    console.error("GTAV API error:", err);
    res.status(500).send("Error loading GTA V cars.");
  }
});

app.get('/gtav', async (req, res) => {
  const { class: selectedClass } = req.query;

  try {
    // 1. Fetch all vehicles from the API
    const response = await fetch('https://gtav-vehicle-database.vercel.app/api/vehicles');
    let cars = await response.json();

    // 2. Add image URLs
    cars.forEach(car => {
      car.imageUrl = `https://raw.githubusercontent.com/MericcaN41/gta5carimages/main/images/${car.Name.toLowerCase()}.png`;
    });

    // 3. Filter if class is selected
    if (selectedClass) {
      cars = cars.filter(car => car.Class?.toLowerCase() === selectedClass.toLowerCase());
    }

    // 4. Fetch saved cars from MongoDB
    const savedCars = await Car.find({});
    const savedNames = savedCars.map(car => car.Name); // Array of saved vehicle names

    res.render('cars/gtav-index.ejs', { cars, savedNames });
  } catch (err) {
    console.error('Error loading GTA V cars:', err);
    res.status(500).send('Server Error');
  }
});

app.post('/cars/save', async (req, res) => {
  const { Name, DisplayName, Manufacturer, Class, imageUrl } = req.body;

  if (!Name) {
    console.error("Vehicle has no Name — cannot save.");
    return res.status(400).send("Vehicle must have a Name.");
  }

  try {
    const existingCar = await Car.findOne({ Name });

    if (!existingCar) {
      await Car.create({ Name, DisplayName, Manufacturer, Class, imageUrl });
      console.log(`Saved ${Name} to your garage.`);
    } else {
      console.log(`ℹ${Name} already exists in the database.`);
    }

    res.redirect('/cars');
  } catch (err) {
    console.error('Error saving car:', err);
    res.status(500).send('Failed to save vehicle.');
  }
});

// GET /...(READ) HOMEPAGE
app.get("/", async (req, res) => {
  res.render("index.ejs");
});

// GET /cars...(READ) Local MongoDEB Cars Index
app.get('/cars', async (req, res) => {
  try {
    const cars = await Car.find({})
    res.render('cars/index', { cars })
  } catch (err) {
    console.error(err)
    res.status(500).send('Error retrieving cars from the database')
  }
})

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
  try {
    const foundCar = await Car.findById(req.params.carId);

    if (!foundCar) {
      return res.status(404).send("Car not found.");
    }

    res.render("cars/edit.ejs", { car: foundCar });
  } catch (err) {
    console.error("Error finding car:", err);
    res.status(500).send("Server error");
  }
});

// PUT /cars/:carId...(UPDATE)...UPDATE CAR DETAILS
app.put("/cars/:carId", async (req, res) => {
  try {
    // Normalise checkbox value
    req.body.typeOfCar = req.body.typeOfCar === "on";

    // Update only the fields expected in your schema
    const updatedData = {
      Name: req.body.Name,
      DisplayName: req.body.DisplayName,
      Manufacturer: req.body.Manufacturer,
      Class: req.body.Class,
      imageUrl: req.body.imageUrl,
      typeOfCar: req.body.typeOfCar
    };

    // Update the car in the database
    await Car.findByIdAndUpdate(req.params.carId, updatedData, { runValidators: true });

    // Redirect to the car's show page
    res.redirect(`/cars/${req.params.carId}`);
  } catch (err) {
    console.error("Error updating car:", err);
    res.status(500).send("Failed to update car.");
  }
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
