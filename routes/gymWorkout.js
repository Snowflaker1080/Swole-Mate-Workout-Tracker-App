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
  destroy,
  saveApiWorkout,
  unsaveApiWorkout,
} from "../controllers/gymWorkout.js";

import isSignedIn from "../middleware/is-signed-in.js";
import GymWorkout from "../models/gymWorkout.js";

const router = express.Router();

// Public routes
router.get("/", index); // Exercise search visible to all
router.get("/image-proxy", imageProxy); // Proxy image fetch

// Protected routes
router.get("/new", isSignedIn, newForm);                 // GET /gymWorkout/new — Render form
router.post("/", isSignedIn, create);                    // POST /gymWorkout — Save manually created workout
router.get("/:id/edit", isSignedIn, editForm);           // GET /gymWorkout/:id/edit — Edit a saved workout
router.put("/:id", isSignedIn, update);                  // PUT /gymWorkout/:id — Update workout
router.delete("/:id", isSignedIn, destroy);              // DELETE /gymWorkout/:id — Delete saved workout

// Save/Unsave searched workouts from API (by apiId)
router.post("/:apiId/save", isSignedIn, saveApiWorkout);        // POST /gymWorkout/:apiId/save — Save a searched workout
router.delete("/:apiId/save", isSignedIn, unsaveApiWorkout);    // DELETE /gymWorkout/:apiId/save — Unsave it

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


export default router;
