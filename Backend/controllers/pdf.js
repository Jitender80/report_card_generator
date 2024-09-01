// controllers/reportController.js
const path = require('path');
const fs = require('fs');
const htmlPdf = require('html-pdf-node');
const Class = require('../models/excelmodel');

//KR20 Comments

function getReliabilityDescription(score) {
    if (score > 0.90) {
      return "Excellent reliability, at the level of the best standardized tests.";
    }  if (score >= 0.85 && score <= 0.90) {
      return "Exam seems to be Very good and reliable.";
    }  if (score >= 0.80 && score <= 0.84) {
      return "Exam seems to be Good and reliable.";
    }  if (score >= 0.71 && score <= 0.79) {
      return "Values lies betweeen the marginally acceptable ranges.There are probably a few items which could be improved";
    }  if (score >= 0.61 && score <= 0.70) {
      return "Somewhat low. This test should be supplemented by other  measures for grading";
    }  if (score >= 0.51 && score <= 0.60) {
      return "Value Suggests need for revision of the test. The test definitely need to be supplemented by other measures for grading";
    }  if (score <= 0.50) {
      return "Questionable Reliability . The test should not contribute heavily to the course grade, and it needs revision";
    } 
  }

async function generateReportCardPDF(dbData) {
    const data = dbData;
    console.log("🚀 ~ generateReportCardPDF ~ data:", data)
    const reportCardHtml = `
    <style>
        .report-card {
            height:1508px;
            width: 1280px;
            padding: 20px;
            border-collapse: collapse;
            background-color:"rgb(149, 203, 241)"
        }
        .report-card, .report-card th, .report-card td {
            border: 1px solid #000;
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
        .header-box, .info-box {
            border: 1px solid #000;
            padding: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        .info-box {
            display: flex;
            justify-content: space-between;
        }
        .info-box .column {
            width: 48%;
        }
    </style>
    <div class="report-card">
        <div class="header-box">
            <img src="path/to/university-logo.png" alt="University Logo" style="width: 50px; height: 50px;">
            <h1>${data.college}</h1>
            <h1>${data.college}</h1>
        </div>
        <div class="info-box">
            <div class="column">
                <p>Course Name : ${data.className}</p>
                <p>Level : ${data.academicYear}</p>
                <p>Credit Hours : ${data.creditHours}</p>
            </div>
            <div class="column">
                <p>Course Code : ${data.courseCode}</p>
                <p>Semester : ${data.semester}</p>
                <p>Item : ${data.courseCoordinator}</p>
            </div>
        </div>
        <div class="items-table">
            <table style="width: 100%;">
         </tr>
${data.items.map((item, index) => {
        let comments = '';

        if (item.numberOfItems > 0) {
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
        }

        return `
        <tr>
            <td>${index + 1}</td>
            <td>${item.category}</td>
            <td
            style="word-wrap: break-word;min-width: 160px;max-width: 160px;"
            >
             ${item.items}
            
            </td>
            <td>${item.numberOfItems}</td>
            <td>${item.percentage}</td>
            <td>${comments}</td>
        </tr>
    `;
    }).join('')}
</table>
</div>
        <div class="data-details" style="margin-top: 20px;">
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

              <tr>
        <td>${data.courses.code}</td>
        <td>${data.courses.creditHour}</td>
        <td>${data.courses.studentsNumber}</td>
        <td>${data.courses.studentsWithdrawn}</td>
        <td>${data.courses.studentsAbsent}</td>
        <td>${data.courses.studentsAttended}</td>
        <td>${data.courses.studentsPassed.number}</td>

        <td>${data.courses.grades.APlus.number} (${data.courses.grades.APlus.percentage}%)</td>
        <td>${data.courses.grades.A.number} (${data.courses.grades.A.percentage}%)</td>
        <td>${data.courses.grades.BPlus.number} (${data.courses.grades.BPlus.percentage}%)</td>
        <td>${data.courses.grades.B.number} (${data.courses.grades.B.percentage}%)</td>
        <td>${data.courses.grades.CPlus.number} (${data.courses.grades.CPlus.percentage}%)</td>
        <td>${data.courses.grades.C.number} (${data.courses.grades.C.percentage}%)</td>
        <td>${data.courses.grades.DPlus.number} (${data.courses.grades.DPlus.percentage}%)</td>
        <td>${data.courses.grades.D.number} (${data.courses.grades.D.percentage}%)</td>
        <td>${data.courses.grades.F.number} (${data.courses.grades.F.percentage}%)</td>
    </tr>
    <tr>
        <td colspan="6"></td>

        <td>${data.courses.studentsPassed.percentage}</td>


        <td>${data.courses.grades.APlus.number}</td>
        <td>${data.courses.grades.A.number}</td>
        <td>${data.courses.grades.BPlus.number}</td>
        <td>${data.courses.grades.B.number}</td>
        <td>${data.courses.grades.CPlus.number}</td>
        <td>${data.courses.grades.C.number}</td>
        <td>${data.courses.grades.DPlus.number}</td>
        <td>${data.courses.grades.D.number}</td>
        <td>${data.courses.grades.F.number}</td>
    </tr>

            </table>
        </div>
    </div>
`;

    const options = { format: 'A4' };
    const file = { content: reportCardHtml };

    try {
        const pdfBuffer = await htmlPdf.generatePdf(file, options);
        const pdfPath = path.join(__dirname, '../reports', `${data?.name?.replace(/\s+/g, '_')}_ReportCard.pdf`);

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

        const data = await Class.findOne().sort({ createdAt: -1 })
        console.log("🚀 ~ generatePdf ~ data:", data)
        let items;
        let numberOfItems;
        let percentage;



        const result = [];
        var total = 0;

        Object.keys(data.questionSummary).forEach(category => {
            const items = data.questionSummary[category];
            console.log("🚀 ~ Object.keys ~ items:", items)
            const numberOfItems = items.length;
            total += numberOfItems;
            const percentage = (numberOfItems / data.questionAnalysis.length) * 100;
            result.push({
                items,
                category,
                numberOfItems,
                percentage: percentage.toFixed(2) // Optional: format percentage to 2 decimal places
            });
            console.log(`Category: ${category}, Number of Items: ${numberOfItems}, Percentage: ${percentage.toFixed(2)}%`);
        });

        let passedCount = data.courses.grades.APlus.number + data.courses.grades.A.number + data.courses.grades.BPlus.number + data.courses.grades.B.number + data.courses.grades.CPlus.number +  data.courses.grades.C.number + data.courses.grades.DPlus.number + data.courses.grades.D.number ;
        let failedCount = + data.courses.grades.F.number;
        let totalStudents = passedCount + failedCount;
      
        


        const dbData = {
            college: data.college,  
            university: data.university,

            name: data.className,
            grade: data.grade,
            average: data.average,
            items: result,
            courses: {
                code: data.courseCode,
                creditHour: data.creditHours,
                studentsNumber: data.studentsNumber ? data.studentsNumber : "-",
                studentsWithdrawn: data.studentsWithdrawn ? data.studentsWithdrawn : "-",
                studentsAbsent: data.studentsAbsent ? data.studentsAbsent : "-",
                studentsAttended: data.studentsAttended ? data.studentsAttended : "-",
                studentsPassed: { number : passedCount ? passedCount : "-" , percentage : ((passedCount / totalStudents) * 100).toFixed(2) },
                grades: {
                    APlus: {
                        number: data.FinalGrade.APlus.number,
                        percentage: data.FinalGrade.APlus.percentage
                    },
                    A: {
                        number: data.FinalGrade.A.number,
                        percentage: data.FinalGrade.A.percentage
                    },
                    BPlus: {
                        number: data.FinalGrade.BPlus.number,
                        percentage: data.FinalGrade.BPlus.percentage
                    },
                    B: {
                        number: data.FinalGrade.B.number,
                        percentage: data.FinalGrade.B.percentage
                    },
                    CPlus: {
                        number: data.FinalGrade.CPlus.number,
                        percentage: data.FinalGrade.CPlus.percentage
                    },
                    C: {
                        number: data.FinalGrade.C.number,
                        percentage: data.FinalGrade.C.percentage
                    },
                    DPlus: {
                        number: data.FinalGrade.DPlus.number,
                        percentage: data.FinalGrade.DPlus.percentage
                    },
                    D: {
                        number: data.FinalGrade.D.number,
                        percentage: data.FinalGrade.D.percentage
                    },
                    F: {
                        number: data.FinalGrade.F.number,
                        percentage: data.FinalGrade.F.percentage
                    }
                }
            }
        };
        console.log("🚀 ~ generatePdf ~ dbData:", dbData)





        const pdfPath = await generateReportCardPDF(dbData);

        if (pdfPath.error) { // Handle error from generateReportCardPDF
            return res.status(500).json({ message: 'Error generating PDF', error: pdfPath.error });
        }

        // Send the generated PDF file as a response
        res.download(pdfPath, `${dbData.name}_ReportCard.pdf`);
    } catch (err) { // Catch unexpected errors
        console.error('Unexpected error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { generatePdf };