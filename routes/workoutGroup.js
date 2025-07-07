import express from "express";
import * as groupController from "../controllers/workoutGroup.js";
import isSignedIn from "../middleware/is-signed-in.js";
import WorkoutGroup from "../models/workoutGroup.js";

const router = express.Router();

router.get("/", isSignedIn, groupController.index);
router.get("/new", isSignedIn, groupController.newForm);
router.post("/", isSignedIn, groupController.create);

router.post("/:groupId/add-exercise", isSignedIn, async (req, res) => {
  const { groupId } = req.params;
  const { exerciseId } = req.body;
  try {
    const group = await WorkoutGroup.findOne({
      _id: groupId,
      userId: req.session.userId,
    });
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.exercises.includes(exerciseId)) {
      group.exercises.push(exerciseId);
      await group.save();
    }

    res.status(200).json({ message: "Exercise added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
