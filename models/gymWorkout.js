const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gymWorkoutSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: String, // Exercise name
  bodyPart: String, // e.g. Chest, Back
  equipment: String, // e.g. Barbell
  instructions: String, // API's instructions
  image: String // For image field
}, { timestamps: true }); // When saving workouts

module.exports = mongoose.model('GymWorkout', gymWorkoutSchema);
