const xlsx = require("xlsx");
const mongoose = require("mongoose");
const Student = require("../models/student");
const Class = require("../models/excelmodel");
const math = require("mathjs");
const simpleStatistics = require("simple-statistics");
const { getGrades } = require("./grading");
const User = require("../models/usermodel");
async function getLatestClassWithStudentScores(id) {
  try {
    const latestClass = await Class.findById(id)
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

exports.createClass = async (req, res) => {
  const { id } = req.params;
  const {
    college,
    univerity,
    className,
    level,
    nameOfCourse,
    courseCode,
    creditHours,
    semester,
    academicYear,

    courseCoordinator,

  } = req.body;
  console.log("🚀 ~ exports.createClass= ~ req.body:", req.body)

  const newClass = new Class({
    user: id,
    college,
    className,
    univerity,
    level,
    nameOfCourse,
    courseCode,
    creditHours,
    semester,
    academicYear,

    courseCoordinator,

  });
  try {
    const savedClass = await newClass.save();
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.reports.push(newClass._id);
    await user.save();
    res.status(201).json({
      data: savedClass._id,
      message: "Class Create Successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }

};

exports.listClasses = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate('classes');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ classes: user.classes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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

exports.uploadFile = async (req, res) => {

  const { id } = req.params;
  
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
  console.log("🚀 ~ exports.uploadFile= ~ IncorrectColumnIndex:", IncorrectColumnIndex)

  const IncorrectIndexData = dataSheet2
    .slice(5)
    .map((row) => row[IncorrectColumnIndex])

  console.log("🚀 ~ exports.uploadFile= ~ IncorrectIndexData:", IncorrectIndexData)

  const correctIndexData = IncorrectIndexData.map((value) => parseFloat((100 - (value * 100)).toFixed(2)));
  console.log("🚀 ~ exports.uploadFile= ~ correctIndexData:", correctIndexData)


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
  console.log("🚀 ~ exports.uploadFile= ~ answerKeyDat:", answerKeyData)

  const TotalStudents = answerKeyData.Score;
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
      percentage: row.Score ? (row.Score / TotalStudents) * 100 : 0,
      score: score,
      questions: studentAnswers,
    };
  });

  // Create a new class with the answer key

  const latestClass = await Class.findById(id);

  if(!latestClass){
    return res.status(401).json({
      message: "NO class present"
    })
  }

  latestClass.answerKey = answerKey;
  latestClass.correctIndexData = correctIndexData;
  latestClass.discIndexData = discIndexData;


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

const extractColumnData = (dataSheet, columnName, headerRowIndex, dataStartRowIndex) => {
  const columnIndex = dataSheet[headerRowIndex].indexOf(columnName);
  return dataSheet
    .slice(dataStartRowIndex)
    .map(row => row[columnIndex])
    .filter(value => value !== null && value !== undefined);
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

async function calculateResult(id) {
  try {
    console.log("🚀 ~ calculateResult ~ id121:", id)

    const classData = await Class.findById(id).populate("students");
    console.log("🚀 ~ calculateResult ~ classData:", classData)

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



    async function calculateSingleValue(scores) {
      const variance = simpleStatistics.variance(scores, { sample: false });
      return variance;
    }
    const studentScores = await getLatestClassWithStudentScores(id);
   

    const scores = studentScores.map((student) => student.score);

    const variance = await calculateSingleValue(scores);
    // console.log("🚀 ~ exports.calculateResult= ~ variance:", variance);

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

    const latestId = await Class.findById(id);
    await Class.findByIdAndUpdate(latestId._id, {
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




    const KR20 =
    (answerKeys?.length / (answerKeys?.length - 1)) *
    (1 - QA_PQ_Sum / variance);
    
    const newArray = disc_.map((item, index) => {
      const questionNumber = item.questionNumber || index + 1; // Default to index + 1 if questionNumber is not available
      
      // console.log("🚀 ~ newArray ~ item.disc_index :", item.disc_index )
      // console.log("🚀 ~ newArray ~ item.correctAnswersPercentage:", item.correctAnswersPercentage)
      if (item.disc_index < 0.2 && item.correctAnswersPercentage >= 0 ) {
        return {
          questionNumber: questionNumber,
          category: "Poor (Bad) Questions",
          disc_index: item.disc_index,
          correctAnswersPercentage: item.correctAnswersPercentage,
        }}
        if (item.disc_index >= 0.2 && item.correctAnswersPercentage >=0 && item.correctAnswersPercentage <= 20) {
          return {
            questionNumber: questionNumber,
            category: "Very Difficult Question",
            disc_index: item.disc_index,
            correctAnswersPercentage: item.correctAnswersPercentage,
          }}
          if (item.correctAnswersPercentage >= 21 && item.correctAnswersPercentage <= 30 ) {
            return {
              questionNumber: questionNumber,
              category: " Difficult Question",
              disc_index: item.disc_index,
              correctAnswersPercentage: item.correctAnswersPercentage,
            }}
            if (item.correctAnswersPercentage >= 31 && item.correctAnswersPercentage <= 70) {
              return {
                questionNumber: questionNumber,
                category: "Good Question",
                questionNumber: questionNumber,
                correctAnswersPercentage: item.correctAnswersPercentage,
              }}
              if (item.correctAnswersPercentage >= 71 && item.correctAnswersPercentage <= 80) {
                return {
                  questionNumber: questionNumber,
                  category: "Easy Question",
                  disc_index: item.disc_index,
                  correctAnswersPercentage: item.correctAnswersPercentage,
                }}
                if(item.correctAnswersPercentage >= 81 && item.correctAnswersPercentage <= 100){
                  return {
                    questionNumber: questionNumber,
                    category: "Very Easy Question",
                    questionNumber: questionNumber,
                    correctAnswersPercentage: item.correctAnswersPercentage,
                  }}
                  
                });
                
                
                
                console.log("🚀 ~ calculateResult ~ KR20:", KR20)

                const resdata = await Class.findByIdAndUpdate(id, {
                  kr20: KR20,
                  questionAnalysis: newArray,
                });
                console.log("🚀 ~ calculateResult ~ resdata:", resdata)
                
                
    return resdata;


  } catch (error) {
    console.log(error.message);
  }
};

async function getResultData(id) {
  try {

    const classData = await Class.findById(id).populate("students")







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
    await classData.save()




    return questionTypes;

  } catch (error) {
    console.log(error.message);
  }
};


exports.getFinalResult = async (req, res) => {

  try {

    const {id} = req.params
    console.log("🚀 ~ exports.getFinalResult= ~ id11:", id)
        // Validate the id
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).send("Invalid ID format");
        }
    

    const cal = await calculateResult(id);
    console.log(cal, "---121")
    const resdata = await getResultData(id);
    console.log(resdata, "505")
    const grades = await getGrades(id)
    console.log(grades, "507")


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

  const {id} = req.params;
  
  const classData = await Class.findById(id)

  res.status(200).json({ data: classData });
};
