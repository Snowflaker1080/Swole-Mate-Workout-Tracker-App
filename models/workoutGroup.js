import mongoose from "mongoose";
const { Schema } = mongoose;

const workoutGroupSchema = new Schema({
  name: { type: String, required: true }, // e.g. "Arms Day", "Legs + Cardio"
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  dayOfWeek: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true,
  },
  exercises: [{ type: Schema.Types.ObjectId, ref: "GymWorkout" }], // saved workouts
  scheduledDate: { type: String }, // e.g. '2025-07-10'
});

const WorkoutGroup = mongoose.models.WorkoutGroup || mongoose.model("WorkoutGroup", workoutGroupSchema);
export default WorkoutGroup;