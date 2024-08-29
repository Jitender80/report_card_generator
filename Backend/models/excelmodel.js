const mongoose = require('mongoose');
const Student = require('./student');

const classSchema = new mongoose.Schema({
  className: { type: String, required: false },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  answerKey: [{ question: String, answer: String }],
  correctIndexData: [Number],
  discIndexData: [Number],
  average: { type: String, required: false },
  code: { type: String, required: false },
  credit: { type: String, required: false },
  studentsNumber: { type: String },
  studentsWithdrawn: { type: String },
  studentsAbsent: { type: String },
  studentsAttended: { type: String },
  studentsPassed: { type: String },
  academicYear: { type: String, required: false },
  coordinatorGender: { type: String, required: false },
  courseCoordinator: { type: String, required: false },

  FinalGrade: {




    APlus: { number: { type: Number }, percentage: { type: Number } },
    A: { number: { type: Number }, percentage: { type: Number } },
    BPlus: { number: { type: Number }, percentage: { type: Number } },
    B: { number: { type: Number }, percentage: { type: Number, } },
    CPlus: { number: { type: Number }, percentage: { type: Number } },
    C: { number: { type: Number }, percentage: { type: Number, } },
    DPlus: { number: { type: Number, }, percentage: { type: Number, } },
    D: { number: { type: Number, }, percentage: { type: Number } },
    F: { number: { type: Number }, percentage: { type: Number } }
    ,
  },

  kr20: { type: Number, required: false },
  questionAnalysis: [{
    questionNumber: { type: String, required: false },
    category: { type: String, required: false },
    disc_index: { type: Number, required: false },
    correctAnswersPercentage: { type: Number, required: false }
  }],
  questionSummary: {
    "Poor (Bad) Questions": [Number],
    "Very Difficult Question": [Number],
    "Difficult Question": [Number],
    "Good Question": [Number],
    "Easy Question": [Number],
    "Very Easy Question": [Number],
  },
})


const Class = mongoose.model('Class', classSchema);

module.exports = Class;