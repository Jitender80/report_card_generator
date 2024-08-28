const mongoose = require('mongoose');
const Student = require('./student'); 

const classSchema = new mongoose.Schema({
  className: { type: String, required: false },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  answerKey: [{ question: String, answer: String }],
  correctIndexData: [Number],
  discIndexData: [Number],
  studentGrades:  [{
    name: { type: String, required: true },
    percentage: { type: Number, required: true },
    grade: { type: String, required: true }
  }],

  kr20: { type: Number, required: false },
  questionAnalysis: [{
    questionNumber: { type: String, required: true },
    category: { type: String, required: true },
    disc_index: { type: Number, required: true },
    correctAnswersPercentage: { type: Number, required: true }
  }]
})


const Class = mongoose.model('Class', classSchema);

module.exports = Class;