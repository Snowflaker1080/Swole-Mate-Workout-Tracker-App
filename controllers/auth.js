const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/user.js");

//__ROUTER__//

//--- GET sign-up form ----------------------------------------------------//
router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up");
});

// POST sign-up form
router.post("/sign-up", async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });

    if (userInDatabase) {
      return res.send(`
      <h1>Username already taken! Try again</h1>
      <p><a href="/auth/sign-up">Try Sign Up Again</a></p>
      <p><a href="/">Home</a></p>
      `);
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.send(`
    <h1>Passwords do not match! Try again</h1>
    <p><a href="/auth/sign-up">Sign Up Again</a></p>
    <p><a href="/">Home</a></p>
      `);
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10); //salting

    // pass in expected fields, avoiding full req.body
    const newUser = {
      username: req.body.username,
      password: hashedPassword,
    };

    const user = await User.create(newUser);
    res.render("auth/thank-you", { username: user.username });
  } catch (err) {
    console.error("Sign Up error", err);
    res.status(500).send("An error occurred during sign up.");
  }
});

//--- GET sign-in form ----------------------------------------------------//
router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in");
});

// POST sign-in form
router.post("/sign-in", async (req, res) => {
  const userInDatabase = await User.findOne({ username: req.body.username });

  if (!userInDatabase) {
    return res.send(`
      <h1>Sign in failed! Please try again.</h1>
      <p><a href="/auth/sign-in">Try Sign In Again</a></p>
      <p><a href="/">Home</a></p>
    `);
  }

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

  // There is a user AND they had the correct password. Time to make a session!
  // Avoid storing the password, even in hashed format, in the session
  // If there is other data you want to save to `req.session.user`, do so here!
  req.session.user = {
    username: userInDatabase.username,
    _id: userInDatabase._id,
  };

  req.session.save(() => {
    res.redirect("/");
  });
});

// GET sign-out
router.get("/sign-out", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect("/");
  });
});

module.exports = router;
