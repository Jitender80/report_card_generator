const mongoose = require('mongoose');
const Student = require('./student'); // Assuming the student schema is in student.js

const classSchema = new mongoose.Schema({
  className: { type: String, required: false },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  answerKey: [{ question: String, answer: String }],
  incorrectIndexData: [Number],
  discIndexData: [Number],
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;