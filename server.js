const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const fetch = require("node-fetch");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const authController = require("./controllers/auth.js"); // auth router holds all the auth endpoints
const isSignedIn = require("./middleware/is-signed-in");
const passUserToView = require("./middleware/pass-user-to-view");

// Connect to MongoDB - folder name explicitly stated
const db_url = process.env.MONGODB_URI;

mongoose
  .connect(db_url, { dbName: "SwoleMateApp" })
  .then(() => {
    console.log("Connected to MongoDB SwoleMateApp Database");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

const app = express();

// Set the port from environment variable or default to 3000 -ternary statement
const port = process.env.PORT ? process.env.PORT : "3000";

//view engines
app.set("view engine", "ejs"); // set the view engine to ejs
app.set("views", path.join(__dirname, "views"));

// Core Middleware - to serve static files from the directory
app.use(express.static(path.join(__dirname, "public"))); //## Check if required?
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data from forms
app.use(methodOverride("_method")); // Middleware for using HTTP verbs such as PUT or DELETE
app.use(morgan("dev")); // Morgan for logging HTTP requests

// Session middleware before routers
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: db_url,
      collectionName: "sessions", // optional
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use(passUserToView); // Always AFTER session middleware

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Controllers

const fitnessGoalsRoutes = require("./routes/fitnessGoals");
app.use("/fitnessGoals", fitnessGoalsRoutes);

const userRoutes = require("./controllers/users");
app.use("/users", userRoutes);

// GET /...(READ) HOMEPAGE
app.get("/", async (req, res) => {
  res.render("index.ejs", { user: req.session.user });
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
