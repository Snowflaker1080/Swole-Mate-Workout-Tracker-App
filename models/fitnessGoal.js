const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fitnessGoalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  goalType: { type: String, required: true },
  startValue: Number,
  targetValue: Number,
  unit: String,
  startDate: Date,
  targetDate: Date,
});

// If the model is already compiled, Mongoose will reuse it rather than trying to recompile and throw an error.
module.exports = mongoose.models.FitnessGoal || mongoose.model("FitnessGoal", fitnessGoalSchema);
