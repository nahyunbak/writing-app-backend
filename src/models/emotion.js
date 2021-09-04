import mongoose, { Schema } from 'mongoose';

const  EmotionSchema = new Schema({
  감정: String,
  종류: String,
});

EmotionSchema.statics.findByQuery = function(query) {
  return this.find(query);
};


const Emotion = mongoose.model('Emotion',  EmotionSchema);
export default Emotion;



