// Import the mongoose library
import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the schema for a fitness goal entry
const fitnessGoalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  goalType: { type: String, required: true },
  startValue: Number,
  targetValue: Number,
  unit: String,
  startDate: Date,
  targetDate: Date,
});

// Export the model for use throughout the app
// If the model is already compiled, Mongoose will reuse it rather than trying to recompile and throw an error.
const FitnessGoal = mongoose.models.FitnessGoal || mongoose.model("FitnessGoal", fitnessGoalSchema);

export default FitnessGoal;
