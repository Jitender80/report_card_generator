const Class = require("../models/excelmodel");

async function getGrades(id){

  try {
    const classData = await Class.findById(id).populate('students');

    // Check if classData is not null
    if (!classData) {
      return  "No class data found" ;
    }

    // console.log("🚀 ~ exports.getGrades= ~ classData.students:", classData.students);

    const gradeBoundaries = {
      APlus: { min: 95, max: 100 },
      A: { min: 90, max: 94 },
      BPlus: { min: 85, max: 89 },
      B: { min: 80, max: 84 },
      CPlus: { min: 75, max: 79 },
      C: { min: 70, max: 74 },
      DPlus: { min: 65, max: 69 },
      D: { min: 60, max: 64 },
      F: { min: 0, max: 59 }
    };

    // Initialize counters for each grade category
    const gradeCounts = {
      APlus: 0,
      A: 0,
      BPlus: 0,
      B: 0,
      CPlus: 0,
      C: 0,
      DPlus: 0,
      D: 0,
      F: 0
    };

    // Process student grades
    classData.students.forEach(student => {
      const percentage = student.percentage;
      console.log("🚀 ~ exports.getGrades= ~ percentage:", percentage);
      for (const [grade, boundary] of Object.entries(gradeBoundaries)) {
        if (percentage >= boundary.min && percentage <= boundary.max) {
          gradeCounts[grade]++;
          break;
        }
      }
    });

    // Calculate total number of students
    const totalStudents = classData.students.length;

    // Calculate percentages for each grade
    const gradePercentages = {};
    for (const [grade, count] of Object.entries(gradeCounts)) {
      gradePercentages[grade] = (count / totalStudents) * 100;
    }

    // Prepare FinalGrade object
    const finalGrade = {};
    for (const grade of Object.keys(gradeCounts)) {
      finalGrade[grade] = {
        number: gradeCounts[grade],
        percentage: gradePercentages[grade]
      };
    }

    // Update the Class document with FinalGrade
    classData.FinalGrade = finalGrade;
    const resdata = await classData.save();

    // console.log("🚀 ~ exports.getGrades= ~ finalGrade:", finalGrade);
    return  resdata;

  } catch (error) {
    console.error("Error fetching class data:", error);

  }
};
module.exports = { getGrades }; 