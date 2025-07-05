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

  // Drop & drop feature - remove exercise from group.
router.post("/:groupId/remove-exercise", isSignedIn, async (req, res) => {
  const { groupId } = req.params;
  const { exerciseId } = req.body;
  try {
    const group = await WorkoutGroup.findOne({ _id: groupId, userId: req.session.userId });
    if (!group) return res.status(404).json({ message: "Group not found" });
    group.exercises = group.exercises.filter(id => id.toString() !== exerciseId);
    await group.save();
    res.status(200).json({ message: "Exercise removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

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
