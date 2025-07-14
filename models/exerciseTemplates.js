import mongoose from 'mongoose';
const exerciseTemplateSchema = new mongoose.Schema({ /* … */ });
export default mongoose.model('ExerciseTemplate', exerciseTemplateSchema);