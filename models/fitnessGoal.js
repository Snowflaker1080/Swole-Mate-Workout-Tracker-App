const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fitnessGoalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  goalType: { type: String, required: true },
  startValue: Number,
  targetValue: Number,
  startDate: Date,
  targetDate: Date,
});

module.exports = mongoose.model("FitnessGoal", fitnessGoalSchema);
