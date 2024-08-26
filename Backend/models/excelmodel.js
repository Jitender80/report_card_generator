const mongoose = require('mongoose');
const Student = require('./student'); 

const classSchema = new mongoose.Schema({
  className: { type: String, required: false },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  answerKey: [{ question: String, answer: String }],
  correctIndexData: [Number],
  discIndexData: [Number],
})


const Class = mongoose.model('Class', classSchema);

module.exports = Class;