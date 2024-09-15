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

exports.generateFinalReport = async (req, res) => {
  const { academicYear, semester } = req.body;

  try {
    // ... (your existing code to fetch classes and process data)

    // Create a new FinalReport document
    const finalReport = new FinalReport(finalReportData);

    // Save the FinalReport document to the database
    await finalReport.save();

    res
      .status(201)
      .json({ message: "Final report generated successfully", finalReport });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
function template1(data) {
  return `
      <div style="page-break-after: always; width:100%;height:100vh; flex: 1; display: flex;">
        <div class="tablebody" 
          style="flex-direction: column; justify-content: center; background-color: #b8d3ef; border: 6px solid #1C4A7A; padding: 20px; margin: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center;background-color:#fff; border:2px solid #000;
            padding: 10px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            ">
          <div style="font-size: 12px; font-weight: bold; gap: 5px;">
            <ul style="display: flex; flex-direction: column;">
              <li class="spacing">KINGDOM OF SAUDI ARABIA</li>
              <li class="spacing">Ministry of Education</li>
              <li class="spacing">${
                data?.university || "Najran University"
              }</li>
              <li class="spacing">Faculty of Dentistry</li>
            </ul>
          </div>
          <img src="https://res.cloudinary.com/dkijovd6p/image/upload/v1725480428/t50opxpqoofrimbd3yxi.png" alt="University Logo" style="width: 75px; height: 75px;">
          <img src="https://res.cloudinary.com/dkijovd6p/image/upload/t_hii/o3jtksywnmrppxs9o9yt.jpg" alt="University Logo" style="width: 125px; height: 75px;">
        </div>



      <div style="font-size: 12px;
         font-weight: bold; gap: 5px; border:1px solid #000;
    flex: 1; display: flex;
    height: 80%;
          display:grid; grid-template-columns: repeat(2, 1fr); background-color:#fff;
           grid-column-gap: 10px; padding-horizontal:5px; position: relative;">
    <ul style="display: flex; flex-direction: column; list-style-type: disc;">
        <li style="margin-bottom: 5px;"> <h2 style="color: blue;">Good Exams (KR20 > 0.80)</h2></li>
        ${data?.course_Observations?.GOOD?.map(
          (exam) =>
            `<li style="margin-bottom: 5px;  margin-left:10px;">${exam.course_name}, ${exam.course_code} (${exam.gender})</li>`
        ).join("")}
    </ul>
    <ul style="display: flex; flex-direction: column; list-style-type: disc;">
        <li style="margin-bottom: 5px;"> <h2 style="color: green;">Exam Quality where KR20 remains within the accepted range (KR20= 0.70-0.79)</h2></li>
        ${data?.course_Observations?.AVERAGE?.map(
          (exam) =>
            `<li style="margin-bottom: 5px;  margin-left:10px;">${exam.course_name}, ${exam.course_code} (${exam.gender})</li>`
        ).join("")}
    </ul>
    <ul style="display: flex; flex-direction: column; list-style-type: disc;">
        <li style="margin-bottom: 5px;"> <h2 style="color: red;">Exam Quality where KR20 value is below the accepted range (KR20= <0.70)</h2></li>
        ${data?.course_Observations?.POOR?.map(
          (exam) =>
            `<li style="margin-bottom: 5px; margin-left:10px;">${exam.course_name}, ${exam.course_code} (${exam.gender})</li>`
        ).join("")}
    </ul>
</div>

        </div>
      </div>
    `;
}

function template2(data) {
  return `
        <div style="page-break-after: always; height:500px;" >
        <div class="tablebody"
        style="flex-direction: column; justify-content: center; background-color: #b8d3ef; border: 6px solid #1C4A7A; padding: 20px; margin: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center;background-color:#fff; border:2px solid #000;
            padding: 10px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            height: 100%;
            ">
            <h1>Summary</h1>
            <p>Total Subjects: ${data.levelTable.length}</p>

        </div>
        </div>
    `;
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

      tablebody{
   width: 100%;
    height: 100%;
      
        border-collapse: collapse;
        
      }


        </style>
      <div class=""
      style=" background-color: #f2f2;  display: flex;
        height: 100%;
     width: 100%;
 
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
        landscape: true,
        printBackground: true,
        margin: {
          top: "10mm",
          right: "10mm",
          bottom: "10mm",
          left: "10mm",
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
