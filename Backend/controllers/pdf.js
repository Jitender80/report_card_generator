// controllers/reportController.js
const path = require('path');
const fs = require('fs');
const htmlPdf = require('html-pdf-node');
const Class = require('../models/excelmodel');

// Function to generate PDF from HTML
const data = {
    name: "John Doe",
    grade: "A",
    average: "90%",
    items: [
        {
            category: "Poor (Bad) Questions",
            itemNo: "7, 31, 36, 44, 59, 61, 64, 78, 79",
            totalItem: "9",
            percentage: "11%",
            comments: `
                ● KEYS of 12, 19, 25, 26, 30, 34, 41, 77, questions with more % of attempt for wrong options are needed to be checked.
                ● All the questions should be rejected.
            `
        },
        {
            category: "Very Difficult Question",
            itemNo: "8, 30",
            totalItem: "2",
            percentage: "2%",
            comments: `
                ● Keys of these items are needed to be checked.
                ● Items should be rejected.
            `
        },
        {
            category: "Difficult Question",
            itemNo: "47, 53, 62",
            totalItem: "3",
            percentage: "4%",
            comments: `
                ● Key of this item is also needed to be checked.
            `
        },
        {
            category: "Good Question",
            itemNo: "3, 10, 18, 33, 34, 38, 41, 43, 45, 48, 50, 54, 66, 69, 70, 72, 74, 75, 76, 77",
            totalItem: "20",
            percentage: "25%",
            comments: `
                ● Items could be stored in question bank for further use.
            `
        },
        {
            category: "Easy Question",
            itemNo: "2, 6, 15, 22, 23, 26, 37, 51, 56, 71, 80",
            totalItem: "11",
            percentage: "14%",
            comments: `
                ● Item should be revised before re-use.
            `
        },
        {
            category: "Very Easy Question",
            itemNo: "1, 4, 5, 9, 11, 12, 13, 14, 16, 17, 19, 20, 21, 24, 25, 27, 28, 29, 32, 35, 39, 40, 42, 46, 49, 52, 55, 57, 58, 60, 63, 65, 67, 68, 73",
            totalItem: "35",
            percentage: "44%",
            comments: `
                ● Items should be rejected Or needed to be revised.
            `
        }
    ],
    courses: [
        {
            code: "CS101",
            creditHour: "3",
            studentsNumber: "11",
            studentsWithdrawn: "0",
            studentsAbsent: "0",
            studentsAttended: "2",
            studentsPassed: "3",
            grades: {
                APlus: "2",
                A: "1",
                BPlus: "5",
                B: "0",
                CPlus: "2",
                C: "1",
                DPlus: "5",
                D: "0",
                F: "2"
            },
            percentages: ["0%", "0%", "18%", "27%", "18%", "9%", "45%", "0%", "18%"]
        }
        // Add more courses as needed
    ]
};
async function generateReportCardPDF() {
    const reportCardHtml = `
    <style>
        .report-card {
            width: 100%;
            border-collapse: collapse;
        }
        .report-card, .report-card th, .report-card td {
            border: 1px solid #ddd;
            padding: 10px;
        }
        .report-card .key {
            font-weight: bold;
            background-color: #f9f9f9;
        }
        .report-card .student-details {
            margin-bottom: 20px;
        }
        .report-card .items-table th, .report-card .items-table td {
            text-align: left;
        }
    </style>
    <div class="report-card">
        <div class="student-details">
      
        </div>
        <div class="items-table">
            <table style="width: 100%;">
                <tr>
                    <th style="width: 5%;">No</th>
                    <th style="width: 20%;">Item Category</th>
                    <th style="width: 15%;">Item No</th>
                    <th style="width: 20%;">Total Item</th>
                    <th style="width: 15%;">Percentage</th>
                    <th style="width: 25%;">Comments/Recommendations</th>
                </tr>
                ${data.items.map((item, index) => {
                    let comments;
                    if (item.category === "Poor (Bad) Questions") {
                        comments = `
                            ● KEYS of 12, 19, 25, 26, 30, 34, 41, 77, questions with more % of attempt for wrong options are needed to be checked.
                            ● All the questions should be rejected.
                        `;
                    } else if (item.category === "Very Difficult Question") {
                        comments = `
                            ● Keys of these items are needed to be checked.
                            ● Items should be rejected.
                        `;
                    } else if (item.category === "Difficult Question") {
                        comments = `
                            ● Key of this item is also needed to be checked.
                        `;
                    } else if (item.category === "Good Question") {
                        comments = `
                            ● Items could be stored in question bank for further use.
                        `;
                    } else if (item.category === "Easy Question") {
                        comments = `
                            ● Item should be revised before re-use.
                        `;
                    } else if (item.category === "Very Easy Question") {
                        comments = `
                            ● Items should be rejected Or needed to be revised.
                        `;
                    } else {
                        comments = `
                            ● No specific comments available.
                        `;
                    }

                    return `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.category}</td>
                            <td>${item.itemNo}</td>
                            <td>${item.totalItem}</td>
                            <td>${item.percentage}</td>
                            <td>${comments}</td>
                        </tr>
                    `;
                }).join('')}
            </table>
        </div>
        <div class="dbData-details" style="margin-top: 20px;">
            <table style="width: 100%;">
                <tr>
                    <th>Course Code</th>
                    <th>Credit Hour</th>
                    <th>Students Number</th>
                    <th>Students Withdrawn</th>
                    <th>Students Absent</th>
                    <th>Students Attended</th>
                    <th>Students Passed</th>
                    <th>A+</th>
                    <th>A</th>
                    <th>B+</th>
                    <th>B</th>
                    <th>C+</th>
                    <th>C</th>
                    <th>D+</th>
                    <th>D</th>
                    <th>F</th>
                </tr>
                ${data.courses.map(dbData => `
                    <tr>
                        <td>${dbData.code}</td>
                        <td>${dbData.creditHour}</td>
                        <td>${dbData.studentsNumber}</td>
                        <td>${dbData.studentsWithdrawn}</td>
                        <td>${dbData.studentsAbsent}</td>
                        <td>${dbData.studentsAttended}</td>
                        <td>${dbData.studentsPassed}</td>
                        <td>${dbData.grades.APlus}</td>
                        <td>${dbData.grades.A}</td>
                        <td>${dbData.grades.BPlus}</td>
                        <td>${dbData.grades.B}</td>
                        <td>${dbData.grades.CPlus}</td>
                        <td>${dbData.grades.C}</td>
                        <td>${dbData.grades.DPlus}</td>
                        <td>${dbData.grades.D}</td>
                        <td>${dbData.grades.F}</td>
                    </tr>
                    <tr>
                        <td colspan="6"></td>
                        <td>${dbData.percentages[0]}</td>
                        <td>${dbData.percentages[1]}</td>
                        <td>${dbData.percentages[2]}</td>
                        <td>${dbData.percentages[3]}</td>
                        <td>${dbData.percentages[4]}</td>
                        <td>${dbData.percentages[5]}</td>
                        <td>${dbData.percentages[6]}</td>
                        <td>${dbData.percentages[7]}</td>
                        <td>${dbData.percentages[8]}</td>
                        <td>${dbData.percentages[9]}</td>
                    </tr>
                `).join('')}
            </table>
        </div>
    </div>
`;

    const options = { format: 'A4' };
    const file = { content: reportCardHtml };

    try {
        const pdfBuffer = await htmlPdf.generatePdf(file, options);
        const pdfPath = path.join(__dirname, '../reports', `${data.name.replace(/\s+/g, '_')}_ReportCard.pdf`);

        // Ensure the directory exists
        fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

        fs.writeFileSync(pdfPath, pdfBuffer);
        console.log(`PDF generated: ${pdfPath}`);
        return pdfPath;
    } catch (err) {
        console.error('Error generating PDF:', err);
        return { error: err.message };
    }
}

async function generatePdf(req, res) {
    try {

        const dbData = await Class.find().sort({createdAt : -1})
        console.log("🚀 ~ generatePdf ~ dbData:", dbData[0])

        const data = {
            name: dbData.className,
            grade: dbData.grade,
            average: dbData.average,
            items: dbData[0].questionAnalysis.map(item => ({
                category: item.category,
                itemNo: item.questionNumber,
                percentage: item.correctAnswersPercentage,
                comments: item.comments
            })),
            courses:{
              code: dbData.code,
              creditHour: dbData.creditHour,
              studentsNumber: dbData.studentsNumber,
              studentsWithdrawn: dbData.studentsWithdrawn,
              studentsAbsent: dbData.studentsAbsent,
              studentsAttended: dbData.studentsAttended,
              studentsPassed: dbData.studentsPassed,
              grades: {
                APlus: {
                  number: dbData.grades.APlus.number,
                  percentage: dbData.percentages.APlus.percentage
                },
                A: {
                  number: dbData.grades.A.number,
                  percentage: dbData.percentages.A.percentage
                },
                BPlus: {
                  number: dbData.grades.BPlus.number,
                  percentage: dbData.percentages.BPlus.percentage
                },
                B: {
                  number: dbData.grades.B.number,
                  percentage: dbData.percentages.B.percentage
                },
                CPlus: {
                  number: dbData.grades.CPlus.number,
                  percentage: dbData.percentages.CPlus.percentage
                },
                C: {
                  number: dbData.grades.C.number,
                  percentage: dbData.percentages.C.percentage
                },
                DPlus: {
                  number: dbData.grades.DPlus.number,
                  percentage: dbData.percentages.DPlus.percentage
                },
                D: {
                  number: dbData.grades.D.number,
                  percentage: dbData.percentages.D.percentage
                },
                F: {
                  number: dbData.grades.F.number,
                  percentage: dbData.percentages.F.percentage
                }
              }
            }
          };
          return res.json(data);



        const pdfPath = await generateReportCardPDF(data);

        if (pdfPath.error) { // Handle error from generateReportCardPDF
            return res.status(500).json({ message: 'Error generating PDF', error: pdfPath.error });
        }

        // Send the generated PDF file as a response
        res.download(pdfPath, `${data.name.replace(/\s+/g, '_')}_ReportCard.pdf`);
    } catch (err) { // Catch unexpected errors
        console.error('Unexpected error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { generatePdf };