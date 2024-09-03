require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const multer = require("multer");
const path = require("path");
const xlsx = require("xlsx");
const { uploadFile,  getstudentData,  createClass, getFinalResult, handleCollegeSubmit } = require("./controllers/excelFile");

const mongoose = require('mongoose');
const cors = require("cors");

const { deleteAllData } = require("./controllers/dev");
const connectDB = require("./db");
const { generate, generateReportCardPDF, generatePdf, getDbData } = require("./controllers/pdf");
const { getGrades } = require("./controllers/grading");
const { getReportsByRoleAndEmail } = require("./controllers/get.controllers");
const User = require("./models/usermodel");


const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

app.use(cors());



connectDB();

app.get("/", (req, res) => {
  res.json({ message: "pong working" });
});
app.get('/wake-up', async (req, res) => {
  try {
    // Perform any necessary operations to wake up the server

    res.status(200).send({ message: 'Server is awake' });
  } catch (err) {
    console.error("Error waking up server:", err);
    res.status(500).send({ error: err.message });
  }
});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Initialize multer with the configured storage
const upload = multer({ storage: storage });





app.use("/auth", authRoutes);

// ********************************************************************************************
// Dev

app.delete("/cleanClass", deleteAllData);
// ********************************************************************************************

app.post("/createClass/:id", createClass );

app.post("/upload/:id", upload.single("file"), uploadFile);
app.get('/getStudent/:id',getstudentData )
app.get('/getReportsByRoleAndEmail', async (req, res) => {
  try {
    console.log('Request query:', req.query);
    const { role, email } = req.query;
    if (!role || !email) {
      console.error('Missing required parameters');
      throw new Error('Bad request');
    }
    const reports = await User.findOne({ email: req.query.email })
    .populate('reports')
    .exec();
    res.json(reports);
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
});


app.get('/getInstructors', async (req, res) => {
  try {
    const instructors = await User.find({ role: 'teacher' }).populate({
      path: 'reports',
      populate: { path: 'user' },
    });
    res.json(instructors);
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
});

// app.get('/calculateRes', calculateResult)

// app.get('/getResultData', getResultData);

// app.get('/finalgrade', getGrades)

app.get('/calculate/:id', getFinalResult)

app.get('/pdfData/:id', getDbData)
app.get('/generate/:id', generatePdf);



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
