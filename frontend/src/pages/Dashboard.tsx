import axios from "axios";
import React, { useEffect, useState } from "react";
import BASE_URL from "../lib/db"
import { ConstructionIcon } from "lucide-react";
import { toast } from "react-toastify";
import ReportCard from "./ReportCard";
import { useSelector } from "react-redux";

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [pdf, setPdf] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const [loading, setLoading] = useState(true);

 const currentClassId = useSelector((state) => state.class.currentClassId);
 
  console.log("🚀 ~ StudentTable ~ currentClassId:", currentClassId)
  const fetchStudents = async () => {
    try {
      if(!currentClassId){
        toast.error('create class first')
        return;
      }
      const res = await axios.get(`${BASE_URL}/getStudent/${currentClassId}`);
      // console.log("🚀 ~ fetchStudents ~ res:", res.data.students)

      // const data = res.data.data[0].students;
      setStudents(res.data.students);


    } catch (error) {
      console.error(error.message);
    }
  };




  const calculateResult = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/calculate/${currentClassId}`);
      if (res.status != 200) {
        alert("Error calculating result | Refresh or fill again");
      }
      console.log("🚀 ~ file: StudentTable.tsx ~ line 39 ~ calculateResult ~ res", res);
    } catch (error) {
      alert("Error calculating result | Refresh or fill again");
      console.error(error.message,"42");
    }
  };

  const getPdf = async (currentClassId) => {

    try {
      const res = await axios.get(`${BASE_URL}/pdfData/${currentClassId}`);
      console.log("🚀 ~ getPdf ~ res:", res.data.data);
      setPdf(res.data.data);
      toast.success("PDF generated successfully");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      toast.loading("Loading data");
      setLoading(true);
      await fetchStudents();
      await calculateResult();
      setLoading(false);
      toast.dismiss()
    };
    fetchData();
  }, []);

  const handlePress = async (currentClassId) => {
    await getPdf(currentClassId);
  };

  if(loading){
    
    return (
      <div className="flex justify-center items-center h-screen">
          <ConstructionIcon size={64}/>
      </div>
    )
  }

  return (
    <div className="flex-1 h-screen w-full overflow-x-auto overflow-y-auto">
    <div className="flex flex-col justify-center items-center m-20 gap-10">
      <h2 className="text-2xl font-semibold">Download PDF</h2>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded"
        onClick={() => {
          window.open(`${BASE_URL}/generate/${currentClassId}`);
        }}
      >
        Download
      </button>
      <i className="text-sm text-gray-600">
        If download not working, please refresh the page and try again.
      </i>
    </div>

    <div className="flex flex-col justify-center items-center bg-blue-200 p-10 rounded-lg shadow-md">
      <div
        onClick={() => handlePress(currentClassId)}
        className="text-2xl bg-green-500 hover:bg-green-700 text-white rounded-md p-2 m-2 cursor-pointer"
      >
        Show PDF
      </div>

      <h2 className="text-red-600 text-xl text-center mt-4">
        This PDF is only for data verification. Kindly ignore the formatting. Instead, download the PDF to view.
      </h2>

      <div className="h-full py-20 mb-20 w-full flex justify-center">
        {pdf && <ReportCard data={pdf} />}
      </div>
    </div>
  </div>
  );
};

export default StudentTable;
