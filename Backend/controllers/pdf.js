// controllers/reportController.js
const path = require('path');
const fs = require('fs');
const htmlPdf = require('html-pdf-node');

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
                ${data.items.map((item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.category}</td>
                        <td>${item.itemNo}</td>
                        <td>${item.totalItem}</td>
                        <td>${item.percentage}</td>
                        <td>${item.comments}</td>
                    </tr>
                `).join('')}
            </table>
        </div>
        <div class="course-details" style="margin-top: 20px;">
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
                ${data.courses.map(course => `
                    <tr>
                        <td>${course.code}</td>
                        <td>${course.creditHour}</td>
                        <td>${course.studentsNumber}</td>
                        <td>${course.studentsWithdrawn}</td>
                        <td>${course.studentsAbsent}</td>
                        <td>${course.studentsAttended}</td>
                        <td>${course.studentsPassed}</td>
                        <td>${course.grades.APlus}</td>
                        <td>${course.grades.A}</td>
                        <td>${course.grades.BPlus}</td>
                        <td>${course.grades.B}</td>
                        <td>${course.grades.CPlus}</td>
                        <td>${course.grades.C}</td>
                        <td>${course.grades.DPlus}</td>
                        <td>${course.grades.D}</td>
                        <td>${course.grades.F}</td>
                    </tr>
                    <tr>
                        <td colspan="6"></td>
                        <td>${course.percentages[0]}</td>
                        <td>${course.percentages[1]}</td>
                        <td>${course.percentages[2]}</td>
                        <td>${course.percentages[3]}</td>
                        <td>${course.percentages[4]}</td>
                        <td>${course.percentages[5]}</td>
                        <td>${course.percentages[6]}</td>
                        <td>${course.percentages[7]}</td>
                        <td>${course.percentages[8]}</td>
                        <td>${course.percentages[9]}</td>
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