const xlsx = require("xlsx");
const mongoose = require("mongoose");
const Student = require("../models/student");
const Class = require("../models/excelmodel");
const math = require("mathjs");
const simpleStatistics = require("simple-statistics");
const { getGrades } = require("./grading");
async function getLatestClassWithStudentScores() {
  try {
    const latestClass = await Class.findOne()
      .sort({ createdAt: -1 })
      .populate("students")
      .exec();
    if (!latestClass) {
      throw new Error("No classes found");
    }

    const idScoreArray = latestClass.students.map((student) => ({
      score: student.score,
    }));

    console.log(
      "🚀 ~ getLsatestClassWithStudentScores ~ idScoreArray:",
      idScoreArray
    );
    return idScoreArray;
  } catch (error) {
    console.error("Error fetching latest class and student scores:", error);
    throw error;
  }
}


exports.handleCollegeSubmit = (req, res) => {
  const { collegeName, universityName } = req.body;

  if (!collegeName || !universityName) {
    return res.status(400).json({ message: 'Both collegeName and universityName are required' });
  }

  // Perform any necessary processing, e.g., save to database

  res.status(200).json({ message: 'College and University names submitted successfully', data: { collegeName, universityName } });
};
exports.createClass = async (req, res) => {


  // class: "",
  // nameOfCourse: "",
  // courseCode: "",
  // creditHours: "",
  // semester: "",
  // academicYear: "",
  // coordinatorGender: "",
  // courseCoordinator: "",
  // totalNoOfQuestion: "",
  // StudentsAttended: "",
  // studentsWithdrawn: "",
  // studentAbsent: "",
  // studentPassed:"",
  
  // className: { type: String, required: false },


  // correctIndexData: [Number],

  // average: { type: String, required: false },
  // code: { type: String, required: false },
  // credit: { type: String, required: false },
  // studentsNumber: { type: String },
  // studentsWithdrawn: { type: String },
  // studentsAbsent: { type: String },
  // studentsAttended: { type: String },
  // studentsPassed: { type: String },
  const {
    college,
    univerity,
    className,
    nameOfCourse,
    courseCode,
    creditHours,
    semester,
    academicYear,
    coordinatorGender,
    courseCoordinator,
    totalNoOfQuestion,
  
    studentsWithdrawn,
    studentAbsent,
    StudentsAttended,
    studentPassed,
  } = req.body;

  const newClass = new Class({
    college,
    univerity,
    className,
    nameOfCourse,
    courseCode,
    courseCode,
    creditHours,
   
    creditHours,
    semester,
    academicYear,
    coordinatorGender,
    courseCoordinator,
    // totalNoOfQuestion,
    studentsNumber:totalNoOfQuestion,
 
    studentsWithdrawn:studentsWithdrawn,
    studentsAbsent:studentAbsent,
    studentsAttended:StudentsAttended,
    
    studentsPassed:studentPassed,
  });

  try {
    const savedClass = await newClass.save();
    res.status(201).json({
      data:savedClass,
      message:"Class Create Successfully"
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.uploadFile = async (req, res) => {
  
  const file = req.file;
  
  console.log("🚀 ~ exports.uploadFile= ~ file:", file)
  const workbook = xlsx.readFile(file.path);
  const sheetNames = workbook.SheetNames;

  // Get sheets at index 0 and 2
  const sheet1 = workbook.Sheets[sheetNames[0]];
  const sheet2 = workbook.Sheets[sheetNames[2]];

  const data = xlsx.utils.sheet_to_json(sheet1);

  const dataSheet2 = xlsx.utils.sheet_to_json(sheet2, { header: 1 });

  //Getting DIsc INdext data
  const discIndexColumnIndex = dataSheet2[4].indexOf("Disc. Index");
  const discIndexData = dataSheet2
    .slice(5)
    .map((row) => row[discIndexColumnIndex])
    .filter((value) => value !== null && value !== undefined);

  const IncorrectColumnIndex = dataSheet2[4].indexOf("Pct. Incorrect");

  const IncorrectIndexData = dataSheet2
    .slice(5)
    .map((row) => row[discIndexColumnIndex])
    .filter((value) => value !== null && value !== undefined);

  const correctIndexData = IncorrectIndexData.map((value) => 100 - value);
  //  console.log("🚀 ~ exports.uploadFile= ~ IncorrectColumnIndex:", IncorrectColumnIndex)
  //  return res.json({IncorrectIndexData, discIndexData})

  //  console.log("🚀 ~ exports.uploadFile= ~ Disc Index data:", discIndexData);

  //  return res.status(200).json({
  //    message: "Data extracted successfully",
  //    discIndexData: discIndexData
  //  });

  // console.log("🚀 ~ exports.uploadFile= ~ data:", data.slice(2));
  const extractQuestionColumns = (row) => {
    const questionColumns = [];
    Object.keys(row).forEach((key) => {
      if (/^Q\s*\d+$/.test(key)) {
        questionColumns.push({
          question: key.replace(/\s/g, ""),
          answer: row[key],
        }); // Remove spaces from keys
      }
    });
    return questionColumns;
  };
  // Extract answer key from the first row
  const answerKeyData = data.slice(0, 1)[0];
  const answerKey =   extractQuestionColumns(answerKeyData);
  console.log("🚀 ~ exports.uploadFile= ~ answerKey:", answerKey);

  // Function to parse percentage strings to numbers
  const parsePercentage = (percentage) => {
    if (typeof percentage === "string") {
      return parseFloat(percentage.replace("%", ""));
    }
    return percentage;
  };

  // Function to calculate score based on the answer key
  const calculateScore = (studentAnswers, answerKey) => {
    let score = 0;
    studentAnswers.forEach((answer) => {
      const correctAnswer = answerKey.find(
        (key) => key.question === answer.question
      );
      if (correctAnswer && correctAnswer.answer === answer.answer) {
        score += 1; // Increment score for each correct answer
      }
    });
    return score;
  };

  // Map student data and calculate scores
  const studentsData = data.slice(1).map((row) => {
    const studentAnswers = extractQuestionColumns(row);
    const score = calculateScore(studentAnswers, answerKey);
    return {
      name: row.StudentName,
      idNumber: row.IDNumber,
      blankCount: row.BlankCount ? parseInt(row.BlankCount, 10) : 0,
      correctCount: score,
      percentage: row.Percentage ? parsePercentage(row.Percentage) : 0,
      score: score,
      questions: studentAnswers,
    };
  });

  // Create a new class with the answer key

  const latestClass = await Class.findOne().sort({ createdAt: -1 }).exec();

  if(!latestClass){
    return res.status(401).json({
      message: "NO class present"
    })
  }

  latestClass.answerKey = answerKey;
  latestClass.correctIndexData = correctIndexData;
  latestClass.discIndexData = discIndexData;
  // const newClass = new Class({
  //   className: 'Class 1', // You can set this dynamically
  //   answerKey: answerKey,
  //   correctIndexData: correctIndexData,
  //   discIndexData: discIndexData,
  // });

  try {
    // Save the class to get the class ID
    // const savedClass = await newClass.save();

    // Save students and get their IDs
    const savedStudents = await Student.insertMany(studentsData);

    // Update the class with the student IDs
    latestClass.students = savedStudents.map((student) => student._id);
    await latestClass.save();

    console.log("Class and students saved successfully");
    res
      .status(200)
      .json({ message: "File uploaded successfully", data: savedStudents });
  } catch (error) {
    console.error("Error saving class and students:", error);
    res.status(500).json({ message: "Error saving data", error });
  }
};
function assignGrade(percentage) {
  if (percentage >= 95) return "A+";
  if (percentage >= 90) return "A";
  if (percentage >= 85) return "B+";
  if (percentage >= 80) return "B";
  if (percentage >= 75) return "C+";
  if (percentage >= 70) return "C";
  if (percentage >= 65) return "D+";
  if (percentage >= 60) return "D";
  return "F";
}

async function calculateResult() {
  try {
    const classData = await Class.findOne()
      .sort({ createdAt: -1 })
      .populate("students")
      .exec();
    const answerKeys = classData.answerKey; // Extract answer keys from the class data

    const QA_P = {};
    const QA_Q = {};
    const QA_PQ = {};
    let QA_PQ_Sum = 0;

    for (const answerKey of answerKeys) {
      const accuracies = [];

      for (const student of classData.students) {
        const studentAnswer = student.questions.find(
          (q) => q.question === answerKey.question
        );

        if (studentAnswer) {
          const isCorrect = studentAnswer.answer === answerKey.answer;
          accuracies.push(isCorrect ? 1 : 0);

          // if (answerKey.question === "Q5") {
          //   console.log("Student Key:", student._id);
          //   console.log("Student Answer:", studentAnswer.answer);
          // }
        }
      }

      const totalStudents = classData.students.length;
      const questionAccuracyValue =
        accuracies.reduce((sum, accuracy) => sum + accuracy, 0) / totalStudents;

      const roundedAccuracy = questionAccuracyValue;

      QA_P[answerKey.question] = roundedAccuracy;
      QA_Q[answerKey.question] = parseFloat(1 - questionAccuracyValue);
      QA_PQ[answerKey.question] = parseFloat(
        roundedAccuracy * (1 - questionAccuracyValue)
      );
      
      QA_PQ_Sum += QA_PQ[answerKey.question];
    }
    console.log("🚀 ~ calculateResult ~ QA_P:", QA_P)
    console.log("🚀 ~ calculateResult ~ QA_Q:", QA_Q)
    console.log("🚀 ~ calculateResult ~ QA_PQ_Sum:", QA_PQ_Sum)

    // calculate variance
    // Calculate variance
    async function calculateSingleValue(scores) {
      const variance = simpleStatistics.variance(scores, { sample: false });
      return variance;
    }
    const studentScores = await getLatestClassWithStudentScores();
    console.log(
      "🚀 ~ exports.calculateResult= ~ studentScores:",
      studentScores
    );

    const scores = studentScores.map((student) => student.score);

    const variance = await calculateSingleValue(scores);
    console.log("🚀 ~ exports.calculateResult= ~ variance:", variance);

    // calculate grades
    function calculatePercentagesAndGrades(classData) {
      const percentages = {};

      classData.students.forEach((student) => {
        const percentage = student.percentage; // Extract the percentage
        const grade = assignGrade(percentage); // Assign the grade
        percentages[student.name] = {
          percentage: percentage,
          grade: grade,
        };
      });

      return percentages;
    }

    const studentGrades = calculatePercentagesAndGrades(classData);
    console.log("🚀 ~ exports.calculateResult= ~ studentGrade:", studentGrades);
    // Convert studentGrades to an array of objects
    const studentGradesArray = Object.keys(studentGrades).map((name) => ({
      name: name,
      percentage: parseFloat(studentGrades[name].percentage),
      grade: studentGrades[name].grade,
    }));

    const latestId = await Class.find().sort({ createdAt: -1 });
    await Class.findByIdAndUpdate(latestId[0]._id, {
      studentGrades: studentGradesArray,
    });

    const getClassStatistics = async () => {
      // Assuming both `discIndexData` and `correctIndexData` arrays are of the same length
      const result = classData.discIndexData.map((discIndex, index) => ({
        questionNumber: classData.answerKey[index].question || index + 1, // Include question number, default to index + 1 if not available
        disc_index: discIndex,
        correctAnswersPercentage: classData.correctIndexData[index] || null, // Ensure we handle cases where lengths differ
      }));
      return result;
    };

    const disc_ = await getClassStatistics();

    console.log("🚀 ~ exports.calculateResult= ~ disc_:", disc_);

    const KR20 =
      (answerKeys?.length / (answerKeys?.length - 1)) *
      (1 - QA_PQ_Sum / variance);
    // console.log("🚀 ~ exports.calculateResult= ~ KR20:", KR20)
    const newArray = disc_.map((item, index) => {
      const questionNumber = item.questionNumber || index + 1; // Default to index + 1 if questionNumber is not available

      if (item.disc_index < 0.2) {
        return {
          questionNumber: questionNumber,
          category: "Poor (Bad) Questions",
          disc_index: item.disc_index,
          correctAnswersPercentage: item.correctAnswersPercentage,
        };
      } else if (item.correctAnswersPercentage <= 0.2) {
        return {
          questionNumber: questionNumber,
          category: "Very Difficult Question",
          disc_index: item.disc_index,
          correctAnswersPercentage: item.correctAnswersPercentage,
        };
      } else if (item.correctAnswersPercentage <= 0.3) {
        return {
          questionNumber: questionNumber,
          category: " Difficult Question",
          disc_index: item.disc_index,
          correctAnswersPercentage: item.correctAnswersPercentage,
        };
      } else if (item.correctAnswersPercentage <= 0.7) {
        return {
          questionNumber: questionNumber,
          category: "Good Question",
          questionNumber: questionNumber,
          correctAnswersPercentage: item.correctAnswersPercentage,
        };
      } else if (item.correctAnswersPercentage <= 0.8) {
        return {
          questionNumber: questionNumber,
          category: "Easy Question",
          disc_index: item.disc_index,
          correctAnswersPercentage: item.correctAnswersPercentage,
        };
      } else {
        return {
          questionNumber: questionNumber,
          category: "Very Easy Question",
          questionNumber: questionNumber,
          correctAnswersPercentage: item.correctAnswersPercentage,
        };
      }
    });

    const resdata = await Class.findByIdAndUpdate(latestId[0]._id, {
      KR20: KR20,
      questionAnalysis: newArray,
    });

    return resdata


  } catch (error) {
    console.log(error.message);
  }
};

async function getResultData() {
  try {
    const classData = await Class.findOne()
      .sort({ createdAt: -1 })
      .populate("students")







    // Create key-value object for question types
    const questionTypes = {
      "Poor (Bad) Questions": [],
      "Very Difficult Question": [],
      "Difficult Question": [],
      "Good Question": [],
      "Easy Question": [],
      "Very Easy Question": [],
    };

    classData.questionAnalysis.forEach((item) => {
      if (questionTypes[item.category]) {
        const questionNumber = parseInt(item.questionNumber.replace('Q', ''), 10);
        questionTypes[item.category].push(questionNumber);
      }
    });
    // console.log("🚀 ~ exports.getResultData= ~ questionTypes:", questionTypes)

    classData.questionSummary = questionTypes;
    classData.save()




    return questionTypes;

  } catch (error) {
    console.log(error.message);
  }
};


exports.getFinalResult = async (req, res) => {

  try {

    const cal = await calculateResult();
    console.log(cal, "---121")
    const resdata = await getResultData();
    console.log(resdata)
    const grades = await getGrades()
    console.log(grades)


    if(!cal || !resdata || !grades){
      return res.status(500).json({ message: "Internal server error" });
    } 
    res.status(200).json({ message: "Result calculated successfully", calculateResult: cal,
      getResultData : resdata, 
      getGrades: grades
     });




  } catch (error) {
    console.log(error.message);

  }
}

exports.getstudentData = async (req, res) => {
  const classData = await Class.find()
    .sort({ createdAt: -1 })
    .populate("students");

  res.status(200).json({ data: classData });
};
