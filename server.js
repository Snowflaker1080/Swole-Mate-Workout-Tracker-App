// ECMAScript Modules (ESM) syntax
// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Module imports
import express from "express";
import fetch from "node-fetch";
import methodOverride from "method-override";
import mongoose from"mongoose";
import morgan from"morgan";
import path from"path";
import session from "express-session";
import MongoStore from "connect-mongo";

// Import ESM-compatible helpers for __dirname resolution
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MongoDB connection - folder name explicitly stated
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

// Express port setup - environment variable or default to 3000 - (ternary statement)
const app = express();
const port = process.env.PORT || 3000;

// View engines
app.set("view engine", "ejs"); // set view engine to ejs
app.set("views", path.join(__dirname, "views"));

// Core Middleware - to serve static files from the directory
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve images, CSS, JS
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data from forms
app.use(methodOverride("_method")); // Middleware for using HTTP verbs such as PUT or DELETE
app.use(morgan("dev")); // Morgan for logging HTTP requests

// Session configuration for auth - Session middleware before routers 
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: db_url,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Middleware to pass user to views
// Always AFTER session middleware & before routes to access user
import passUserToView from "./middleware/pass-user-to-view.js";
app.use(passUserToView); 
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Route connections
import authController from "./controllers/auth.js"; // auth router holds all the auth endpoints
import fitnessGoalsRoutes from "./routes/fitnessGoals.js";
import gymWorkoutRoutes from "./routes/gymWorkout.js";
import isSignedIn from "./middleware/is-signed-in.js";
import userRoutes from "./controllers/users.js";

app.use("/auth", authController);
app.use("/fitnessGoals", fitnessGoalsRoutes);
app.use("/gymWorkout", gymWorkoutRoutes);
app.use("/users", userRoutes);

// GET - HOMEPAGE
app.get("/", async (req, res) => {
  res.render("index.ejs", { user: req.session.user });
});

// Wildcard handler
app.get("/*spat", async (req, res) => {
  try {
    console.warn(`Unknown route accessed: ${req.originalUrl}`);
    res.redirect("/");
  } catch (err) {
    console.error("Error handling unknown route:", err);
    res.status(500).send("Something went wrong. Please try again.");
  }
});

// Error handling fallback
app.use((req, res) => {
  console.warn(`Unknown route accessed: ${req.originalUrl}`);
  res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});

// Server listener
app.listen(port, () => {
  console.log(`The express app/server is ready on http://localhost:${port}`);
});
