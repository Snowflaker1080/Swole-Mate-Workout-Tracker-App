// Module imports
  // Import Express to create a router
import express from "express";
  // Import the User model to perform DB operations
import user from "../models/user.js";
  // Create a new Express router
const router = express.Router();

// READ: All Users
router.get("/", async (req, res) => {
  const users = await User.find();
  res.render("users/index", { users }); // or res.json(users);
});

// READ: Single User
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render("users/show", { user }); // or res.json(user);
});

// CREATE: Show new user form
router.get("/new", (req, res) => {
  res.render("users/new");
});

// CREATE: Submit new user form
router.post("/", async (req, res) => {
  await User.create(req.body);
  res.redirect("/users");
});

// UPDATE: Show edit form
router.get("/:id/edit", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render("users/edit", { user });
});

// UPDATE: Submit update
router.put("/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/users");
});

// DELETE: Remove user
router.delete("/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/users");
});

export default router;