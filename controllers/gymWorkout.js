// ECMAScript Modules (ESM) syntax
import fetch from "node-fetch";
import GymWorkout from "../models/gymWorkout.js";
import WorkoutGroup from "../models/workoutGroup.js";
import { cacheToDisk } from "../services/imageCache.js";

// INDEX: Search & display workouts
async function index(req, res) {
  const queryRaw = req.query.q?.trim() || "";
  const knownBodyParts = ["Arms", "Back", "Chest", "Legs", "Shoulders", "Core"];
  let query = queryRaw;
  let bodyPart = req.query.bodyPart || "";

  // Multi-word parsing: detect body part in query string
  if (queryRaw !== "") {
    const words = queryRaw.split(/\s+/);
    const matchedPart = words.find((word) =>
      knownBodyParts.includes(
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
    );
    if (matchedPart) {
      bodyPart =
        matchedPart.charAt(0).toUpperCase() +
        matchedPart.slice(1).toLowerCase();
      query = words
        .filter((w) => w.toLowerCase() !== matchedPart.toLowerCase())
        .join(" ")
        .trim();
    }
  }

  const muscleSearch =
    req.query.muscle === "true" ||
    ["legs", "arms", "back", "core", "chest", "shoulders"].includes(
      query.toLowerCase()
    );

  let exercises = [];

  // Fetch from GymFit API
  try {
    if (query.trim() !== "") {
      if (muscleSearch) {
        // Search by muscle
        const muscleUrl = `https://gym-fit-main-868a98d.zuplo.app/v1/muscles/search?query=${query}&offset=0&number=50${bodyPart ? `&bodyPart=${bodyPart}` : ""}`;
        const response = await fetch(muscleUrl, {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": process.env.GYMFIT_API_KEY,
            "X-RapidAPI-Host": "gym-fit.p.rapidapi.com",
          },
        });
        const data = await response.json();
        exercises = Array.isArray(data) ? data : [];
      } else {
        // Search by exercise (default)
        const url = `https://gym-fit.p.rapidapi.com/v1/exercises/search?query=${query}&number=50&offset=0${bodyPart ? `&bodyPart=${bodyPart}` : ""}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": process.env.GYMFIT_API_KEY,
            "X-RapidAPI-Host": "gym-fit.p.rapidapi.com",
          },
        });
        const data = await response.json();
        exercises = Array.isArray(data.results) ? data.results : [];

        // Add proxy image URLs
        exercises = exercises.map((exercise) => ({
          ...exercise,
          proxyImageUrl:
            exercise.image && exercise.image !== "image_coming_soon"
              ? `/gymWorkout/image-proxy?url=${encodeURIComponent(exercise.image)}`
              : null,
        }));
      }
    }
  } catch (err) {
    console.error("API fetch error:", err);
  }

  // Load saved workouts, filter only those NOT already in a group
  let savedWorkouts = [];
  try {
    // Fetch all saved workouts for this user
    const savedWorkoutsRaw = await GymWorkout.find({
      userId: req.session.userId,
    });

    // Cache each one’s image to disk ONCE
    await Promise.allSettled(savedWorkoutsRaw.map((doc) => cacheToDisk(doc)));

    // Determine which are unassigned
    const groupsForFilter = await WorkoutGroup.find({
      userId: req.session.userId,
    }).populate("exercises");
    const assignedIds = new Set(
      groupsForFilter.flatMap((g) => g.exercises).map((ex) => ex._id.toString())
    );
    const unassignedRaw = savedWorkoutsRaw.filter(
      (w) => !assignedIds.has(w._id.toString())
    );

    // Map unassigned docs into plain objects for EJS,
    //    prefer local copy if present
    savedWorkouts = unassignedRaw.map((w) => {
      const local = w.localImagePath;
      return {
        ...w.toObject(),
        proxyImageUrl: local
          ? local
          : w.image && w.image !== "image_coming_soon"
            ? `/gymWorkout/image-proxy?url=${encodeURIComponent(w.image)}`
            : null,
      };
    });
  } catch (err) {
    console.error("Error loading saved workouts:", err);
    return res.status(500).send("Failed to load saved workouts");
  }

  // Render workout groups as drop zones
  let workoutGroups = await WorkoutGroup.find({ userId: req.session.userId }).populate("exercises");
  workoutGroups = workoutGroups.map(group => {
    const g = group.toObject();
    g.exercises = g.exercises.map(ex => ({
      ...ex,
      proxyImageUrl: ex.image && ex.image !== "image_coming_soon"
        ? `/gymWorkout/image-proxy?url=${encodeURIComponent(ex.image)}`
        : null
    }));
    return g;
  });

  const savedApiIds = savedWorkouts.map((w) => w.apiId);
  const searchSummary = bodyPart
    ? `Filtered by body part: ${bodyPart}`
    : `Results for: ${query}`;

  res.render("gymWorkout/index", {
    exercises,
    savedWorkouts,
    workoutGroups,
    user: req.user,
    isMuscleSearch: req.query.muscle === "true",
    hasSearched: "q" in req.query && req.query.q.trim() !== "",
    q: req.query.q || "",
    selectedBodyPart: bodyPart,
    bodyParts: knownBodyParts,
    searchSummary,
    savedApiIds,
  });
}

// IMAGE PROXY: fetches an image and streams it to the client
async function imageProxy(req, res) {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send("Image URL is required");

  try {
    const response = await fetch(imageUrl);
    if (!response.ok)
      return res.status(response.status).send("Failed to fetch image");

    const contentType = response.headers.get("content-type");
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600"); // 1 hour
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).send("Error fetching image");
  }
}

// Render new workout form
async function newForm(req, res) {
  res.render("gymWorkout/new");
}

// Create Workout
async function create(req, res) {
  const { apiId, name, bodyPart, equipment, instructions } = req.body;
  let image = req.body.image;
  if (typeof image === "object" && image !== null) image = image.url || "";
  if (typeof image !== "string") image = "";

  const existing = await GymWorkout.findOne({
    apiId,
    userId: req.session.userId,
  });
  if (existing) return res.redirect("/gymWorkout");

  await GymWorkout.create({
    apiId,
    userId: req.session.userId,
    name,
    bodyPart,
    equipment,
    instructions,
    image,
  });
  res.redirect("/gymWorkout");
}

// Edit form
async function editForm(req, res) {
  const workout = await GymWorkout.findOne({
    _id: req.params.id,
    userId: req.session.userId,
  });
  if (!workout) return res.status(404).send("Not found");
  res.render("gymWorkout/edit", { workout });
}

// Update workout
async function update(req, res) {
  const { name, bodyPart, equipment, instructions } = req.body;
  let image = req.body.image;
  if (typeof image === "object" && image !== null) image = image.url || "";
  if (typeof image !== "string") image = "";

  await GymWorkout.findOneAndUpdate(
    { _id: req.params.id, userId: req.session.userId },
    { name, bodyPart, equipment, instructions, image }
  );
  res.redirect("/gymWorkout");
}

// Delete a standalone saved workout
async function destroy(req, res) {
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
}

// Unlink one exercise from a workout-group
async function removeExerciseFromGroup(req, res) {
  const { groupId } = req.params;
  const { exerciseId } = req.body;
  try {
    const group = await WorkoutGroup.findOne({
      _id: groupId,
      userId: req.session.userId,
    });
    if (!group) return res.status(404).json({ message: "Group not found" });
    group.exercises = group.exercises.filter(
      (id) => id.toString() !== exerciseId
    );
    await group.save();
    res.status(200).json({ message: "Exercise removed" });
  } catch (err) {
    console.error("Remove-exercise error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// SAVE handler (API exercise → user’s saved collection)
async function saveApiWorkout(req, res) {
  const { apiId } = req.params;
  const { name, bodyPart, equipment, instructions } = req.body;
  let image = req.body.image;
  if (typeof image === "object" && image !== null) image = image.url || "";
  if (typeof image !== "string") image = "";

  try {
    const existing = await GymWorkout.findOne({
      apiId,
      userId: req.session.userId,
    });
    if (existing) return res.redirect("/gymWorkout");

    await GymWorkout.create({
      apiId,
      userId: req.session.userId,
      name,
      bodyPart,
      equipment,
      instructions,
      image,
    });
    res.redirect("/gymWorkout");
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).send("Failed to save workout");
  }
}

// UNSAVE handler
async function unsaveApiWorkout(req, res) {
  const { apiId } = req.params;
  try {
    await GymWorkout.findOneAndDelete({
      apiId,
      userId: req.session.userId,
    });
    res.redirect("/gymWorkout");
  } catch (err) {
    console.error("Unsave error:", err);
    res.status(500).send("Failed to remove saved workout");
  }
}

export {
  index,
  imageProxy,
  newForm,
  create,
  editForm,
  update,
  destroy,
  saveApiWorkout,
  unsaveApiWorkout,
  removeExerciseFromGroup,
};
