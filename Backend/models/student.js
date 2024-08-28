const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  answer: String,
});

const studentSchema = new mongoose.Schema({
  name: String,
  idNumber: String,
  blankCount: Number,
  correctCount: Number,
  percentage: Number,
  score: Number,
  questions: [questionSchema],

});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;