const mongoose = require("mongoose");
const Student = require("./student");
const { number } = require("mathjs");
const { title } = require("process");

const finalReportSchema = new mongoose.Schema({
  semester: { type: String, required: true },
  year: { type: Number, required: true },
  gender: { type: String, required: true },
  course_Observations: {

    "GOOD": [
        {

          course_code: { type: String, required: true },
          course_name: { type: String, required: true },
          gender: { type: String, required: true },
        }
      ],


    "AVERAGE": [
        {

          course_code: { type: String, required: true },
          course_name: { type: String, required: true },
          gender: { type: String, required: true },
        }
      ],


    "POOR":
    [
        {

          course_code: { type: String, required: true },
          course_name: { type: String, required: true },
          gender: { type: String, required: true },
        }
      ]
    },
    



  levels: {  },

});

module.exports = mongoose.model("FinalReport", finalReportSchema);