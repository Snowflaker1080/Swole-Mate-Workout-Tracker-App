import ExerciseTemplate from '../models/exerciseTemplates.js' 

export async function index(req, res, next) {
  try {
    const exerciseTemplates = await ExerciseTemplate.find({ owner: req.user._id })
    res.render('exerciseTemplates/index', { exerciseTemplates, user: req.user })
  } catch (err) {
    next(err)
  }
}

export function newExerciseTemplate(req, res) {
  res.render('exerciseTemplates/new', { user: req.user })
}

export async function create(req, res, next) {
  try {
    req.body.owner = req.user._id
    await ExerciseTemplate.create(req.body)
    res.redirect('/exerciseTemplates')
  } catch (err) {
    next(err)
  }
}

export async function show(req, res, next) {
  try {
    const exerciseTemplate = await ExerciseTemplate.findById(req.params.id)
    if (!exerciseTemplate) return res.redirect('back')
    res.render('exerciseTemplates/show', { exerciseTemplate, user: req.user })
  } catch (err) {
    next(err)
  }
}

export async function edit(req, res, next) {
  try {
    const exerciseTemplate = await ExerciseTemplate.findById(req.params.id)
    if (!exerciseTemplate) return res.redirect('back')
    res.render('exerciseTemplates/edit', { exerciseTemplate, user: req.user })
  } catch (err) {
    next(err)
  }
}

export async function update(req, res, next) {
  try {
    const updated = await ExerciseTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    res.redirect(`/exerciseTemplates/${updated._id}`)
  } catch (err) {
    next(err)
  }
}

export async function destroyExerciseTemplate(req, res, next) {
  try {
    await ExerciseTemplate.findByIdAndDelete(req.params.id)
    res.redirect('/exerciseTemplates')
  } catch (err) {
    next(err)
  }
}