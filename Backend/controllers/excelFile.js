const xlsx = require('xlsx');
const mongoose = require('mongoose');
const Student = require('../models/student');
const Class = require('../models/excelmodel');
const math = require('mathjs');
const simpleStatistics = require('simple-statistics');
exports.uploadFile = async (req, res) => {
  const file = req.file;
  const workbook = await xlsx.readFile(file.path);
  const sheetNames = workbook.SheetNames;

  // Get sheets at index 0 and 2
  const sheet1 = workbook.Sheets[sheetNames[0]];
  const sheet2 = workbook.Sheets[sheetNames[2]];
  
  const data = xlsx.utils.sheet_to_json(sheet1);

  const dataSheet2 = xlsx.utils.sheet_to_json(sheet2, { header: 1 });




  //Getting DIsc INdext data
 const discIndexColumnIndex = dataSheet2[4].indexOf('Disc. Index');
 const discIndexData = dataSheet2.slice(5)
 .map(row => row[discIndexColumnIndex])
 .filter(value => value !== null && value !== undefined);

 const IncorrectColumnIndex = dataSheet2[4].indexOf('Pct. Incorrect');

 const IncorrectIndexData = dataSheet2.slice(5)
 .map(row => row[discIndexColumnIndex])
 .filter(value => value !== null && value !== undefined);
 
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
        questionColumns.push({ question: key.replace(/\s/g, ''), answer: row[key] }); // Remove spaces from keys
      }
    });
    return questionColumns;
  };
  // Extract answer key from the first row
  const answerKeyData = data.slice(0, 1)[0];
  const answerKey = extractQuestionColumns(answerKeyData);
  console.log("🚀 ~ exports.uploadFile= ~ answerKey:", answerKey);

  // Function to dynamically extract columns that match a pattern
  

  // Function to parse percentage strings to numbers
  const parsePercentage = (percentage) => {
    if (typeof percentage === 'string') {
      return parseFloat(percentage.replace('%', ''));
    }
    return percentage;
  };

  // Function to calculate score based on the answer key
  const calculateScore = (studentAnswers, answerKey) => {
    let score = 0;
    studentAnswers.forEach((answer) => {
      const correctAnswer = answerKey.find((key) => key.question === answer.question);
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
  const newClass = new Class({
    className: 'Class 1', // You can set this dynamically
    answerKey: answerKey,
    incorrectIndexData: IncorrectIndexData ,
    discIndexData: discIndexData,
  });

  try {
    // Save the class to get the class ID
    const savedClass = await newClass.save();

    // Save students and get their IDs
    const savedStudents = await Student.insertMany(studentsData);

    // Update the class with the student IDs
    savedClass.students = savedStudents.map(student => student._id);
    await savedClass.save();






    // Calculation
  









    console.log('Class and students saved successfully');
    res.status(200).json({ message: "File uploaded successfully", data: savedStudents });
  } catch (error) {
    console.error('Error saving class and students:', error);
    res.status(500).json({ message: "Error saving data", error });
  }
};
function assignGrade(percentage) {
  if (percentage >= 95) return 'A+';
  if (percentage >= 90) return 'A';
  if (percentage >= 85) return 'B+';
  if (percentage >= 80) return 'B';
  if (percentage >= 75) return 'C+';
  if (percentage >= 70) return 'C';
  if (percentage >= 65) return 'D+';
  if (percentage >= 60) return 'D';
  return 'F';
}

exports.calculateResult = async (req, res) => {
  try {
    const classData = await Class.findById({ _id: "66c998b41052ee69590f4a7b" }).populate("students");
    const answerKeys = classData.answerKey; // Extract answer keys from the class data

    const QA_P = {};
    const QA_Q = {};
    const QA_PQ = {};
    let QA_PQ_Sum = 0;

    for (const answerKey of answerKeys) {
      const accuracies = [];

      for (const student of classData.students) {
        const studentAnswer = student.questions.find(q => q.question === answerKey.question);

        if (studentAnswer) {
          const isCorrect = studentAnswer.answer === answerKey.answer;
          accuracies.push(isCorrect ? 1 : 0);

          if (answerKey.question === "Q5") {
            console.log("Student Key:", student._id);
            console.log("Student Answer:", studentAnswer.answer);
          }
        }
      }

      const totalStudents = classData.students.length;
      const questionAccuracyValue = accuracies.reduce((sum, accuracy) => sum + accuracy, 0) / totalStudents;

      const roundedAccuracy = questionAccuracyValue.toFixed(2);

      QA_P[answerKey.question] = roundedAccuracy;
      QA_Q[answerKey.question] = (1 - questionAccuracyValue).toFixed(2);
      QA_PQ[answerKey.question] = (roundedAccuracy * (1 - questionAccuracyValue)).toFixed(2);

      QA_PQ_Sum += parseFloat(QA_PQ[answerKey.question]);
    }

    const studentScores = {
      stud_1: 45.00,
      stud_2: 48.00,
      stud_3: 44.00,
      stud_4: 48.00,
      stud_5: 47.00,
      stud_6: 46.00,
      stud_7: 46.00,
      stud_8: 46.00,
      stud_9: 44.00,
      stud_10: 46.00,
      stud_11: 47.00,
      stud_12: 45.00,
      stud_13: 42.00,
      stud_14: 44.00,
      stud_15: 31.00,
      stud_16: 43.00,
      stud_17: 40.00,
      stud_18: 43.00
    };


    function calculatePercentagesAndGrades(classData) {
      const percentages = {};
  
      classData.students.forEach(student => {
          const percentage = student.percentage; // Extract the percentage
          const grade = assignGrade(percentage); // Assign the grade
          percentages[student.name] = {
              percentage: percentage.toFixed(2),
              grade: grade
          };
      });
  
      return percentages;
  }





  const studentGrades = calculatePercentagesAndGrades(classData);
   
    function calculateSingleValue(scores) {
      // Convert the object values to an array
      const scoreArray = Object.values(scores);

      // Calculate the population variance using simple-statistics
      const variance = simpleStatistics.variance(scoreArray, { sample: false });

      return variance;
    }

    const variance = calculateSingleValue(studentScores);
    // =(C27/(C27-1))*(1-(C28/C29))


    const KR20 = (answerKeys?.length / (answerKeys?.length - 1) * ( 1 - (QA_PQ_Sum.toFixed(2) / variance.toFixed(2) )))
    res.json({
      studentGrades,
      KR20,
      answerKeys: answerKeys?.length,
      QA_P,
      QA_Q,
      QA_PQ,
      QA_PQ_Sum: QA_PQ_Sum.toFixed(2),
      variance: variance.toFixed(2),
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.getstudentData = async (req, res) => {
  const classData = await Class.find().sort({ createdAt: -1 }).populate("students");

  res.status(200).json({ data: classData });
}


// {
//   "_id": "66cc5b30a87356aeefd5c86d",
//   "className": "Class 1",
//   "students": [
//       {
//           "_id": "66cc5b30a87356aeefd5c8bf",
//           "name": "hahr",
//           "idNumber": "10001",
//           "blankCount": 0,
//           "correctCount": 54,
//           "percentage": 67.5,
//           "score": 54,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8c0"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8c1"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c8c2"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8c3"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8c4"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c8c5"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8c6"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8c7"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c8c8"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8c9"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8ca"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8cb"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c8cc"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8cd"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c8ce"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8cf"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c8d0"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c8d1"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8d2"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c8d3"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8d4"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8d5"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8d6"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8d7"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8d8"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8d9"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c8da"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8db"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8dc"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8dd"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c8de"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8df"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8e0"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8e1"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8e2"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8e3"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8e4"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c8e5"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8e6"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c8e7"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8e8"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c8e9"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c8ea"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c8eb"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8ec"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8ed"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8ee"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8ef"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8f0"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8f1"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c8f2"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8f3"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c8f4"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c8f5"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c8f6"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c8f7"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8f8"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c8f9"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c8fa"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c8fb"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c8fc"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c8fd"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c8fe"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c8ff"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c900"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c901"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c902"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c903"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c904"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c905"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c906"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c907"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c908"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c909"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c90a"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c90b"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c90c"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c90d"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c90e"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c90f"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5c910",
//           "name": "dssd",
//           "idNumber": "10002",
//           "blankCount": 0,
//           "correctCount": 54,
//           "percentage": 67.5,
//           "score": 54,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c911"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c912"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c913"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c914"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c915"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c916"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c917"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c918"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c919"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c91a"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c91b"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c91c"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c91d"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c91e"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c91f"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c920"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c921"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c922"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c923"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c924"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c925"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c926"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c927"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c928"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c929"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c92a"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c92b"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c92c"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c92d"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c92e"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c92f"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c930"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c931"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c932"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c933"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c934"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c935"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c936"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c937"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c938"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c939"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c93a"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c93b"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c93c"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c93d"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c93e"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c93f"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c940"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c941"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c942"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c943"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c944"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c945"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c946"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c947"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c948"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c949"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c94a"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c94b"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c94c"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c94d"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c94e"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c94f"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c950"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c951"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c952"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c953"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c954"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c955"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c956"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c957"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c958"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c959"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c95a"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c95b"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c95c"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c95d"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c95e"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c95f"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c960"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5c961",
//           "name": "vf",
//           "idNumber": "10003",
//           "blankCount": 0,
//           "correctCount": 55,
//           "percentage": 68.8,
//           "score": 55,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c962"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c963"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c964"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c965"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c966"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c967"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c968"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c969"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c96a"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c96b"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c96c"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c96d"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c96e"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c96f"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c970"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c971"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c972"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c973"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c974"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c975"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c976"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c977"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c978"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c979"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c97a"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c97b"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c97c"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c97d"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c97e"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c97f"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c980"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c981"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c982"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c983"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c984"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c985"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c986"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c987"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c988"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c989"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c98a"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c98b"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c98c"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c98d"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c98e"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c98f"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c990"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c991"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c992"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c993"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c994"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c995"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c996"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c997"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c998"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c999"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c99a"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c99b"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c99c"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c99d"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c99e"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c99f"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9a0"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9a1"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9a2"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c9a3"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9a4"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9a5"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9a6"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9a7"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9a8"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9a9"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c9aa"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9ab"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c9ac"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c9ad"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9ae"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9af"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9b0"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9b1"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5c9b2",
//           "name": "we",
//           "idNumber": "10004",
//           "blankCount": 0,
//           "correctCount": 66,
//           "percentage": 82.5,
//           "score": 66,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9b3"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9b4"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c9b5"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9b6"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9b7"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c9b8"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9b9"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9ba"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c9bb"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9bc"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9bd"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9be"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c9bf"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9c0"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9c1"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9c2"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9c3"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c9c4"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9c5"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c9c6"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9c7"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9c8"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9c9"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9ca"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9cb"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9cc"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9cd"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9ce"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9cf"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9d0"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c9d1"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9d2"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9d3"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9d4"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9d5"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9d6"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c9d7"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9d8"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9d9"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c9da"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9db"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c9dc"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9dd"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9de"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c9df"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9e0"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9e1"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9e2"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9e3"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c9e4"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9e5"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9e6"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9e7"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9e8"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9e9"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9ea"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9eb"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9ec"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9ed"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9ee"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c9ef"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9f0"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9f1"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9f2"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9f3"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c9f4"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9f5"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9f6"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9f7"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5c9f8"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9f9"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c9fa"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5c9fb"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5c9fc"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c9fd"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5c9fe"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5c9ff"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca00"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ca01"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca02"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5ca03",
//           "name": "bfdbfdbfdsbfdsbfd",
//           "idNumber": "10005",
//           "blankCount": 0,
//           "correctCount": 53,
//           "percentage": 66.3,
//           "score": 53,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca04"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca05"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca06"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca07"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca08"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ca09"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca0a"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca0b"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca0c"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca0d"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca0e"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca0f"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca10"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca11"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca12"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca13"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca14"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca15"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca16"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ca17"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca18"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ca19"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca1a"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca1b"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca1c"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca1d"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca1e"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca1f"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca20"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca21"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca22"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca23"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca24"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca25"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca26"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca27"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca28"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca29"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca2a"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca2b"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca2c"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca2d"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca2e"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca2f"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca30"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca31"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca32"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca33"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca34"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca35"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca36"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca37"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca38"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca39"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca3a"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca3b"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca3c"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca3d"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ca3e"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca3f"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ca40"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca41"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca42"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca43"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca44"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca45"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca46"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca47"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca48"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca49"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca4a"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca4b"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca4c"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca4d"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ca4e"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca4f"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca50"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ca51"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca52"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca53"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5ca54",
//           "name": "cd",
//           "idNumber": "10006",
//           "blankCount": 0,
//           "correctCount": 57,
//           "percentage": 71.3,
//           "score": 57,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca55"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca56"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca57"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca58"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca59"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ca5a"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca5b"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca5c"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca5d"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca5e"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca5f"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca60"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca61"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca62"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca63"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca64"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca65"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca66"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca67"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ca68"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca69"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca6a"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca6b"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca6c"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca6d"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca6e"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca6f"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca70"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca71"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca72"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca73"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca74"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca75"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca76"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca77"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca78"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ca79"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca7a"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca7b"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca7c"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca7d"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca7e"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca7f"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca80"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca81"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca82"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca83"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca84"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca85"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca86"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca87"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca88"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca89"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca8a"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca8b"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca8c"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca8d"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca8e"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca8f"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca90"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ca91"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca92"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca93"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ca94"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca95"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ca96"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca97"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca98"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ca99"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca9a"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca9b"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ca9c"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ca9d"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ca9e"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ca9f"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5caa0"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5caa1"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5caa2"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5caa3"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5caa4"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5caa5",
//           "name": "fs",
//           "idNumber": "10007",
//           "blankCount": 0,
//           "correctCount": 62,
//           "percentage": 77.5,
//           "score": 62,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5caa6"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5caa7"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5caa8"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5caa9"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5caaa"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5caab"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5caac"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5caad"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5caae"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5caaf"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cab0"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cab1"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cab2"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cab3"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cab4"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cab5"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cab6"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cab7"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cab8"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cab9"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5caba"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cabb"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cabc"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cabd"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cabe"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cabf"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cac0"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cac1"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cac2"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cac3"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cac4"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cac5"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cac6"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cac7"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cac8"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cac9"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5caca"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cacb"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cacc"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cacd"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cace"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cacf"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cad0"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cad1"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cad2"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cad3"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cad4"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cad5"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cad6"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cad7"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cad8"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cad9"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cada"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cadb"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cadc"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cadd"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cade"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cadf"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cae0"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cae1"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cae2"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cae3"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cae4"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cae5"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cae6"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cae7"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cae8"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cae9"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5caea"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5caeb"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5caec"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5caed"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5caee"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5caef"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5caf0"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5caf1"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5caf2"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5caf3"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5caf4"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5caf5"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5caf6",
//           "name": "ge",
//           "idNumber": "10008",
//           "blankCount": 0,
//           "correctCount": 66,
//           "percentage": 82.5,
//           "score": 66,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5caf7"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5caf8"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5caf9"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cafa"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cafb"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cafc"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cafd"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cafe"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5caff"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb00"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb01"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb02"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb03"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb04"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb05"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb06"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb07"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb08"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb09"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cb0a"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb0b"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb0c"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb0d"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb0e"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb0f"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb10"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb11"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb12"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb13"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb14"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb15"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb16"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb17"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb18"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb19"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb1a"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cb1b"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb1c"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb1d"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb1e"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb1f"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb20"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb21"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb22"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb23"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb24"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb25"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb26"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb27"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb28"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb29"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb2a"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb2b"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb2c"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb2d"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb2e"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb2f"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb30"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cb31"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb32"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cb33"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb34"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb35"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb36"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb37"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cb38"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb39"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb3a"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb3b"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb3c"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb3d"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cb3e"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb3f"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb40"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cb41"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb42"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb43"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb44"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb45"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb46"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5cb47",
//           "name": "bhy",
//           "idNumber": "10009",
//           "blankCount": 0,
//           "correctCount": 73,
//           "percentage": 91.3,
//           "score": 73,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb48"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb49"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb4a"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb4b"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb4c"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cb4d"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb4e"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb4f"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb50"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb51"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb52"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb53"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb54"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb55"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb56"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb57"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb58"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb59"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb5a"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cb5b"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb5c"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb5d"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb5e"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb5f"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb60"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb61"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb62"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb63"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb64"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb65"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb66"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb67"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb68"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb69"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb6a"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb6b"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cb6c"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb6d"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb6e"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb6f"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb70"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb71"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb72"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb73"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb74"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb75"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb76"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb77"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb78"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb79"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb7a"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb7b"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb7c"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb7d"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb7e"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb7f"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb80"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb81"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cb82"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb83"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cb84"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb85"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb86"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb87"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb88"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cb89"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb8a"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb8b"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb8c"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb8d"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb8e"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cb8f"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb90"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb91"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cb92"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb93"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb94"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb95"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb96"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb97"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5cb98",
//           "name": "bjyt",
//           "idNumber": "10010",
//           "blankCount": 1,
//           "correctCount": 39,
//           "percentage": 48.8,
//           "score": 39,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cb99"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb9a"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cb9b"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb9c"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb9d"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cb9e"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cb9f"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cba0"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cba1"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cba2"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cba3"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cba4"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cba5"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cba6"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cba7"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cba8"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cba9"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbaa"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbab"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cbac"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbad"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbae"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbaf"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbb0"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbb1"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbb2"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cbb3"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbb4"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbb5"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbb6"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbb7"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbb8"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbb9"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbba"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbbb"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbbc"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbbd"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "",
//                   "_id": "66cc5b30a87356aeefd5cbbe"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cbbf"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbc0"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbc1"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbc2"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbc3"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbc4"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbc5"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbc6"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbc7"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cbc8"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cbc9"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbca"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbcb"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbcc"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbcd"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbce"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cbcf"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cbd0"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbd1"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbd2"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cbd3"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbd4"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cbd5"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbd6"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cbd7"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cbd8"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cbd9"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbda"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbdb"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cbdc"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbdd"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cbde"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbdf"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbe0"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbe1"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cbe2"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbe3"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbe4"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbe5"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbe6"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbe7"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cbe8"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5cbe9",
//           "name": "brjty",
//           "idNumber": "10011",
//           "blankCount": 0,
//           "correctCount": 57,
//           "percentage": 71.3,
//           "score": 57,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbea"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbeb"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cbec"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbed"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbee"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cbef"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbf0"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbf1"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cbf2"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbf3"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbf4"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbf5"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cbf6"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbf7"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cbf8"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbf9"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cbfa"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cbfb"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbfc"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cbfd"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cbfe"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cbff"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc00"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc01"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc02"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc03"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc04"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc05"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc06"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc07"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc08"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc09"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc0a"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc0b"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc0c"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc0d"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc0e"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc0f"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc10"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc11"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc12"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc13"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc14"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc15"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc16"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc17"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc18"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc19"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc1a"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc1b"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc1c"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc1d"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc1e"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc1f"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc20"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc21"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc22"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc23"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc24"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc25"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc26"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc27"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc28"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc29"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc2a"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc2b"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc2c"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc2d"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc2e"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc2f"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc30"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc31"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc32"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc33"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc34"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc35"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc36"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc37"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc38"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc39"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5cc3a",
//           "name": "btryjrtyj",
//           "idNumber": "10012",
//           "blankCount": 0,
//           "correctCount": 66,
//           "percentage": 82.5,
//           "score": 66,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc3b"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc3c"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc3d"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc3e"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc3f"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc40"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc41"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc42"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc43"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc44"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc45"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc46"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc47"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc48"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc49"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc4a"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc4b"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc4c"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc4d"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc4e"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc4f"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc50"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc51"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc52"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc53"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc54"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc55"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc56"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc57"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc58"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc59"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc5a"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc5b"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc5c"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc5d"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc5e"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc5f"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc60"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc61"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc62"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc63"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc64"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc65"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc66"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc67"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc68"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc69"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc6a"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc6b"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc6c"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc6d"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc6e"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc6f"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc70"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc71"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc72"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc73"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc74"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc75"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc76"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc77"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc78"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc79"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc7a"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc7b"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc7c"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc7d"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc7e"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc7f"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc80"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc81"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc82"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc83"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc84"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc85"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc86"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc87"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc88"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc89"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc8a"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5cc8b",
//           "name": "rcqwfe",
//           "idNumber": "10013",
//           "blankCount": 0,
//           "correctCount": 72,
//           "percentage": 90,
//           "score": 72,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc8c"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc8d"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc8e"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc8f"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc90"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc91"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc92"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc93"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc94"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc95"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc96"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc97"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cc98"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc99"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc9a"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cc9b"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cc9c"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc9d"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cc9e"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cc9f"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cca0"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cca1"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cca2"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cca3"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cca4"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cca5"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cca6"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cca7"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cca8"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cca9"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ccaa"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccab"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccac"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccad"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccae"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccaf"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ccb0"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ccb1"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccb2"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ccb3"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ccb4"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ccb5"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccb6"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ccb7"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ccb8"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccb9"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccba"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccbb"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccbc"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ccbd"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ccbe"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccbf"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccc0"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccc1"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ccc2"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ccc3"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccc4"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ccc5"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ccc6"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccc7"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ccc8"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccc9"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ccca"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cccb"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cccc"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cccd"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccce"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cccf"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ccd0"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ccd1"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccd2"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ccd3"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ccd4"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccd5"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ccd6"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccd7"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccd8"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ccd9"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ccda"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ccdb"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5ccdc",
//           "name": "cqe",
//           "idNumber": "10014",
//           "blankCount": 0,
//           "correctCount": 62,
//           "percentage": 77.5,
//           "score": 62,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccdd"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccde"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ccdf"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cce0"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cce1"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cce2"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cce3"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cce4"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cce5"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cce6"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cce7"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cce8"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cce9"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccea"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cceb"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccec"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cced"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccee"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccef"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ccf0"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccf1"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccf2"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccf3"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccf4"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccf5"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccf6"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ccf7"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccf8"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccf9"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccfa"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ccfb"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccfc"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ccfd"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccfe"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ccff"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd00"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cd01"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd02"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd03"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd04"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd05"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd06"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd07"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd08"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd09"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd0a"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd0b"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd0c"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd0d"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd0e"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd0f"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd10"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd11"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd12"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd13"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd14"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd15"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd16"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cd17"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd18"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cd19"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd1a"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd1b"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd1c"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd1d"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cd1e"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd1f"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd20"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd21"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd22"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd23"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd24"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd25"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd26"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd27"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cd28"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cd29"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd2a"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd2b"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd2c"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5cd2d",
//           "name": "cqr",
//           "idNumber": "10015",
//           "blankCount": 0,
//           "correctCount": 66,
//           "percentage": 82.5,
//           "score": 66,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd2e"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd2f"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd30"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd31"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd32"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cd33"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd34"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd35"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd36"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd37"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd38"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd39"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd3a"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd3b"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd3c"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd3d"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd3e"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd3f"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd40"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd41"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd42"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd43"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd44"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd45"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd46"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd47"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd48"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd49"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd4a"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd4b"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd4c"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd4d"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd4e"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd4f"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd50"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd51"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cd52"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd53"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd54"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd55"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd56"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd57"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd58"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd59"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd5a"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd5b"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd5c"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd5d"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd5e"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd5f"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd60"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd61"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd62"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd63"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd64"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd65"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd66"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd67"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd68"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd69"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cd6a"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd6b"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd6c"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd6d"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd6e"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cd6f"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd70"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd71"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd72"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd73"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd74"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd75"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd76"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd77"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cd78"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd79"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd7a"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd7b"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cd7c"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd7d"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5cd7e",
//           "name": "grebf",
//           "idNumber": "10016",
//           "blankCount": 0,
//           "correctCount": 43,
//           "percentage": 53.8,
//           "score": 43,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd7f"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd80"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd81"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd82"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd83"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd84"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd85"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd86"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd87"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd88"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd89"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd8a"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd8b"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd8c"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd8d"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd8e"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd8f"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd90"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd91"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd92"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd93"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd94"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd95"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd96"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd97"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd98"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cd99"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd9a"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd9b"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd9c"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cd9d"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cd9e"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cd9f"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cda0"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cda1"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cda2"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cda3"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cda4"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cda5"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cda6"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cda7"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cda8"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cda9"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cdaa"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdab"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdac"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdad"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdae"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdaf"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cdb0"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cdb1"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdb2"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdb3"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdb4"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cdb5"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdb6"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdb7"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cdb8"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cdb9"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdba"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cdbb"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cdbc"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cdbd"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cdbe"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdbf"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdc0"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cdc1"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdc2"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdc3"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdc4"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cdc5"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cdc6"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdc7"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdc8"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cdc9"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdca"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cdcb"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdcc"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdcd"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cdce"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5cdcf",
//           "name": "dfbbfds",
//           "idNumber": "10017",
//           "blankCount": 0,
//           "correctCount": 53,
//           "percentage": 66.3,
//           "score": 53,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdd0"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdd1"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cdd2"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cdd3"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdd4"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cdd5"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cdd6"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cdd7"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdd8"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdd9"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cdda"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cddb"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cddc"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cddd"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdde"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cddf"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cde0"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cde1"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cde2"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cde3"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cde4"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cde5"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cde6"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cde7"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cde8"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cde9"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cdea"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cdeb"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdec"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cded"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdee"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cdef"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdf0"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdf1"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdf2"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cdf3"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cdf4"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cdf5"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cdf6"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdf7"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cdf8"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdf9"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdfa"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cdfb"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cdfc"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdfd"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdfe"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cdff"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce00"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce01"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce02"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce03"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce04"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce05"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce06"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce07"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce08"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce09"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce0a"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce0b"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce0c"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce0d"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce0e"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce0f"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce10"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce11"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce12"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce13"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce14"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce15"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce16"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce17"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce18"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce19"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce1a"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce1b"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce1c"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce1d"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce1e"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce1f"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5ce20",
//           "name": "bfsd",
//           "idNumber": "10018",
//           "blankCount": 0,
//           "correctCount": 60,
//           "percentage": 75,
//           "score": 60,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce21"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce22"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce23"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce24"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce25"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce26"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce27"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce28"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce29"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce2a"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce2b"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce2c"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce2d"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce2e"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce2f"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce30"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce31"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce32"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce33"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce34"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce35"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce36"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce37"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce38"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce39"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce3a"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce3b"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce3c"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce3d"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce3e"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce3f"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce40"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce41"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce42"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce43"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce44"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce45"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce46"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce47"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce48"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce49"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce4a"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce4b"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce4c"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce4d"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce4e"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce4f"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce50"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce51"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce52"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce53"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce54"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce55"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce56"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce57"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce58"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce59"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce5a"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce5b"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce5c"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce5d"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce5e"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce5f"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce60"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce61"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce62"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce63"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce64"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce65"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce66"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce67"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce68"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce69"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce6a"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce6b"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce6c"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce6d"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce6e"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce6f"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce70"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5ce71",
//           "name": "bdfs",
//           "idNumber": "10019",
//           "blankCount": 0,
//           "correctCount": 54,
//           "percentage": 67.5,
//           "score": 54,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce72"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce73"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce74"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce75"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce76"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce77"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce78"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce79"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce7a"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce7b"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce7c"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce7d"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce7e"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce7f"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce80"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce81"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce82"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce83"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce84"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce85"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce86"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce87"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce88"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce89"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce8a"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce8b"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce8c"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce8d"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce8e"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce8f"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce90"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce91"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce92"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce93"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce94"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce95"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ce96"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce97"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ce98"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce99"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce9a"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce9b"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce9c"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ce9d"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ce9e"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ce9f"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cea0"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cea1"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cea2"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cea3"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cea4"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cea5"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cea6"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cea7"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cea8"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cea9"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ceaa"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ceab"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ceac"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cead"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ceae"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ceaf"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ceb0"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ceb1"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ceb2"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ceb3"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ceb4"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ceb5"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ceb6"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ceb7"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ceb8"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ceb9"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ceba"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cebb"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cebc"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cebd"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cebe"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cebf"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cec0"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cec1"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       },
//       {
//           "_id": "66cc5b30a87356aeefd5cec2",
//           "name": "fbds",
//           "idNumber": "10020",
//           "blankCount": 0,
//           "correctCount": 57,
//           "percentage": 71.3,
//           "score": 57,
//           "questions": [
//               {
//                   "question": "Q1",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cec3"
//               },
//               {
//                   "question": "Q2",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cec4"
//               },
//               {
//                   "question": "Q3",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cec5"
//               },
//               {
//                   "question": "Q4",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cec6"
//               },
//               {
//                   "question": "Q5",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cec7"
//               },
//               {
//                   "question": "Q6",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cec8"
//               },
//               {
//                   "question": "Q7",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cec9"
//               },
//               {
//                   "question": "Q8",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ceca"
//               },
//               {
//                   "question": "Q9",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cecb"
//               },
//               {
//                   "question": "Q10",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cecc"
//               },
//               {
//                   "question": "Q11",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cecd"
//               },
//               {
//                   "question": "Q12",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cece"
//               },
//               {
//                   "question": "Q13",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cecf"
//               },
//               {
//                   "question": "Q14",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ced0"
//               },
//               {
//                   "question": "Q15",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ced1"
//               },
//               {
//                   "question": "Q16",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ced2"
//               },
//               {
//                   "question": "Q17",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ced3"
//               },
//               {
//                   "question": "Q18",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ced4"
//               },
//               {
//                   "question": "Q19",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ced5"
//               },
//               {
//                   "question": "Q20",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ced6"
//               },
//               {
//                   "question": "Q21",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ced7"
//               },
//               {
//                   "question": "Q22",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ced8"
//               },
//               {
//                   "question": "Q23",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ced9"
//               },
//               {
//                   "question": "Q24",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ceda"
//               },
//               {
//                   "question": "Q25",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cedb"
//               },
//               {
//                   "question": "Q26",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cedc"
//               },
//               {
//                   "question": "Q27",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cedd"
//               },
//               {
//                   "question": "Q28",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cede"
//               },
//               {
//                   "question": "Q29",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cedf"
//               },
//               {
//                   "question": "Q30",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cee0"
//               },
//               {
//                   "question": "Q31",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cee1"
//               },
//               {
//                   "question": "Q32",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cee2"
//               },
//               {
//                   "question": "Q33",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cee3"
//               },
//               {
//                   "question": "Q34",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cee4"
//               },
//               {
//                   "question": "Q35",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cee5"
//               },
//               {
//                   "question": "Q36",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cee6"
//               },
//               {
//                   "question": "Q37",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cee7"
//               },
//               {
//                   "question": "Q38",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cee8"
//               },
//               {
//                   "question": "Q39",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cee9"
//               },
//               {
//                   "question": "Q40",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ceea"
//               },
//               {
//                   "question": "Q41",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5ceeb"
//               },
//               {
//                   "question": "Q42",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5ceec"
//               },
//               {
//                   "question": "Q43",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5ceed"
//               },
//               {
//                   "question": "Q44",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ceee"
//               },
//               {
//                   "question": "Q45",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5ceef"
//               },
//               {
//                   "question": "Q46",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cef0"
//               },
//               {
//                   "question": "Q47",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cef1"
//               },
//               {
//                   "question": "Q48",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cef2"
//               },
//               {
//                   "question": "Q49",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cef3"
//               },
//               {
//                   "question": "Q50",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cef4"
//               },
//               {
//                   "question": "Q51",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cef5"
//               },
//               {
//                   "question": "Q52",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cef6"
//               },
//               {
//                   "question": "Q53",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cef7"
//               },
//               {
//                   "question": "Q54",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cef8"
//               },
//               {
//                   "question": "Q55",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cef9"
//               },
//               {
//                   "question": "Q56",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cefa"
//               },
//               {
//                   "question": "Q57",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cefb"
//               },
//               {
//                   "question": "Q58",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cefc"
//               },
//               {
//                   "question": "Q59",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cefd"
//               },
//               {
//                   "question": "Q60",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cefe"
//               },
//               {
//                   "question": "Q61",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5ceff"
//               },
//               {
//                   "question": "Q62",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cf00"
//               },
//               {
//                   "question": "Q63",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cf01"
//               },
//               {
//                   "question": "Q64",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cf02"
//               },
//               {
//                   "question": "Q65",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cf03"
//               },
//               {
//                   "question": "Q66",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cf04"
//               },
//               {
//                   "question": "Q67",
//                   "answer": "B",
//                   "_id": "66cc5b30a87356aeefd5cf05"
//               },
//               {
//                   "question": "Q68",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cf06"
//               },
//               {
//                   "question": "Q69",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cf07"
//               },
//               {
//                   "question": "Q70",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cf08"
//               },
//               {
//                   "question": "Q71",
//                   "answer": "C",
//                   "_id": "66cc5b30a87356aeefd5cf09"
//               },
//               {
//                   "question": "Q72",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cf0a"
//               },
//               {
//                   "question": "Q73",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cf0b"
//               },
//               {
//                   "question": "Q74",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cf0c"
//               },
//               {
//                   "question": "Q75",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cf0d"
//               },
//               {
//                   "question": "Q76",
//                   "answer": "A",
//                   "_id": "66cc5b30a87356aeefd5cf0e"
//               },
//               {
//                   "question": "Q77",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cf0f"
//               },
//               {
//                   "question": "Q78",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cf10"
//               },
//               {
//                   "question": "Q79",
//                   "answer": "E",
//                   "_id": "66cc5b30a87356aeefd5cf11"
//               },
//               {
//                   "question": "Q80",
//                   "answer": "D",
//                   "_id": "66cc5b30a87356aeefd5cf12"
//               }
//           ],
//           "incorrectIndexData": [],
//           "discIndexData": [],
//           "__v": 0
//       }
//   ],
//   "answerKey": [
//       {
//           "question": "Q1",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c86e"
//       },
//       {
//           "question": "Q2",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c86f"
//       },
//       {
//           "question": "Q3",
//           "answer": "D",
//           "_id": "66cc5b30a87356aeefd5c870"
//       },
//       {
//           "question": "Q4",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c871"
//       },
//       {
//           "question": "Q5",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c872"
//       },
//       {
//           "question": "Q6",
//           "answer": "E",
//           "_id": "66cc5b30a87356aeefd5c873"
//       },
//       {
//           "question": "Q7",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c874"
//       },
//       {
//           "question": "Q8",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c875"
//       },
//       {
//           "question": "Q9",
//           "answer": "A",
//           "_id": "66cc5b30a87356aeefd5c876"
//       },
//       {
//           "question": "Q10",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c877"
//       },
//       {
//           "question": "Q11",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c878"
//       },
//       {
//           "question": "Q12",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c879"
//       },
//       {
//           "question": "Q13",
//           "answer": "A",
//           "_id": "66cc5b30a87356aeefd5c87a"
//       },
//       {
//           "question": "Q14",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c87b"
//       },
//       {
//           "question": "Q15",
//           "answer": "D",
//           "_id": "66cc5b30a87356aeefd5c87c"
//       },
//       {
//           "question": "Q16",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c87d"
//       },
//       {
//           "question": "Q17",
//           "answer": "D",
//           "_id": "66cc5b30a87356aeefd5c87e"
//       },
//       {
//           "question": "Q18",
//           "answer": "A",
//           "_id": "66cc5b30a87356aeefd5c87f"
//       },
//       {
//           "question": "Q19",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c880"
//       },
//       {
//           "question": "Q20",
//           "answer": "E",
//           "_id": "66cc5b30a87356aeefd5c881"
//       },
//       {
//           "question": "Q21",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c882"
//       },
//       {
//           "question": "Q22",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c883"
//       },
//       {
//           "question": "Q23",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c884"
//       },
//       {
//           "question": "Q24",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c885"
//       },
//       {
//           "question": "Q25",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c886"
//       },
//       {
//           "question": "Q26",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c887"
//       },
//       {
//           "question": "Q27",
//           "answer": "D",
//           "_id": "66cc5b30a87356aeefd5c888"
//       },
//       {
//           "question": "Q28",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c889"
//       },
//       {
//           "question": "Q29",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c88a"
//       },
//       {
//           "question": "Q30",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c88b"
//       },
//       {
//           "question": "Q31",
//           "answer": "A",
//           "_id": "66cc5b30a87356aeefd5c88c"
//       },
//       {
//           "question": "Q32",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c88d"
//       },
//       {
//           "question": "Q33",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c88e"
//       },
//       {
//           "question": "Q34",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c88f"
//       },
//       {
//           "question": "Q35",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c890"
//       },
//       {
//           "question": "Q36",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c891"
//       },
//       {
//           "question": "Q37",
//           "answer": "E",
//           "_id": "66cc5b30a87356aeefd5c892"
//       },
//       {
//           "question": "Q38",
//           "answer": "A",
//           "_id": "66cc5b30a87356aeefd5c893"
//       },
//       {
//           "question": "Q39",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c894"
//       },
//       {
//           "question": "Q40",
//           "answer": "A",
//           "_id": "66cc5b30a87356aeefd5c895"
//       },
//       {
//           "question": "Q41",
//           "answer": "D",
//           "_id": "66cc5b30a87356aeefd5c896"
//       },
//       {
//           "question": "Q42",
//           "answer": "A",
//           "_id": "66cc5b30a87356aeefd5c897"
//       },
//       {
//           "question": "Q43",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c898"
//       },
//       {
//           "question": "Q44",
//           "answer": "D",
//           "_id": "66cc5b30a87356aeefd5c899"
//       },
//       {
//           "question": "Q45",
//           "answer": "A",
//           "_id": "66cc5b30a87356aeefd5c89a"
//       },
//       {
//           "question": "Q46",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c89b"
//       },
//       {
//           "question": "Q47",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c89c"
//       },
//       {
//           "question": "Q48",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c89d"
//       },
//       {
//           "question": "Q49",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c89e"
//       },
//       {
//           "question": "Q50",
//           "answer": "A",
//           "_id": "66cc5b30a87356aeefd5c89f"
//       },
//       {
//           "question": "Q51",
//           "answer": "D",
//           "_id": "66cc5b30a87356aeefd5c8a0"
//       },
//       {
//           "question": "Q52",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c8a1"
//       },
//       {
//           "question": "Q53",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c8a2"
//       },
//       {
//           "question": "Q54",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c8a3"
//       },
//       {
//           "question": "Q55",
//           "answer": "D",
//           "_id": "66cc5b30a87356aeefd5c8a4"
//       },
//       {
//           "question": "Q56",
//           "answer": "D",
//           "_id": "66cc5b30a87356aeefd5c8a5"
//       },
//       {
//           "question": "Q57",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c8a6"
//       },
//       {
//           "question": "Q58",
//           "answer": "D",
//           "_id": "66cc5b30a87356aeefd5c8a7"
//       },
//       {
//           "question": "Q59",
//           "answer": "E",
//           "_id": "66cc5b30a87356aeefd5c8a8"
//       },
//       {
//           "question": "Q60",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c8a9"
//       },
//       {
//           "question": "Q61",
//           "answer": "D",
//           "_id": "66cc5b30a87356aeefd5c8aa"
//       },
//       {
//           "question": "Q62",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c8ab"
//       },
//       {
//           "question": "Q63",
//           "answer": "D",
//           "_id": "66cc5b30a87356aeefd5c8ac"
//       },
//       {
//           "question": "Q64",
//           "answer": "D",
//           "_id": "66cc5b30a87356aeefd5c8ad"
//       },
//       {
//           "question": "Q65",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c8ae"
//       },
//       {
//           "question": "Q66",
//           "answer": "E",
//           "_id": "66cc5b30a87356aeefd5c8af"
//       },
//       {
//           "question": "Q67",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c8b0"
//       },
//       {
//           "question": "Q68",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c8b1"
//       },
//       {
//           "question": "Q69",
//           "answer": "D",
//           "_id": "66cc5b30a87356aeefd5c8b2"
//       },
//       {
//           "question": "Q70",
//           "answer": "D",
//           "_id": "66cc5b30a87356aeefd5c8b3"
//       },
//       {
//           "question": "Q71",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c8b4"
//       },
//       {
//           "question": "Q72",
//           "answer": "E",
//           "_id": "66cc5b30a87356aeefd5c8b5"
//       },
//       {
//           "question": "Q73",
//           "answer": "A",
//           "_id": "66cc5b30a87356aeefd5c8b6"
//       },
//       {
//           "question": "Q74",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c8b7"
//       },
//       {
//           "question": "Q75",
//           "answer": "E",
//           "_id": "66cc5b30a87356aeefd5c8b8"
//       },
//       {
//           "question": "Q76",
//           "answer": "B",
//           "_id": "66cc5b30a87356aeefd5c8b9"
//       },
//       {
//           "question": "Q77",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c8ba"
//       },
//       {
//           "question": "Q78",
//           "answer": "C",
//           "_id": "66cc5b30a87356aeefd5c8bb"
//       },
//       {
//           "question": "Q79",
//           "answer": "E",
//           "_id": "66cc5b30a87356aeefd5c8bc"
//       },
//       {
//           "question": "Q80",
//           "answer": "D",
//           "_id": "66cc5b30a87356aeefd5c8bd"
//       }
//   ],
//   "__v": 1
// }