// ECMAScript Modules (ESM) syntax
// Imports
// routes/gymWorkout.js
import express from "express";
import {
  index,
  imageProxy,
  newForm,
  create,
  editForm,
  update,
  destroy,
} from "../controllers/gymWorkout.js";
import isSignedIn from "../middleware/is-signed-in.js";
import WorkoutGroup from "../models/workoutGroup.js";

const router = express.Router();

// ─── Public ────────────────────────────────────────────────────────────────────
router.get("/", index); // GET/gymWorkout - Browse/search exercises (and see saved ones)
router.get("/image-proxy", imageProxy); // GET/gymWorkout/image-proxy  Proxy image URLs

// ─── Protected ─────────────────────────────────────────────────────────────────
// All routes below require a signed-in user
router.use(isSignedIn);
router.get("/new",        newForm); // GET/gymWorkout/new - Show manual-entry form
router.post("/",          create); // POST/gymWorkout - Create a new saved workout (manual OR API)

// GET    /gymWorkout/:id/edit   Show edit form for a saved workout
// PUT    /gymWorkout/:id        Apply updates
// DELETE /gymWorkout/:id        Delete a saved workout
router.get("/:id/edit",  editForm);
router.put("/:id",       update);
router.delete("/:id",    destroy);

// ─── Drop & Drop ───────────────────────────────────────────────────────────────
// Remove one exercise from a workout-group
router.delete("/:groupId/remove-exercise", async (req, res) => {
  const { groupId } = req.params;
  const { exerciseId } = req.body;
  try {
    const group = await WorkoutGroup.findOne({
      _id: groupId,
      userId: req.session.userId,
    });
    if (!group) return res.status(404).json({ message: "Group not found" });
    group.exercises = group.exercises.filter(
      id => id.toString() !== exerciseId
    );
    await group.save();
    res.status(200).json({ message: "Exercise removed" });
  } catch (err) {
    console.error("Remove-exercise error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
