import mongoose, { Schema } from 'mongoose';

const  JobSchema = new Schema({
  직업: String,
  현대: String,
  중세: String,
  판타지: String,
});

JobSchema.statics.findByQuery = function(query) {
  return this.find(query);
};


const Job = mongoose.model('Job',  JobSchema);
export default Job;



