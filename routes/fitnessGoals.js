// ECMAScript Modules (ESM) syntax

// Imports
import express from "express";

  // Import the FitnessGoal model used in the index route
import FitnessGoal from "../models/fitnessGoal.js";

  // Import the controller that handles all FitnessGoal logic
import * as fitnessGoalsController from "../controllers/fitnessGoals.js";

  // Import middleware to restrict access to signed-in users
import isSignedIn from "../middleware/is-signed-in.js"; 

// new Express router instance
const router = express.Router();

// Apply the isSignedIn middleware to all routes in this file
router.use(isSignedIn);

// Route: GET /fitnessGoals - Purpose: Display all goals for the logged-in user
router.get("/", async (req, res) => {
  const goals = await FitnessGoal.find({ userId: req.session.userId });
  res.render("fitnessGoals/index", { goals });
});

// Route: GET /fitnessGoals/new - Purpose: Render form to create or update multiple goals
router.get("/new", fitnessGoalsController.newForm);

// Route: POST /fitnessGoals - Purpose: Handle bulk creation or updating of goals
router.post("/", fitnessGoalsController.bulkCreateOrUpdate);

// Route: GET /fitnessGoals/:id/edit - Purpose: Render the edit form for a specific goal
router.get("/:id/edit", fitnessGoalsController.edit);

// Route: PUT /fitnessGoals/:id - Purpose: Update a specific goal (method-override is used)
router.put("/:id", fitnessGoalsController.update);

// Route: DELETE /fitnessGoals/:id - Purpose: Delete a specific goal
router.delete("/:id", fitnessGoalsController.deleteGoal);

// Export the router using ESM syntax
export default router;