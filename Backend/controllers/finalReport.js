const mongoose = require('mongoose');
const Student = require('../models/student');
const Class = require('../models/excelmodel');
const FinalReport = require('../models/finalReportModel');
const path = require('path');
const Handlebars = require('handlebars');
const fs = require('fs');
const puppeteer = require('puppeteer');

const { PDFDocument } = require('pdf-lib');
const dummydata = require('../assets/dummy');


exports.generateFinalReport = async (req, res) => {
    const { academicYear, semester } = req.body;

    try {
        // ... (your existing code to fetch classes and process data)

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
function template1(data) {
    return `
        <div style="page-break-after: always;">
            <h1>Report Card</h1>
            <h2>Academic Year: ${data.academicYear}</h2>
            <h3>Semester: ${data.semester}</h3>
            <table border="1" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${data?.levelTable.map(cls => `
                        <tr>
                            <td>${cls.level}</td>

                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function template2(data) {
    return `
        <div style="page-break-after: always;">
            <h1>Summary</h1>
            <p>Total Subjects: ${data.levelTable.length}</p>

        </div>
    `;
}


// ... (other functions)

const templates = [
  // Replace with your actual template functions here
  template1,
  template2
];

function generateReportCardHTML(data) {
    return `
      <style>
        </style>
      <div class="">
        ${templates.map(template => `
          <div class="page">
            ${template(data)}
          </div>
        `).join('\n')}
      </div>
    `;
}

exports.generateReportCardPDF = async (req, res) => {
    const { academicYear, semester } = req.body; // Assuming data retrieval from request body

    try {
        const browser = await puppeteer.launch();
        const pdfPages = [];

        // Fetch data from database (replace with your actual logic)
        // const dbData = await Class.find({ academicYear, semester });
        const dbData = dummydata

        for (const template of templates) {
            const page = await browser.newPage();
            const htmlContent = generateReportCardHTML(dbData);

            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                landscape: true,
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '10mm',
                    bottom: '20mm',
                    left: '10mm'
                },
            });
            pdfPages.push(pdfBuffer);
            await page.close();
        }

        await browser.close();

        const mergedPdfBuffer = await mergePdfBuffers(pdfPages);

        const pdfPath = path.join(
            __dirname,
            "../reports",
            `${semester?.replace(/\s+/g, "_")}_ReportCard.pdf` // Use semester from request body
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

async function mergePdfBuffers(pdfBuffers) {
    const mergedPdf = await PDFDocument.create();
    for (const pdfBuffer of pdfBuffers) {
        const pdf = await PDFDocument.load(pdfBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    return await mergedPdf.save();
}
