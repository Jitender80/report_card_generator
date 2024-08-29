const mongoose = require('mongoose');
const Student = require('./student'); 

const classSchema = new mongoose.Schema({
  className: { type: String, required: false },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  answerKey: [{ question: String, answer: String }],
  correctIndexData: [Number],
  discIndexData: [Number],
  grade:{type:String,required:true
  },
  average: { type: String, required: true },
  code:{type:String,required:true},
  credit:{type:String,required:true},
  studentsNumber:{type:String},
  studentsWithdrawn:{type:String},
  studentsAbsent:{type:String},
  studentsAttended:{type:String},
  studentsPassed:{type:String},

  FinalGrade:  {




      APlus: { number: { type: Number}, percentage: { type: Number} },
      A: { number: { type: Number  }, percentage: { type: Number } },
      BPlus: { number: { type: Number }, percentage: { type: Number} },
      B: { number: { type: Number }, percentage: { type: Number,  } },
      CPlus: { number: { type: Number }, percentage: { type: Number } },
      C: { number: { type: Number}, percentage: { type: Number, } },
      DPlus: { number: { type: Number, }, percentage: { type: Number, } },
      D: { number: { type: Number, }, percentage: { type: Number } },
      F: { number: { type: Number }, percentage: { type: Number } }
    ,
  },

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