const dotenv = require("dotenv");
dotenv.config();

const Car = require("./models/car.js");
const express = require("express");
const fetch = require('node-fetch');
const isSignedIn = require("./middleware/is-signed-in");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");

const app = express();

// Set the port from environment variable or default to 3000 -ternary statement
const port = process.env.PORT ? process.env.PORT : "3000";

//view engines
app.set("view engine", "ejs"); // set the view engine to ejs
app.set("views", path.join(__dirname, "views"));

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

// Core Middleware - to serve static files from the directory
app.use(express.urlencoded({ extended: false })); // Middleware to parse URL-encoded data from forms
app.use(methodOverride("_method")); // Middleware for using HTTP verbs such as PUT or DELETE
app.use(morgan("dev")); // Morgan for logging HTTP requests
app.use(express.static(path.join(__dirname, "public"))); //## Check if required?

// Session middleware before routers
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // not saving sessions for guests to prevent db clutter
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Controllers
const authController = require("./controllers/auth.js"); // auth router holds all the auth endpoints
app.use("/auth", authController);
const carController = require("./controllers/cars");
app.use("/cars", carController); // Protect all /cars routes
const userRoutes = require("./controllers/users");
app.use("/users", userRoutes);

app.get("/gtav", async (req, res) => {
  const { class: selectedClass } = req.query;

  try {
    // Fetch all vehicles from the API
    const response = await fetch(
      "https://gtav-vehicle-database.vercel.app/api/vehicles"
    );
    let cars = await response.json();

    // add image URLs
    cars.forEach((car) => {
      car.imageUrl = `https://raw.githubusercontent.com/MericcaN41/gta5carimages/main/images/${car.Name.toLowerCase()}.png`;
    });

    // Filter if class is selected
    if (selectedClass) {
      cars = cars.filter(
        (car) => car.Class?.toLowerCase() === selectedClass.toLowerCase()
      );
    }

    // Fetch saved cars from MongoDB
    const savedCars = await Car.find({});
    const savedNames = savedCars.map((car) => car.Name); // Array of saved vehicle names
    console.log(savedNames);

    res.render("cars/gtav-index", {
      cars,
      savedNames,
      user: req.session.user || null,
    });
  } catch (err) {
    console.error("Error loading GTA V cars:", err);
    res.status(500).send("Server Error");
  }
});

app.post("/cars/save", isSignedIn, async (req, res) => {
  let { Name, DisplayName, Manufacturer, Class, imageUrl } = req.body;

  console.log("REQ.BODY:", req.body);

  if (!Name) {
    console.error("Vehicle has no Name — cannot save.");
    return res.status(400).send("Vehicle must have a Name.");
  }

  try {
    // Check if already exists in MongoDB
    const existingCar = await Car.findOne({ Name });
    if (existingCar) {
      console.log(`ℹ ${Name} already exists in the database.`);
      return res.redirect("/cars");
    }
    // Auto-fetch image if missing or blank
    if (!imageUrl && DisplayName) {
      imageUrl =
        (await getCarImageFromGoogle(DisplayName)) ||
        "/stylesheets/images/placeholder.jpg";
      console.log(`Fetched image for "${DisplayName}": ${imageUrl}`);
    }

    if (!existingCar) {
      await Car.create({ Name, DisplayName, Manufacturer, Class, imageUrl, user: req.session.user._id });
      console.log(`Saved ${Name} to your garage.`);
    } else {
      console.log(`ℹ${Name} already exists in the database.`);
    }

    res.redirect("/cars");
  } catch (err) {
    console.error("Error saving car:", err);
    res.status(500).send("Failed to save vehicle.");
  }
});

// GET /...(READ) HOMEPAGE
app.get("/", async (req, res) => {
  res.render("index.ejs", { user: req.session.user });
});

// Connect to MongoDB - folder name explicitly stated
const db_url = process.env.MONGODB_URI;

mongoose
  .connect(db_url, { dbName: "MyGarageAppUsers" })
  .then(() => {
    console.log("Connected to MongoDB MyGarageAppUsers Database");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use((req, res) => {
  res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});

// Wildcard
app.get("/*spat", async (req, res) => {
  try {
    console.warn(`Unknown route accessed: ${req.originalUrl}`);
    res.redirect("/");
  } catch (err) {
    console.error("Error handling unknown route:", err);
    res.status(500).send("Something went wrong. Please try again.");
  }
});

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
