const mongoose = require('mongoose');
const Student = require('../models/student');
const Class = require('../models/excelmodel');
const FinalReport = require('../models/finalReportModel');
const path = require('path');
const Handlebars = require('handlebars');

const fs = require("fs");
const puppeteer = require("puppeteer");


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


////**************************************************************************************************** */

////**************************************************************************************************** */
const dummydata = {

    "semester": "First Semester",
    "year": "2015-16",
    "gender": "all",
    "course_Observations": {
        "GOOD": [
            {
                "course_code": "232 PDS-2",
                "course_name": "Removable Prosthodontics (Preclinical II)",
                "gender": "female",
                "_id": "66e62b9afaf568e0518c7fa6"
            },
            {
                "course_code": "121 RDS-1",
                "course_name": "Dental Biomaterials I",
                "gender": "male",
                "_id": "66e62b9afaf568e0518c7fa7"
            }
        ],
        "AVERAGE": [],
        "POOR": [
            {
                "course_code": "232 PDS-2",
                "course_name": "Removable Prosthodontics (Preclinical II)",
                "gender": "male",
                "_id": "66e62b9afaf568e0518c7fa8"
            },
            {
                "course_code": "415 VDS-3",
                "course_name": "Orthodontics I",
                "gender": "female",
                "_id": "66e62b9afaf568e0518c7fa9"
            },
            {
                "course_code": "412 VDS-2",
                "course_name": "Periodontology I",
                "gender": "male",
                "_id": "66e62b9afaf568e0518c7faa"
            },
            {
                "course_code": "512 VDS-2",
                "course_name": "Dental Public Health & Community Dentistry II",
                "gender": "male",
                "_id": "66e62b9afaf568e0518c7fab"
            }
        ]
    },
    "levelTable": [
        {
            "level": "6",
            "classId": [
                "66e4f8fe28bff2be4ed966f6",
                "66e4f94d28bff2be4ed986fe"
            ],
            "levelAverage": {
                "Poor (Bad) Questions": {
                    "number": 34,
                    "percentage": 42.75
                },
                "Very Difficult Question": {
                    "number": 3,
                    "percentage": 3.875
                },
                "Difficult Question": {
                    "number": 4,
                    "percentage": 5
                },
                "Good Question": {
                    "number": 17,
                    "percentage": 21.125
                },
                "Easy Question": {
                    "number": 14,
                    "percentage": 17.75
                },
                "Very Easy Question": {
                    "number": 8,
                    "percentage": 10
                },
                "Total Accepted": {
                    "number": 17.5,
                    "percentage": 21.875
                },
                "Total Rejected": {
                    "number": 22.5,
                    "percentage": 28.125
                }
            },
            "_id": "66e62b9afaf568e0518c7fac"
        },
        {
            "level": "3",
            "classId": [
                "66e5fed6d0f928ccf4bbbbd0"
            ],
            "levelAverage": {
                "Poor (Bad) Questions": {
                    "number": 34,
                    "percentage": 43
                },
                "Very Difficult Question": {
                    "number": 3,
                    "percentage": 4
                },
                "Difficult Question": {
                    "number": 4,
                    "percentage": 5
                },
                "Good Question": {
                    "number": 17,
                    "percentage": 21
                },
                "Easy Question": {
                    "number": 14,
                    "percentage": 18
                },
                "Very Easy Question": {
                    "number": 8,
                    "percentage": 10
                },
                "Total Accepted": {
                    "number": 0,
                    "percentage": 0
                },
                "Total Rejected": {
                    "number": 0,
                    "percentage": 0
                }
            },
            "_id": "66e62b9afaf568e0518c7fad"
        },
        {
            "level": "10",
            "classId": [
                "66e60a15055142a83e52037e"
            ],
            "levelAverage": {
                "Poor (Bad) Questions": {
                    "number": 29,
                    "percentage": 48
                },
                "Very Difficult Question": {
                    "number": 4,
                    "percentage": 7
                },
                "Difficult Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Good Question": {
                    "number": 9,
                    "percentage": 15
                },
                "Easy Question": {
                    "number": 3,
                    "percentage": 5
                },
                "Very Easy Question": {
                    "number": 15,
                    "percentage": 25
                },
                "Total Accepted": {
                    "number": 0,
                    "percentage": 0
                },
                "Total Rejected": {
                    "number": 0,
                    "percentage": 0
                }
            },
            "_id": "66e62b9afaf568e0518c7fae"
        },
        {
            "level": "2",
            "classId": [
                "66e60ac858d7ef3fc302bd87"
            ],
            "levelAverage": {
                "Poor (Bad) Questions": {
                    "number": 29,
                    "percentage": 48
                },
                "Very Difficult Question": {
                    "number": 4,
                    "percentage": 7
                },
                "Difficult Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Good Question": {
                    "number": 9,
                    "percentage": 15
                },
                "Easy Question": {
                    "number": 3,
                    "percentage": 5
                },
                "Very Easy Question": {
                    "number": 15,
                    "percentage": 25
                },
                "Total Accepted": {
                    "number": 0,
                    "percentage": 0
                },
                "Total Rejected": {
                    "number": 0,
                    "percentage": 0
                }
            },
            "_id": "66e62b9afaf568e0518c7faf"
        },
        {
            "level": "12",
            "classId": [
                "66e60b5a2287e7f0cca09b2b"
            ],
            "levelAverage": {
                "Poor (Bad) Questions": {
                    "number": 44,
                    "percentage": 73
                },
                "Very Difficult Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Difficult Question": {
                    "number": 2,
                    "percentage": 3
                },
                "Good Question": {
                    "number": 7,
                    "percentage": 12
                },
                "Easy Question": {
                    "number": 3,
                    "percentage": 5
                },
                "Very Easy Question": {
                    "number": 4,
                    "percentage": 7
                },
                "Total Accepted": {
                    "number": 0,
                    "percentage": 0
                },
                "Total Rejected": {
                    "number": 0,
                    "percentage": 0
                }
            },
            "_id": "66e62b9afaf568e0518c7fb0"
        }
    ],
    "CourseNameTable": [
        {
            "CourseName": "Removable Prosthodontics (Preclinical II)",
            "classId": [
                "66e4f8fe28bff2be4ed966f6",
                "66e4f94d28bff2be4ed986fe"
            ],
            "levelAverage": {
                "Poor (Bad) Questions": {
                    "number": 0,
                    "percentage": 0
                },
                "Very Difficult Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Difficult Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Good Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Easy Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Very Easy Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Total Accepted": {
                    "number": 0,
                    "percentage": 0
                },
                "Total Rejected": {
                    "number": 0,
                    "percentage": 0
                }
            },
            "_id": "66e62b9afaf568e0518c7fb1"
        },
        {
            "CourseName": "Dental Biomaterials I",
            "classId": [
                "66e5fed6d0f928ccf4bbbbd0"
            ],
            "levelAverage": {
                "Poor (Bad) Questions": {
                    "number": 0,
                    "percentage": 0
                },
                "Very Difficult Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Difficult Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Good Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Easy Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Very Easy Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Total Accepted": {
                    "number": 0,
                    "percentage": 0
                },
                "Total Rejected": {
                    "number": 0,
                    "percentage": 0
                }
            },
            "_id": "66e62b9afaf568e0518c7fb2"
        },
        {
            "CourseName": "Orthodontics I",
            "classId": [
                "66e60a15055142a83e52037e"
            ],
            "levelAverage": {
                "Poor (Bad) Questions": {
                    "number": 0,
                    "percentage": 0
                },
                "Very Difficult Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Difficult Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Good Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Easy Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Very Easy Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Total Accepted": {
                    "number": 0,
                    "percentage": 0
                },
                "Total Rejected": {
                    "number": 0,
                    "percentage": 0
                }
            },
            "_id": "66e62b9afaf568e0518c7fb3"
        },
        {
            "CourseName": "Periodontology I",
            "classId": [
                "66e60ac858d7ef3fc302bd87"
            ],
            "levelAverage": {
                "Poor (Bad) Questions": {
                    "number": 0,
                    "percentage": 0
                },
                "Very Difficult Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Difficult Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Good Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Easy Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Very Easy Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Total Accepted": {
                    "number": 0,
                    "percentage": 0
                },
                "Total Rejected": {
                    "number": 0,
                    "percentage": 0
                }
            },
            "_id": "66e62b9afaf568e0518c7fb4"
        },
        {
            "CourseName": "Dental Public Health & Community Dentistry II",
            "classId": [
                "66e60b5a2287e7f0cca09b2b"
            ],
            "levelAverage": {
                "Poor (Bad) Questions": {
                    "number": 0,
                    "percentage": 0
                },
                "Very Difficult Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Difficult Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Good Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Easy Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Very Easy Question": {
                    "number": 0,
                    "percentage": 0
                },
                "Total Accepted": {
                    "number": 0,
                    "percentage": 0
                },
                "Total Rejected": {
                    "number": 0,
                    "percentage": 0
                }
            },
            "_id": "66e62b9afaf568e0518c7fb5"
        }
    ],



};
const template1 = Handlebars.compile(`
    <div class="page">
      <h1>Welcome to Your Report Card</h1>
      <p>This report card provides a comprehensive overview of your academic performance.</p>
      {{#each data.courses}}
        <h2>Course: {{this.name}}</h2>
        <table>
          </table>
      {{/each}}
    </div>
  `);
const template2 = Handlebars.compile(`
    <div class="page">
      <h1>Welcome to Your Report Card</h1>
      <p>This report card provides a csswwsomprehensive overview of your academic performance.</p>
      <p>This report card provides a csswwsomprehensive overview of your academic performance.</p>
      <p>This report card provides a csswwsomprehensive overview of your academic performance.</p>
      <p>This report card provides a csswwsomprehensive overview of your academic performance.</p>
      <p>This report card provides a csswwsomprehensive overview of your academic performance.</p>
      <p>This report card provides a csswwsomprehensive overview of your academic performance.</p>
      <p>This report card provides a csswwsomprehensive overview of your academic performance.</p>
      <p>This report card provides a csswwsomprehensive overview of your academic performance.</p>
      <p>This report card provides a csswwsomprehensive overview of your academic performance.</p>
      <p>This report card provides a csswwsomprehensive overview of your academic performance.</p>
      <p>This report card provides a csswwsomprehensive overview of your academic performance.</p>
      <p>This report card provides a csswwsomprehensive overview of your academic performance.</p>
      {{#each data.courses}}
        <h2>Course: {{this.name}}</h2>
        <table>
          </table>
      {{/each}}
    </div>
  `);
  
  const templates = [
    template1,
    template2
    // ... other templates
  ];
  

function generateReportCardHTML(data) {
    return `
      <style>
        body {
          font-family: Arial, sans-serif;
        }
        .report-card {
          width: 100%;
          height: 900px;
          margin: 0 auto;
          border: 6px solid #1C4A7A;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          background-color: #b8d3ef;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .page {
          page-break-after: always;
          padding: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        h1, h2 {
          text-align: center;
        }
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

// Example usage for web preview


exports.previewReportCard = async (req, res) => {

    // const { data, templates } = req.body;


    const reportCardHtml = generateReportCardHTML(dummydata, templates);
    res.send(reportCardHtml);

}



async function mergePdfBuffers(pdfBuffers) {
    const { default: PDFMerger } = await import('pdf-merger-js');
    const merger = new PDFMerger();
    for (const buffer of pdfBuffers) {
      merger.add(buffer);
    }
    return await merger.saveAsBuffer();
  }

  exports.generateReportCardPDF = async (req, res) => {
    const dbData = dummydata; // Assuming data is already in the correct format
  
    try {
      const browser = await puppeteer.launch();
      const pdfPages = [];
  
      for (const template of templates) {
        const page = await browser.newPage();
        await page.setContent(template(dbData), { waitUntil: 'networkidle0' });
  
        // Customize layout and styling as needed
        await page.evaluate(() => {
          // Apply CSS styles or modify DOM elements
          document.body.style.backgroundColor = '#f0f0f0';
          const h1 = document.querySelector('h1');
          if (h1) {
            h1.style.textAlign = 'center';
          }
          // ... other customizations
        });
  
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
      `${dbData?.name?.replace(/\s+/g, "_")}_ReportCard.pdf`
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
