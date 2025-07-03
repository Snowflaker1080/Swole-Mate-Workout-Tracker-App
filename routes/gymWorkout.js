// ECMAScript Modules (ESM) syntax
// Imports
import express from "express";
import {
  index,
  imageProxy,
  newForm,
  create,
  editForm,
  update,
} from "../controllers/gymWorkout.js";

import isSignedIn from "../middleware/is-signed-in.js";
import GymWorkout from "../models/gymWorkout.js";

const router = express.Router();

// Public route
router.get("/", index); // Exercise search visible to all

// Protected routes
router.get("/new", isSignedIn, newForm);
router.post("/", isSignedIn, create);
router.get("/:id/edit", isSignedIn, editForm);
router.post("/:id", isSignedIn, update);
router.delete("/:id", async (req, res) => {
  try {
    await GymWorkout.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.userId,
    });
    res.redirect("/gymWorkout");
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("Failed to delete workout.");
  }
});

// Proxy image fetch
router.get("/image-proxy", imageProxy);

export default router;
