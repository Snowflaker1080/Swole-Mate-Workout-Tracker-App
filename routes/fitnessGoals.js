const express = require("express");
const router = express.Router();
const fitnessGoalsController = require("../controllers/fitnessGoals");
const isSignedIn = require('../middleware/is-signed-in');
const passUserToView = require('../middleware/pass-user-to-view');

// Index
router.get("/", isSignedIn, fitnessGoalsController.index);

// New
router.get("/new", fitnessGoalsController.new);

// Create
router.post("/", fitnessGoalsController.bulkCreateOrUpdate);

// Edit form
router.get("/:id/edit", fitnessGoalsController.edit);

// Update (using method-override)
router.put("/:id", fitnessGoalsController.update);

// Delete (using method-override)
router.delete("/:id", fitnessGoalsController.delete);

module.exports = router;