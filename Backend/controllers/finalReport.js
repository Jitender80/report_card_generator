const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const Student = require("../models/student");
const Class = require("../models/excelmodel");
const FinalReport = require("../models/finalReportModel");
const path = require("path");

const fs = require("fs");

const archiver = require("archiver");
const { PDFDocument } = require("pdf-lib");

const finalReportModel = require("../models/finalReportModel");
const { template1, template2, template3 } = require("../templates/finalReport");
const { mergePdfBuffers } = require("../utils");

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
    console.log("🚀 ~ exports.generateFinalReport= ~ classes:", classes);

    const finalReportData = {
      semester,
      year: academicYear,
      gender: "all", // You can modify this as needed
      course_Observations: {
        GOOD: [],
        AVERAGE: [],
        POOR: [],
      },
      levelTable: [],
      CourseNameTable: [],
    };

    // Process the classes to populate levelTable and CourseNameTable
    const levelMap = new Map();
    const courseMap = new Map();

    classes.forEach((classDoc) => {
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
            "Total Rejected": { number: 0, percentage: 0 },
          },
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
            "Total Rejected": { number: 0, percentage: 0 },
          },
        });
      }
      courseMap.get(courseName).classId.push(classDoc._id);
      // Categorize based on kr20
      const kr20 = classDoc.kr20;
      const courseObservation = {
        course_code: classDoc.courseCode,
        course_name: classDoc.nameOfCourse,
        gender: classDoc.gender,
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
    const data = await finalReport.save();

    res
      .status(201)
      .json({ data});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getFinalReport = async (req, res) => {
  const { id } = req.params;

  try {
    const latestReport = await finalReportModel
      .findOne({_id : "66e887da52c5825e291366db"})
      .sort({ createdAt: -1 })

      .populate({
        path: "levelTable.classId",
        select: "nameOfCourse questionAnalysisData kr20 semester academicYear gender", // Only include name and questionSummary
      })
      .populate({
        path: "CourseNameTable.classId",
        select: "nameOfCourse questionAnalysisData kr20 semester academicYear gender", // Only include nameOfCourse, questionAnalysisData, and kr20
      });
      
    // Find the latest report for the specified class
    // const latestReport = await FinalReport.findOne({ 'levelTable.classId': classId })
    //   .sort({ createdAt: -1 }) // Assuming you have a createdAt field to sort by
    //   .populate('levelTable.classId', 'nameOfCourse _id'); // Populate class details

    if (!latestReport) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.status(200).json({ latestReport });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



const templates = [template1, template2, template3];

function generateReportCardHTML(data) {
  return `
      <style>

    

      .leveltable {
      background-color: #f2f2ff;
      }

      .leveltable th, td {
      border: 1px solid #000;
  font-weight: bold;
  text-align:center;

      }


        </style>
      <div class=""
      style=" background-color: #f2f2ff;  display: flex;

 
      >


        ${templates
          .map(
            (template) => `
          <div class="page"           >
            ${template(data)}
          </div>
        `
          )
          .join("\n")}
      </div>
    `;
}

const cleanFolder = (folderPath) => {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${err}`);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file: ${err}`);
        } else {
          console.log(`Deleted file: ${filePath}`);
        }
      });
    });
  });
};

const reportsFolderPath = path.join(__dirname, "../reports");


exports.previewReportCard = async (req, res) => {
  const {id} = req.params;
  try {
    // Fetch data from database (replace with your actual logic)
    // const { academicYear, semester } = req.body;
    const data = await finalReportModel
    .findById(id)
    .populate({
      path: "levelTable.classId",
      select: "nameOfCourse questionAnalysisData kr20 semester academicYear gender", // Only include name and questionSummary
    })
    .populate({
      path: "CourseNameTable.classId",
      select: "nameOfCourse questionAnalysisData kr20 semester academicYear gender", // Only include nameOfCourse, questionAnalysisData, and kr20
    });
    console.log("🚀 ~ exports.previewReportCard= ~ data:", data)

    // const data = dummydata;

    // Ensure dbData contains the required properties
    // const data = {
    //     academicYear,
    //     semester,
    //     classes: dbData.map(cls => ({
    //         subject: cls.subject,
    //         grade: cls.grade
    //     }))
    // };

      const htmlContent = generateReportCardHTML(data );

      res.send(htmlContent);
  } catch (err) {
    console.error("Error generating preview:", err);
    res.status(500).send("Error generating preview");
  }
};

exports.generateReportCardPDF = async (req, res) => {
  // cleanFolder(reportsFolderPath);

  const { id } = req.params;
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const pdfPages = [];



    const dbData = await finalReportModel
    .findById(id)
    .populate({
      path: "levelTable.classId",
      select: "nameOfCourse questionAnalysisData kr20 semester academicYear gender", // Only include name and questionSummary
    })
    .populate({
      path: "CourseNameTable.classId",
      select: "nameOfCourse questionAnalysisData kr20 semester academicYear gender", // Only include nameOfCourse, questionAnalysisData, and kr20
    });


    
    if (!dbData) {
      throw new Error('Data not found');
    }

    const page = await browser.newPage();
    const htmlContent = generateReportCardHTML(dbData, template1);
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfPath = path.join(reportsFolderPath, `report-${id}.pdf`);
    await page.pdf({ path: pdfPath, format: 'A4' });
    await page.close();
    await browser.close();

    // Create a zip file and add the single PDF to it
    const zipFilePath = path.join(reportsFolderPath, `reports-${id}.zip`);
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
    });

    output.on('close', () => {
      console.log(`${archive.pointer()} total bytes`);
      console.log('archiver has been finalized and the output file descriptor has closed.');
      res.download(zipFilePath);
    });

    archive.on('error', (err) => {
      console.error("Archiver error:", err);
      res.status(500).send("Error creating zip file");
    });


    archive.pipe(output);

    archive.file(pdfPath, { name: `report-${id}.pdf` });

    await archive.finalize();
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).send("Error generating PDF");
  }
};
