import WorkoutGroup from "../models/workoutGroup.js";
import GymWorkout from "../models/gymWorkout.js";

export async function index(req, res) {
  const groups = await WorkoutGroup.find({ userId: req.session.userId }).populate("exercises");

  // ProxyImageUrl to each exercise in each group
  for (const group of groups) {
    group.exercises = group.exercises.map(ex => ({
      ...ex.toObject(),
      proxyImageUrl: ex.image
    }));
  }

  res.render("workoutGroups/index", { workoutGroups: groups });
}

export async function newForm(req, res) {
  const exercises = await GymWorkout.find({ userId: req.session.userId });
  res.render("workoutGroups/new", { exercises });
}

// Create Workout Group
export async function create(req, res) {
  const { name, dayOfWeek, selectedExercises } = req.body;

  const group = new WorkoutGroup({
    name,
    dayOfWeek,
    userId: req.session.userId,
    exercises: Array.isArray(selectedExercises) ? selectedExercises : [selectedExercises],
  });

  await group.save();
  res.redirect("/gymWorkout");
}

// Render edit form
export async function editForm(req, res) {
  const group = await WorkoutGroup.findOne({
    _id: req.params.id,
    userId: req.session.userId,
  }).populate("exercises");
  if (!group) return res.status(404).send("Not found");

  // Attach proxyImageUrl
  group.exercises = group.exercises.map(ex => ({
    ...ex.toObject(),
    proxyImageUrl: ex.image
  }));

  const exercises = await GymWorkout.find({ userId: req.session.userId });
  res.render("workoutGroups/edit", { group, exercises });
}
// Handle form submission to update - "Save Changes Button"
export async function update(req, res) {
  const { name, dayOfWeek, selectedExercises } = req.body;
  const exercises = Array.isArray(selectedExercises)
    ? selectedExercises
    : [selectedExercises];
  await WorkoutGroup.findOneAndUpdate(
    { _id: req.params.id, userId: req.session.userId },
    { name, dayOfWeek, exercises }
  );
  res.redirect("/gymWorkout");
}

/* DELETE /workoutGroup/:id - Remove a workout group owned by the signed-in user */
export async function destroy(req, res) {
  try {
    await WorkoutGroup.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.userId
    });
    // send back to your list of groups
    res.redirect("/gymWorkout");
  } catch (err) {
    console.error("Workout group delete error:", err);
    res.status(500).send("Could not delete workout group");
  }
}