import WorkoutGroup from "../models/workoutGroup.js";
import GymWorkout from "../models/gymWorkout.js";

export async function index(req, res) {
  const groups = await WorkoutGroup.find({ userId: req.session.userId }).populate("exercises");
  res.render("workoutGroup/index", { groups });
}

export async function newForm(req, res) {
  const exercises = await GymWorkout.find({ userId: req.session.userId });
  res.render("workoutGroup/new", { exercises });
}

export async function create(req, res) {
  const { name, dayOfWeek, selectedExercises } = req.body;

  const group = new WorkoutGroup({
    name,
    dayOfWeek,
    userId: req.session.userId,
    exercises: Array.isArray(selectedExercises) ? selectedExercises : [selectedExercises],
  });

  await group.save();
  res.redirect("/workoutGroup");
}