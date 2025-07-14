import express from 'express'
import * as exerciseTemplatesCtrl from '../controllers/exerciseTemplates.js'
import isSignedIn from '../middleware/is-signed-in.js'

const router = express.Router()

// INDEX • GET /exerciseTemplates
router.get('/',      isSignedIn, exerciseTemplatesCtrl.index)
// NEW   • GET /exerciseTemplates/new
router.get('/new', isSignedIn, exerciseTemplatesCtrl.newExerciseTemplate)
// CREATE• POST /exerciseTemplates
router.post('/',     isSignedIn, exerciseTemplatesCtrl.create)
// SHOW  • GET /exerciseTemplates/:id
router.get('/:id',   isSignedIn, exerciseTemplatesCtrl.show)
// EDIT  • GET /exerciseTemplates/:id/edit
router.get('/:id/edit', isSignedIn, exerciseTemplatesCtrl.edit)
// UPDATE• PUT /exerciseTemplates/:id
router.put('/:id',   isSignedIn, exerciseTemplatesCtrl.update)
// DELETE• DELETE /exerciseTemplates/:id
router.delete('/:id', isSignedIn, exerciseTemplatesCtrl.destroyExerciseTemplate)

export default router