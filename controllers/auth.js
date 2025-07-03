// Imports
  // Import Express to create a router
import express from "express";
  // Import bcrypt fro password hashing and verificaiton
import bcrypt from "bcrypt";
  // Import User model from database
import User from "../models/user.js";

// Initialise the router object for defining auth-related routes
const router = express.Router();

// Route: GET /auth/sign-up - Purpose: Render the sign-up form to the user
router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up");
});

// Route: POST /auth/sign-up - Purpose: Handle form submission for new user registration
router.post("/sign-up", async (req, res) => {
  try {
      // Check if the username is already taken
    const userInDatabase = await User.findOne({ username: req.body.username });

    if (userInDatabase) {
      return res.send(`
      <h1>Username already taken! Try again</h1>
      <p><a href="/auth/sign-up">Try Sign Up Again</a></p>
      <p><a href="/">Home</a></p>
      `);
    }
      // Ensure passwords match
    if (req.body.password !== req.body.confirmPassword) {
      return res.send(`
    <h1>Passwords do not match! Try again</h1>
    <p><a href="/auth/sign-up">Sign Up Again</a></p>
    <p><a href="/">Home</a></p>
      `);
    }

     // Hash the password before storing
    const hashedPassword = bcrypt.hashSync(req.body.password, 10); //salting

    // Pass in expected fields, avoiding full req.body. Prepare user object with only required fields
    const newUser = {
      username: req.body.username,
      password: hashedPassword,
    };

     // Save user to the database
    const user = await User.create(newUser);

     // Show thank-you page with their username
    res.render("auth/thank-you", { username: user.username });
  } catch (err) {
    console.error("Sign Up error", err);
    res.status(500).send("An error occurred during sign up.");
  }
});

// Route: GET /auth/sign-in - Purpose: Render the sign-in form
router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in");
});

// Route: POST /auth/sign-in - Purpose: Authenticate user credentials
router.post("/sign-in", async (req, res) => {
  // Find the user in the database
  const userInDatabase = await User.findOne({ username: req.body.username });

  if (!userInDatabase) {
    return res.send(`
      <h1>Sign in failed! Please try again.</h1>
      <p><a href="/auth/sign-in">Try Sign In Again</a></p>
      <p><a href="/">Home</a></p>
    `);
  }
  // Validate password using bcrypt
  const validPassword = bcrypt.compareSync(
    req.body.password,
    userInDatabase.password
  );
  if (!validPassword) {
    return res.send(`
      <h1>Sign in failed! Please try again.</h1>
      <p><a href="/auth/sign-in">Try Sign In Again</a></p>
      <p><a href="/">Home</a></p>
    `);
  }

  // Store the user's _id in the session
  req.session.userId = userInDatabase._id;

  // Store username for quick access in views
  req.session.user = {
    username: userInDatabase.username,
  };

  // Save session and redirect to homepage
  req.session.save(() => {
    res.redirect("/");
  });
});

// Route: GET /auth/sign-out - Purpose: Destroy the session and log the user out
router.get("/sign-out", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect("/");
  });
});

// Export the router so it can be used in server.js
export default router;

