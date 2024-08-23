const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient, Prisma } = require("@prisma/client");
const multer = require("multer");
const xlsx = require("xlsx");


const batchSize = 100; // Adjust the batch size as needed
let hasError = false;


const prisma = new PrismaClient();

const errorMessage = '';

exports.uploadFile = async (req, res) => {
  const file = req.file;
  const workbook = await xlsx.readFile(file.path);
  const sheetNames = workbook.SheetNames;

  // Get sheets at index 0 and 2
  const sheet1 = workbook.Sheets[sheetNames[0]];
  const sheet2 = workbook.Sheets[sheetNames[2]];

  // console.log(sheet1, "---");

  const data = xlsx.utils.sheet_to_json(sheet1);
  const data2 = xlsx.utils.sheet_to_json(sheet2);

  // Process data in batches or asynchronously

  try {
    const batchSize = 100; // Adjust batch size as needed
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (row, index) => {
          const {
            StudentName,
            IDNumber,
            BlankCount,
            Correct,
            Score,
            Percentage,
            ...questions
          } = row;
          const idNumberStr = IDNumber ? IDNumber.toString() : null;

          // Validate required fields
          if (!StudentName || !idNumberStr) {
            return { row, error: "Missing required fields: StudentName or IDNumber" };
          }

          try {
            await prisma.student.create({
              data: {
                name: StudentName,
                idNumber: IDNumber,
                blankCount: BlankCount,
                correctCount: Correct,
                percentage: Percentage,
                score: Score,
                questions: {
                  create: Object.keys(questions).map((key) => ({
                    question: key,
                    answer: questions[key],
                  })),
                },
              },
            });
          } catch (error) {
            return { row, error , errorMessage: error.message};                                     
          }
        })
      );
    }





    res.status(200).json({ message: "File processed successfully" });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};