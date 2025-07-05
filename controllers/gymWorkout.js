// ECMAScript Modules (ESM) syntax
import fetch from "node-fetch";
import GymWorkout from "../models/gymWorkout.js";
import WorkoutGroup from "../models/workoutGroup.js";

// INDEX: Search & display workouts
async function index(req, res) {
  const query = req.query.q || "";
  const bodyPart = req.query.bodyPart || "";
  const muscleSearchh = req.query.muscle === "true"; // Muscle search
  let exercises = [];

  try {
    if (muscleSearchh) {
      // Search by muscle
      const muscleUrl = `https://gym-fit-main-868a98d.zuplo.app/v1/muscles/search?query=${query}&offset=0&number=50${bodyPart ? `&bodyPart=${bodyPart}` : ""}`;

      const response = await fetch(muscleUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.GYMFIT_API_KEY}`,
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
            ? `/image-proxy?url=${encodeURIComponent(exercise.image)}`
            : null,
      }));
    }
  } catch (err) {
    console.error("API fetch error:", err);
  }

  // Load saved workouts and add proxy image URLs
  let savedWorkouts = [];
  try {
    const savedWorkoutsRaw = await GymWorkout.find({
      userId: req.session.userId,
    });
    savedWorkouts = savedWorkoutsRaw.map((w) => ({
      ...w.toObject(),
      proxyImageUrl:
        w.image && w.image !== "image_coming_soon"
          ? `/image-proxy?url=${encodeURIComponent(w.image)}`
          : null,
    }));
  } catch (err) {
    console.error("Error loading saved workouts:", err);
    res.status(500).send("Failed to load saved workouts");
  }

  // Render workout groups as drop zones
  const workoutGroups = await WorkoutGroup.find({ userId: req.session.userId }).populate("exercises");

  res.render("gymWorkout/index", {
    exercises,
    savedWorkouts,
    workoutGroups,
    user: req.user,
    isMuscleSearch: req.query.muscle === "true", 
  });
}

// Image Proxy
async function imageProxy(req, res) {
  const imageUrl = req.query.url;

  if (!imageUrl) {
    return res.status(400).send("Image URL is required");
  }

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch image");
    }

    const contentType = response.headers.get("content-type");

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

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
  // If image is an object (e.g., { url: ... }), extract the URL
  if (typeof image === "object" && image !== null) {
    image = image.url || "";
  }
  // If image is not a string, set it to an empty string
  if (typeof image !== "string") {
    image = "";
  }
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

// Edit Form
async function editForm(req, res) {
  const workout = await GymWorkout.findOne({
    _id: req.params.id,
    userId: req.session.userId,
  });

  if (!workout) return res.status(404).send("Not found");
  res.render("gymWorkout/edit", { workout });
}

// Update Workout
async function update(req, res) {
  const { name, bodyPart, equipment, instructions } = req.body;
  let image = req.body.image;

  if (typeof image === "object" && image !== null) {
    image = image.url || "";
  }
  if (typeof image !== "string") {
    image = "";
  }
  await GymWorkout.findOneAndUpdate(
    { _id: req.params.id, userId: req.session.userId },
    { name, bodyPart, equipment, instructions, image }
  );

  res.redirect("/gymWorkout");
}

// Export All
export { index, imageProxy, newForm, create, editForm, update };
