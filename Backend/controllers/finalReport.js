const mongoose = require('mongoose');
const Student = require('../models/student');
const Class = require('../models/excelmodel');
const FinalReport = require('../models/finalReportModel');


exports.generateFinalReport = async (req, res) => {
  const { academicYear, semester } = req.body;

  try {

    // const classes = await Class.aggregate([
    //   {
    //     $project: {
    //       academicYear: academicYear,

    //       semester: semester,
    //       // Add any additional fields you need here
    //     }
    //   }
    // ])
    const classes = await Class.find({ academicYear, semester });
    console.log("🚀 ~ exports.generateFinalReport= ~ classes:", classes)

    const finalReportData = {
      semester,
      year: academicYear,
      gender: 'all', // You can modify this as needed
      course_Observations: {
        GOOD: [],
        AVERAGE: [],
        POOR: []
      },
      levelTable: [],
      CourseNameTable: []
    };

    // Process the classes to populate levelTable and CourseNameTable
    const levelMap = new Map();
    const courseMap = new Map();

    classes.forEach(classDoc => {
      // Process levelTable
      const level = classDoc.level;
      if (!levelMap.has(level)) {
        levelMap.set(level, {
          level,
          classId: [],
          levelAverage: {
            "Poor (Bad) Questions": { number: 0, percentage: 0 },
            "Very Difficult Question": { number: 0, percentage: 0 },
            "Difficult Question": { number: 0, percentage: 0 },
            "Good Question": { number: 0, percentage: 0 },
            "Easy Question": { number: 0, percentage: 0 },
            "Very Easy Question": { number: 0, percentage: 0 },
            "Total Accepted": { number: 0, percentage: 0 },
            "Total Rejected": { number: 0, percentage: 0 }
          }
        });
      }
      levelMap.get(level).classId.push(classDoc._id);

      // Process CourseNameTable
      const courseName = classDoc.nameOfCourse;
      if (!courseMap.has(courseName)) {
        courseMap.set(courseName, {
          CourseName: courseName,
          classId: [],
          levelAverage: {
            "Poor (Bad) Questions": { number: 0, percentage: 0 },
            "Very Difficult Question": { number: 0, percentage: 0 },
            "Difficult Question": { number: 0, percentage: 0 },
            "Good Question": { number: 0, percentage: 0 },
            "Easy Question": { number: 0, percentage: 0 },
            "Very Easy Question": { number: 0, percentage: 0 },
            "Total Accepted": { number: 0, percentage: 0 },
            "Total Rejected": { number: 0, percentage: 0 }
          }
        });
      }
      courseMap.get(courseName).classId.push(classDoc._id);
      // Categorize based on kr20
      const kr20 = classDoc.kr20;
      const courseObservation = {
        course_code: classDoc.courseCode,
        course_name: classDoc.nameOfCourse,
        gender: classDoc.gender
      };

      if (kr20 > 0.8) {
        finalReportData.course_Observations.GOOD.push(courseObservation);
      } else if (kr20 >= 0.7 && kr20 <= 0.79) {
        finalReportData.course_Observations.AVERAGE.push(courseObservation);
      } else if (kr20 < 0.7) {
        finalReportData.course_Observations.POOR.push(courseObservation);
      }
    });
    // Convert maps to arrays
    finalReportData.levelTable = Array.from(levelMap.values());
    finalReportData.CourseNameTable = Array.from(courseMap.values());

    // Create a new FinalReport document
    const finalReport = new FinalReport(finalReportData);

    // Save the FinalReport document to the database
    await finalReport.save();

    res.status(201).json({ message: 'Final report generated successfully', finalReport });





  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });

  }
}



