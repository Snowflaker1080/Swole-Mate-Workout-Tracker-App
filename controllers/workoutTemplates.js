import WorkoutGroup from '../models/workoutGroup.js';

export async function show(req, res, next) {
  try {
    const group = await WorkoutGroup
      .findById(req.params.id)
      .populate('exercises');                
    if (!group) return res.redirect('/workoutTemplates');
    res.render('workoutTemplates/show', {
      workoutGroup: group,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
}