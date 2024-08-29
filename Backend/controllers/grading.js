const Class = require("../models/excelmodel");

exports.getGrades = async (req, res) => {
  try {
    const classData = await Class.findOne().populate('students').sort({ createdAt: -1 });

    // Check if classData is not null
    if (!classData) {
      return res.status(404).json({ message: "No class data found" });
    }

    console.log("🚀 ~ exports.getGrades= ~ classData.students:", classData.students);

    const gradeBoundaries = {
      APlus: { min: 90, max: 100 },
      A: { min: 80, max: 89 },
      BPlus: { min: 75, max: 79 },
      B: { min: 70, max: 74 },
      CPlus: { min: 65, max: 69 },
      C: { min: 60, max: 64 },
      DPlus: { min: 55, max: 59 },
      D: { min: 50, max: 54 },
      F: { min: 0, max: 49 }
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
    await classData.save();

    console.log("🚀 ~ exports.getGrades= ~ finalGrade:", finalGrade);
    return res.status(200).json({ data: finalGrade, message: "Data fetched and updated successfully" });

  } catch (error) {
    console.error("Error fetching class data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};