import express from "express";
import User from "../models/user.js";

const router = express.Router();

// READ: All Users
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    res.render("users/index", { users });
  } catch (err) {
    next(err);
  }
});

// READ: Single User
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.redirect("/users");
    res.render("users/show", { user });
  } catch (err) {
    next(err);
  }
});

// CREATE: show form
router.get("/new", (req, res) => {
  res.render("users/new");
});

// CREATE: submit form
router.post("/", async (req, res, next) => {
  try {
    await User.create(req.body);
    res.redirect("/users");
  } catch (err) {
    next(err);
  }
});

// EDIT form
router.get("/:id/edit", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.redirect("/users");
    res.render("users/edit", { user });
  } catch (err) {
    next(err);
  }
});

// UPDATE
router.put("/:id", async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/users");
  } catch (err) {
    next(err);
  }
});

// DELETE
router.delete("/:id", async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect("/users");
  } catch (err) {
    next(err);
  }
});

export default router;