// ECMAScript Modules (ESM) syntax

// Load env
import dotenv from "dotenv";
dotenv.config();

// Core Module imports
import express from "express";
import methodOverride from "method-override";
import mongoose from"mongoose";
import morgan from"morgan";
import path from"path";
import session from "express-session";
import MongoStore from "connect-mongo";
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import ESM-compatible helpers for __dirname resolution
import { dirname } from "path";

// Express port setup - environment variable or default to 3000 - (ternary statement)
const app = express();
const port = process.env.PORT || 3000;

// View engines
app.set("view engine", "ejs"); // set view engine to ejs
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public"))); // serve images, CSS, JS

// Core Middleware - to serve static files from the directory
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data from forms
app.use(methodOverride("_method")); // Middleware for using HTTP verbs such as PUT or DELETE
app.use(morgan("dev")); // Morgan for logging HTTP requests

// Required config guards (fail fast on Heroku)
const mongoUrl = process.env.MONGODB_URI;
if (!mongoUrl) {
  console.error('MONGODB_URI is missing — set it in Heroku Config Vars.');
  process.exit(1);
}
if (!process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET is missing — set it in Heroku Config Vars.');
  process.exit(1);
}

// Connect MongoDB (single connection)
try {
  await mongoose.connect(mongoUrl, { dbName: 'SwoleMateApp' });
  console.log('Connected to MongoDB SwoleMateApp Database');
} catch (err) {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}
mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${mongoose.connection.name}`);
});

// Sessions using the existing Mongoose client
let sessionStore;
try {
  sessionStore = MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: 'sessions',
  });
  console.log('Mongo session store initialised');
} catch (err) {
  console.error('Failed to create Mongo session store:', err);
  process.exit(1);
}

// Session configuration for auth - Session middleware before routers 
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
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
import exerciseTemplatesRouter  from './routes/exerciseTemplates.js'
import fitnessGoalsRoutes from "./routes/fitnessGoals.js";
import gymWorkoutRoutes from "./routes/gymWorkout.js";
import imageProxyRoutes from "./routes/imageProxy.js";
import scheduleRoutes from "./routes/schedule.js";
import userRoutes from "./routes/users.js";
import workoutGroupRoutes from "./routes/workoutGroup.js";
import workoutTemplatesRouter   from './routes/workoutTemplates.js'

app.use("/auth", authController);
app.use('/exerciseTemplates', exerciseTemplatesRouter)
app.use("/fitnessGoals", fitnessGoalsRoutes);
app.use("/gymWorkout", gymWorkoutRoutes);
app.use("/proxy", imageProxyRoutes); // Image Proxy Route
app.use("/schedule", scheduleRoutes);
app.use("/users", userRoutes);
app.use("/workoutGroup", workoutGroupRoutes);
app.use('/workoutTemplates', workoutTemplatesRouter)

// GET - HOMEPAGE
app.get("/", async (req, res) => {
  res.render("index.ejs", { user: req.session.user });
});

// Wildcard handler
app.get("/{*spat}", async (req, res) => {
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

// // Catch-all
app.get('{*}', (_req, res) => res.redirect('/'));

// 404 fallback (unreached if you redirect *)
app.use((req, res) => res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`));

// Server listener
app.listen(port, '0.0.0.0', () => {
  console.log(`Server ready on ${port}`);
});
