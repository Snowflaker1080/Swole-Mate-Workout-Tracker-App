const express = require('express');
const router = express.Router();
const gymWorkoutController = require('../controllers/gymWorkout');
const isSignedIn = require('../middleware/is-signed-in');

// ## Check authentication middleware is applied if needed
router.get('/', gymWorkoutController.index); // public exercise search
router.get('/new',isSignedIn, gymWorkoutController.newForm); // isSignedIn protected
router.post('/', isSignedIn, gymWorkoutController.create); // isSignedIn protected
router.get('/:id/edit', isSignedIn, gymWorkoutController.editForm); // isSignedIn protected
router.post('/:id',isSignedIn, gymWorkoutController.update); // isSignedIn protected

module.exports = router;