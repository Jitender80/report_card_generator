const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const xlsx = require('xlsx');



exports.uploadFile = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
    
        // Process the Excel file
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
    
        // Iterate over the data and store it in the database
        for (const row of data) {
          const { studentName, studentId, percentage, subject, ...questions } = row;
          await prisma.student.create({
            data: {
              name: studentName,
              id: studentId,
              percentage,
              subject,
              questions: {
                create: Object.keys(questions).map((key) => ({
                  question: key,
                  answer: questions[key],
                })),
              },
            },
          });
        }
    
        res.status(200).json({ message: 'File processed successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process file' });
      }

}