const express = require("express");
const router = express.Router();
const FitnessGoal = require("../models/fitnessGoal");
const fitnessGoalsController = require("../controllers/fitnessGoals");
const isSignedIn = require('../middleware/is-signed-in');

// Applied to all routes in this file for only signed in guests
router.use(isSignedIn);

// Index
router.get("/", async (req, res) => {
  const goals = await FitnessGoal.find({ userId: req.session.userId });
  res.render("fitnessGoals/index", { goals });
});

// New
router.get("/new", fitnessGoalsController.new);

// Create
router.post("/", fitnessGoalsController.bulkCreateOrUpdate);

// Edit form
router.get("/:id/edit", fitnessGoalsController.edit);

// Update (using method-override)
router.put("/:id", fitnessGoalsController.update);

// Delete
router.delete('/:id', fitnessGoalsController.deleteGoal);

module.exports = router;