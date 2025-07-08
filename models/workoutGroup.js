import mongoose from "mongoose";
const { Schema } = mongoose;

const workoutGroupSchema = new Schema({
  name:        { type: String, required: true },          // e.g. "Bicep Day"
  userId:      { type: Schema.Types.ObjectId,
                 ref: "User",
                 required: true },
  exercises:   [{ type: Schema.Types.ObjectId,
                 ref: "GymWorkout" }],                   // saved workouts
  scheduledDate: {
    type: String,                                         // "2025-07-10"
    default: null                                         // <— ensures the field exists (as null) when you clear a date
  }
});

workoutGroupSchema.set("toObject", { virtuals: true });
workoutGroupSchema.set("toJSON",   { virtuals: true });

export default mongoose.models.WorkoutGroup
  || mongoose.model("WorkoutGroup", workoutGroupSchema);