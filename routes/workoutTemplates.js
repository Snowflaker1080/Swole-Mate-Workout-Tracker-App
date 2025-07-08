import express from 'express';
import WorkoutGroup from '../models/workoutGroup.js';
import isSignedIn from '../middleware/is-signed-in.js';
import * as workoutTemplatesCtrl from '../controllers/workoutTemplates.js';

const router = express.Router();

// INDEX • GET /workoutTemplates
// Show all workout‐group templates belonging to the current user
router.get('/', isSignedIn, async (req, res, next) => {
  try {
    const workoutGroups = await WorkoutGroup
      .find({ owner: req.user._id })
      .populate('exercises');
    res.render('workoutTemplates/index', {
      groups:      workoutGroups,
      user:        req.user,
      savedApiIds: []
    });
  } catch (err) {
    next(err);
  }
});

// NEW • GET /workoutTemplates/new
router.get('/new', isSignedIn, (req, res) => {
  res.render('workoutTemplates/new');
});

// CREATE • POST /workoutTemplates
router.post('/', isSignedIn, async (req, res, next) => {
  try {
    const group = new WorkoutGroup({
      name:       req.body.name,
      dayOfWeek:  req.body.dayOfWeek,
      exercises:  req.body.exercises || [],
      owner:      req.user._id
    });
    await group.save();
    res.redirect('/workoutTemplates');
  } catch (err) {
    next(err);
  }
});

// SHOW • GET /workoutTemplates/:id
router.get('/:id', isSignedIn, workoutTemplatesCtrl.show);

// EDIT • GET /workoutTemplates/:id/edit
router.get('/:id/edit', isSignedIn, async (req, res, next) => {
  try {
    const group = await WorkoutGroup.findById(req.params.id);
    if (!group) return res.redirect('/workoutTemplates');
    res.render('workoutTemplates/edit', { group });
  } catch (err) {
    next(err);
  }
});

// UPDATE • PUT /workoutTemplates/:id
router.put('/:id', isSignedIn, async (req, res, next) => {
  try {
    await WorkoutGroup.findByIdAndUpdate(req.params.id, {
      name:       req.body.name,
      dayOfWeek:  req.body.dayOfWeek,
      exercises:  req.body.exercises || []
    });
    res.redirect('/workoutTemplates');
  } catch (err) {
    next(err);
  }
});

// DELETE • DELETE /workoutTemplates/:id
router.delete('/:id', isSignedIn, async (req, res, next) => {
  try {
    await WorkoutGroup.findByIdAndDelete(req.params.id);
    res.redirect('/workoutTemplates');
  } catch (err) {
    next(err);
  }
});

export default router;