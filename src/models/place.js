import mongoose, { Schema } from 'mongoose';

const  PlaceSchema = new Schema({
  장소: String,
  현대: String,
  중세: String,
  판타지: String,
});

PlaceSchema.statics.findByQuery = function(query) {
  return this.find(query);
};


const Place = mongoose.model('Place',  PlaceSchema);
export default Place;



