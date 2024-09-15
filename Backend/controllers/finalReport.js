const mongoose = require("mongoose");
const Student = require("../models/student");
const Class = require("../models/excelmodel");
const FinalReport = require("../models/finalReportModel");
const path = require("path");
const Handlebars = require("handlebars");
const fs = require("fs");
const puppeteer = require("puppeteer");

const { PDFDocument } = require("pdf-lib");
const dummydata = require("../assets/dummy");
const finalReportModel = require("../models/finalReportModel");
const { template1, template2 } = require("../templates/finalReport");

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


exports.getFinalReport = async (req, res) => {
  // const { classId } = req.params;

  
  try {
    const latestReport = await finalReportModel.find({}).sort({ createdAt: -1 }).limit(1).populate({
      path: 'levelTable.classId',
      select: 'nameOfCourse questionAnalysisData kr20' // Only include name and questionSummary
    });
    // Find the latest report for the specified class
    // const latestReport = await FinalReport.findOne({ 'levelTable.classId': classId })
    //   .sort({ createdAt: -1 }) // Assuming you have a createdAt field to sort by
    //   .populate('levelTable.classId', 'nameOfCourse _id'); // Populate class details

    if (!latestReport) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json({ latestReport });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}




// ... (other functions)

const templates = [
  // Replace with your actual template functions here
  template1,
  template2,
];

function generateReportCardHTML(data) {
  return `
      <style>

    

      .leveltable {
      background-color: #f2f2ff;
      }

      .leveltable th, td {
      border: 1px solid #000;
        padding: 2px; 
      }


        </style>
      <div class=""
      style=" background-color: #f2f2ff;  display: flex;
        // height: 100%;
    //  width: 100%;
 
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

exports.generateReportCardPDF = async (req, res) => {
  cleanFolder(reportsFolderPath);
  const { academicYear, semester } = req.body; // Assuming data retrieval from request body

  try {
    const browser = await puppeteer.launch();
    const pdfPages = [];

    // Fetch data from database (replace with your actual logic)
    // const dbData = await Class.find({ academicYear, semester });
    const dbData = dummydata;

    for (const template of templates) {
      const page = await browser.newPage();
      const htmlContent = generateReportCardHTML(dbData);

      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        landscape: false,
        printBackground: true,
        margin: {
          top: "10mm",

          bottom: "10mm",

        },
      });
      pdfPages.push(pdfBuffer);
      await page.close();
    }

    await browser.close();

    const mergedPdfBuffer = await mergePdfBuffers(pdfPages);
    let index = 0;
    const pdfPath = path.join(
      __dirname,
      "../reports",
      `${dbData.semester?.replace(
        /\s+/g,
        "_"
      )}_${Date.now()}_${index++}_ReportCard.pdf` // Use semester from request body
    );

    fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
    fs.writeFileSync(pdfPath, mergedPdfBuffer);

    console.log(`PDF generated: ${pdfPath}`);
    res.sendFile(pdfPath);
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).send("Error generating PDF");
  }
};

exports.previewReportCard = async (req, res) => {
  try {
    // Fetch data from database (replace with your actual logic)
    // const { academicYear, semester } = req.body;
    // const dbData = await Class.find({ academicYear, semester });
    const data = dummydata;

    // Ensure dbData contains the required properties
    // const data = {
    //     academicYear,
    //     semester,
    //     classes: dbData.map(cls => ({
    //         subject: cls.subject,
    //         grade: cls.grade
    //     }))
    // };

    const htmlContent = generateReportCardHTML(data);

    res.send(htmlContent);
  } catch (err) {
    console.error("Error generating preview:", err);
    res.status(500).send("Error generating preview");
  }
};
async function mergePdfBuffers(pdfBuffers) {
  const mergedPdf = await PDFDocument.create();
  for (const pdfBuffer of pdfBuffers) {
    const pdf = await PDFDocument.load(pdfBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  return await mergedPdf.save();
}
