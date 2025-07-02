const GymWorkout = require("../models/gymWorkout");
const fetch = require("node-fetch");

// const API_KEY = process.env.GYMFIT_API_KEY;
// console.log("Using API Key:", API_KEY);

async function index(req, res) {
  const query = req.query.q || "Deadlift"; // default search
  const bodyPart = req.query.bodyPart || "";

  let exercises = [];

  const url = `https://gym-fit.p.rapidapi.com/v1/exercises/search?query=${query}&number=50&offset=0${bodyPart ? `&bodyPart=${bodyPart}` : ""}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.GYMFIT_API_KEY,
        "X-RapidAPI-Host": "gym-fit.p.rapidapi.com",
      },
    });

    const data = await response.json();

    if (Array.isArray(data.results)) {
      exercises = data.results;
    } else {
      console.error("Unexpected API response:", data);
      exercises = [];
    }
  } catch (err) {
    console.error("API fetch error:", err);
  }

  const savedWorkouts = await GymWorkout.find({ userId: req.session.userId });

  res.render("gymWorkout/index", { exercises, savedWorkouts });
}

async function newForm(req, res) {
  res.render("gymWorkout/new");
}

async function create(req, res) {
  const { name, bodyPart, equipment, instructions, image } = req.body;
  await GymWorkout.create({
    userId: req.session.userId,
    name,
    bodyPart,
    equipment,
    instructions,
    image,
  });
  res.redirect("/gymWorkout");
}

async function editForm(req, res) {
  const workout = await GymWorkout.findOne({
    _id: req.params.id,
    userId: req.session.userId,
  });

  if (!workout) return res.status(404).send("Not found");
  res.render("gymWorkout/edit", { workout });
}

async function update(req, res) {
  const { name, bodyPart, equipment, instructions, image } = req.body;
  await GymWorkout.findOneAndUpdate(
    { _id: req.params.id, userId: req.session.userId },
    { name, bodyPart, equipment, instructions, image }
  );
  res.redirect("/gymWorkout");
}

module.exports = { index, newForm, create, editForm, update };
