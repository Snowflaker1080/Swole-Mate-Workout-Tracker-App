
import mongoose from "mongoose";

const { Schema } = mongoose;

const gymWorkoutSchema = new mongoose.Schema({
  apiId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  bodyPart: {
    type: String,
    required: true,
  },
  // Link the workout to a specific user (used for personalisation and CRUD control)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
   image: {
    type: String,
  },
  localImagePath: String,   // e.g. "/uploads/exercises/12345-161234567890.png"
  notes: String,
  // Allow user to favourite a workout
  isFavourite: { type: Boolean, default: false },
  tags: [String],
  
});

// Compound index ensures uniqueness per user
gymWorkoutSchema.index({ apiId: 1, userId: 1 }, { unique: true });

// Compile the schema model into a Mongoose model called 'GymWorkout' - This automatically maps to the 'gymworkouts' collection in MongoDB
const GymWorkout = mongoose.models.GymWorkout || mongoose.model("GymWorkout", gymWorkoutSchema);

// Export the model using ESM syntax
export default GymWorkout;