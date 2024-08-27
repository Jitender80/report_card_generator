import axios from "axios";
import React, { useEffect } from "react";
import { BASE_URL } from "../App.jsx";
import { ConstructionIcon } from "lucide-react";

const StudentTable = () => {
  const [students, setStudents] = React.useState([]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/getStudent`);

      // const data = res.data.data[0].students
      // if (typeof data === 'object') {
      //   const studentsArray = [];
      //   for (const key in data) {
      //     studentsArray.push(data[key]);
      //   }
      //   // setStudents(studentsArray);
      //   return;
      // }

      const data = res.data.data[0].students;
      console.log("🚀 ~ fetchStudents ~ data:", res.data.data[0].students);
      console.log("🚀 fetchStudents data type", typeof data);

      // const studentsArray = Object.entries(data);
      // const studentsArray = Object.entries(data);
      // console.log(
      //   "🚀 fetchStudents ~ studentsArray typeof:",
      //   typeof studentsArray
      // );
      // console.log("🚀 fetchStudents ~ studentsArray:", studentsArray);
      setStudents(data);
      console.log("student name", students[1]?.score);
      console.log("student questions", students[1]?.questions[1]);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="container mx-auto overflow-y-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">ID Number</th>
            <th className="py-2 px-4 border-b">Blank Count</th>
            <th className="py-2 px-4 border-b">Correct Count</th>
            <th className="py-2 px-4 border-b">Percentage</th>
            <th className="py-2 px-4 border-b">Score</th>
            <th className="py-2 px-4 border-b">Questions</th>
            {/* <th className="py-2 px-4 border-b">Incorrect Index Data</th>
            <th className="py-2 px-4 border-b">Disc Index Data</th> */}
          </tr>
        </thead>
        <tbody className="overflow-y-auto">
          {Object.entries(students).map((student, index) => (
            // <div>
            //   {console.log(
            //     ".🚀 ~ file: StudentTable.tsx ~ line 78 ~ Object.entries(students).map ~ student",
            //     student[1]?.name
            //   )}
            // </div>
            <tr key={index}>
              <td className="py-2 px-4 border-b">{student[1]?.name}</td>
              <td className="py-2 px-4 border-b">{student[1]?.idNumber}</td>
              <td className="py-2 px-4 border-b">{student[1]?.blankCount}</td>
              <td className="py-2 px-4 border-b">{student[1]?.correctCount}</td>
              <td className="py-2 px-4 border-b">{student[1]?.percentage}</td>
              <td className="py-2 px-4 border-b">{student[1]?.score}</td>
              <td className="py-2 px-4 border-b">{student?.questions}</td>
              {/* <td className="py-2 px-4 border-b">
                {student.incorrectIndexData}
              </td>
              <td className="py-2 px-4 border-b">{student.discIndexData}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
