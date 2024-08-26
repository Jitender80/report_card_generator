import axios from 'axios';
import React, { useEffect } from 'react';
import { BASE_URL } from '../App.jsx';

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

      const data = res.data.data.students;
      console.log("🚀 ~ fetchStudents ~ data:", typeof res.data.data.students)
      const studentsArray = Array.isArray(data) ? data : Object.values(data);

      setStudents(studentsArray);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="container mx-auto">
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
          <th className="py-2 px-4 border-b">Incorrect Index Data</th>
          <th className="py-2 px-4 border-b">Disc Index Data</th>
        </tr>
      </thead>
      <tbody>
        {
          students.map((s)=>{
            console.log(s, "---")
          })
        }
        {students.map((student, index) => (

          <tr key={index}>

            <td className="py-2 px-4 border-b">{student.idNumber            }</td>
            <td className="py-2 px-4 border-b">{student.idNumber}</td>
            <td className="py-2 px-4 border-b">{student.blankCount}</td>
            <td className="py-2 px-4 border-b">{student.correctCount}</td>
            <td className="py-2 px-4 border-b">{student.percentage}</td>
            <td className="py-2 px-4 border-b">{student.score}</td>
            <td className="py-2 px-4 border-b">{student.questions}</td>
            <td className="py-2 px-4 border-b">{student.incorrectIndexData}</td>
            <td className="py-2 px-4 border-b">{student.discIndexData}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
};

export default StudentTable;