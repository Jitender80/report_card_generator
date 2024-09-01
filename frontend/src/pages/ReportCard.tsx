import React from 'react';

const ReportCard = ({ data }) => {
  return (
    <div className="report-card">
      <style>
        {`
          .report-card {
            width: 100%;
            padding: 20px;
            border-collapse: collapse;
            background-color: rgb(149, 203, 241);
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
        `}
      </style>
      <div className="header-box">
        <img src="path/to/university-logo.png" alt="University Logo" style={{ width: '50px', height: '50px' }} />
        <h1>University Name</h1>
      </div>
      <div className="info-box">
        <div className="column">
          <p>Course Name : {data.className}</p>
          <p>Level : {data.academicYear}</p>
          <p>Credit Hours : {data.creditHours}</p>
        </div>
        <div className="column">
          <p>Course Code : {data.courseCode}</p>
          <p>Semester : {data.semester}</p>
          <p>Item : {data.courseCoordinator}</p>
        </div>
      </div>
      <div className="items-table">
        <table style={{ width: '100%' }}>
          <tbody>
            {data.items.map((item, index) => {
              let comments = ''
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
                }}

    

                return (
                    <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.category}</td>
                    <td style={{ wordWrap: 'break-word', minWidth: '160px', maxWidth: '160px' }}>
                      {item.items}
                    </td>
                    <td>{item.numberOfItems}</td>
                    <td>{item.percentage}</td>
                    <td>{comments}</td>
                  </tr>
               );
            })}
          </tbody>
        </table>
      </div>
      <div className="data-details" style={{ marginTop: '20px' }}>
        <table style={{ width: '100%' }}>
          <thead>
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
          </thead>
          <tbody>
            <tr>
              <td>{data.courses.code}</td>
              <td>{data.courses.creditHour}</td>
              <td>{data.courses.studentsNumber}</td>
              <td>{data.courses.studentsWithdrawn}</td>
              <td>{data.courses.studentsAbsent}</td>
              <td>{data.courses.studentsAttended}</td>
              <td>{data.courses.studentsPassed}</td>
              <td>{data.courses.grades.APlus.number} ({data.courses.grades.APlus.percentage}%)</td>
              <td>{data.courses.grades.A.number} ({data.courses.grades.A.percentage}%)</td>
              <td>{data.courses.grades.BPlus.number} ({data.courses.grades.BPlus.percentage}%)</td>
              <td>{data.courses.grades.B.number} ({data.courses.grades.B.percentage}%)</td>
              <td>{data.courses.grades.CPlus.number} ({data.courses.grades.CPlus.percentage}%)</td>
              <td>{data.courses.grades.C.number} ({data.courses.grades.C.percentage}%)</td>
              <td>{data.courses.grades.DPlus.number} ({data.courses.grades.DPlus.percentage}%)</td>
              <td>{data.courses.grades.D.number} ({data.courses.grades.D.percentage}%)</td>
              <td>{data.courses.grades.F.number} ({data.courses.grades.F.percentage}%)</td>
            </tr>
            <tr>
              <td colSpan={7}></td>
              <td>{data.courses.grades.APlus.number}</td>
              <td>{data.courses.grades.A.number}</td>
              <td>{data.courses.grades.BPlus.number}</td>
              <td>{data.courses.grades.B.number}</td>
              <td>{data.courses.grades.CPlus.number}</td>
              <td>{data.courses.grades.C.number}</td>
              <td>{data.courses.grades.DPlus.number}</td>
              <td>{data.courses.grades.D.number}</td>
              <td>{data.courses.grades.F.number}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportCard;