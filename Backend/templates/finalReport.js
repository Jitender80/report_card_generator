function formatSemesterData(data) {
    const semesterMapping = {
        "First Semester": "1st",
        "Second Semester": "2nd",
        "Third Semester": "3rd",
        "Fourth Semester": "4th",
        "Fifth Semester": "5th",
        "Sixth Semester": "6th",
        "Seventh Semester": "7th",
        "Eighth Semester": "8th",
    };

    const semester = semesterMapping[data.semester];
    const year = data.year.split("-")[0]; // Extract the starting year

    return `${semester} Semester, (${year} G)`;
}
function template1(data) {
    return `
        <div style="page-break-after: always; width:100%;height:90vh; flex: 1; display: flex;">
          <div  
            style="flex-direction: column; justify-content: center; background-color: #b8d3ef; border: 6px solid #1C4A7A; padding: 10px; margin: 5px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <div style="display: flex; justify-content: space-between; align-items: center;background-color:#fff; border:2px solid #000;
              padding: 10px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              ">
            <div style="font-size: 12px; font-weight: bold; gap: 5px;">
              <ul style="display: flex; flex-direction: column;">
                <li class="spacing">KINGDOM OF SAUDI ARABIA</li>
                <li class="spacing">Ministry of Education</li>
                <li class="spacing">${data?.university || "Najran University"
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
                 <div style="position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background-color: #000;"></div>
      <ul style="display: flex; flex-direction: column; list-style-type: disc;">
          <li style="margin-bottom: 5px;"> <h3 style="color: blue;">Good Exams (KR20 > 0.80)</h3></li>
          ${data?.course_Observations?.GOOD?.map(
            (exam) =>
                `<li style="margin-bottom: 5px;  margin-left:10px;">${exam.course_name}, ${exam.course_code} (${exam.gender})</li>`
        ).join("")}
      </ul>
      <ul style="display: flex; flex-direction: column; list-style-type: disc;">
          <li style="margin-bottom: 5px;"> <h3 style="color: green;">Exam Quality where KR20 remains within the accepted range (KR20= 0.70-0.79)</h3></li>
          ${data?.course_Observations?.AVERAGE?.map(
            (exam) =>
                `<li style="margin-bottom: 5px;  margin-left:10px;">${exam.course_name}, ${exam.course_code} (${exam.gender})</li>`
        ).join("")}
      </ul>
      <ul style="display: flex; flex-direction: column; list-style-type: disc;">
          <li style="margin-bottom: 5px;"> <h3 style="color: red;">Exam Quality where KR20 value is below the accepted range (KR20= <0.70)</h3></li>
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
    return data.levelTable
        .map(
            (levelData) => `
      <div style="page-break-after: always;  width:100%;height:90vh;  max-height: 1122px; padding: 2px; box-sizing: border-box;">
        <div style="flex-direction: column; justify-content: center; background-color: #b8d3ef; border: 6px solid #1C4A7A; padding: 10px; margin: 0; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">

          <div style="display: flex; justify-content: space-between; align-items: center; background-color:#fff; border:2px solid #000;
            padding: 10px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <div style="font-size: 12px; font-weight: bold; gap: 5px;">
              <ul style="display: flex; flex-direction: column;">
                <li class="spacing">KINGDOM OF SAUDI ARABIA</li>
                <li class="spacing">Ministry of Education</li>
                <li class="spacing">${data?.university || "Najran University"}</li>
                <li class="spacing">Faculty of Dentistry</li>
              </ul>
            </div>
            <img src="https://res.cloudinary.com/dkijovd6p/image/upload/v1725480428/t50opxpqoofrimbd3yxi.png" alt="University Logo" style="width: 75px; height: 75px;">
            <img src="https://res.cloudinary.com/dkijovd6p/image/upload/t_hii/o3jtksywnmrppxs9o9yt.jpg" alt="University Logo" style="width: 125px; height: 75px;">
          </div>

          <table class="leveltable"  style=" width:100%;  border-collapse: collapse; border:2px solid #000; background-color:#fff">
            <thead>
               <tr>
    <th style="padding: 2px; word-wrap: break-word; white-space: normal; vertical-align: top;">N</th>
    <th colspan="30" style="padding: 2px; word-wrap: break-word; white-space: normal; vertical-align: top;">Course Title & Course Code</th>
    <th colspan="5" style="padding: 2px; word-wrap: break-word; white-space: normal; vertical-align: top;">${"  "}</th>
    <th style="padding: 2px; word-wrap: break-word; white-space: normal; vertical-align: top;">Difficult Question</th>
    <th style="padding: 2px; word-wrap: break-word; white-space: normal; vertical-align: top;">Good Question</th>
    <th style="padding: 2px; word-wrap: break-word; white-space: normal; vertical-align: top;">Easy Question</th>
    <th style="padding: 2px; word-wrap: break-word; white-space: normal; vertical-align: top; background-color:#cdf1d1;">Total Accepted</th>
    <th style="padding: 2px; word-wrap: break-word; white-space: normal; vertical-align: top;">Very Easy Question</th>
    <th style="padding: 2px; word-wrap: break-word; white-space: normal; vertical-align: top;">Very Difficult Question</th>
    <th style="padding: 2px; word-wrap: break-word; white-space: normal; vertical-align: top;">Poor (Bad) Questions</th>
    <th style="padding: 2px; word-wrap: break-word; white-space: normal; vertical-align: top;background-color:#f6dddd;">Total Rejected</th>
    <th style="padding: 2px; word-wrap: break-word; white-space: normal; vertical-align: top;">KR 20</th>
  </tr>
     </thead>
            <tbody id="tableData">
              ${levelData.classId
                .map(
                  (classData, classIndex) => `
                    <tr>
                      <td rowspan="2" style="padding: 10px;">${classIndex + 1}</td>
                      <td colspan="30" rowspan="2" style="padding: 10px 5px 20px 5px;">${classData.nameOfCourse}</td>
                      <td style="padding: 2px;" colspan="5">N</td>
                      <td style="padding: 2px;">${classData.questionAnalysisData['Difficult Question']?.number || '0'}</td>
                      <td style="padding: 2px;">${classData.questionAnalysisData['Good Question']?.number || ''}</td>
                      <td style="padding: 2px;">${classData.questionAnalysisData['Easy Question']?.number || ''}</td>
                      <td style="padding: 2px;background-color:#cdf1d1;">${classData.questionAnalysisData['Total Accepted']?.number || ''}</td>
                      <td style="padding: 2px;">${classData.questionAnalysisData['Very Easy Question']?.number || ''}</td>
                      <td style="padding: 2px;">${classData.questionAnalysisData['Very Difficult Question']?.number || ''}</td>
                      <td style="padding: 2px;">${classData.questionAnalysisData['Poor (Bad) Questions']?.number || ''}</td>
                      <td style="padding: 2px;background-color:#f6dddd">${classData.questionAnalysisData['Total Rejected']?.number || ''}</td>
                      <td rowspan="2" style="padding: 2px;">${classData.kr20.toFixed(2) || ''}</td>
                    </tr>
                    <tr>
                      <td style="padding: 2px;" colspan="5" >%</td>
                      <td style="padding: 2px;">${classData.questionAnalysisData['Difficult Question']?.percentage || '0'}%</td>
                      <td style="padding: 2px;">${classData.questionAnalysisData['Good Question']?.percentage || ''}%</td>
                      <td style="padding: 2px;">${classData.questionAnalysisData['Easy Question']?.percentage || ''}%</td>
                      <td style="padding: 2px;background-color:#cdf1d1; ">${classData.questionAnalysisData['Total Accepted']?.percentage || ''}%</td>
                      <td style="padding: 2px;">${classData.questionAnalysisData['Very Easy Question']?.percentage || ''}%</td>
                      <td style="padding: 2px;">${classData.questionAnalysisData['Very Difficult Question']?.percentage || ''}%</td>
                      <td style="padding: 2px;">${classData.questionAnalysisData['Poor (Bad) Questions']?.percentage || ''}%</td>
                      <td style="padding: 2px;background-color:#f6dddd;">${classData.questionAnalysisData['Total Rejected']?.percentage || ''}%</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `
        )
        .join("");
}
module.exports = { template1, template2 };
