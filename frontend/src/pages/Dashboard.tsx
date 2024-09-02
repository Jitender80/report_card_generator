import axios from "axios";
import React, { useEffect } from "react";
import BASE_URL from "../lib/db"
import { ConstructionIcon } from "lucide-react";
import { toast } from "react-toastify";
import ReportCard from "./ReportCard";

const StudentTable = () => {
  const [students, setStudents] = React.useState([]);
  const [pdf, setPdf] = React.useState(null);

  const [showPdf, setShowPdf] = React.useState(false);
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





  const calculateResult = async () => {

    try {
      const res = await axios.get(`${BASE_URL}/calculate`);
      if (res.status != 200) {
        alert("Error calculating result | Refresh of filll again");
      }
      console.log("🚀 ~ file: StudentTable.tsx ~ line 39 ~ calculateResult ~ res", res)
    } catch (error) {
      alert("Error calculating result | Refresh of filll again");
      console.error(error.message);
    }
  }

  const getPdf = async () => {
    try {
      // Call the /generate API
      const res = await axios.get(`${BASE_URL}/pdfData`);
      console.log("🚀 ~ getPdf ~ res:", res.data.data)






      // Update the state with the fetched data
      setPdf(res.data.data);
      toast.success("PDF generated successfully");
    } catch (error) {

      toast.error("Failed to generate PDF");
    }
  };

  useEffect(() => {
    fetchStudents();
    calculateResult();



  }, []);
  console.log(pdf)

  const handlePress = async () => {
    await getPdf();
  }

  return (
    <div className=" flex-1 h-screen w-full   overflow-x-auto overflow-y-auto ">

      <div className="flex flex-col justify-center items-center m-20 gap-10">

        <h2 className="text-2xl">Download PDF</h2>
        <button

          className="bg-blue-500 hover:bg-blue-700 space-x-3 text-white font-bold py-2 px-4 rounded"

          onClick={() => { window.open(`${BASE_URL}/generate`) }}
        >
          Download


        </button>

        <i>
          if download not working, please refresh the page and try again
        </i>
      </div>

      <div className="flex flex-col justify-center items-center bg-blue-200 ">

        <div onClick={handlePress} className="
            text-2xl bg-green-500 rounded-md p-2 m-2 cursor-pointer
            ">
          Show PDF
        </div>


    <h2 className="text-red-600 text-xl">THis Pdf is only for data verification , Kindly ignore the formatting ,Instead Download the pdf to view</h2>

        <div className="h-full py-20 mb-20 " >

          {pdf && <ReportCard data={pdf} />}
        </div>


      </div>




      <div className="mt-10 border-zinc-700 border-1">


        {/* <table className="min-w-full bg-white border-red-100 border-2 ">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">ID Number</th>
            <th className="py-2 px-4 border-b">Blank Count</th>
            <th className="py-2 px-4 border-b">Correct Count</th>
            <th className="py-2 px-4 border-b">Percentage</th>
            <th className="py-2 px-4 border-b">Score</th>

          </tr>
        </thead>
        <tbody className="overflow-y-auto p-5">
          {Object.entries(students).map((student, index) => (
            // <div>
            //   {console.log(
            //     ".🚀 ~ file: StudentTable.tsx ~ line 78 ~ Object.entries(students).map ~ student",
            //     student[1]?.name
            //   )}
            // </div>
            <tr key={index} >
              <td className="py-2 px-4 border-b">
                {student[1]?.name || "name"}
              </td>
              <td className="py-2 px-4 border-b">{student[1]?.idNumber}</td>
              <td className="py-2 px-4 border-b">{student[1]?.blankCount}</td>
              <td className="py-2 px-4 border-b">{student[1]?.correctCount}</td>
              <td className="py-2 px-4 border-b">{student[1]?.percentage}</td>
              <td className="py-2 px-4 border-b">{student[1]?.score}</td>
              <td className="py-2 px-4 border-b">

              </td>

            </tr>
          ))}
        </tbody>
      </table> */}
      </div>
    </div>
  );
};

export default StudentTable;
