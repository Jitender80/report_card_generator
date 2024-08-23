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

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Process the Excel file asynchronously
  try {
    const workbook = await xlsx.readFile(file.path);
const sheetNames = workbook.SheetNames;

const sheet1Name = 'Results Grid'; // Replace with the actual sheet name
const sheet2Name = 'Item Analysis'; // Replace with the actual sheet name

if (!sheetNames.includes(sheet1Name) || !sheetNames.includes(sheet2Name)) {
  return res.status(400).json({ error: "Required sheets not found in the Excel file" });
}

const sheet1 = workbook.Sheets[sheet1Name];
const sheet2 = workbook.Sheets[sheet2Name];
console.log(sheet1, sheet2);

return;

    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Process data in batches or asynchronously
    const batchSize = 100; // Adjust batch size as needed
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (row) => {
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
            return { row, error };
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