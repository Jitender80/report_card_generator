import React from 'react';

const ReportCard = ({ data }) => {
  const getComments = (category, numberOfItems) => {
    if (numberOfItems <= 0) return '';

    switch (category) {
      case "Poor (Bad) Questions":
        return `
          ● Discrimination value of this items are negative in value.
          ● Discrimination value of this items are less than 0.20
          ● All the items should be rejected.
        `;
      case "Very Difficult Question":
        return `
          ● Keys of these items are needed to be checked.
          ● Items should be rejected.
        `;
      case "Difficult Question":
        return `
          ● Key of this item is also needed to be checked.
        `;
      case "Good Question":
        return `
          ● Discrimination value of first raw items is accepted good
          ● Items could be stored in question bank for further use.
        `;
      case "Easy Question":
        return `
          ● Item should be revised before re-use.
        `;
      case "Very Easy Question":
        return `
          ● Items should be rejected or needed to be revised.
        `;
      default:
        return `
          ● No specific comments available.
        `;
    }
  };

  return (
    <div className="report-card">
      <style>
        {`
   .report-card {
  width: 1080px;
  padding: 0 60px; /* Corrected paddingHorizontal */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #7fd0f5;
  -webkit-print-color-adjust: exact; /* Ensures print color matches screen */
}

.report-card table {
  width: 100%; /* Ensures the table fits inside the container */
  height: 60%;
  border-collapse: collapse; /* Ensures borders are collapsed */
  border-spacing: 0; /* Removes gaps between cells */
  align-self: center;
}
  
      .report-card th, .report-card td {
          border: 2px solid #000; /* Adds borders */
          padding: 10px;
      }
  
      .report-card th {
          background-color: #d3e0ea !important; /* Light blue color for headers */
          color: #000 !important; /* Ensures text color is black */
          font-weight: bold;
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
          padding: 10px;
          margin-bottom: 20px;
          text-align: center;
          border:2px solid #000;
          display: flex;
          flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
      }
  
      .info-box {
          border: 2px solid #000;
          display: flex;
          justify-content: space-between;
      }
  
      .info-box .column {
          width: 48%;
      }
  
      .data-details {
      height: 40%;
      // width:'60%'

      }
      .data-details td {
          font-size: 12px; 
          text-align: center;
      }
  
      .data-details th {
          font-size: 14px; 
      }
          .li{
          
          font-size: 14px;
          font-weight: bold;
          }
          .ol{

          }
          .white{
              background-color: #e7e5e5;
          }
          table.maintable {
          background-color:white
          }
          .back{
              background-color: #fff;}
              ul {
    list-style-type: none; 
}
    .bottom tr td{
    background-colo:#fff}

    .roww{
    
    background-color: #fff;}
    .spac{
    margin:4px;
    }
    .spac{
  margin:4px;
}
.spacing {
  margin-bottom: 10px;
}
        `}
      </style>
      <div className="header-box back px-20">
        <div style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', flexDirection: 'row', gap: '2px' }}>
          <ul>
            <li>KINGDOM OF SAUDI ARABIA</li>
            <li>Ministry of Education</li>
            <li>{data?.university || "Najran University"}</li>
            <li>Faculty of Dentistry</li>
          </ul>
        </div>
        <img src={data.logo} alt="University Logo" style={{ width: '80px', height: '80px' }} />
        <div style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', flexDirection: 'row', gap: '2px' }}>
          <ul>
            <li>المملكة العربية السعودية</li>
            <li>وزارة التعليم</li>
            <li>جامعة نجران</li>
            <li>كلية طب الأسنان</li>
          </ul>
        </div>
      </div>
      <div className="info-box back">
        <div className="column">
          <p>Course Name: {data.name}</p>
          <p>Level: {data.level}</p>
          <p>Credit Hours: {data.creditHours}</p>
        </div>
        <div className="column">
          <p>Course Code: {data.courses.code}</p>
          <p>Semester: {data.semester}</p>
          <p>Course Coordinator: {data.courseCoordinator}</p>
        </div>
      </div>
      <div className="items-table report-card">
        <table className="maintable">
          <thead>
            <tr>
              <th className="white">Serial No.</th>
              <th className="white">Item Category</th>
              <th>Question No</th>
              <th>Total Questions</th>
              <th>%</th>
              <th>Comments/Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => {
              const comments = getComments(item.category, item.numberOfItems);
              if (item.category === "Reliability") {
                return (
                  <tr key={index}>
                    <td className="white">{index + 1}</td>
                    <td className="white">{item.category}</td>
                    <td colSpan="3" style={{ wordWrap: 'break-word', minWidth: '160px', maxWidth: '160px', fontSize: '16px', fontWeight: '600', textAlign: 'center' }}>
                      KR20 = {item.numberOfItems}
                    </td>
                    <td className="white">● {comments}</td>
                  </tr>
                );
              } else {
                return (
                  <tr key={index}>
                    <td className="white">{index + 1}</td>
                    <td className="white">{item.category}</td>
                    <td style={{ wordWrap: 'break-word', minWidth: '160px', maxWidth: '160px' }}>
                      {item.items.map((subItem, subIndex) => (
                        <span key={subIndex} className="spac">{subItem}</span>
                      ))}
                    </td>
                    <td>{item.numberOfItems}</td>
                    <td>{item.percentage}</td>
                    <td>{comments}</td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>

      
      <div className="data-details maintable items-table flex justify-center items-center" style={{ marginTop: '20px' }}>
        <table className="bottom">
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
            <tr className="roww">
              <td>{data.courses.code}</td>
              <td>{data.courses.creditHour}</td>
              <td>{data.courses.studentsNumber}</td>
              <td>{data.courses.studentsWithdrawn}</td>
              <td>{data.courses.studentsAbsent}</td>
              <td>{data.courses.studentsAttended}</td>
              <td>{data.courses.studentsPassed.number}</td>
              <td>{data.courses.grades.APlus.number.toFixed(0)}</td>
              <td>{data.courses.grades.A.number.toFixed(0)}</td>
              <td>{data.courses.grades.BPlus.number.toFixed(0)}</td>
              <td>{data.courses.grades.B.number.toFixed(0)}</td>
              <td>{data.courses.grades.CPlus.number.toFixed(0)}</td>
              <td>{data.courses.grades.C.number.toFixed(0)}</td>
              <td>{data.courses.grades.DPlus.number.toFixed(0)}</td>
              <td>{data.courses.grades.D.number.toFixed(0)}</td>
              <td>{data.courses.grades.F.number.toFixed(0)}</td>
            </tr>
            <tr className="roww">
              <td colSpan="6"></td>
              <td>({data.courses.studentsPassed.percentage}%)</td>
              <td>({data.courses.grades.APlus.percentage.toFixed(0)}%)</td>
              <td>({data.courses.grades.A.percentage.toFixed(0)}%)</td>
              <td>({data.courses.grades.BPlus.percentage.toFixed(0)}%)</td>
              <td>({data.courses.grades.B.percentage.toFixed(0)}%)</td>
              <td>({data.courses.grades.CPlus.percentage.toFixed(0)}%)</td>
              <td>({data.courses.grades.C.percentage.toFixed(0)}%)</td>
              <td>({data.courses.grades.DPlus.percentage.toFixed(0)}%)</td>
              <td>({data.courses.grades.D.percentage.toFixed(0)}%)</td>
              <td>({data.courses.grades.F.percentage.toFixed(0)}%)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportCard;