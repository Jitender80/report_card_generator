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
      <div style="page-break-after: always;  width:100%;height:90vh; max-width: 794px; max-height: 1122px; padding: 20px; box-sizing: border-box;">
        <div 
          style="flex-direction: column; justify-content: center; background-color: #b8d3ef; border: 6px solid #1C4A7A; padding: 20px; margin: 0; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
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
          <table class="leveltable" style="width: 100%; border-collapse: collapse; border:2px solid #000">
            <thead>
              <tr>
                <th colspan="35">Level ${levelData.level}</th>
                <th colspan="65">${formatSemesterData(data)}</th>
              </tr>
            </thead>
            <tbody id="tableData">
              <tr>
                <th>N</th>
                <th colspan="30">Course Title & Course Code</th>
                <th>${"  "}</th>
                <th>Difficult</th>
                <th>Good</th>
                <th>Easy</th>
                <th>Total</th>
                <th>Accepted</th>
                <th>Very Easy</th>
                <th>Very Difficult</th>
                <th>Bad</th>
                <th>Total Rejected</th>
                <th>KR 20</th>
              </tr>
              ${Object.entries(levelData.levelAverage)
                .map(
                  ([key, value], index) => `
                    <tr>
                      <td rowspan="2">${index + 1}</td>
                      <td colspan="30" rowspan="2">${key}</td>
                      <td rowspan="2"> 1</td>
                      <td>${value.number}</td>
                      <td>${value.percentage}%</td>
                      <td>${value.number}</td>
                      <td>${value.percentage}%</td>
                      <td>${value.number}</td>
                      <td>${value.percentage}%</td>
                      <td>${value.number}</td>
                      <td>${value.percentage}%</td>
                      <td>${value.number}</td>
                      <td>${value.percentage}%</td>
                    </tr>
                    <tr>
                      <td>${value.number}</td>
                      <td>${value.percentage}%</td>
                      <td>${value.number}</td>
                      <td>${value.percentage}%</td>
                      <td>${value.number}</td>
                      <td>${value.percentage}%</td>
                      <td>${value.number}</td>
                      <td>${value.percentage}%</td>
                      <td>${value.number}</td>
                      <td>${value.percentage}%</td>
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
