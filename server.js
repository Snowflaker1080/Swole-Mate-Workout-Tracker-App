const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const morgan = require("morgan");
const Car = require("./models/car.js");


//middleware to serve static files from the directory
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method")); // new
app.use(morgan("dev")); //new - Morgan terminal logs
app.use(express.static(path.join(__dirname, "public")));

//view engines
app.set("view engine", "ejs"); // set the view engine to ejs
app.set('views', path.join(__dirname, 'views'))

// Connection routes after middleware
const carController = require("./controllers/cars");
app.use("/cars", carController);

app.get('/gtav', async (req, res) => {
  const { class: selectedClass } = req.query;

  try {
    // Fetch all vehicles from the API
    const response = await fetch('https://gtav-vehicle-database.vercel.app/api/vehicles');
    let cars = await response.json();

    // add image URLs
    cars.forEach(car => {
      car.imageUrl = `https://raw.githubusercontent.com/MericcaN41/gta5carimages/main/images/${car.Name.toLowerCase()}.png`;
    });

    // Filter if class is selected
    if (selectedClass) {
      cars = cars.filter(car => car.Class?.toLowerCase() === selectedClass.toLowerCase());
    }

    // Fetch saved cars from MongoDB
    const savedCars = await Car.find({});
    const savedNames = savedCars.map(car => car.Name); // Array of saved vehicle names
    console.log(savedNames);
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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use((req, res) => {
  res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
