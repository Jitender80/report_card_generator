const mongoose = require("mongoose");
const Student = require("./student");
const { number } = require("mathjs");

const finalReportSchema = new mongoose.Schema({
  semester: { type: String, required: true },
  year: { type: Number, required: true },
  gender: { type: String, required: true },
  observations: { type: String, required: true },
  course_sections: { type: mongoose.Schema.Types.Mixed, required: true }, // JSON to store names of courses based on KR20 value
  question_analysis: { type: mongoose.Schema.Types.Mixed, required: true } // JSON to store multiple tables based on levels
});

module.exports = mongoose.model("FinalReport", finalReportSchema);