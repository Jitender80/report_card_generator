// controllers/reportController.js
const path = require('path');
const fs = require('fs');
const htmlPdf = require('html-pdf-node');

// Function to generate PDF from HTML
async function generateReportCardPDF(data) {
    const reportCardHtml = `
    <style>
        .report-card {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            width: 100%;
            border-collapse: collapse;
        }
        .report-card div {
            padding: 10px;
            border: 1px solid #ddd;
        }
        .report-card .key {
            font-weight: bold;
            background-color: #f9f9f9;
        }
    </style>
    <div class="report-card">
        <div class="key">Student Name</div>
        <div>${data.name}</div>
        <div class="key">Grade</div>
        <div>${data.grade}</div>
        <div class="key">Average</div>
        <div>${data.average}</div>
        <div class="key">Subjects</div>
        <div>
            <table border="1" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <th style="text-align: left;">Subject</th>
                    <th style="text-align: left;">Score</th>
                </tr>
                ${data.subjects.map(subject => `
                    <tr>
                        <td>${subject.name}</td>
                        <td>${subject.score}</td>
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
        const data = {
            name: "John Doe",
            grade: "A",
            average: "90%",
            subjects: [
                { name: "Mathematics", score: "95" },
                // ...
            ]
        };

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